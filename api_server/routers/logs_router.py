from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import os
import google.generativeai as genai
from datetime import datetime, timezone, timedelta

from schemas import schemas
from services import crud
from core.database import get_db
from routers.websocket_router import manager

router = APIRouter(tags=["logs"])

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Global throttle for AI checks to preserve rate limits (Free Tier)
last_ai_check = datetime.now(timezone.utc) - timedelta(seconds=60)

async def process_ai_risk(log_data: dict, db: Session):
    global last_ai_check
    # Predictive Risk Engine
    # Only run if we haven't checked Gemini in the last 15 seconds to avoid 429 errors
    if (datetime.now(timezone.utc) - last_ai_check).total_seconds() < 15:
        return
        
    temp = log_data["temperature"]
    if temp >= 7.5 and GEMINI_API_KEY:
        last_ai_check = datetime.now(timezone.utc)
        # Check if we already have an active alert for this shipment
        latest_alert = crud.get_latest_alert(db, log_data["shipment_id"])
        if not latest_alert or (datetime.now(timezone.utc) - latest_alert.created_at.replace(tzinfo=timezone.utc)) > timedelta(minutes=5):
            try:
                # Prompt Gemini for risk prediction
                prompt = f"""
                A cold chain vaccine shipment (Shipment ID {log_data['shipment_id']}) is showing a rising temperature trend.
                Current Temperature: {temp}°C (Safe limit is 2-8°C).
                Battery Level: {log_data['battery_level']}%.
                
                Provide a brief emergency action plan for the driver. Be concise.
                """
                response = model.generate_content(prompt)
                
                # Create Alert
                alert_schema = schemas.AlertCreate(
                    shipment_id=log_data["shipment_id"],
                    alert_type="temperature",
                    severity="high" if temp > 8.0 else "medium",
                    message=f"AI Risk Detected: {response.text[:200]}..." # Truncated for simplicity
                )
                db_alert = crud.create_alert(db, alert_schema)
                
                alert_dict = schemas.Alert.from_orm(db_alert).dict()
                alert_dict['created_at'] = alert_dict['created_at'].isoformat()
                
                # Senders and Drivers get the full alert
                await manager.broadcast_alert(alert_dict, ["sender", "driver"])
            except Exception as e:
                print(f"AI Risk Engine Error (likely rate limit): {e}")

@router.post("/logs", response_model=schemas.SensorLog)
async def create_log(log: schemas.SensorLogCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_log = crud.create_sensor_log(db, log)
    
    log_dict = schemas.SensorLog.from_orm(db_log).dict()
    log_dict['recorded_at'] = log_dict['recorded_at'].isoformat()
    
    # Broadcast to senders
    await manager.broadcast_sensor_log(log_dict, db)
    
    # Process AI predictive risk asynchronously only if temperature is high
    if log_dict["temperature"] >= 7.5:
        background_tasks.add_task(process_ai_risk, log_dict, db)
            
    return db_log

@router.get("/trucks/latest")
def get_latest_truck_positions(db: Session = Depends(get_db)):
    """Return latest GPS + telemetry snapshot for every active truck. Used by the Sender Fleet Map."""
    logs = crud.get_latest_truck_logs(db)
    return [
        {
            "truck_id": log.truck_id,
            "temperature": log.temperature,
            "humidity": log.humidity,
            "battery_level": log.battery_level,
            "door_status": log.door_status,
            "location": {
                "latitude": log.latitude,
                "longitude": log.longitude
            },
            "recorded_at": log.recorded_at.isoformat() if log.recorded_at else None
        }
        for log in logs
    ]
