from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload, selectinload
from db.models import User, Workflow, Node, Edge
from models.response import Http
from models.schema import workflowBase, ResponseModel, workflowresponse, WorkflowUpdateRequest, WorkflowResponse
from uuid import UUID
import uuid

async def create_workflows(db: AsyncSession, workflow_data: workflowBase, user_id: str) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)

        new_workflow = Workflow(
            title=workflow_data.title,
            enabled=True,
            trigger="Manual",
            user_id=user_id
        )
        db.add(new_workflow)
        await db.commit()
        await db.refresh(new_workflow)

        return ResponseModel(status=Http.StatusOk,
                             message="Workflow created successfully",
                             data=workflowresponse.model_validate(new_workflow))
    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError,
                             message=f"Database error occurred: {str(e)}",
                             data=None)
    except Exception as e:
        return ResponseModel(status=Http.StatusInternalServerError,
                             message=f"Unexpected error: {str(e)}",
                             data=None)


async def get_all_workflows(db: AsyncSession, user_id: str) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return ResponseModel(status=Http.StatusNotFound, message="User not found", data=None)

        result = await db.execute(select(Workflow).where(Workflow.user_id == user_id))
        workflows = result.scalars().all()
        response = [workflowresponse.model_validate(ws) for ws in workflows]

        return ResponseModel(status=Http.StatusOk, message="Workflows fetched successfully", data=response)
    except SQLAlchemyError as e:
        return ResponseModel(status=Http.StatusInternalServerError,
                             message=f"Database error occurred: {str(e)}", data=None)
    except Exception as e:
        return ResponseModel(status=Http.StatusInternalServerError,
                             message=f"Unexpected error: {str(e)}", data=None)


async def upadate_workflows(db: AsyncSession, user_id: str, workflow_id: UUID, workflow_data: workflowBase) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return ResponseModel(status=Http.StatusNotFound, message="User not found", data=None)

        result = await db.execute(select(Workflow).where(Workflow.id == workflow_id, Workflow.user_id == user_id))
        workflow = result.scalar_one_or_none()
        if not workflow:
            return ResponseModel(status=Http.StatusNotFound, message="Workflow not found", data=None)

        update_data = workflow_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(workflow, key, value)
        await db.commit()
        await db.refresh(workflow)

        return ResponseModel(status=Http.StatusOk,
                             message="Workflow updated successfully",
                             data=workflowresponse.model_validate(workflow))
    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError,
                             message=f"Database error occurred: {str(e)}",
                             data=None)
    except Exception as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError,
                             message=f"Unexpected error: {str(e)}",
                             data=None)


async def delete_workflows(db: AsyncSession, user_id: str, workflow_id: UUID) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return ResponseModel(status=Http.StatusNotFound, message="User not found", data=None)

        result = await db.execute(select(Workflow).where(Workflow.id == workflow_id, Workflow.user_id == user_id))
        workflow = result.scalar_one_or_none()
        if not workflow:
            return ResponseModel(status=Http.StatusNotFound, message="Workflow not found", data=None)

        await db.delete(workflow)
        await db.commit()
        return ResponseModel(status=Http.StatusOk, message="Workflow deleted successfully", data=None)

    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Database error: {str(e)}", data=None)
    except Exception as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Unexpected error: {str(e)}", data=None)


async def save_workflows(db: AsyncSession, user_id: str, workflow_id: UUID, updated_workflow: WorkflowUpdateRequest) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    try:
        result = await db.execute(select(Workflow).where(Workflow.id == workflow_id, Workflow.user_id == user_id))
        workflow = result.scalar_one_or_none()
        if not workflow:
            return ResponseModel(status=Http.StatusNotFound, message="Workflow not found", data=None)

        # Update workflow
        workflow.title = updated_workflow.title
        workflow.enabled = updated_workflow.enabled

        # Delete existing nodes and edges
        await db.execute(Node.__table__.delete().where(Node.workflow_id == workflow_id))
        await db.execute(Edge.__table__.delete().where(Edge.workflow_id == workflow_id))

        created_nodes = {}
        for node_data in updated_workflow.nodes:
            node_id = str(node_data.id) if node_data.id else str(uuid.uuid4())
            new_node = Node(
                id=node_id,
                title=node_data.title,
                workflow_id=workflow_id,
                trigger=node_data.trigger,
                enabled=node_data.enabled,
                data=node_data.data or {},
                position_x=node_data.position_x,
                position_y=node_data.position_y,
                type=node_data.type
            )
            db.add(new_node)
            created_nodes[node_id] = new_node

        await db.flush()

        for edge_data in updated_workflow.edges:
            edge_id = str(edge_data.id) if edge_data.id else str(uuid.uuid4())
            if str(edge_data.source_node_id) not in created_nodes or str(edge_data.target_node_id) not in created_nodes:
                print(f"Warning: Edge {edge_id} references non-existent nodes")
                continue
            new_edge = Edge(
                id=edge_id,
                workflow_id=workflow_id,
                source_node_id=edge_data.source_node_id,
                target_node_id=edge_data.target_node_id
            )
            db.add(new_edge)

        await db.commit()

        # Fetch updated workflow nodes and edges
        result_nodes = await db.execute(select(Node).where(Node.workflow_id == workflow_id))
        workflow_nodes = result_nodes.scalars().all()
        result_edges = await db.execute(select(Edge).where(Edge.workflow_id == workflow_id))
        workflow_edges = result_edges.scalars().all()

        response_data = {
            "id": str(workflow.id),
            "title": workflow.title,
            "enabled": workflow.enabled,
            "user_id": str(workflow.user_id),
            "nodes": [
                {
                    "id": str(node.id),
                    "title": node.title,
                    "workflow_id": str(node.workflow_id),
                    "position_x": node.position_x,
                    "position_y": node.position_y,
                    "enabled": node.enabled,
                    "trigger": node.trigger,
                    "data": node.data
                } for node in workflow_nodes
            ],
            "edges": [
                {
                    "id": str(edge.id),
                    "workflow_id": str(edge.workflow_id),
                    "source_node_id": str(edge.source_node_id),
                    "target_node_id": str(edge.target_node_id)
                } for edge in workflow_edges
            ]
        }

        return ResponseModel(status=Http.StatusOk, message="Workflow updated successfully", data=response_data)

    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Database error: {str(e)}", data=None)
    except Exception as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Unexpected error: {str(e)}", data=None)

async def get_workflow(db: AsyncSession, user_id: str, workflow_id: UUID) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    try:
        result = await db.execute(
            select(Workflow)
            .options(joinedload(Workflow.nodes), joinedload(Workflow.edges))
            .where(Workflow.id == workflow_id, Workflow.user_id == user_id)
        )
        workflow = result.unique().scalar_one_or_none()  

        if not workflow:
            return ResponseModel(status=Http.StatusNotFound, message="Workflow not found", data=None)

        return ResponseModel(
            status=Http.StatusOk,
            message="Workflow fetched successfully",
            data=WorkflowResponse.model_validate(workflow)
        )

    except SQLAlchemyError as e:
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Database error: {str(e)}", data=None)
    except Exception as e:
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Unexpected error: {str(e)}", data=None)

async def form_builder(db: AsyncSession, workflow_id: UUID) -> ResponseModel:
    if not workflow_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    try:
        result = await db.execute(
            select(Workflow)
            .options(
                selectinload(Workflow.nodes),
                selectinload(Workflow.edges)
            )
            .where(Workflow.id == workflow_id)
        )
        workflow = result.unique().scalar_one_or_none()

        if not workflow:
            return ResponseModel(status=Http.StatusNotFound, message="Workflow not found", data=None)

        workflow_schema = WorkflowResponse.model_validate(workflow)

        return ResponseModel(
            status=Http.StatusOk,
            message="Workflow schema fetched successfully",
            data=workflow_schema
        )

    except SQLAlchemyError as e:
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Database error: {str(e)}", data=None)
    except Exception as e:
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Unexpected error: {str(e)}", data=None)
