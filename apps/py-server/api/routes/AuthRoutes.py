from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.schema import UserModel, UserResponse, UserTokenResponse, FastApiResponseWrapper
from api.controllers.userController import signup_user, signin_user

USER_ROUTES = APIRouter()

@USER_ROUTES.post("/signup", response_model=FastApiResponseWrapper[UserResponse])
def create_user(user: UserModel, db: Session = Depends(get_db)):
    response, data = signup_user(user, db)
    return FastApiResponseWrapper[UserResponse](response=response, data=data)


@USER_ROUTES.post("/signin", response_model=FastApiResponseWrapper[UserTokenResponse])
def login_user(user: UserModel, db: Session = Depends(get_db)):
    response, data = signin_user(user.email, user.password, db)
    return FastApiResponseWrapper[UserTokenResponse](response=response, data=data)
