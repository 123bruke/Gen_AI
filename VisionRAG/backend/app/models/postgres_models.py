"""
SQLAlchemy Models for VisionRAG Primary Database (PostgreSQL with SQLite fallback).
Covers:
- Users (Accounts created & metadata JSON)
- UserSessions (Login & Logout tracking, duration, session status)
- UploadedFiles (Files uploaded by users, major large file BYTEA binary, metadata JSON, upload progress)
- Conversations (Chats created by users)
- ChatMessages (User sended info, assistant responses, multimodal attachments, metadata JSON)
- TaskProgress (Information progress & task stages stored in DB)
"""

import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Integer,
    BigInteger,
    ForeignKey,
    Text,
    LargeBinary,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar = Column(String(255), nullable=True)
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    files = relationship("UploadedFile", back_populates="user")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("TaskProgress", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "avatar": self.avatar or (self.full_name[:2].upper() if self.full_name else "U"),
            "role": self.role or "user",
            "is_active": self.is_active,
            "metadata": self.metadata_ or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }


class UserSession(Base):
    """Tracks user authentication life cycle: login, logout, duration, and device metadata."""
    __tablename__ = "user_sessions"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)
    login_time = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)
    logout_time = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, index=True)

    user = relationship("User", back_populates="sessions")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_token": self.session_token,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "metadata": self.metadata_ or {},
            "login_time": self.login_time.isoformat() if self.login_time else None,
            "logout_time": self.logout_time.isoformat() if self.logout_time else None,
            "duration_seconds": self.duration_seconds,
            "is_active": self.is_active,
        }


class UploadedFile(Base):
    """Tracks files input/uploaded by users, major large file bytea binary, and metadata."""
    __tablename__ = "uploaded_files"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    file_size_display = Column(String(50), nullable=False)
    checksum_md5 = Column(String(64), nullable=True, index=True)
    status = Column(String(50), default="uploaded")
    progress_percent = Column(Integer, default=100)
    has_binary = Column(Boolean, default=False)
    file_blob = Column(LargeBinary, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)
    uploaded_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="files")

    def to_dict(self, include_binary: bool = False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.original_filename,
            "stored_filename": self.stored_filename,
            "fileType": self.file_type,
            "size": self.file_size_display,
            "size_bytes": self.file_size_bytes,
            "checksum": self.checksum_md5,
            "status": self.status,
            "progress_percent": self.progress_percent,
            "has_binary": self.has_binary,
            "path": self.file_path,
            "metadata": self.metadata_ or {},
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }
        if include_binary and self.file_blob:
            data["binary_bytes_length"] = len(self.file_blob)
        return data


class Conversation(Base):
    """Stores user conversations and topic categorization in PostgreSQL."""
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    folder_id = Column(String(64), nullable=True)
    pinned = Column(Boolean, default=False)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def to_dict(self, include_messages: bool = False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "folder_id": self.folder_id,
            "pinned": self.pinned,
            "metadata": self.metadata_ or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_messages:
            data["messages"] = [m.to_dict() for m in self.messages]
        return data


class ChatMessage(Base):
    """Stores user sended info, prompt queries, responses, and multimodal metadata."""
    __tablename__ = "chat_messages"

    id = Column(String(64), primary_key=True)
    chat_id = Column(String(64), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    sender = Column(String(20), nullable=False) # 'user' or 'assistant'
    text = Column(Text, nullable=False)
    attachments = Column(JSON, default=list)
    multimodal_data = Column(JSON, default=dict)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")

    def to_dict(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "user_id": self.user_id,
            "sender": self.sender,
            "text": self.text,
            "attachments": self.attachments or [],
            "multimodal": self.multimodal_data or {},
            "metadata": self.metadata_ or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class TaskProgress(Base):
    """Tracks information and processing progress in PostgreSQL."""
    __tablename__ = "task_progress"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String(100), nullable=False, index=True)
    task_type = Column(String(100), nullable=False)
    stage = Column(String(100), nullable=False)
    progress_percent = Column(Integer, default=0)
    status = Column(String(50), default="in_progress", index=True) # pending, in_progress, completed, failed
    message = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tasks")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "task_id": self.task_id,
            "task_type": self.task_type,
            "stage": self.stage,
            "progress_percent": self.progress_percent,
            "status": self.status,
            "message": self.message,
            "metadata": self.metadata_ or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
