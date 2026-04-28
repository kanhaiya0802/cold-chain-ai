from sqlalchemy.orm import Session
from models import models
from schemas import schemas
from datetime import datetime, timezone

# --- Users ---
def get_user_by_username(db: Session, username: str):
    # In our seed, we generated email as username@test.com
    return db.query(models.User).filter(models.User.email == f"{username}@test.com").first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

# --- Inventory ---
def get_inventory(db: Session, sender_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Inventory)
    if sender_id:
        query = query.filter(models.Inventory.sender_id == sender_id)
    return query.offset(skip).limit(limit).all()

def get_batches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Batch).order_by(models.Batch.expiry_date.asc()).offset(skip).limit(limit).all()

# --- Orders ---
def get_orders(db: Session, user_id: int = None, role: str = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Order)
    if role == "receiver":
        query = query.filter(models.Order.receiver_id == user_id)
    elif role == "sender":
        query = query.filter(models.Order.sender_id == user_id)
    return query.order_by(models.Order.order_date.desc()).offset(skip).limit(limit).all()

def approve_order(db: Session, order_id: int):
    """Approve an order and allocate batches using FEFO logic."""
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order or order.status != models.OrderStatusEnum.pending:
        return None, "Order not found or not pending."
    
    for item in order.items:
        # FEFO: Get available batches ordered by expiry date
        batches = db.query(models.Batch).filter(
            models.Batch.inventory_id == item.inventory_id,
            models.Batch.status == models.BatchStatusEnum.available,
            models.Batch.quantity_available > 0
        ).order_by(models.Batch.expiry_date.asc()).all()
        
        needed = item.requested_quantity
        for batch in batches:
            if needed <= 0:
                break
            take = min(batch.quantity_available, needed)
            batch.quantity_available -= take
            needed -= take
            
            # Simple MVP allocation: assign the first used batch
            if item.batch_id is None:
                item.batch_id = batch.batch_id
                
            if batch.quantity_available == 0:
                batch.status = models.BatchStatusEnum.reserved
                
        if needed > 0:
            return None, f"Not enough inventory for item ID {item.inventory_id}"
            
        item.status = models.OrderItemStatusEnum.approved
        item.approved_quantity = item.requested_quantity

    order.status = models.OrderStatusEnum.confirmed
    db.commit()
    db.refresh(order)
    return order, "Order approved successfully."

def pack_order(db: Session, order_id: int):
    """Mark an order as packed and ready for dispatch."""
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order or order.status != models.OrderStatusEnum.confirmed:
        return None, "Order not found or not in confirmed state."
    
    order.status = models.OrderStatusEnum.packed
    db.commit()
    db.refresh(order)
    return order, "Order packed successfully."

# --- Shipments ---
def get_shipments(db: Session, skip: int = 0, limit: int = 100):
    shipments = db.query(models.Shipment).order_by(models.Shipment.start_time.desc()).offset(skip).limit(limit).all()
    for s in shipments:
        s.latest_telemetry = db.query(models.SensorLog).filter(models.SensorLog.shipment_id == s.shipment_id).order_by(models.SensorLog.recorded_at.desc()).first()
    return shipments

def get_shipment_by_id(db: Session, shipment_id: int):
    shipment = db.query(models.Shipment).filter(models.Shipment.shipment_id == shipment_id).first()
    if shipment:
        shipment.latest_telemetry = db.query(models.SensorLog).filter(models.SensorLog.shipment_id == shipment_id).order_by(models.SensorLog.recorded_at.desc()).first()
    return shipment

def create_shipment(db: Session, ship: schemas.ShipmentCreate):
    db_ship = models.Shipment(
        truck_id=ship.truck_id,
        sender_id=ship.sender_id,
        start_time=datetime.now(timezone.utc),
        shipment_status=models.ShipmentStatusEnum.loading
    )
    db.add(db_ship)
    db.commit()
    db.refresh(db_ship)
    return db_ship

# --- Sensor Logs ---
def create_sensor_log(db: Session, log: schemas.SensorLogCreate):
    db_log = models.SensorLog(
        shipment_id=log.shipment_id,
        truck_id=log.truck_id,
        temperature=log.temperature,
        humidity=log.humidity,
        latitude=log.latitude,
        longitude=log.longitude,
        door_status=log.door_status,
        battery_level=log.battery_level,
        recorded_at=datetime.now(timezone.utc)
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_recent_sensor_logs(db: Session, shipment_id: int, limit: int = 50):
    return db.query(models.SensorLog).filter(models.SensorLog.shipment_id == shipment_id).order_by(models.SensorLog.recorded_at.desc()).limit(limit).all()

def get_latest_truck_logs(db: Session):
    """Return the single most-recent log for every unique truck_id (for GPS map)."""
    from sqlalchemy import func
    # Sub-query: max log_id per truck
    subq = (
        db.query(func.max(models.SensorLog.log_id).label("max_id"))
        .group_by(models.SensorLog.truck_id)
        .subquery()
    )
    return db.query(models.SensorLog).join(subq, models.SensorLog.log_id == subq.c.max_id).all()

# --- Alerts ---
def create_alert(db: Session, alert: schemas.AlertCreate):
    db_alert = models.Alert(
        shipment_id=alert.shipment_id,
        order_id=alert.order_id,
        alert_type=alert.alert_type,
        severity=alert.severity,
        message=alert.message,
        created_at=datetime.now(timezone.utc),
        status="active"
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_latest_alert(db: Session, shipment_id: int):
    return db.query(models.Alert).filter(models.Alert.shipment_id == shipment_id).order_by(models.Alert.created_at.desc()).first()

def get_active_alerts(db: Session, limit: int = 100):
    return db.query(models.Alert).filter(models.Alert.status == "active").order_by(models.Alert.created_at.desc()).limit(limit).all()

# --- Receiver Specific ---
def create_receiver_order(db: Session, receiver_id: int, req: schemas.OrderPlaceRequest):
    db_order = models.Order(
        receiver_id=receiver_id,
        sender_id=req.sender_id,
        required_delivery_date=req.required_delivery_date,
        priority=req.priority,
        status=models.OrderStatusEnum.pending
    )
    db.add(db_order)
    db.flush() # Get order_id
    
    for item in req.items:
        db_item = models.OrderItem(
            order_id=db_order.order_id,
            inventory_id=item.inventory_id,
            requested_quantity=item.quantity,
            status=models.OrderItemStatusEnum.pending
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def create_complaint(db: Session, user_id: int, complaint: schemas.ComplaintCreate):
    db_complaint = models.Complaint(
        user_id=user_id,
        order_id=complaint.order_id,
        complaint_type=complaint.complaint_type,
        message=complaint.message,
        status="open"
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

def get_receiver_shipments(db: Session, receiver_id: int):
    """Get all shipments that contain orders for this receiver."""
    return db.query(models.Shipment).join(models.ShipmentOrder).filter(models.ShipmentOrder.receiver_id == receiver_id).all()

def get_receiver_proofs(db: Session, receiver_id: int):
    return db.query(models.DeliveryProof).filter(models.DeliveryProof.receiver_id == receiver_id).all()
# --- Transport Specific ---
def get_driver_shipments(db: Session, driver_id: int):
    return db.query(models.Shipment).join(models.Truck).filter(models.Truck.driver_id == driver_id).all()

def get_shipment_stops(db: Session, shipment_id: int):
    return db.query(models.ShipmentOrder).filter(models.ShipmentOrder.shipment_id == shipment_id).order_by(models.ShipmentOrder.delivery_sequence.asc()).all()

def update_shipment_status(db: Session, shipment_id: int, status: str):
    shipment = db.query(models.Shipment).filter(models.Shipment.shipment_id == shipment_id).first()
    if shipment:
        shipment.shipment_status = status
        if status == "in_transit" and not shipment.start_time:
            shipment.start_time = datetime.now(timezone.utc)
        db.commit()
        db.refresh(shipment)
    return shipment

def update_stop_status(db: Session, stop_id: int, status: str):
    stop = db.query(models.ShipmentOrder).filter(models.ShipmentOrder.shipment_order_id == stop_id).first()
    if stop:
        stop.delivery_status = status
        db.commit()
        db.refresh(stop)
    return stop

def create_delivery_proof(db: Session, proof: schemas.DeliveryProofCreate, receiver_id: int):
    db_proof = models.DeliveryProof(
        order_id=proof.order_id,
        shipment_id=proof.shipment_id,
        receiver_id=receiver_id,
        delivered_quantity=proof.delivered_quantity,
        temperature_status=proof.temperature_status,
        receiver_signature=proof.receiver_signature,
        qr_verified=proof.qr_verified,
        remarks=proof.remarks,
        delivery_time=datetime.now(timezone.utc)
    )
    db.add(db_proof)
    
    # Update order status to delivered
    order = db.query(models.Order).filter(models.Order.order_id == proof.order_id).first()
    if order:
        order.status = models.OrderStatusEnum.delivered
        
    db.commit()
    db.refresh(db_proof)
    return db_proof

def create_driver_issue(db: Session, driver_id: int, issue: schemas.DriverIssueReportCreate):
    db_issue = models.DriverIssueReport(
        driver_id=driver_id,
        shipment_id=issue.shipment_id,
        stop_id=issue.stop_id,
        issue_type=issue.issue_type,
        description=issue.description,
        severity=issue.severity,
        latitude=issue.latitude,
        longitude=issue.longitude,
        status="open",
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue
