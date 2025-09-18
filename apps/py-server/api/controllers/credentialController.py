from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db.models import User,Credentials
from models.schema import ResponseModel, CredentialsBase,CredentialResponse
from models.response import Http
from uuid import UUID

def create_credentials(db: Session, credentials_data: CredentialsBase) -> ResponseModel:
    if not create_credentials.data.user_id:
         return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
        
    try:
        new_credentials = Credentials(
            name=credentials_data.name,
            type=credentials_data.type,
            data=credentials_data.data,
            user_id=credentials_data.user_id,
        )

        db.add(new_credentials)
        db.commit()
        db.refresh(new_credentials)

        credential_response = CredentialResponse.model_validate(new_credentials)  # <-- FIXED

        return ResponseModel(
            status=Http.StatusOk,
            message="Credentials created successfully",
            data=credential_response
        )

    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occurred: {str(e)}",
            data=None
        )
        

def get_credentials(db:Session,user_id)->ResponseModel:

    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
        
    try:
        user=db.query(User).filter(User.id==user_id).first()
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="User not found",
                data=None
            )
        creds=db.query(Credentials).filter(Credentials.user_id==user_id).all()
        response_data = []
        for c in creds:
            response_data.append(CredentialResponse.model_validate(c))
        
        return ResponseModel(
            status=Http.StatusOk,
            message="Credentails fetched successfully",
            data=response_data
        )
    except SQLAlchemyError as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occurred: {str(e)}",
            data=None
        )
    except Exception as e:
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An unexpected error occured: {str(e)}",
            data=None
        )
       
        
def delete_credentails(db:Session,credential_id: UUID,user_id:str)->ResponseModel:
    if not user_id:
        return ResponseModel(
            status=Http.StatusNotFound,
            message="UnAuthorized",
            data=None
        )
        
    try:
        user=db.query(User).filter(User.id==user_id).first()
        if not user:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="User not found",
                data=None
            )
        
        credential=db.query(Credentials).filter(Credentials.id==credential_id,Credentials.user_id==user_id).first()
        if not credential:
            return ResponseModel(
                status=Http.StatusNotFound,
                message="Credentails not found",
                data=None
            )
        db.delete(credential)
        db.commit()
        return ResponseModel(
            status=Http.StatusOk,
            message="credentail deleted successfully",
            data=None
        )
    except SQLAlchemyError as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"Database error occured: {str(e)}",
            data=None
        )
    except Exception as e:
        db.rollback()
        return ResponseModel(
            status=Http.StatusInternalServerError,
            message=f"An internal server error occured :{str(e)}",
            data=None
        )