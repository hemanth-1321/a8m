import uuid
from sqlalchemy import Column, ForeignKey, String, Text, Numeric, DateTime, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = 'users'
    id =Column(UUID,primary_key=True,default=uuid.uuid4)
    email=Column(String(),unique=True,nullable=False)
    password=Column(String(),nullable=False)
    created_At=Column(DateTime(timezone=True),server_default=func.now())
      

