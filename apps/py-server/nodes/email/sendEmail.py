import resend
from celery_app import celery
from sqlalchemy.orm import Session
from db.database import get_db
from typing import Dict, Any
from db.models import Node
from utils.get_credentails import get_credentials

def sendEmail(to: str, subject: str, body: str, api_key: str):
    resend.api_key = api_key
    
    html_body = body.replace('\n', '<br>')
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        {html_body}
    </body>
    </html>
    """
    
    params: resend.Emails.SendParams = {
        "from": "Hemanth <noreply@resend.hemanth.buzz>", 
        "to": to,
        "subject": subject,
        "html": html_content,
        "text": body,  
    }
    
    email = resend.Emails.send(params)
    print(f"Email sent: {email}")
    return email

def run_gmail_node(node: Node, input_data: Dict[str, Any], user_id) -> Dict[str, Any]:
    print("input data email", input_data)
    db: Session = next(get_db())
    
    try:
        node = db.query(Node).filter(Node.id == node.id).first()
        if not node:
            return {"error": "node not found"}

        email_to = None
        name = "User"  # default name
        body_content = ""
        subject_content = "No Subject"

        if input_data.get("output"):
            body_content = str(input_data.get("output", ""))
            
        form_data = input_data.get("data", {}).get("formData", {})
        if form_data:
            name = form_data.get("name", name)
            if form_data.get("email"):
                email_to = form_data.get("email")
        
        if not email_to and input_data.get("data"):
            data = input_data.get("data", {})
            if data.get("to"):
                email_to = data.get("to")
            if data.get("email"):
                email_to = data.get("email")
        
        node_data = node.data or {}
        
        if not email_to:
            email_to = node_data.get("to")
        
        # Validate email_to is a string and not empty
        if not email_to or not isinstance(email_to, str):
            return {"error": "No valid email recipient found. The 'to' field must be a non-empty string."}
        
        # Get email templates from node configuration
        body_template = node_data.get("body", "")
        subject_template = node_data.get("subject", "No Subject")
        
        
        
        # Check if there's specific email content in input data
        input_body = input_data.get("body") or input_data.get("email_body")
        
        if input_body:
            # Use specific email body from input
            body_template = input_body
        elif body_content and len(body_content.strip()) > 0:
            if body_template and "{{previous_node.output}}" in body_template:
                pass
            elif body_template and "Thank you for reaching out" in body_template:
                body_template = f"Hello,\n\nHere's the information you requested:\n\n{body_content}\n\nBest regards,\nYour Team"
            else:
                # Clean up the body content and format it properly
                clean_content = body_content.replace('***', '• ').replace('**', '').strip()
                
                # Create a well-formatted email
                body_template = f"""Hello,

Here's the information you requested:

{clean_content}

Best regards,
Your Team"""
        elif not body_template:
            body_template = "Default email content"
        
        # Replace placeholders dynamically
        # Replace {{previous_node.name}} with actual name
        body_filled = body_template.replace("{{previous_node.name}}", name)
        subject_filled = subject_template.replace("{{previous_node.name}}", name)
        
        # Replace {{previous_node.output}} with previous node's output if present
        if body_content:
            body_filled = body_filled.replace("{{previous_node.output}}", body_content)
            subject_filled = subject_filled.replace("{{previous_node.output}}", body_content)
        
        # Get credentials
        credentials = get_credentials(node_id=node.id, cred_name="gmail", user_id=user_id)
        
        if not credentials:
            return {"error": "missing resend credentials"}
        
        api_key = credentials["data"].get("oauth_token")
        if not api_key:
            return {"error": "missing API key in credentials"}
        
        # Send email
        email_result = sendEmail(to=email_to, subject=subject_filled, body=body_filled, api_key=api_key)
        
        # Update node status
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
            "response": email_result
        }
    
    except Exception as e:
        return {"error": str(e)}