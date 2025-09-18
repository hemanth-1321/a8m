import uuid
from sqlalchemy import Column, ForeignKey, String, DateTime, func, JSON, Boolean, Enum, Table, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
import enum
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
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    enabled = Column(Boolean, default=False)
    trigger = Column(Enum(TriggerType), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="workflows")
    nodes = relationship(
        "Node",
        back_populates="workflow",
        cascade="all, delete-orphan"
    )
    edges = relationship(
        "Edge",
        back_populates="workflow",
        cascade="all, delete-orphan"
    )
    credentials = relationship(
        "Credentials",
        secondary=workflow_credentials,
        back_populates="workflows"
    )

class Node(Base):
    __tablename__ = "nodes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    enabled = Column(Boolean, default=False)
    trigger = Column(Enum(TriggerType), nullable=False)
    data = Column(JSON, nullable=False)  # Use JSONB for PostgreSQL if needed
    position_x = Column(Float, nullable=False)
    position_y = Column(Float, nullable=False)
    type = Column(Enum(NodeType), nullable=True)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="nodes")

class Edge(Base):
    __tablename__ = "edges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_id = Column(String, nullable=False)
    target_node_id = Column(String, nullable=False)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="edges")