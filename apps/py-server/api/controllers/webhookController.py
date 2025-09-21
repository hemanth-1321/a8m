from sqlalchemy.orm import Session
from db.models import Workflow
from models.response import Http
from models.schema import  ResponseModel
from uuid import UUID
from tasks import process_webhook_task  # import the task
from sqlalchemy.exc import SQLAlchemyError
def webhook_start(db: Session, user_id: str, workflow_id: UUID, data: dict)->ResponseModel:
    print(f"Webhook received for user {user_id}, workflow {workflow_id}")
    
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="unauthorized"
        ) 
    try:
        workflow=db.query(Workflow).filter(Workflow.id==workflow_id,Workflow.user_id==user_id).first()
        if not workflow:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="workflow not found"
            )
        process_webhook_task.apply_async(args=[user_id, str(workflow_id), data], queue="webhooks")
        workflow.status="running"
        db.commit()
        
        return ResponseModel(
            status=Http.StatusOk,
            message="Workflow queued successfully",
            data={"workflow_id": str(workflow.id)}
        )
        
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=str(e)
        )
    except Exception as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=str(e)
        )
        
