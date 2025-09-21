from db.models import Node,Workflow
from db.database import get_db
from sqlalchemy.orm import Session

def execution(node_id,workflow_id):
    db:Session=next(get_db())
    try:
        workflow=db.query(Workflow).filter(Workflow.id==workflow_id).first()
        if not workflow:
            print(f"workflow{workflow_id} not found")
            return

        node = db.query(Node).filter(Node.id == node_id).first()
        if not node:
            print(f"Node {node_id} not found in workflow {workflow_id}")
            return

         # Use title OR data["name"]
        node_name = node.title or (node.data or {}).get("name", "unknown")
        
        print(f"Executing node {node_id} ({node_name}) in workflow {workflow_id}")
           
        
    except Exception as exc:
        print(f"Error processing workflow {workflow_id}: {exc}, retrying...")
        
                
    
    