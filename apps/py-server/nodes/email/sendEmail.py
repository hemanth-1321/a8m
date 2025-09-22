import os
import resend
from celery_app import celery
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Workflow, Node, Edge, WorkflowExecution
from typing import Dict, Any
from db.models import Node
import uuid

resend.api_key = os.environ["RESEND_API_KEY"]







def sendEmail(to: str, subject: str, body: str):
    """
    Send email using Resend API
    
    Args:
        to (str): Recipient email address
        subject (str): Email subject
        body (str): Email body content
    """
    params: resend.Emails.SendParams = {
        "from": "Acme <noreply@yourdomain.com>",
        "to": to,
        "subject": subject,  # Use the passed subject parameter
        "html": body,        # Use the passed body parameter
    }

    email = resend.Emails.send(params)
    print(f"Email sent: {email}")
    return email


def run_gmail_node(node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    node: current Gmail node containing template in node.data
    input_data: combined outputs from previous nodes
    """
    db: Session = next(get_db())
    try:
        # Refresh node (optional)
        node = db.query(Node).filter(Node.id == node.id).first()
        if not node:
            print(f"Node {node.id} not found")  #type:ignore
            return {"error": "node not found"}

        # Extract previous node outputs (for example, form data)
        form_data = input_data.get("data", {}).get("formData", {})
        name = form_data.get("name", "User")
        email_to = form_data.get("email")

        # Extract template from current node
        body_template = node.data.get("body", "")
        subject_template = node.data.get("subject", "No Subject")

        # Replace placeholders dynamically
        body_filled = body_template.replace("{{previous_node.name}}", name)
        subject_filled = subject_template.replace("{{previous_node.name}}", name)

        # Here you would call your real email API
        
        email_result = sendEmail(to=email_to, subject=subject_filled, body=body_filled)
            
        print(f"Sending email to: {email_to}")
        print(f"Subject: {subject_filled}")
        print(f"Body:\n{body_filled}")

        # Return info to pass to next node
        return {
            "gmail_result": f"sent_{node.id}",
            "sent_to": email_to,
            "subject": subject_filled,
            "body": body_filled
        }

    except Exception as e:
        print(f"Error in Gmail node {node.id}: {e}")#type:ignore
        return {"error": str(e)}








