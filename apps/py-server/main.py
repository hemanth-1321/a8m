
from fastapi import FastAPI
from api.routes.AuthRoutes import USER_ROUTES
from api.routes.CredentialRoutes import CREDENTIAL_ROUTES
from api.routes.workflowRoutes import WORKFLOW_ROUTES
from api.routes.nodeRoutes import NODE_ROUTER
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app=FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]


app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
        allow_headers=["*"],  # Allows all headers
    )
@app.get("/")
def health():
    return {"msg": "Hello world,Health check"}


app.include_router(USER_ROUTES, prefix="/api/v1/auth",tags=["users"])
app.include_router(CREDENTIAL_ROUTES,prefix="/api/v1/credentials",tags=["credentails"])
app.include_router(WORKFLOW_ROUTES,prefix="/api/v1/workflows",tags=["workflows"])
app.include_router(NODE_ROUTER,prefix="/api/v1/node",tags=["nodes"])
if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host="0.0.0.0",port=8000,reload=True)