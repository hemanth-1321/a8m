from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_async_db
from models.schema import FastApiResponseWrapper, NodeBase, nodeResponse, nodeRequest
from api.controllers.nodeController import create_nodes, get_all_nodes, delete_nodes
from api.middleware.middleware import auth_middleware

NODE_ROUTER = APIRouter()

@NODE_ROUTER.post("/create", response_model=FastApiResponseWrapper[nodeResponse])
async def create_node(
    node_data: NodeBase,
    db: AsyncSession = Depends(get_async_db),
    user: dict = Depends(auth_middleware)
):
    print("user", user)
    response = await create_nodes(db, node_data, user_id=user["user_id"], workflow_id=node_data.workflow_id)
    return FastApiResponseWrapper(
        response=response,
        data=response.data
    )


from uuid import UUID

@NODE_ROUTER.get("/all", response_model=FastApiResponseWrapper[list[nodeResponse]])
async def get_all_node(payload: nodeRequest, db: AsyncSession = Depends(get_async_db)):
    workflow_uuid = UUID(payload.workflow_id)
    response = await get_all_nodes(db, workflow_id=workflow_uuid)
    return FastApiResponseWrapper(
        response=response,
        data=response.data
    )


@NODE_ROUTER.delete("/{node_id}", response_model=FastApiResponseWrapper)
async def delete_node(node_id: str, db: AsyncSession = Depends(get_async_db)):
    node_uuid = UUID(node_id)
    response = await delete_nodes(db, node_id=node_uuid)
    return FastApiResponseWrapper(
        response=response,
        data="deleted successfully"
    )
