import re
from fastapi import  Request, APIRouter
from tasks import process_webhook_task
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Workflow,Node
WORKFLOW_RESUME = APIRouter()

@WORKFLOW_RESUME.post("/workflow/resume")
async def resume_workflow(request: Request):
    db:Session=next(get_db())
    form = await request.form()
    data = {key: form[key] for key in form.keys()}

    from_email = str(data.get("from") or "")
    subject = str(data.get("subject") or "")
    text_body = str(data.get("text") or "")
    html_body = str(data.get("html") or "")

    # Print everything
    print("From:", from_email)
    print("Subject:", subject)
    print("Text body:", text_body)
    print("HTML body:", html_body)

    # Extract workflow and node IDs from subject
    workflow_id = None
    node_id = None
    match = re.search(r"\[WF-([a-f0-9-]+)-N-([a-f0-9-]+)\]", subject)
    if match:
        workflow_id, node_id = match.groups()
        print("Workflow ID:", workflow_id)
        print("Node ID:", node_id)
    
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    user_id = None
    if workflow is not None:
        user_id = workflow.user_id
    else:
        print("Workflow not found for ID:", workflow_id)
    
    process_webhook_task.delay(user_id,workflow_id, {
        "from": from_email,
        "subject": subject,
        "text": text_body,
        "html": html_body,
    },
    node_id
)

    return {
        "from": from_email,
        "subject": subject,
        "workflow_id": workflow_id,
        "node_id": node_id,
        "text": text_body,
        "html": html_body
    }
