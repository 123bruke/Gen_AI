"""
Enterprise User, Session, Large File Binary, and Progress Management Service.
Interacts with PostgreSQL primary database (with resilient SQLite fallback) and logs progress
via Python's standard logging library into the separate simple DB section.
"""

import uuid
import datetime
from typing import Optional, Dict, Any, List

from app.db.postgres_db import postgres_manager
from app.models.postgres_models import (
    User,
    UserSession,
    UploadedFile,
    Conversation,
    ChatMessage,
    TaskProgress
)
from app.security.auth_handler import (
    hash_password,
    verify_password,
    generate_session_token,
    create_access_token,
    decode_access_token
)
from app.db.log_db import app_logger

class UserService:
    """Manages User Accounts, Authentication Sessions, Large Files BYTEA Binary, Conversations, and Task Progress."""

    # ==========================================
    # 1. USER REGISTRATION & AUTHENTICATION
    # ==========================================
    def register_user(
        self,
        full_name: str,
        email: str,
        password: str,
        ip_address: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Creates a new user account in PostgreSQL, starts session, generates JWT, and logs progress."""
        email_clean = email.strip().lower()
        
        with postgres_manager.session_scope() as session:
            existing = session.query(User).filter(User.email == email_clean).first()
            if existing:
                app_logger.warning(
                    f"Registration rejected: Email '{email_clean}' is already in use.",
                    extra={"event_type": "ACCOUNT_CREATION_FAILED", "details": {"email": email_clean}}
                )
                raise ValueError("An account with this email address already exists.")

            user_id = f"usr_{uuid.uuid4().hex[:12]}"
            username = email_clean.split("@")[0]
            hashed_pw = hash_password(password)
            now = datetime.datetime.utcnow()

            user_meta = metadata or {}
            user_meta.setdefault("registration_ip", ip_address)
            user_meta.setdefault("theme", "white")
            user_meta.setdefault("preferred_model", "visionrag-v2.5")

            new_user = User(
                id=user_id,
                email=email_clean,
                username=username,
                full_name=full_name.strip(),
                hashed_password=hashed_pw,
                avatar=full_name[:2].upper() if full_name else "U",
                role="user",
                is_active=True,
                metadata_=user_meta,
                created_at=now,
                last_login=now
            )
            session.add(new_user)
            session.flush()

            # Create session
            session_id = f"sess_{uuid.uuid4().hex[:12]}"
            session_token = generate_session_token()
            user_session = UserSession(
                id=session_id,
                user_id=user_id,
                session_token=session_token,
                ip_address=ip_address,
                metadata_={"created_via": "registration"},
                login_time=now,
                is_active=True
            )
            session.add(user_session)
            
            # Issue JWT token
            jwt_token = create_access_token({
                "sub": user_id,
                "email": email_clean,
                "name": new_user.full_name,
                "session_id": session_id
            })

            user_dict = new_user.to_dict()

        # Log account creation progress using logging library into separate simple DB section
        app_logger.info(
            f"Account created successfully for '{full_name}' ({email_clean}) in PostgreSQL.",
            extra={
                "user_id": user_id,
                "event_type": "ACCOUNT_CREATED",
                "details": {
                    "email": email_clean,
                    "full_name": full_name,
                    "ip_address": ip_address,
                    "created_at": now.isoformat()
                }
            }
        )

        return {
            "success": True,
            "user": user_dict,
            "token": jwt_token,
            "sessionId": session_id,
            "message": "Account created and session initialized in PostgreSQL."
        }

    def login_user(
        self,
        email: str,
        password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Authenticates user against PostgreSQL, starts session, generates JWT, and logs progress."""
        email_clean = email.strip().lower()

        with postgres_manager.session_scope() as session:
            user = session.query(User).filter(User.email == email_clean).first()
            if not user or not verify_password(password, user.hashed_password):
                app_logger.warning(
                    f"Failed login attempt for email: '{email_clean}'",
                    extra={
                        "event_type": "LOGIN_FAILED",
                        "details": {"email": email_clean, "ip_address": ip_address}
                    }
                )
                raise ValueError("Invalid email or password.")

            if not user.is_active:
                raise ValueError("Account is currently disabled.")

            now = datetime.datetime.utcnow()
            user.last_login = now

            # Create active session in PostgreSQL
            session_id = f"sess_{uuid.uuid4().hex[:12]}"
            session_token = generate_session_token()
            sess_meta = metadata or {}
            sess_meta.setdefault("user_agent", user_agent)
            
            new_session = UserSession(
                id=session_id,
                user_id=user.id,
                session_token=session_token,
                ip_address=ip_address,
                user_agent=user_agent,
                metadata_=sess_meta,
                login_time=now,
                is_active=True
            )
            session.add(new_session)
            
            # Issue JWT Token
            jwt_token = create_access_token({
                "sub": user.id,
                "email": user.email,
                "name": user.full_name,
                "session_id": session_id
            })

            user_dict = user.to_dict()

        # Log login event using logging library
        app_logger.info(
            f"User logged in: {user_dict['full_name']} ({email_clean})",
            extra={
                "user_id": user_dict["id"],
                "event_type": "USER_LOGIN",
                "details": {
                    "session_id": session_id,
                    "ip_address": ip_address,
                    "login_time": now.isoformat()
                }
            }
        )

        return {
            "success": True,
            "user": user_dict,
            "token": jwt_token,
            "sessionId": session_id,
            "message": "Login successful."
        }

    def get_current_user_from_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verifies JWT token or session token and returns active user details from PostgreSQL."""
        if not token:
            return None
        
        # 1. Try JWT decode
        payload = decode_access_token(token)
        user_id = payload.get("sub") if payload else None

        with postgres_manager.session_scope() as session:
            if user_id:
                user = session.query(User).filter(User.id == user_id).first()
                if user and user.is_active:
                    return user.to_dict()
            
            # 2. Fallback to session_token match
            user_session = session.query(UserSession).filter(
                UserSession.session_token == token,
                UserSession.is_active == True
            ).first()
            if user_session and user_session.user:
                return user_session.user.to_dict()

        return None

    def logout_user(
        self,
        token: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Terminates session in PostgreSQL, computes duration, and logs progress."""
        now = datetime.datetime.now(datetime.timezone.utc)
        session_data = None
        target_user_id = user_id

        # If JWT token, extract sub
        if token:
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                target_user_id = payload["sub"]

        with postgres_manager.session_scope() as session:
            q = session.query(UserSession).filter(UserSession.is_active == True)
            if target_user_id:
                q = q.filter(UserSession.user_id == target_user_id)
            elif token:
                q = q.filter(UserSession.session_token == token)

            active_session = q.order_by(UserSession.login_time.desc()).first()
            if active_session:
                active_session.logout_time = now
                active_session.is_active = False
                
                if active_session.login_time:
                    lt = active_session.login_time
                    if lt.tzinfo is None:
                        lt = lt.replace(tzinfo=datetime.timezone.utc)
                    delta = now - lt
                    active_session.duration_seconds = max(0, int(delta.total_seconds()))

                session_data = active_session.to_dict()
                target_user_id = active_session.user_id

        # Log logout event
        app_logger.info(
            f"User logged out: user_id={target_user_id}",
            extra={
                "user_id": target_user_id,
                "event_type": "USER_LOGOUT",
                "details": {
                    "logout_time": now.isoformat(),
                    "duration_seconds": session_data.get("duration_seconds") if session_data else 0,
                    "session_id": session_data.get("id") if session_data else None
                }
            }
        )

        return {
            "success": True,
            "message": "User logged out successfully.",
            "session": session_data
        }

    # ==========================================
    # 2. UPLOADED & MAJOR LARGE FILE BYTEA STORAGE
    # ==========================================
    def record_file_upload(
        self,
        original_filename: str,
        stored_filename: str,
        file_path: str,
        file_type: str,
        file_size_bytes: int,
        user_id: Optional[str] = None,
        checksum_md5: Optional[str] = None,
        file_blob: Optional[bytes] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Stores uploaded file metadata and optionally major large file binary (BYTEA)
        directly in PostgreSQL.
        """
        file_id = f"f_{uuid.uuid4().hex[:12]}"
        size_mb = file_size_bytes / (1024 * 1024)
        size_display = f"{size_mb:.2f} MB" if size_mb >= 0.1 else f"{file_size_bytes / 1024:.1f} KB"
        now = datetime.datetime.utcnow()

        file_meta = metadata or {}
        file_meta.setdefault("original_name", original_filename)
        file_meta.setdefault("mime_type", file_type)
        file_meta.setdefault("md5_checksum", checksum_md5)
        file_meta.setdefault("stored_in_postgres_binary", bool(file_blob))

        has_binary = bool(file_blob)

        with postgres_manager.session_scope() as session:
            valid_user_id = None
            if user_id:
                u = session.query(User).filter(User.id == user_id).first()
                if u:
                    valid_user_id = u.id

            upload_record = UploadedFile(
                id=file_id,
                user_id=valid_user_id,
                original_filename=original_filename,
                stored_filename=stored_filename,
                file_path=file_path,
                file_type=file_type,
                file_size_bytes=file_size_bytes,
                file_size_display=size_display,
                checksum_md5=checksum_md5,
                status="uploaded",
                progress_percent=100,
                has_binary=has_binary,
                file_blob=file_blob,
                metadata_=file_meta,
                uploaded_at=now
            )
            session.add(upload_record)
            file_dict = upload_record.to_dict()

        # Log file upload progress
        app_logger.info(
            f"File uploaded & stored in PostgreSQL: '{original_filename}' ({size_display}) [Binary in DB: {has_binary}]",
            extra={
                "user_id": valid_user_id,
                "event_type": "FILE_UPLOAD",
                "details": {
                    "file_id": file_id,
                    "filename": original_filename,
                    "size": size_display,
                    "has_binary": has_binary,
                    "md5": checksum_md5
                }
            }
        )

        return file_dict

    def get_file_binary(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves raw binary file content stored in PostgreSQL BYTEA."""
        with postgres_manager.session_scope() as session:
            record = session.query(UploadedFile).filter(UploadedFile.id == file_id).first()
            if not record:
                return None
            return {
                "id": record.id,
                "filename": record.original_filename,
                "file_type": record.file_type,
                "file_size_bytes": record.file_size_bytes,
                "binary": record.file_blob,
                "path": record.file_path,
                "has_binary": record.has_binary
            }

    def list_user_files(self, user_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """List files stored in PostgreSQL, optionally filtered by user_id."""
        with postgres_manager.session_scope() as session:
            q = session.query(UploadedFile)
            if user_id:
                q = q.filter(UploadedFile.user_id == user_id)
            records = q.order_by(UploadedFile.uploaded_at.desc()).limit(limit).all()
            return [r.to_dict() for r in records]

    # ==========================================
    # 3. USER CONVERSATIONS & CHAT MESSAGES
    # ==========================================
    def save_conversation(
        self,
        conversation_id: str,
        user_id: Optional[str],
        title: str,
        folder_id: Optional[str] = None,
        pinned: bool = False,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Creates or updates a user conversation record in PostgreSQL."""
        now = datetime.datetime.utcnow()
        with postgres_manager.session_scope() as session:
            conv = session.query(Conversation).filter(Conversation.id == conversation_id).first()
            if not conv:
                conv = Conversation(
                    id=conversation_id,
                    user_id=user_id,
                    title=title,
                    folder_id=folder_id,
                    pinned=pinned,
                    metadata_=metadata or {},
                    created_at=now,
                    updated_at=now
                )
                session.add(conv)
            else:
                conv.title = title
                conv.folder_id = folder_id
                conv.pinned = pinned
                if metadata:
                    conv.metadata_ = metadata
                conv.updated_at = now
            return conv.to_dict()

    def list_conversations(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Lists user conversations from PostgreSQL."""
        with postgres_manager.session_scope() as session:
            q = session.query(Conversation)
            if user_id:
                q = q.filter(Conversation.user_id == user_id)
            records = q.order_by(Conversation.updated_at.desc()).limit(limit).all()
            return [r.to_dict(include_messages=True) for r in records]

    def record_chat_message(
        self,
        chat_id: str,
        sender: str,
        text: str,
        user_id: Optional[str] = None,
        attachments: Optional[List[Any]] = None,
        multimodal: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Stores sent prompt, message, attachments, and multimodal response in PostgreSQL."""
        msg_id = f"msg_{uuid.uuid4().hex[:12]}"
        now = datetime.datetime.utcnow()

        with postgres_manager.session_scope() as session:
            # Ensure conversation exists
            conv = session.query(Conversation).filter(Conversation.id == chat_id).first()
            if not conv:
                conv = Conversation(
                    id=chat_id,
                    user_id=user_id,
                    title=text[:40] if text else "New Conversation",
                    created_at=now,
                    updated_at=now
                )
                session.add(conv)
                session.flush()

            msg = ChatMessage(
                id=msg_id,
                chat_id=chat_id,
                user_id=user_id,
                sender=sender,
                text=text,
                attachments=attachments or [],
                multimodal_data=multimodal or {},
                metadata_=metadata or {},
                created_at=now
            )
            session.add(msg)
            conv.updated_at = now
            msg_dict = msg.to_dict()

        return msg_dict

    # ==========================================
    # 4. TASK & INFORMATION PROGRESS STORAGE
    # ==========================================
    def update_task_progress(
        self,
        task_id: str,
        task_type: str,
        stage: str,
        progress_percent: int,
        status: str = "in_progress",
        user_id: Optional[str] = None,
        message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Persists information progress in PostgreSQL."""
        now = datetime.datetime.utcnow()
        with postgres_manager.session_scope() as session:
            task = session.query(TaskProgress).filter(TaskProgress.task_id == task_id).first()
            if not task:
                task = TaskProgress(
                    id=f"tsk_{uuid.uuid4().hex[:12]}",
                    task_id=task_id,
                    user_id=user_id,
                    task_type=task_type,
                    stage=stage,
                    progress_percent=min(100, max(0, progress_percent)),
                    status=status,
                    message=message or f"Stage: {stage}",
                    metadata_=metadata or {},
                    created_at=now,
                    updated_at=now
                )
                session.add(task)
            else:
                task.stage = stage
                task.progress_percent = min(100, max(0, progress_percent))
                task.status = status
                if message:
                    task.message = message
                if metadata:
                    merged = dict(task.metadata_ or {})
                    merged.update(metadata)
                    task.metadata_ = merged
                task.updated_at = now

            task_dict = task.to_dict()

        return task_dict

    def get_task_progress(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves task progress from PostgreSQL."""
        with postgres_manager.session_scope() as session:
            task = session.query(TaskProgress).filter(TaskProgress.task_id == task_id).first()
            return task.to_dict() if task else None

    def list_user_tasks(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Lists task and info progress records from PostgreSQL."""
        with postgres_manager.session_scope() as session:
            q = session.query(TaskProgress)
            if user_id:
                q = q.filter(TaskProgress.user_id == user_id)
            records = q.order_by(TaskProgress.updated_at.desc()).limit(limit).all()
            return [r.to_dict() for r in records]

    def list_user_sessions(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """List user sessions with login/logout timestamps and duration."""
        with postgres_manager.session_scope() as session:
            q = session.query(UserSession)
            if user_id:
                q = q.filter(UserSession.user_id == user_id)
            records = q.order_by(UserSession.login_time.desc()).limit(limit).all()
            return [r.to_dict() for r in records]

user_service = UserService()
