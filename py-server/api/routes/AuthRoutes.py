from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_async_db
from models.schema import UserModel, UserResponse, UserTokenResponse, FastApiResponseWrapper
from api.controllers.userController import signup_user, signin_user

USER_ROUTES = APIRouter()

@USER_ROUTES.post("/signup", response_model=FastApiResponseWrapper[UserResponse])
async def create_user(user: UserModel, db: AsyncSession = Depends(get_async_db)):
    response, data = await signup_user(user, db)
    return FastApiResponseWrapper[UserResponse](response=response, data=data)

@USER_ROUTES.post("/signin", response_model=FastApiResponseWrapper[UserTokenResponse])
async def login_user(user: UserModel, db:AsyncSession = Depends(get_async_db)):
    response, data =await signin_user(user.email, user.password, db)
    return FastApiResponseWrapper[UserTokenResponse](response=response, data=data)
