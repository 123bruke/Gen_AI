-- ========================================================
-- VisionRAG Enterprise PostgreSQL Database Initialization
-- Primary Relational & Multimodal Storage
-- Stores:
-- 1. User Accounts & Profile Metadata (JSONB)
-- 2. User Authentication Sessions & Audit Tracking (JSONB)
-- 3. Uploaded Files & Major Large Files Binary Storage (BYTEA + JSONB Metadata)
-- 4. User Conversations & Sent Messages (JSONB Multimodal & Metadata)
-- 5. Information Progress & Async Task Execution (JSONB Progress Metrics)
-- ========================================================

-- Enable extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Account Registration & Authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_metadata ON users USING GIN (metadata);

-- 2. User Sessions Table (Tracks Login, Logout, Duration & Active Sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON user_sessions(is_active);

-- 3. Uploaded Files Table (Tracks All User Uploaded & Major Large Files)
CREATE TABLE IF NOT EXISTS uploaded_files (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_size_display VARCHAR(50) NOT NULL,
    checksum_md5 VARCHAR(64),
    status VARCHAR(50) DEFAULT 'uploaded',
    progress_percent INTEGER DEFAULT 100,
    has_binary BOOLEAN DEFAULT FALSE,
    file_blob BYTEA,
    metadata JSONB DEFAULT '{}'::jsonb,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_checksum ON uploaded_files(checksum_md5);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_metadata ON uploaded_files USING GIN (metadata);

-- 4. User Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    folder_id VARCHAR(64),
    pinned BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- 5. Chat Messages Table (Stores User Sended Info & Assistant Responses)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    chat_id VARCHAR(64) REFERENCES conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    sender VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    multimodal_data JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_metadata ON chat_messages USING GIN (metadata);

-- 6. Task & Information Progress Table (Real-time and Persisted Progress in DB)
CREATE TABLE IF NOT EXISTS task_progress (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(100) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    stage VARCHAR(100) NOT NULL,
    progress_percent INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_progress',
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON task_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON task_progress(status);
CREATE INDEX IF NOT EXISTS idx_progress_metadata ON task_progress USING GIN (metadata);
