import os
import resend

resend.api_key = os.environ["RESEND_API_KEY"]



def sendEmail(to:str,data):
    params: resend.Emails.SendParams = {
    "from": "Acme <onboarding@resend.dev>",
    "to": to,
    "subject": "hello world",
    "html": "<strong>it works!</strong>",   
}

    email = resend.Emails.send(params)
    print(email)