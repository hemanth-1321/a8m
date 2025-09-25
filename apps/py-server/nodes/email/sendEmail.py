import resend
import os
from celery_app import celery
from sqlalchemy.orm import Session
from db.database import get_db
from typing import Dict, Any
from db.models import Node
from utils.get_credentails import get_credentials
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv


load_dotenv()
GEMINI_API_KEY=os.getenv("GEMINI_KEY")
def sendEmail(to: str, subject: str, body: str, api_key: str):
    """Send email using Resend API."""
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


def generate_email_body_gemini(input_data: dict, user_name: str = "User") -> str:
    gemini = ChatGoogleGenerativeAI(model="gemini-2.5-flash", api_key=GEMINI_API_KEY) 

    prompt = f"""
    You are an AI assistant that writes professional, clear, and friendly emails.
    Use the following data to write an email for {user_name}:

    {input_data}

    Write the email in a polite, concise, and professional style. Include all relevant information from the data,do not include any errors in the email.
    """

    response = gemini.invoke([{"role": "user", "content": prompt}])
    return str(response.text())


def run_gmail_node(node: Node, input_data: Dict[str, Any], user_id) -> Dict[str, Any]:
    """Run a Gmail node: generate email using Gemini and send with Resend."""
    print("Input data:", input_data)
    db: Session = next(get_db())

    try:
        node = db.query(Node).filter(Node.id == node.id).first()
        if not node:
            return {"error": "Node not found"}

        # Determine recipient
        email_to = None
        user_name = "User"

        form_data = input_data.get("data", {}).get("formData", {})
        if form_data:
            user_name = form_data.get("name", user_name)
            email_to = form_data.get("email", email_to)

        if not email_to:
            email_to = (
                input_data.get("data", {}).get("to") or
                input_data.get("data", {}).get("email") or
                input_data.get("to") or
                input_data.get("email") or
                (node.data or {}).get("to")
            )

        if not email_to or not isinstance(email_to, str):
            print(f"Debug - email_to: {email_to}")
            print(f"Debug - input_data: {input_data}")
            return {"error": "No valid email recipient found."}

        subject = (node.data or {}).get("subject", "No Subject")
        if input_data.get("subject"):
            subject = input_data.get("subject")

        # Generate email body with Gemini AI
        body = generate_email_body_gemini(input_data, user_name=user_name)

        body = body.replace("{{previous_node.name}}", user_name)
        subject = subject.replace("{{previous_node.name}}", user_name)  #type:ignore

        credentials = get_credentials(node_id=node.id, cred_name="gmail", user_id=user_id)
        if not credentials:
            return {"error": "Missing Resend credentials"}

        api_key = credentials["data"].get("oauth_token")
        if not api_key:
            return {"error": "Missing API key in credentials"}

        email_result = sendEmail(to=email_to, subject=subject, body=body, api_key=api_key)

        node.status = "completed"
        db.commit()

        print(f"Email sent to: {email_to}")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}")

        return {
            "gmail_result": f"sent_{node.id}",
            "sent_to": email_to,
            "subject": subject,
            "body": body,
            "response": email_result
        }

    except Exception as e:
        return {"error": str(e)}
