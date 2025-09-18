
from fastapi import FastAPI
from api.routes.AuthRoutes import USER_ROUTES
from api.routes.CredentialRoutes import CREDENTIAL_ROUTES
from api.routes.workflowRoutes import WORKFLOW_ROUTES
from dotenv import load_dotenv

load_dotenv()

app=FastAPI()


@app.get("/")
def health():
    return {"msg": "Hello world,Health check"}


app.include_router(USER_ROUTES, prefix="/api/v1/auth",tags=["users"])
app.include_router(CREDENTIAL_ROUTES,prefix="/api/v1/credentials",tags=["credentails"])
app.include_router(WORKFLOW_ROUTES,prefix="/api/v1/workflow",tags=["workflows"])

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host="0.0.0.0",port=8000,reload=True)