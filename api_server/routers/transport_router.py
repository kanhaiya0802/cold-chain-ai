from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from schemas import schemas
from services import crud
from core.database import get_db
from core.auth import get_current_user
from models import models

router = APIRouter(prefix="/transport", tags=["transport"])

@router.get("/shipments", response_model=List[schemas.Shipment])
def get_my_shipments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.driver:
        raise HTTPException(status_code=403, detail="Only drivers can access this.")
    return crud.get_driver_shipments(db, current_user.user_id)

@router.get("/shipments/{shipment_id}", response_model=schemas.Shipment)
def get_shipment_details(shipment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify shipment belongs to driver
    shipment = crud.get_shipment_by_id(db, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # Check if this shipment belongs to current driver's truck
    truck = db.query(models.Truck).filter(models.Truck.truck_id == shipment.truck_id).first()
    if not truck or truck.driver_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You are not assigned to this shipment.")
    
    return shipment

@router.post("/shipments/{shipment_id}/start")
def start_shipment(shipment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    shipment = crud.get_shipment_by_id(db, shipment_id)
    truck = db.query(models.Truck).filter(models.Truck.truck_id == shipment.truck_id).first()
    if truck.driver_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return crud.update_shipment_status(db, shipment_id, "in_transit")

@router.get("/shipments/{shipment_id}/stops", response_model=List[schemas.ShipmentOrder])
def get_shipment_stops(shipment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_shipment_stops(db, shipment_id)

@router.post("/stops/{stop_id}/status")
def update_stop_status(stop_id: int, req: schemas.StopStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Simple check: stop exists
    return crud.update_stop_status(db, stop_id, req.status)

@router.post("/confirm-delivery")
def confirm_delivery(proof: schemas.DeliveryProofCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # For demo, we just accept the proof. In real app, we'd verify QR etc.
    return crud.create_delivery_proof(db, proof, proof.receiver_id)

@router.post("/issues", response_model=schemas.DriverIssueReport)
def report_issue(issue: schemas.DriverIssueReportCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_driver_issue(db, current_user.user_id, issue)

@router.get("/alerts", response_model=List[schemas.Alert])
def get_driver_alerts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Find all active alerts for shipments assigned to this driver
    return db.query(models.Alert).join(models.Shipment).join(models.Truck).filter(
        models.Truck.driver_id == current_user.user_id,
        models.Alert.status == "active"
    ).all()

@router.get("/live-monitoring/{shipment_id}")
def get_live_data(shipment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logs = crud.get_recent_sensor_logs(db, shipment_id, limit=1)
    if not logs:
        return None
    return logs[0]
