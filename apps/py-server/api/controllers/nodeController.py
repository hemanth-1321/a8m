from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db.models import Node,User
from models.schema import ResponseModel,nodeBase,nodeResponse
from models.response import Http
from uuid import UUID


def create_nodes(db:Session,node_data:nodeBase,user_id:str,workflow_id)->ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        user=db.query(User).filter(User.id==user_id).first()
        if not user:
            return ResponseModel(
            status=Http.StatusNotFound,
            message="user not found",
            data=None
            )
        new_node=Node(
            title=node_data.title,
            trigger=node_data.trigger,
            enabled=True,
            workflow_id=workflow_id
        )
        db.add(new_node)
        db.commit()
        db.refresh(new_node)
        response=nodeResponse.model_validate(new_node) 
        return ResponseModel(
            status=Http.StatusOk,
            message="node created succesfully",
            data=new_node
        )
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"data base error occrured:{str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occurred:{str(e)}",
            data=None
        )
       
        
def get_all_nodes(db:Session,workflow_id)->ResponseModel:
    if not workflow_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="workspace not found",
            data=None
        )
    try:
        nodes=db.query(Node).filter(Node.workflow_id==workflow_id).all()
        if not nodes:
            return ResponseModel(
            status=Http.StatusInternalServerError,
            message="unable to find nodes",
            data=None
        )
        response=nodeResponse.model_validate(nodes)
        return ResponseModel(
            status=Http.StatusOk,
            message="nodes fetched succesfully",
            data=response
        )
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"data base error occrured:{str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occurred:{str(e)}",
            data=None
        )
        
def delete_node(db:Session,node_id)->ResponseModel:
    if not node_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="node id not found",
            data=None
        )
    try:
        node=db.query(Node).filter(Node.id==node_id).first()
        db.delete(node)
        db.commit()
        return ResponseModel(
             status=Http.StatusOk,
             message="node delted successfully",
             data=None
        )
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"data base error occrured:{str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occurred:{str(e)}",
            data=None
        )