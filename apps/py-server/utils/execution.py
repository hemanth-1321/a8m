from db.models import Node, Workflow
from db.database import get_db
from sqlalchemy.orm import Session

from nodes.test import  run_openai_node, run_telegram_node  # add more as needed
from nodes.email.sendEmail import run_gmail_node
NODE_EXECUTION_MAP = {
    "send email": run_gmail_node,
    "openai": run_openai_node,
    "telegram": run_telegram_node,
    # "slack": run_slack_node, etc.
}
def execution(node_id, workflow_id, initial_data):
    print("initial data", initial_data)
    
    db: Session = next(get_db())
    output_data = {}

    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            return {}

        node = db.query(Node).filter(Node.id == node_id).first()
        if not node:
            return {}

        node.status = "running"
        db.add(node)
        db.commit()

        node_name = (node.title or (node.data or {}).get("name", "unknown")).lower()
        node_type = node.type
        print(f"Executing node {node_id} ({node_name}) type {node_type}")

        if node_type and getattr(node_type, "name", None) == "ACTION":
            # dynamically call function if exists
            func = NODE_EXECUTION_MAP.get(node_name)
            if func:
                output_data = func(node, initial_data,user_id=workflow.user_id)
            else:
                output_data = {"result": f"No handler for {node_name}"}

        elif node_type and getattr(node_type, "name", None) == "FORM":
            output_data = {"form_data": initial_data.get("form_data", {})}

        elif node_type and getattr(node_type, "name", None) in ["WEBHOOK", "TRIGGER"]:
            output_data = {"triggered": True}

        else:
            # fallback: pass input forward
            output_data = initial_data

        node.status = "completed"
        db.commit()
        return output_data

    except Exception as exc:
        print(f"Error processing workflow {workflow_id}: {exc}")
        return initial_data  # fail-safe
