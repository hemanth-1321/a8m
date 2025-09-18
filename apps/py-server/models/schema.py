from typing import Generic, TypeVar, Optional, Dict, Any
from pydantic import BaseModel
from uuid import UUID

T = TypeVar("T")

class UserModel(BaseModel):
    email: str
    password: str
    
    
class UserResponse(BaseModel):
    id: str
    email: str
    
    
class ResponseModel(BaseModel):
    status: int
    message: str
    data: Any = None
    

class UserTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse  
    
    
class CredentialsBase(BaseModel):
    """Base schema for Credentials with common fields"""
    name: str
    type: str
    data: Dict[str, Any]
    user_id: Optional[str] = None 
  
  
class CredentialResponse(BaseModel):
    id: UUID
    name: str
    type: str
    data: Dict[str, Any]
    user_id: UUID

    class Config:
        from_attributes = True  


class FastApiResponseWrapper(BaseModel, Generic[T]):
    response: ResponseModel
    data: Optional[T] = None
