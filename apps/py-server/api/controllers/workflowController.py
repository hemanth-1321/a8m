from models.response import Http
from models.schema import workflowBase,ResponseModel,workflowresponse,WorkflowUpdateRequest,WorkflowResponse
from db.models import User,Workflow
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db.models import Workflow
from fastapi import  HTTPException
from uuid import UUID
from sqlalchemy.orm import joinedload
from api.controllers.nodeController import update_nodes,update_edges_only
def create_workflows(db: Session, workflow_data: workflowBase, user_id: str) -> ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="UnAuthorized",
                data=None
            )
        
        new_workflow = Workflow(
            title=workflow_data.title,
            enabled=True,
            trigger=workflow_data.trigger,
            user_id=user_id
        )
        
        db.add(new_workflow)
        db.commit()
        db.refresh(new_workflow)
        
        workflow_response = workflowresponse.model_validate(new_workflow)
        return ResponseModel(
            status=Http.StatusOk,
            message="workflow created succesfully",
            data=workflow_response
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

def get_all_workflows(db:Session,user_id:str)->ResponseModel:
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
        workflows=db.query(Workflow).filter(Workflow.user_id==user_id).all()
        response=[]
        for ws in workflows:
            response.append(workflowresponse.model_validate(ws))
        return ResponseModel(
            status=Http.StatusOk,
            message="Credentails fetched successfully",
            data=response
        )
    except SQLAlchemyError as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected exception occured {str(e)}",
            data=None
        )
        
        
def upadate_workflows(db:Session,user_id:str,workflow_id,workflow_data: workflowBase)->ResponseModel:
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
        workflow=db.query(Workflow).filter(
            Workflow.id==workflow_id,
            Workflow.user_id==user_id
        ).first()
        if not workflow:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="workflow not found",
                data=None
            )
        update_data=workflow_data.model_dump(exclude_unset=True)
        for key,value in update_data.items():
            setattr(workflow,key,value)
        db.commit()
        db.refresh(workflow)

        return ResponseModel(
            status=Http.StatusOk,
            message="Workflow updated sucessfully",
            data=workflowresponse.model_validate(workflow)
        )            
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"database error occured {str(e)}",
            data=None
        )
    except Exception as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occured {str(e)}",
            data=None
        )
        
def delete_workflows(db:Session,user_id:str,workflow_id)->ResponseModel:
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
                message="User not found",
                data=None
            )
        workflow=db.query(Workflow).filter(Workflow.id==workflow_id,Workflow.user_id==user_id).first()
        if not workflow:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="workflow not found",
                data=None
            )
        db.delete(workflow)
        db.commit()
        return ResponseModel(
            status=Http.StatusOk,
            message="workflow delted successfully",
            data=None
        )
    
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occured: {str(e)}",
            data=None
        )
    except Exception as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An internal server error occured :{str(e)}",
            data=None
        )


def save_workflows(db: Session, user_id: str, workflow_id: UUID, updated_workflow: WorkflowUpdateRequest) -> ResponseModel:
    if not user_id:
        return ResponseModel(status=Http.StatusNotFound, message="Unauthorized", data=None)
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id, Workflow.user_id == user_id).first()
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")

        # Update fields
        workflow.title = updated_workflow.title  # type: ignore
        workflow.enabled = updated_workflow.enabled  # type: ignore

        # Cast UUID → str before passing
        update_nodes(db, str(workflow_id), new_nodes=updated_workflow.nodes)
        update_edges_only(db, str(workflow_id), updated_workflow.edges)

        db.commit()
        db.refresh(workflow)

        return ResponseModel(
            status=Http.StatusOk,
            message="Workflow updated successfully",
            data=WorkflowResponse.model_validate(workflow)
        )
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Database error: {str(e)}", data=None)
    except Exception as e:
        return ResponseModel(status=Http.StatusInternalServerError, message=f"Unexpected error: {str(e)}", data=None)
    
    
    

def get_workflow(db: Session, user_id: str, workflow_id: UUID) -> ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="unauthorized",
            data=None
        )
    try:
        workflow = (
            db.query(Workflow)
            .options(joinedload(Workflow.nodes), joinedload(Workflow.edges))
            .filter(Workflow.id == workflow_id, Workflow.user_id == user_id)
            .first()
        )

        if not workflow:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="workflow not found"
            )

        return ResponseModel(
            status=Http.StatusOk,
            message="workflow fetched successfully",
            data=WorkflowResponse.model_validate(workflow)
        )
    except SQLAlchemyError as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Unexpected error occurred: {str(e)}",
            data=None
        )
