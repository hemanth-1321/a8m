#alembic revision --autogenerate -m "workflow_executions"

import uuid
from sqlalchemy import Column, ForeignKey, String, DateTime, func, JSON, Boolean, Enum, Table, Float,Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship,Mapped,mapped_column
from .database import Base
import enum
from typing import List,Optional,Any
from datetime import datetime

class TriggerType(str, enum.Enum):
    WebHook = "WebHook"
    Manual = "Manual"
    Cron = "Cron"

class NodeType(str, enum.Enum):
    FORM = "form-builder"
    WEBHOOK = "webhook"
    TRIGGER = "manual-trigger"
    ACTION="action"
    TOOL="tool"

# Many-to-Many relationship table
workflow_credentials = Table(
    "workflow_credentials",
    Base.metadata,
    Column("workflow_id", UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), primary_key=True),
    Column("credentials_id", UUID(as_uuid=True), ForeignKey("credentials.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(50), unique=True, nullable=False)
    password = Column(String(225), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    credentials = relationship(
        "Credentials",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    workflows = relationship(
        "Workflow",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    executions = relationship(   
        "WorkflowExecution",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    

class Credentials(Base):
    __tablename__ = "credentials"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    name = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False)  
    data = Column(JSON, nullable=False)  
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    user = relationship("User", back_populates="credentials")
    workflows = relationship(
        "Workflow",
        secondary=workflow_credentials,
        back_populates="credentials"
    )
    
class Workflow(Base):
    __tablename__ = "workflows"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    trigger: Mapped[TriggerType] = mapped_column(Enum(TriggerType), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status:Mapped[str]=mapped_column(String(50),default="pending",server_default="pending")
    user: Mapped["User"] = relationship("User", back_populates="workflows")
    nodes: Mapped[List["Node"]] = relationship(
        "Node",
        back_populates="workflow",
        cascade="all, delete-orphan"
    )
    edges: Mapped[List["Edge"]] = relationship(
        "Edge",
        back_populates="workflow",
        cascade="all, delete-orphan"
    )
    credentials: Mapped[List["Credentials"]] = relationship(
        "Credentials",
        secondary=workflow_credentials,
        back_populates="workflows"
    )
    executions = relationship("WorkflowExecution", back_populates="workflow",  cascade="all, delete-orphan")
    
class Node(Base):
    __tablename__ = "nodes"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    trigger: Mapped[TriggerType] = mapped_column(Enum(TriggerType), nullable=False)
    data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    position_x: Mapped[float] = mapped_column(Float, nullable=False)
    position_y: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[NodeType] = mapped_column(Enum(NodeType), nullable=True)
    status:Mapped[str]=mapped_column(String(50),default="pending",server_default="pending")
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("workflows.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="nodes")

class Edge(Base):
    __tablename__ = "edges"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False) 
    target_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False) 
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("workflows.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="edges")
    
class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    status: Mapped[str] = mapped_column(String(50), default="pending")
    input_data: Mapped[dict] = mapped_column(JSON, default=dict)
    output_data: Mapped[dict] = mapped_column(JSON, default=dict)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    waiting_node_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    execution_order: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    started_at: Mapped[Any] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[Any]] = mapped_column(DateTime(timezone=True))

    # relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="executions")
    user: Mapped["User"] = relationship("User", back_populates="executions")

    
    
    
    
    
    
    
    #docker exec -it my-postgres bash
    #psql -U hemanth -d postgres
    
   #alembic revision --autogenerate -m "credentaisl_table"
    