import resend
from celery_app import celery
from sqlalchemy.orm import Session
from db.database import get_db
from typing import Dict, Any
from db.models import Node
from utils.get_credentails import get_credentials


def sendEmail(to: str, subject: str, body: str,api_key:str):
   
    resend.api_key = api_key
    params: resend.Emails.SendParams = {
        "from": "Automate <noreply@resend.hemanth.buzz>",
        "to": to,
        "subject": subject,  
        "html": body,        
    }

    email = resend.Emails.send(params)
    print(f"Email sent: {email}")
    return email


def run_gmail_node(node: Node, input_data: Dict[str, Any],user_id) -> Dict[str, Any]:
    db: Session = next(get_db())
    try:
        node = db.query(Node).filter(Node.id == node.id).first()
        if not node:
            print(f"Node {node.id} not found")  #type:ignore
            return {"error": "node not found"}

        # Extract previous node outputs 
        form_data = input_data.get("data", {}).get("formData", {})
        name = form_data.get("name", "User")
        email_to = form_data.get("email")

        # Extract template from current node
        body_template = node.data.get("body", "")
        subject_template = node.data.get("subject", "No Subject")

        # Replace placeholders dynamically
        body_filled = body_template.replace("{{previous_node.name}}", name)
        subject_filled = subject_template.replace("{{previous_node.name}}", name)
        
        credentials = get_credentials(node_id=node.id,cred_name="gmail",user_id=user_id)  
        if not credentials:
            return {"error": "missing resend credentials"}
        api_key = credentials["data"].get("oauth_token")
       
        email_result = sendEmail(to=email_to, subject=subject_filled, body=body_filled,api_key=api_key)
        node.status = "completed"
        db.commit() 
        print(f"Sending email to: {email_to}")
        print(f"Subject: {subject_filled}")
        print(f"Body:\n{body_filled}")

        return {
            "gmail_result": f"sent_{node.id}",
            "sent_to": email_to,
            "subject": subject_filled,
            "body": body_filled,
            "response":email_result
        }

    except Exception as e:
        print(f"Error in Gmail node {node.id}: {e}")#type:ignore
        return {"error": str(e)}


