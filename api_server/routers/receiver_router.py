from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from schemas import schemas
from services import crud
from core.database import get_db
from core.auth import get_current_user
from models import models

router = APIRouter(prefix="/receiver", tags=["receiver"])

@router.get("/senders", response_model=List[schemas.User])
def get_available_senders(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == models.RoleEnum.sender).all()

@router.get("/stats")
def get_receiver_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.receiver:
        raise HTTPException(status_code=403, detail="Only receivers can access this.")
    
    # Active Orders (anything not delivered/cancelled)
    active_orders = db.query(models.Order).filter(
        models.Order.receiver_id == current_user.user_id,
        models.Order.status.notin_([models.OrderStatusEnum.delivered, models.OrderStatusEnum.cancelled])
    ).count()

    # In Transit
    in_transit = db.query(models.Order).filter(
        models.Order.receiver_id == current_user.user_id,
        models.Order.status == models.OrderStatusEnum.dispatched
    ).count()

    # Delivered This Month
    delivered = db.query(models.Order).filter(
        models.Order.receiver_id == current_user.user_id,
        models.Order.status == models.OrderStatusEnum.delivered
    ).count()

    # Delayed (Check active alerts of type delay for shipments linked to these orders)
    delayed = db.query(models.Order).join(models.Alert).filter(
        models.Order.receiver_id == current_user.user_id,
        models.Alert.alert_type == models.AlertTypeEnum.delay,
        models.Alert.status == "active"
    ).count()

    return {
        "active_orders": active_orders,
        "in_transit": in_transit,
        "delivered_total": delivered,
        "delayed_orders": delayed,
        "pending_approvals": active_orders - in_transit, # Simplified
        "avg_delivery_time": "2.4 days"
    }

@router.post("/orders", response_model=schemas.Order)
def place_order(req: schemas.OrderPlaceRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.receiver:
         raise HTTPException(status_code=403, detail="Only receivers can place orders.")
    
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Account not verified. Please upload your medical license for approval."
        )
        
    return crud.create_receiver_order(db, current_user.user_id, req)

@router.get("/orders", response_model=List[schemas.Order])
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_orders(db, user_id=current_user.user_id, role="receiver")

@router.get("/orders/{order_id}/tracking")
def get_order_tracking(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.order_id == order_id, models.Order.receiver_id == current_user.user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Find shipment linked to this order
    shipment_order = db.query(models.ShipmentOrder).filter(models.ShipmentOrder.order_id == order_id).first()
    if not shipment_order:
        return {"status": order.status, "tracking": None, "message": "Shipment not yet assigned"}

    shipment = crud.get_shipment_by_id(db, shipment_order.shipment_id)
    latest_log = db.query(models.SensorLog).filter(models.SensorLog.shipment_id == shipment.shipment_id).order_by(models.SensorLog.recorded_at.desc()).first()
    
    return {
        "order_id": order.order_id,
        "status": order.status,
        "shipment_id": shipment.shipment_id,
        "shipment_status": shipment.shipment_status,
        "eta": "45 mins" if shipment.shipment_status == "in_transit" else "TBD",
        "latest_telemetry": latest_log,
        "safety_status": "Safe" # Mock logic
    }

@router.get("/history", response_model=List[schemas.Order])
def get_delivery_history(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Order).filter(
        models.Order.receiver_id == current_user.user_id,
        models.Order.status == models.OrderStatusEnum.delivered
    ).all()

@router.get("/proofs", response_model=List[schemas.DeliveryProof])
def get_my_proofs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_receiver_proofs(db, current_user.user_id)

@router.post("/complaints", response_model=schemas.Complaint)
def submit_complaint(complaint: schemas.ComplaintCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_complaint(db, current_user.user_id, complaint)
