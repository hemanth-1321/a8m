from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from models.schema import FastApiResponseWrapper
from db.database import get_db
from api.middleware.middleware import auth_middleware
from api.controllers.webhookController import webhook_start
from uuid import UUID
from typing import Any

WEBHOOK = APIRouter()

@WEBHOOK.post("/{workflow_id}")
def webhook_endpoint(
    workflow_id: UUID,
    data: Any = Body(...),
    db: Session = Depends(get_db),
    user: dict = Depends(auth_middleware),
):
    user_id = user["user_id"]
    response = webhook_start(db, user_id=user_id, workflow_id=workflow_id, data=data)
    return FastApiResponseWrapper(
        response=response,
        data=response.data
    )