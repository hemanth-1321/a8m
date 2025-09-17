from pydantic import BaseModel
from typing import List

class UserModel(BaseModel):
    email:str
    password:str
    
    
    
class UserResponse(BaseModel):
    id:str
    email:str
    
    
class ResponseModel(BaseModel):
    status: int
    message: str
    
    

class UserTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse  
    
    
    
class FastApiResponseWrapper(BaseModel):
    response:ResponseModel
    data:(
        UserResponse
        |UserTokenResponse
        |List[UserResponse]
        |List[UserTokenResponse]
        |None
    )