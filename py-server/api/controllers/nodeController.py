from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db.models import Node, User
from models.schema import ResponseModel, NodeBase, nodeResponse
from models.response import Http
from pydantic import TypeAdapter, BaseModel
from uuid import UUID

# Calculator request schema
class CalculationRequest(BaseModel):
    operation: str
    operands: list[float]

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


# CALCULATOR
async def calculate(db: AsyncSession, calc_req: CalculationRequest) -> ResponseModel:
    """
    Perform a basic arithmetic calculation based on the operation and operands provided.
    Supported operations: add, subtract, multiply, divide.
    """
    try:
        op = calc_req.operation.lower()
        operands = calc_req.operands

        if not operands or len(operands) < 2:
            return ResponseModel(status=Http.StatusBadRequest, message="At least two operands required", data=None)

        if op == "add":
            result = sum(operands)
        elif op == "subtract":
            result = operands[0]
            for value in operands[1:]:
                result -= value
        elif op == "multiply":
            result = 1
            for value in operands:
                result *= value
        elif op == "divide":
            result = operands[0]
            for value in operands[1:]:
                if value == 0:
                    return ResponseModel(status=Http.StatusBadRequest, message="Division by zero", data=None)
                result /= value
        else:
            return ResponseModel(status=Http.StatusBadRequest, message=f"Unsupported operation '{calc_req.operation}'", data=None)

        return ResponseModel(status=Http.StatusOk, message="Calculation successful", data={"result": result})

    except Exception as e:
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Calculation error: {str(e)}", data=None)