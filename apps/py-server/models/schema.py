from typing import Generic, TypeVar, Optional, Dict, Any
from pydantic import BaseModel,Field
from enum import Enum
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

class TriggerTypeEnum(str,Enum):
    WEBHOOK = "WebHook"
    MANUAL = "Manual"
    CRON = "Cron"
    

class workflowresponse(BaseModel):
    id: UUID
    title: str
    user_id: UUID
    class Config:
        from_attributes = True  
class nodeResponse(BaseModel):
    id: UUID
    title: str
    user_id: UUID
    workflow_id:UUID
    class Config:
        from_attributes = True

class workflowBase(BaseModel):
    title: str = Field(..., min_length=1, description="Title is required")
    trigger: TriggerTypeEnum


class nodeBase(BaseModel):
    title: str = Field(..., min_length=1, description="Title is required")
    workflow_id:str 
    trigger: TriggerTypeEnum




class FastApiResponseWrapper(BaseModel, Generic[T]):
    response: ResponseModel
    data: Optional[T] = None
