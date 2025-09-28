from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from db.database import get_async_db
from models.schema import (
    workflowresponse,
    workflowBase,
    FastApiResponseWrapper,
    WorkflowUpdateRequest,
    WorkflowResponse
)
from api.middleware.middleware import auth_middleware
from api.controllers.workflowController import (
    create_workflows,
    get_all_workflows,
    upadate_workflows,
    delete_workflows,
    save_workflows,
    get_workflow,
    form_builder
)

WORKFLOW_ROUTES = APIRouter()


@WORKFLOW_ROUTES.post("/create", response_model=FastApiResponseWrapper[workflowresponse])
async def create_workflow(workflow_data: workflowBase,
                          db: AsyncSession = Depends(get_async_db),
                          user: dict = Depends(auth_middleware)):
    user_id = user["user_id"]
    response = await create_workflows(db, workflow_data, user_id)
    return FastApiResponseWrapper[workflowresponse](response=response, data=response.data)


@WORKFLOW_ROUTES.get("/all", response_model=FastApiResponseWrapper[list[workflowresponse]])
async def get_all_workflow(db: AsyncSession = Depends(get_async_db),
                           user: dict = Depends(auth_middleware)):
    user_id = user["user_id"]
    response = await get_all_workflows(db, user_id)
    return FastApiResponseWrapper[list[workflowresponse]](response=response, data=response.data)


@WORKFLOW_ROUTES.put("/update/{workflow_id}", response_model=FastApiResponseWrapper[workflowresponse])
async def update_workflow(workflow_data: workflowBase,
                          workflow_id: UUID,
                          db: AsyncSession = Depends(get_async_db),
                          user: dict = Depends(auth_middleware)):
    user_id = user["user_id"]
    response = await upadate_workflows(db, user_id, workflow_id=workflow_id, workflow_data=workflow_data)
    return FastApiResponseWrapper[workflowresponse](response=response, data=response.data)


@WORKFLOW_ROUTES.delete("/delete/{workflow_id}", response_model=FastApiResponseWrapper[workflowresponse])
async def delete_workflow(workflow_id: UUID,
                          db: AsyncSession = Depends(get_async_db),
                          user: dict = Depends(auth_middleware)):
    user_id = user["user_id"]
    response = await delete_workflows(db, user_id, workflow_id)
    return FastApiResponseWrapper[workflowresponse](response=response, data=response.data)


@WORKFLOW_ROUTES.post("/{workflow_id}", response_model=FastApiResponseWrapper[WorkflowResponse])
async def save_workflow(workflow_id: UUID,
                        updated_workflow: WorkflowUpdateRequest,
                        db: AsyncSession = Depends(get_async_db),
                        user: dict = Depends(auth_middleware)):
    response = await save_workflows(db=db, user_id=user["user_id"], workflow_id=workflow_id, updated_workflow=updated_workflow)
    print("updated_workflow", updated_workflow)
    return FastApiResponseWrapper[WorkflowResponse](response=response, data=response.data)


@WORKFLOW_ROUTES.get("/{workflow_id}", response_model=FastApiResponseWrapper[WorkflowResponse])
async def get_workflow_by_id(workflow_id: UUID,
                             db: AsyncSession = Depends(get_async_db),
                             user: dict = Depends(auth_middleware)):
    user_id = user["user_id"]
    response = await get_workflow(db, user_id=user_id, workflow_id=workflow_id)
    return FastApiResponseWrapper[WorkflowResponse](response=response, data=response.data)


@WORKFLOW_ROUTES.get("/form/{workflow_id}", response_model=FastApiResponseWrapper[WorkflowResponse])
async def get_form_builder(workflow_id: UUID, db: AsyncSession = Depends(get_async_db)):
    response = await form_builder(db, workflow_id)
    return FastApiResponseWrapper[WorkflowResponse](
        response=response,
        data=WorkflowResponse.model_validate(response.data) if response.data else None
    )
