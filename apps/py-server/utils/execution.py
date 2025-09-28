from db.models import Node, Workflow,Edge
from db.syncDB import get_db
from sqlalchemy.orm import Session
from nodes.Agents.llms.run_agent_node import run_agent_node
from nodes.email.sendEmail import run_gmail_node

NODE_EXECUTION_MAP = {
    "send email": run_gmail_node,
    "send & wait for email": run_gmail_node,
    "agent": run_agent_node,
    "ai agent": run_agent_node,   
    "groq": run_agent_node,
    "gemini": run_agent_node,
}

def execution(node_id: str, workflow_id: str, initial_data: dict, resume: bool = False):
    """
    Executes a workflow node.

    - resume=False → fresh execution (normal run)
    - resume=True → resuming a waiting node (e.g. webhook reply)
    """
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
        print(f"Executing node {node_id} ({node_name}) type {node_type} (resume={resume})")

        if node_type and getattr(node_type, "name", None) == "ACTION":
            func = NODE_EXECUTION_MAP.get(node_name)
            if func:
                if node_name == "send & wait for email":
                    if resume:
                        output_data = {"reply": initial_data}
                    else:
                        output_data = func(node, initial_data, user_id=workflow.user_id, wait_for_reply=True)
                        node.status = "waiting_for_reply"
                        db.commit()
                        print(f"Node {node.id} is waiting for reply. Workflow paused.")
                        return {"status": "waiting_for_reply"}
                elif node_name == "send email":
                    output_data = func(node, initial_data, user_id=workflow.user_id)
                else:
                    output_data = func(node, initial_data, user_id=workflow.user_id)
                    print("output data", output_data)
            else:
                output_data = {"result": f"No handler for {node_name}"}
        else:
            output_data = initial_data

        node.status = "completed"
        db.commit()

        edges = db.query(Edge).filter(Edge.source_node_id == node.id).all()
        for edge in edges:
            print(f"Passing output to next node {edge.target_node_id}")
            execution(str(edge.target_node_id), workflow_id, output_data, resume=False)

        return output_data

    except Exception as exc:
        print(f"Error processing workflow {workflow_id}: {exc}")
        return initial_data
