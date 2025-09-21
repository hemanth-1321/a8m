from celery_app import celery
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import WorkflowExecution
from typing import Dict,Any
from db.models import Workflow
from utils.get_execution_order import get_execution_order
from nodes.test import run_gmail_node,run_openai_node,run_telegram_node
from utils.execution import execution

@celery.task(bind=True, max_retries=5, default_retry_delay=10)
def process_webhook_task(self, user_id: str, workflow_id: str,initial_data: Dict[str, Any]):
    db:Session=next(get_db())
    try:
        #  print(f"Processing workflow {workflow_id} for user {user_id} with data {initial_data}")
        
        workflow=db.query(Workflow).filter(Workflow.id==workflow_id).first()
        if not workflow:
            print(f"workflow{workflow_id} not found")
            return
        workflow_execution=WorkflowExecution(
            workflow_id=workflow_id,
            user_id=user_id,
            status="running",
            input_data=initial_data
        )
        db.add(workflow_execution)
        db.commit()
        execution_order=get_execution_order(workflow.nodes,workflow.edges)
        node_outputs={}
        for node_id in execution_order:
            node=next((n for n in workflow.nodes if n.id==node_id),None)
            if not node:
                continue
            
            input_data: Dict[str, Any] = {**initial_data}

            for edge in workflow.edges:
                if edge.target_node_id==node_id and edge.source_node_id in node_outputs:
                    input_data.update(node_outputs[edge.source_node_id])
            
            node_name = node.data.get("name", "").lower()
            # print("node recieved",node_id,node_name)
            execution(node_id=node_id,workflow_id=workflow_id)
            
            
            
            if node_name == "gmail":
                output = run_gmail_node(node, input_data)
                
            elif node_name == "openai":
                output = run_openai_node(node, input_data)
            elif node_name == "telegram":
                output = run_telegram_node(node, input_data)
            else:
                output = {}
            # print('output',output)
            node_outputs[node_id] = output
            workflow_execution.output_data.update({str(node_id): output})
            db.commit()
        workflow_execution.status = "completed"  #type: ignore
    
        db.commit()
        workflow.status = "completed"
        db.commit()
        print(f"Workflow {workflow_id} completed successfully")


        
        
        
    except Exception as exc:
        print(f"Error processing workflow {workflow_id}: {exc}, retrying...")
        raise self.retry(exc=exc)
