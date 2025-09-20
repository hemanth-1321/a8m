from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.schema import  FastApiResponseWrapper,NodeBase,nodeResponse,nodeRequest
from api.controllers.nodeController import create_nodes,get_all_nodes,delete_nodes
from api.middleware.middleware import auth_middleware

NODE_ROUTER=APIRouter()

@NODE_ROUTER.post("/create",response_model=FastApiResponseWrapper[nodeResponse])
def create_node(
    node_data:NodeBase,
    db: Session = Depends(get_db),
    user:dict=Depends(auth_middleware)
    ):
    print("user",user)
    response=create_nodes(db,node_data,user_id=user["user_id"],workflow_id=node_data.workflow_id)
    return FastApiResponseWrapper(
        response=response,
        data=response.data
    )

@NODE_ROUTER.get("/all", response_model=FastApiResponseWrapper[list[nodeResponse]])
def get_all_node(payload: nodeRequest, db: Session = Depends(get_db)):
    response = get_all_nodes(db, workflow_id=payload.workflow_id)
    return FastApiResponseWrapper(
        response=response,
        data=response.data
    )


@NODE_ROUTER.delete("/{node_id}",response_model=FastApiResponseWrapper)
def delete_node(node_id:str,db:Session=Depends(get_db)):
    response=delete_nodes(db,node_id=node_id)
    return FastApiResponseWrapper(
        response=response,
        data="deleted successfully"
    )