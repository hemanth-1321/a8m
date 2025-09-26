from typing import Generic, TypeVar, Optional, Dict, Any,List
from pydantic import BaseModel,Field
from enum import Enum
from uuid import UUID
from db.models import NodeType, TriggerType
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
    data:Optional[Any] = None
    

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
    id: Optional[UUID] = None
    title: str
    workflow_id:UUID
    class Config:
        from_attributes = True

class workflowBase(BaseModel):
    title: str = Field(..., min_length=1, description="Title is required")
    # trigger: TriggerTypeEnum


class NodeBase(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=1, description="Title is required")
    workflow_id: UUID
    trigger: TriggerTypeEnum
    enabled: bool = True
    data: Optional[dict[str, Any]] = Field(default_factory=dict)
    position_x: float = 0.0
    position_y: float = 0.0
    type: NodeType 


class EdgeRequest(BaseModel):
    id: UUID
    source_node_id: UUID
    target_node_id: UUID

class WorkflowUpdateRequest(BaseModel):
    title: str
    enabled:bool
    nodes: List[NodeBase]
    edges: List[EdgeRequest]
    
class EdgeResponse(EdgeRequest):
    workflow_id: UUID

    class Config:
        from_attributes = True
        
        

class nodeRequest(BaseModel):
    workflow_id: str
        
class FastApiResponseWrapper(BaseModel, Generic[T]):
    response: ResponseModel
    data: Optional[T] = None




class NodeResponse(BaseModel):
    id: Optional[UUID] = None
    title: str
    workflow_id: UUID
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    enabled: Optional[bool] = True
    trigger: Optional[str] = "Manual"
    data: Optional[dict] = None   
    class Config:
        from_attributes = True

class WorkflowResponse(BaseModel):
    id: UUID
    title: str
    enabled: bool
    user_id: UUID
    nodes: List[NodeResponse] = []
    edges: List[EdgeResponse] = []

    class Config:
        from_attributes = True   


