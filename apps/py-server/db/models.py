import uuid
from sqlalchemy import Column, ForeignKey, String, DateTime, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(50), unique=True, nullable=False)
    password = Column(String(225), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to credentials
    credentials = relationship(
        "Credentials",
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

    # Relationship back to user
    user = relationship("User", back_populates="credentials")
