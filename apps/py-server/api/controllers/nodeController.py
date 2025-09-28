from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db.models import Node, User
from models.schema import ResponseModel, NodeBase, nodeResponse
from models.response import Http
from pydantic import TypeAdapter
from uuid import UUID

# CREATE NODE
async def create_nodes(db: AsyncSession, node_data: NodeBase, user_id: str, workflow_id: UUID) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)

    try:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return ResponseModel(status=Http.StatusNotFound, message="User not found", data=None)

        new_node = Node(
            title=node_data.title,
            trigger=node_data.trigger,
            enabled=node_data.enabled,
            data=node_data.data,
            position_x=node_data.position_x,
            position_y=node_data.position_y,
            type=node_data.type,
            workflow_id=workflow_id
        )
        db.add(new_node)
        await db.commit()
        await db.refresh(new_node)

        response = nodeResponse.model_validate(new_node)
        return ResponseModel(status=Http.StatusOk, message="Node created successfully", data=response)

    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Database error: {str(e)}", data=None)
    except Exception as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Unexpected error: {str(e)}", data=None)


# GET ALL NODES
async def get_all_nodes(db: AsyncSession, workflow_id: UUID) -> ResponseModel:
    if not workflow_id:
        return ResponseModel(status=Http.StatusNotFound, message="Workflow not found", data=None)
    try:
        result = await db.execute(select(Node).filter(Node.workflow_id == workflow_id))
        nodes = result.scalars().all()
        if not nodes:
            return ResponseModel(status=Http.StatusNotFound, message="No nodes found", data=None)

        response = TypeAdapter(list[nodeResponse]).validate_python(nodes)
        return ResponseModel(status=Http.StatusOk, message="Nodes fetched successfully", data=response)

    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Database error: {str(e)}", data=None)
    except Exception as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Unexpected error: {str(e)}", data=None)


# DELETE NODE
async def delete_nodes(db: AsyncSession, node_id: UUID) -> ResponseModel:
    if not node_id:
        return ResponseModel(status=Http.StatusNotFound, message="Node ID not found", data=None)
    try:
        result = await db.execute(select(Node).filter(Node.id == node_id))
        node = result.scalar_one_or_none()
        if not node:
            return ResponseModel(status=Http.StatusNotFound, message="Node not found", data=None)

        await db.delete(node)
        await db.commit()
        return ResponseModel(status=Http.StatusOk, message="Node deleted successfully", data=None)

    except SQLAlchemyError as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Database error: {str(e)}", data=None)
    except Exception as e:
        await db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Unexpected error: {str(e)}", data=None)
