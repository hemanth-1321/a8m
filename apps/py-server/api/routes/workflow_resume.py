from fastapi import FastAPI, Request,APIRouter
from db.database import get_db
from db.models import Node, Workflow
from sqlalchemy.orm import Session

WORKFLOW_RESUME = APIRouter()
@WORKFLOW_RESUME.post("/workflow/resume")
async def resume_workflow(request: Request):
    data = await request.json()
    reply_token = data.get("reply_token")

    if not reply_token:
        return {"error": "Missing reply_token"}

    # Parse token: [WF-<workflowId>-N-<nodeId>]
    try:
        parts = reply_token.strip("[]").split("-")
        workflow_id = int(parts[1])
        node_id = int(parts[3])
    except Exception:
        return {"error": "Invalid reply token"}

    db: Session = next(get_db())

    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        return {"error": "Node not found"}

    # Mark node completed & continue workflow
    node.status = "completed"
    db.commit()

    # TODO: Trigger execution of next node in workflow
    # execution(node_id, workflow_id, {"email_reply": data})
    

    return {"status": "resumed", "workflow": workflow_id, "node": node_id}
