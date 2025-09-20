import uuid
from sqlalchemy import Column, ForeignKey, String, DateTime, func, JSON, Boolean, Enum, Table, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship,Mapped,mapped_column
from .database import Base
import enum
from typing import List
from datetime import datetime

#alembic revision --autogenerate -m "credentaisl_table"
class TriggerType(str, enum.Enum):
    WebHook = "WebHook"
    Manual = "Manual"
    Cron = "Cron"

class NodeType(str, enum.Enum):
    FORM = "FORM"
    ACTION = "ACTION"
    TRIGGER = "TRIGGER"

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
    
    # Relationships
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

class Credentials(Base):
    __tablename__ = "credentials"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    name = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False)  # platform
    data = Column(JSON, nullable=False)  # Use JSONB for PostgreSQL if needed
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
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

    # Relationships
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

class Node(Base):
    __tablename__ = "nodes"
    
    # Convert to new style with Mapped[]
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    trigger: Mapped[TriggerType] = mapped_column(Enum(TriggerType), nullable=False)
    data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    position_x: Mapped[float] = mapped_column(Float, nullable=False)
    position_y: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[NodeType] = mapped_column(Enum(NodeType), nullable=True)
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("workflows.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="nodes")

class Edge(Base):
    __tablename__ = "edges"
    
    # Convert to new style with Mapped[] and fix UUID types
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)  # ✅ Changed from String to UUID
    target_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)  # ✅ Changed from String to UUID
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("workflows.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="edges")