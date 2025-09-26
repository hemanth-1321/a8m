from db.models import Node, Workflow
from db.database import get_db
from sqlalchemy.orm import Session
from nodes.test import run_telegram_node 
from nodes.Agents.llms.run_agent_node import run_agent_node
from nodes.email.sendEmail import run_gmail_node
NODE_EXECUTION_MAP = {
    "send email": run_gmail_node,
    "agent": run_agent_node,
    "telegram": run_telegram_node,
    "groq":run_agent_node,
    "gemini":run_agent_node,
    "send & wait for email":run_gmail_node
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
            func = NODE_EXECUTION_MAP.get(node_name)
            if func:
                if node_name in ["send email", "send & wait for email"]:
                    wait = node_name == "send & wait for email"
                    output_data = func(node, initial_data, user_id=workflow.user_id, wait_for_reply=wait)

                    if wait:
                        # Node is waiting → mark paused & return
                        node.status = "waiting_for_reply"
                        db.commit()
                        print(f"Node {node.id} is waiting for reply. Workflow paused.")
                        return {"status": "waiting_for_reply"}

                else:
                    output_data = {"result": f"No handler logic for {node_name}"}
            else:
                output_data = {"result": f"No handler for {node_name}"}
        else:
            output_data = initial_data

        node.status = "completed"
        db.commit()
        return output_data

    except Exception as exc:
        print(f"Error processing workflow {workflow_id}: {exc}")
        return initial_data
