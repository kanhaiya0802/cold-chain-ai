from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict
from sqlalchemy.orm import Session
import jwt
import os

from models import models
from schemas import schemas
from services import crud
from core.database import get_db
from core import auth

router = APIRouter(tags=["websocket"])

SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key_123")
ALGORITHM = "HS256"

class ConnectionManager:
    def __init__(self):
        # Store connections by role or user_id for targeted broadcasting
        self.active_connections: Dict[str, List[WebSocket]] = {
            "sender": [],
            "receiver": [],
            "driver": []
        }

    async def connect(self, websocket: WebSocket, token: str):
        await websocket.accept()
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            role = payload.get("role")
            if role in self.active_connections:
                self.active_connections[role].append(websocket)
            return payload
        except jwt.PyJWTError:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return None

    def disconnect(self, websocket: WebSocket, role: str):
        if role in self.active_connections and websocket in self.active_connections[role]:
            self.active_connections[role].remove(websocket)

    async def broadcast_to_role(self, message: dict, role: str):
        for connection in self.active_connections.get(role, []):
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                self.disconnect(connection, role)

    async def broadcast_sensor_log(self, log_data: dict, db: Session):
        message = {"type": "log_update", "data": log_data}
        # Senders and drivers both get real-time truck telemetry + GPS
        await self.broadcast_to_role(message, "sender")
        await self.broadcast_to_role(message, "driver")

    async def broadcast_alert(self, alert_data: dict, roles: List[str]):
        # Senders and potentially drivers/receivers depending on severity
        for role in roles:
            await self.broadcast_to_role({"type": "ALERT", "data": alert_data}, role)

manager = ConnectionManager()

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    user_payload = await manager.connect(websocket, token)
    if not user_payload:
        return
        
    role = user_payload.get("role")

    try:
        # Send initial GPS snapshot for all trucks so map populates immediately
        if role in ("sender", "driver"):
            latest_logs = crud.get_latest_truck_logs(db)
            for log in latest_logs:
                initial_data = {
                    "truck_id": log.truck_id,
                    "temperature": log.temperature,
                    "humidity": log.humidity,
                    "battery_level": log.battery_level,
                    "door_status": log.door_status,
                    "shipment_id": log.shipment_id,
                    "location": {"latitude": log.latitude, "longitude": log.longitude},
                    "recorded_at": log.recorded_at.isoformat() if log.recorded_at else None
                }
                await websocket.send_json({"type": "log_update", "data": initial_data})
            
        while True:
            # Keep connection open, handle incoming commands if any
            data = await websocket.receive_text()
            pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, role)

