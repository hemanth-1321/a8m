from celery_app import celery
from sqlalchemy.orm import Session
from db.syncDB import get_db
from db.models import WorkflowExecution, Workflow
from typing import Dict, Any,Optional
from utils.get_execution_order import get_execution_order
from utils.execution import execution
import uuid

@celery.task(bind=True, max_retries=5, default_retry_delay=10)
def process_webhook_task(self, user_id: str, workflow_id: str, initial_data: Dict[str, Any], start_node_id:Optional[str] = None):
    """
    Runs a workflow from start or resumes it when a webhook reply arrives.
    """
    print("Webhook received", user_id, workflow_id, initial_data, start_node_id)
    db: Session = next(get_db())

    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            print(f"Workflow {workflow_id} not found")
            return

        # Either create a new execution or fetch latest one
        workflow_execution = (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.workflow_id == workflow_id, WorkflowExecution.user_id == user_id)
            .order_by(WorkflowExecution.started_at.desc())
            .first()
        )

        if not workflow_execution:
            workflow_execution = WorkflowExecution(
                workflow_id=workflow_id,
                user_id=user_id,
                status="running",
                input_data=initial_data,
                output_data={}
            )
            db.add(workflow_execution)
            db.commit()

        execution_order = get_execution_order(workflow.nodes, workflow.edges)
        node_outputs = {}

        # If resuming → skip already executed nodes
        if start_node_id and start_node_id in [str(nid) for nid in execution_order]:
            start_index = [str(nid) for nid in execution_order].index(str(start_node_id))
            execution_order = execution_order[start_index:]  # start from paused node
        print("Execution order:", execution_order)

        for node_id in execution_order:
            node = next((n for n in workflow.nodes if str(n.id) == str(node_id)), None)
            if not node:
                continue

            # If this is the node we are resuming from
            if start_node_id and str(node_id) == str(start_node_id):
                print(f"Resuming workflow {workflow_id} at node {node_id}")
                output = execution(node_id=node_id, workflow_id=workflow_id, initial_data=initial_data, resume=True)

                node_outputs[node_id] = output
                workflow_execution.output_data.update({str(node_id): output})
                db.commit()
                continue  # proceed to next node

            # Normal execution for fresh nodes
            input_data: Dict[str, Any] = {**initial_data}
            for edge in workflow.edges:
                if str(edge.target_node_id) == str(node_id) and str(edge.source_node_id) in node_outputs:
                    input_data.update(node_outputs[str(edge.source_node_id)])

            output = execution(node_id=node_id, workflow_id=workflow_id, initial_data=input_data)

            if output.get("status") == "waiting_for_reply":
                print(f"Workflow {workflow_id} paused at node {node_id}")
                workflow_execution.status = "paused"
                workflow_execution.waiting_node_id = str(node_id) # type: ignore
                workflow_execution.execution_order = [str(nid) for nid in execution_order] # type: ignore
                db.commit()
                return

            node_outputs[node_id] = output
            workflow_execution.output_data.update({str(node_id): output})
            db.commit()

        # If finished all nodes
        workflow_execution.status = "completed"
        workflow.status = "completed"
        db.commit()
        print(f"Workflow {workflow_id} completed successfully")

    except Exception as exc:
        print(f"Error processing workflow {workflow_id}: {exc}, retrying...")
        raise self.retry(exc=exc)
