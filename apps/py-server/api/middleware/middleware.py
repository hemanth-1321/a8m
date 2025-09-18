import jwt
from fastapi import Depends,HTTPException
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from models.response import Http

SECRET_KEY = "secret"  
ALGORITHM = "HS256"

security=HTTPBearer()


def auth_middleware(credentails:HTTPAuthorizationCredentials=Depends(security)):
    token=credentails.credentials
    print("middleware",token)
    try:
        payload=jwt.decode(token,SECRET_KEY,ALGORITHM)
        user_id:str=payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=Http.StatusUnauthorized, detail="Invalid token payload")
        return {"user_id": user_id}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=Http.StatusUnauthorized, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=Http.StatusUnauthorized, detail="Invalid token")
