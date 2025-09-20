from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.schema import workflowresponse,workflowBase,FastApiResponseWrapper,WorkflowUpdateRequest,ResponseModel,WorkflowResponse
from api.middleware.middleware import auth_middleware
from api.controllers.workflowController import create_workflows,get_all_workflows,upadate_workflows,delete_workflows,save_workflows,get_workflow
from uuid import UUID
from sqlalchemy.orm import joinedload
WORKFLOW_ROUTES=APIRouter()


@WORKFLOW_ROUTES.post("/create",response_model=FastApiResponseWrapper[workflowresponse])
def create_workflow( workflow_data:workflowBase,db: Session = Depends(get_db),user: dict = Depends(auth_middleware)):
    user_id=user["user_id"]
    response=create_workflows(db,workflow_data,user_id)
    return FastApiResponseWrapper[workflowresponse](
        response=response,
        data=response.data
    )
    
@WORKFLOW_ROUTES.get("/all",response_model=FastApiResponseWrapper[list[workflowresponse]])
def get_all_workflow(db:Session=Depends(get_db),user:dict=Depends(auth_middleware)):
    user_id=user["user_id"]
    response=get_all_workflows(db,user_id)
    return FastApiResponseWrapper[list[workflowresponse]](
        response=response,
        data=response.data
    )
    
    
@WORKFLOW_ROUTES.put("/update/{workflow_id}",response_model=FastApiResponseWrapper[workflowresponse])
def update_workflow(
    workflow_data: workflowBase,                  # non-default first
    db: Session = Depends(get_db),                # then defaults
    user: dict = Depends(auth_middleware),
    workflow_id=UUID
):
    user_id=user["user_id"]
    response=upadate_workflows(db,user_id,workflow_id=workflow_id,workflow_data=workflow_data)
    return FastApiResponseWrapper[workflowresponse](
        response=response,
        data=response.data
    )
    
    
@WORKFLOW_ROUTES.delete("/delete/{workflow_id}",response_model=FastApiResponseWrapper[workflowresponse])
def delete_workflow(
    db:Session=Depends(get_db),
    user:dict=Depends(auth_middleware),
    workflow_id=UUID
):
    user_id=user["user_id"]
    response=delete_workflows(db,user_id,workflow_id)
    return FastApiResponseWrapper[workflowresponse](
        response=response,
        data=response.data
    )
    
    
    
    
@WORKFLOW_ROUTES.post("/{workflow_id}", response_model=FastApiResponseWrapper[WorkflowResponse])
def save_workflow(workflow_id: UUID, updated_workflow: WorkflowUpdateRequest, db: Session = Depends(get_db), user: dict = Depends(auth_middleware)):
   response = save_workflows(
    db=db,
    user_id=user["user_id"],
    workflow_id=workflow_id,
    updated_workflow=updated_workflow
)   
   print("updated_workflow",updated_workflow)
   
   return FastApiResponseWrapper[WorkflowResponse](response=response, data=response.data)



@WORKFLOW_ROUTES.get(
    "/{workflow_id}",
    response_model=FastApiResponseWrapper[WorkflowResponse]
)
def get_workflow_by_id(
    workflow_id: UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(auth_middleware)
):
    user_id = user["user_id"]
    response = get_workflow(db, user_id=user_id, workflow_id=workflow_id)

    # ensure ResponseWrapper always has correct typing
    return FastApiResponseWrapper[WorkflowResponse](
        response=response,
        data=response.data
    )
