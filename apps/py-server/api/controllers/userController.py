import bcrypt
import jwt
from db.models import User
from models.response import Http
from models.schema import UserModel , UserResponse,ResponseModel,UserTokenResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

SECRET_KEY = "secret"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  



#user signup
def signup_user(user: UserModel, db: Session) -> tuple[ResponseModel, UserResponse | None]:
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        return ResponseModel(status=Http.StatusBadGateway, message="User already exists"), None

    # Hash password
    password_hash = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    password_hash_str = password_hash.decode('utf-8')  # convert to string for DB

    # Create new user
    new_user = User(
        email=user.email,
        password=password_hash_str
    )
    db.add(new_user)
    print(f"new useer",new_user)
    db.commit()
    db.refresh(new_user)

    user_response = UserResponse(
        id=str(new_user.id),
        email=str(new_user.email)
    )
    return ResponseModel(status=Http.StatusOk,message="User crreated sucessfully"),user_response


# retrurn jwt token
def create_access_token(data: dict):
    print(data)
    to_encode=data.copy()
    expire=datetime.now()+(timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp":expire
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, ALGORITHM)
    print("jwt _token",encoded_jwt)
    return encoded_jwt

## signin controller
def signin_user(email: str, password: str, db: Session) -> tuple[ResponseModel, UserTokenResponse | None]:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return ResponseModel(status=Http.StatusNotFound, message="User not found"), None

    if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return ResponseModel(status=Http.StatusUnauthorized, message="Invalid password"), None

    access_token = create_access_token({"user_id": str(user.id)})

    # Wrap the response in Pydantic model
    token_response = UserTokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            email=str(user.email)
        )
    )

    return ResponseModel(status=Http.StatusOk, message="Signin successful"), token_response