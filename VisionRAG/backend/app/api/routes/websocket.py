"""
Real-Time WebSocket Engine for VisionRAG
Enables bidirectional streaming, real-time progress updates, live log broadcasting,
and multimodal chat interactions between frontend clients and backend agent pipelines.
"""

from typing import List, Dict, Any, Optional, Set
import json
import asyncio
import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["Real-Time WebSockets"])

class ConnectionManager:
    """Manages active WebSocket connections and topic subscriptions."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        self.topic_subscribers: Dict[str, Set[WebSocket]] = {
            "all": set(),
            "logs": set(),
            "progress": set(),
            "chat": set(),
            "uploads": set(),
            "data_pipeline": set()
        }

    async def connect(self, websocket: WebSocket, client_id: str = "anonymous", topic: str = "all"):
        await websocket.accept()
        self.active_connections.add(websocket)
        
        if client_id not in self.user_connections:
            self.user_connections[client_id] = set()
        self.user_connections[client_id].add(websocket)

        if topic in self.topic_subscribers:
            self.topic_subscribers[topic].add(websocket)
        self.topic_subscribers["all"].add(websocket)

        # Welcome message
        welcome = {
            "event": "CONNECTED",
            "client_id": client_id,
            "topic": topic,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "message": "Connected to VisionRAG Real-Time WebSocket stream."
        }
        await websocket.send_json(welcome)

    def disconnect(self, websocket: WebSocket, client_id: str = "anonymous"):
        self.active_connections.discard(websocket)
        if client_id in self.user_connections:
            self.user_connections[client_id].discard(websocket)
            if not self.user_connections[client_id]:
                del self.user_connections[client_id]
        for topic in self.topic_subscribers:
            self.topic_subscribers[topic].discard(websocket)

    async def send_personal_message(self, message: Dict[str, Any], client_id: str):
        if client_id in self.user_connections:
            for connection in list(self.user_connections[client_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    self.disconnect(connection, client_id)

    async def broadcast(self, message: Dict[str, Any], topic: str = "all"):
        """Broadcasts real-time events to all subscribers or a specific topic."""
        message["broadcast_at"] = datetime.datetime.utcnow().isoformat()
        targets = self.topic_subscribers.get(topic, self.active_connections)
        for connection in list(targets):
            try:
                await connection.send_json(message)
            except Exception:
                self.active_connections.discard(connection)

    def sync_broadcast(self, message: Dict[str, Any], topic: str = "all"):
        """Synchronous wrapper to trigger async broadcast from standard pipelines."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(self.broadcast(message, topic=topic))
            else:
                loop.run_until_complete(self.broadcast(message, topic=topic))
        except Exception:
            pass

manager = ConnectionManager()
ws_manager = manager

# WebSocket Endpoints

@router.websocket("/ws")
@router.websocket("/ws/live")
async def websocket_general_endpoint(
    websocket: WebSocket,
    client_id: Optional[str] = Query("student_frontend"),
    topic: Optional[str] = Query("all")
):
    """
    Main WebSocket endpoint for real-time bidirectional streaming.
    Receives user interactions, heartbeats, and broadcasts live progress events.
    """
    await manager.connect(websocket, client_id=client_id, topic=topic)
    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
            except Exception:
                data = {"raw": data_text}

            event_type = data.get("event", "CLIENT_MESSAGE")

            if event_type == "PING":
                await websocket.send_json({"event": "PONG", "timestamp": datetime.datetime.utcnow().isoformat()})
            elif event_type == "SUBSCRIBE":
                new_topic = data.get("topic", "all")
                if new_topic in manager.topic_subscribers:
                    manager.topic_subscribers[new_topic].add(websocket)
                await websocket.send_json({
                    "event": "SUBSCRIBED",
                    "topic": new_topic,
                    "status": "success"
                })
            else:
                # Echo and broadcast user action update to subscribers
                broadcast_payload = {
                    "event": "USER_ACTION_BROADCAST",
                    "client_id": client_id,
                    "payload": data,
                    "server_time": datetime.datetime.utcnow().isoformat()
                }
                await manager.broadcast(broadcast_payload, topic=data.get("topic", "all"))

    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id=client_id)
    except Exception:
        manager.disconnect(websocket, client_id=client_id)

@router.websocket("/ws/chat/{client_id}")
async def websocket_chat_endpoint(websocket: WebSocket, client_id: str):
    """Specialized WebSocket channel for interactive multi-turn educational chat."""
    await manager.connect(websocket, client_id=client_id, topic="chat")
    try:
        while True:
            msg = await websocket.receive_json()
            query_text = msg.get("query", msg.get("message", ""))
            
            # Send immediate ACK
            await websocket.send_json({
                "event": "MESSAGE_RECEIVED",
                "query": query_text,
                "status": "processing"
            })

            # Broadcast processing progress
            await manager.broadcast({
                "event": "CHAT_INTERACTION_ACTIVE",
                "client_id": client_id,
                "query": query_text
            }, topic="chat")

    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id=client_id)
    except Exception:
        manager.disconnect(websocket, client_id=client_id)

# REST API bridge for WebSockets

class BroadcastRequest(BaseModel):
    event: str
    topic: Optional[str] = "all"
    payload: Dict[str, Any]
    client_id: Optional[str] = None

@router.post("/api/ws/broadcast")
async def trigger_websocket_broadcast(req: BroadcastRequest):
    """REST endpoint allowing agents or pipelines to push instant real-time events over WebSockets."""
    message = {
        "event": req.event,
        "payload": req.payload,
        "sender": req.client_id or "system_pipeline"
    }
    await manager.broadcast(message, topic=req.topic or "all")
    return {
        "status": "success",
        "active_subscribers": len(manager.active_connections),
        "topic": req.topic
    }
