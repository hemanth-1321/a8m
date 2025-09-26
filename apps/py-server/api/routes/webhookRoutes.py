from fastapi import APIRouter, Depends, Body,Request
from sqlalchemy.orm import Session
from models.schema import FastApiResponseWrapper
from db.database import get_db
from api.middleware.middleware import auth_middleware
from api.controllers.webhookController import webhook_start
from uuid import UUID
from typing import Any
import json
from urllib.parse import parse_qs, unquote
WEBHOOK = APIRouter()

@WEBHOOK.post("/{workflow_id}")
def webhook_endpoint(
    workflow_id: UUID,
    data: Any = Body(...),
    db: Session = Depends(get_db),
):
    response = webhook_start(db, workflow_id=workflow_id, data=data)
    return FastApiResponseWrapper(
        response=response,
        data=response.data
    )
    

@WEBHOOK.post("/github/{workflow_id}")
async def github_webhook(
    workflow_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
):
    body = await request.body()
    
    if not body:
        return {"status": "error", "detail": "Empty request body"}
    
    print("Raw body received:", body[:200], "...")  # Log first 200 chars
    
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            payload = json.loads(body.decode('utf-8'))
        elif "application/x-www-form-urlencoded" in content_type:
            body_str = body.decode('utf-8')
            parsed_data = parse_qs(body_str)
            
            if 'payload' in parsed_data:
                payload_json = parsed_data['payload'][0]
                payload = json.loads(payload_json)
            else:
                return {"status": "error", "detail": "No payload parameter found"}
        else:
            try:
                payload = json.loads(body.decode('utf-8'))
            except:
                return {"status": "error", "detail": f"Unsupported content type: {content_type}"}
    
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

    print("Simplified webhook:", simplified)

    try:
        response = webhook_start(db, workflow_id=workflow_id, data=simplified)
        return FastApiResponseWrapper(
        response=response,
        data=response.data
    )
    except Exception as e:
        print(f"Error in webhook_start: {e}")
        return {"status": "error", "detail": str(e)}
    
    
    