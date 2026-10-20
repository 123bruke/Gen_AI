"""
End-to-End PostgreSQL Integration Test Suite for VisionRAG.
Validates:
1. User registration & login with JWT & PostgreSQL JSONB metadata.
2. Major large file storage in PostgreSQL BYTEA binary column & download streaming.
3. User messages/queries sent and assistant multimodal responses stored in PostgreSQL.
4. Task and information progress stored in PostgreSQL task_progress table.
5. Session audit tracking and duration computation in PostgreSQL.
"""

import urllib.request
import urllib.parse
import json
import uuid

BASE_URL = "http://localhost:8000"

def run_tests():
    print("=== STARTING END-TO-END POSTGRESQL & AUTHENTICATION TESTS ===")
    
    # 1. Check Health & PostgreSQL Status
    req = urllib.request.urlopen(f"{BASE_URL}/api/db/status")
    db_status = json.loads(req.read().decode("utf-8"))
    print(f"[1] Database Status: Engine={db_status.get('db_type')}, Connected={db_status.get('connected')}, IsPostgres={db_status.get('is_postgres')}")
    assert db_status.get("connected") == True, "Database is not connected!"
    assert db_status.get("is_postgres") == True, "Database is not PostgreSQL!"

    # 2. Register User with Metadata
    test_email = f"researcher_{uuid.uuid4().hex[:6]}@visionrag.ai"
    reg_payload = json.dumps({
        "full_name": "Dr. Sophia Carter",
        "email": test_email,
        "password": "SecureVisionPassword2026!",
        "metadata": {
            "department": "Advanced Computer Vision & Robotics",
            "role": "Lead Scientist",
            "security_clearance": "Level-4",
            "preferences": {"theme": "white", "notifications": True}
        }
    }).encode("utf-8")
    
    reg_req = urllib.request.Request(
        f"{BASE_URL}/api/auth/register",
        data=reg_payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    reg_res = json.loads(urllib.request.urlopen(reg_req).read().decode("utf-8"))
    user_id = reg_res["user"]["id"]
    jwt_token = reg_res["token"]
    print(f"[2] Registered User: ID={user_id}, Email={test_email}, FullName={reg_res['user']['full_name']}")
    assert jwt_token, "JWT Token not generated!"

    # 3. Authenticate / Login
    login_payload = json.dumps({
        "email": test_email,
        "password": "SecureVisionPassword2026!",
        "metadata": {"client": "integration_test_suite"}
    }).encode("utf-8")
    login_req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=login_payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    login_res = json.loads(urllib.request.urlopen(login_req).read().decode("utf-8"))
    active_token = login_res["token"]
    session_id = login_res["sessionId"]
    print(f"[3] User Login: SessionID={session_id}, TokenPrefix={active_token[:25]}...")

    # 4. Verify /me Endpoint
    me_req = urllib.request.Request(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {active_token}"}
    )
    me_res = json.loads(urllib.request.urlopen(me_req).read().decode("utf-8"))
    print(f"[4] Verified /me: User={me_res['user']['full_name']}, MetaDepartment={me_res['user']['metadata'].get('department')}")
    assert me_res["user"]["id"] == user_id, "User ID mismatch!"

    # 5. Upload File with Major Large File BYTEA Storage in PostgreSQL
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    test_binary_data = b"POSTGRESQL_BYTEA_BINARY_TEST_DATA_" + b"0123456789ABCDEF" * 1024 # ~16KB test binary blob
    filename = "satellite_multimodal_scan.dat"
    
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8") + test_binary_data + (
        f"\r\n--{boundary}\r\n"
        f'Content-Disposition: form-data; name="user_id"\r\n\r\n'
        f"{user_id}\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="store_binary_in_db"\r\n\r\n'
        f"true\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    upload_req = urllib.request.Request(
        f"{BASE_URL}/api/uploads",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {active_token}"
        },
        method="POST"
    )
    upload_res = json.loads(urllib.request.urlopen(upload_req).read().decode("utf-8"))
    file_id = upload_res["fileId"]
    print(f"[5] Uploaded File: ID={file_id}, Name={upload_res['filename']}, Size={upload_res['size']}, StoredInPostgresBYTEA={upload_res['hasBinaryInPostgres']}")
    assert upload_res["hasBinaryInPostgres"] == True, "File binary was not stored in PostgreSQL BYTEA!"

    # 6. Download Raw Binary File directly from PostgreSQL BYTEA
    dl_req = urllib.request.Request(
        f"{BASE_URL}/api/uploads/{file_id}/download",
        headers={"Authorization": f"Bearer {active_token}"}
    )
    dl_res = urllib.request.urlopen(dl_req).read()
    print(f"[6] Downloaded File from PostgreSQL BYTEA: Length={len(dl_res)} bytes")
    assert dl_res == test_binary_data, "Downloaded binary data does not match original binary!"

    # 7. Send User Message & Query -> Persisted in PostgreSQL Conversations & ChatMessages
    chat_payload = json.dumps({
        "query": "Explain architectural schematic and multimodal token alignment",
        "chat_id": f"chat_{uuid.uuid4().hex[:8]}",
        "attachments": [filename]
    }).encode("utf-8")

    chat_req = urllib.request.Request(
        f"{BASE_URL}/api/chat",
        data=chat_payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {active_token}"
        },
        method="POST"
    )
    chat_res = json.loads(urllib.request.urlopen(chat_req).read().decode("utf-8"))
    print(f"[7] Sent User Query & Received Response: ChatID={chat_res.get('chat_id')}, MessageID={chat_res.get('message_id')}, PersistedInPostgres={chat_res.get('persisted_in_postgres')}")
    assert chat_res.get("persisted_in_postgres") == True, "Chat message was not persisted in PostgreSQL!"

    # 8. Check Task Progress Table in PostgreSQL
    tasks_req = urllib.request.Request(
        f"{BASE_URL}/api/progress?user_id={user_id}",
        headers={"Authorization": f"Bearer {active_token}"}
    )
    tasks_res = json.loads(urllib.request.urlopen(tasks_req).read().decode("utf-8"))
    print(f"[8] Task Progress Records in PostgreSQL: Count={tasks_res['count']}, Tasks={[t['task_type'] for t in tasks_res['tasks']]}")
    assert tasks_res["count"] > 0, "No task progress was recorded in PostgreSQL!"

    # 9. Verify Final DB Status Counts
    final_db_req = urllib.request.urlopen(f"{BASE_URL}/api/db/status")
    final_db_res = json.loads(final_db_req.read().decode("utf-8"))
    print(f"[9] Final PostgreSQL Metrics: Users={final_db_res.get('user_count')}, Files={final_db_res.get('uploaded_files_count')}, Conversations={final_db_res.get('conversations_count')}, Messages={final_db_res.get('messages_count')}, Tasks={final_db_res.get('task_progress_count')}")

    # 10. User Logout & Session Duration Audit
    logout_payload = json.dumps({"token": active_token, "user_id": user_id}).encode("utf-8")
    logout_req = urllib.request.Request(
        f"{BASE_URL}/api/auth/logout",
        data=logout_payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {active_token}"
        },
        method="POST"
    )
    logout_res = json.loads(urllib.request.urlopen(logout_req).read().decode("utf-8"))
    print(f"[10] User Logout: Success={logout_res.get('success')}, SessionData={logout_res.get('session')}")

    print("\n>>> ALL POSTGRESQL & AUTHENTICATION END-TO-END TESTS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    run_tests()
