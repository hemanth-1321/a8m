from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.schema import FastApiResponseWrapper, CredentialsBase, CredentialResponse
from api.controllers.credentialController import create_credentials,get_credentials,delete_credentails
from api.middleware.middleware import auth_middleware
from uuid import UUID
CREDENTIAL_ROUTES = APIRouter()

@CREDENTIAL_ROUTES.post(
    "/create",
    response_model=FastApiResponseWrapper[CredentialResponse]  
)
def create_credential(
    credentials: CredentialsBase,
    db: Session = Depends(get_db),
    user: dict = Depends(auth_middleware)
):
    credentials.user_id = user["user_id"]
    response_model = create_credentials(db, credentials_data=credentials)
    return FastApiResponseWrapper[CredentialResponse](
        response=response_model,
        data=response_model.data
    )


@CREDENTIAL_ROUTES.get(
    "/get",
    response_model=FastApiResponseWrapper[list[CredentialResponse]]
)
def get_credentail(
    db:Session=Depends(get_db),
    user:dict=Depends(auth_middleware)
):
    user_id=user["user_id"]
    response=get_credentials(db,user_id)
    return FastApiResponseWrapper[list[CredentialResponse]](
        response=response,
        data=response.data
    )
    
@CREDENTIAL_ROUTES.delete("/{credential_id}",response_model=FastApiResponseWrapper[None])
def remove_credential(
    credential_id:UUID, 
    db:Session=Depends(get_db),
    user:dict=Depends(auth_middleware)
):
    response=delete_credentails(db,credential_id,user_id=user["user_id"])
    return FastApiResponseWrapper[None](
        response=response,
        data=response.data
    )