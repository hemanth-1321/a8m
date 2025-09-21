from celery_app import celery
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Workflow, Node, Edge, WorkflowExecution
from typing import Dict, Any
from collections import defaultdict, deque
import uuid


def run_gmail_node(node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
    # print(f"[GMAIL] Node {node.id}: {input_data}")
    return {"gmail_result": f"sent_{node.id}"}

def run_openai_node(node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
    # print(f"[OPENAI] Node {node.id}: {input_data}")
    return {"openai_result": f"generated_{node.id}"}

def run_telegram_node(node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
    # print(f"[TELEGRAM] Node {node.id}: {input_data}")
    return {"telegram_result": f"sent_{node.id}"}
