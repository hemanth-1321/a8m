from fastapi import FastAPI, Request, APIRouter

WORKFLOW_RESUME = APIRouter()

@WORKFLOW_RESUME.post("/workflow/resume")
async def resume_workflow(request: Request):
    form = await request.form()
    data = {key: form[key] for key in form.keys()}

    from_email = data.get("from")
    subject = data.get("subject")
    text_body = data.get("text")
    html_body = data.get("html")

    # Print everything
    print("From:", from_email)
    print("Subject:", subject)
    print("Text body:", text_body)
    print("HTML body:", html_body)

    # Return as JSON
    return {
        "from": from_email,
        "subject": subject,
        "text": text_body,
        "html": html_body
    }
