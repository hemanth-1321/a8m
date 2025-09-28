from fastapi import APIRouter, Depends, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_async_db
from models.schema import FastApiResponseWrapper
from api.controllers.webhookController import webhook_start
from uuid import UUID
from typing import Any
import json
from urllib.parse import parse_qs

WEBHOOK = APIRouter()

@WEBHOOK.post("/{workflow_id}")
async def webhook_endpoint(
    workflow_id: UUID,
    data: Any = Body(...),
    db: AsyncSession = Depends(get_async_db),
):
    response = await webhook_start(db, workflow_id=workflow_id, data=data)
    return FastApiResponseWrapper(
        response=response,
        data=response.data
    )

@WEBHOOK.post("/github/{workflow_id}")
async def github_webhook(
    workflow_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
):
    body = await request.body()
    if not body:
        return {"status": "error", "detail": "Empty request body"}

    try:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            payload = json.loads(body.decode('utf-8'))
        elif "application/x-www-form-urlencoded" in content_type:
            parsed_data = parse_qs(body.decode('utf-8'))
            if "payload" in parsed_data:
                payload = json.loads(parsed_data["payload"][0])
            else:
                return {"status": "error", "detail": "No payload parameter found"}
        else:
            payload = json.loads(body.decode('utf-8'))
    except json.JSONDecodeError as e:
        return {"status": "error", "detail": f"Invalid JSON: {str(e)}"}
    except Exception as e:
        return {"status": "error", "detail": f"Error parsing payload: {str(e)}"}

    simplified = {
        "email": payload.get("pusher", {}).get("email")
                  or payload.get("head_commit", {}).get("author", {}).get("email"),
        "repository": payload.get("repository", {}).get("full_name"),
        "branch": payload.get("ref", "").replace("refs/heads/", ""),
        "commit_id": payload.get("head_commit", {}).get("id"),
        "message": payload.get("head_commit", {}).get("message"),
    }

    try:
        response = await webhook_start(db, workflow_id=workflow_id, data=simplified)
        return FastApiResponseWrapper(response=response, data=response.data)
    except Exception as e:
        return {"status": "error", "detail": str(e)}
