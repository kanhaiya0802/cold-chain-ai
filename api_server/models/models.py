from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime, timezone
import enum

# Enums
class RoleEnum(str, enum.Enum):
    admin = "admin"
    sender = "sender"
    receiver = "receiver"
    driver = "driver"

class InventoryCategoryEnum(str, enum.Enum):
    vaccine = "vaccine"
    medicine = "medicine"

class BatchStatusEnum(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    dispatched = "dispatched"
    expired = "expired"

class OrderStatusEnum(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    packed = "packed"
    dispatched = "dispatched"
    delivered = "delivered"
    cancelled = "cancelled"

class PriorityEnum(str, enum.Enum):
    normal = "normal"
    urgent = "urgent"
    critical = "critical"

class OrderItemStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class TruckStatusEnum(str, enum.Enum):
    available = "available"
    assigned = "assigned"
    in_transit = "in_transit"
    maintenance = "maintenance"

class ShipmentStatusEnum(str, enum.Enum):
    planned = "planned"
    loading = "loading"
    dispatched = "dispatched"
    in_transit = "in_transit"
    completed = "completed"
    cancelled = "cancelled"

class ShipmentOrderStatusEnum(str, enum.Enum):
    pending = "pending"
    reached = "reached"
    delivered = "delivered"
    failed = "failed"
    skipped = "skipped"

class AlertTypeEnum(str, enum.Enum):
    temperature = "temperature"
    delay = "delay"
    route = "route"
    battery = "battery"
    door_open = "door_open"

class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class TempStatusEnum(str, enum.Enum):
    safe = "safe"
    warning = "warning"
    breached = "breached"

# Models
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    role = Column(SQLEnum(RoleEnum))
    organization_name = Column(String)
    password_hash = Column(String)
    verification_id = Column(String, nullable=True) # Medical/Business License
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Inventory(Base):
    __tablename__ = "inventory"
    inventory_id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.user_id")) # Owner of this stock
    item_name = Column(String)
    category = Column(SQLEnum(InventoryCategoryEnum))
    total_quantity = Column(Integer, default=0)
    available_quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)
    min_temperature = Column(Float)
    max_temperature = Column(Float)

    batches = relationship("Batch", back_populates="inventory")
    sender = relationship("User")

class Batch(Base):
    __tablename__ = "batches"
    batch_id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.inventory_id"))
    batch_number = Column(String, unique=True, index=True)
    quantity_available = Column(Integer)
    manufacture_date = Column(DateTime)
    expiry_date = Column(DateTime)
    supplier_name = Column(String)
    status = Column(SQLEnum(BatchStatusEnum), default=BatchStatusEnum.available)

    inventory = relationship("Inventory", back_populates="batches")

class Order(Base):
    __tablename__ = "orders"
    order_id = Column(Integer, primary_key=True, index=True)
    receiver_id = Column(Integer, ForeignKey("users.user_id"))
    sender_id = Column(Integer, ForeignKey("users.user_id"), nullable=True) # Destination warehouse
    order_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    required_delivery_date = Column(DateTime)
    status = Column(SQLEnum(OrderStatusEnum), default=OrderStatusEnum.pending)
    priority = Column(SQLEnum(PriorityEnum), default=PriorityEnum.normal)

    items = relationship("OrderItem", back_populates="order")
    receiver = relationship("User", foreign_keys=[receiver_id])
    sender = relationship("User", foreign_keys=[sender_id])

class OrderItem(Base):
    __tablename__ = "order_items"
    order_item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"))
    inventory_id = Column(Integer, ForeignKey("inventory.inventory_id"))
    batch_id = Column(Integer, ForeignKey("batches.batch_id"), nullable=True)
    requested_quantity = Column(Integer)
    approved_quantity = Column(Integer, default=0)
    status = Column(SQLEnum(OrderItemStatusEnum), default=OrderItemStatusEnum.pending)

    order = relationship("Order", back_populates="items")
    inventory = relationship("Inventory")
    batch = relationship("Batch")

class Truck(Base):
    __tablename__ = "trucks"
    truck_id = Column(Integer, primary_key=True, index=True)
    truck_number = Column(String, unique=True)
    driver_id = Column(Integer, ForeignKey("users.user_id"))
    capacity = Column(Float) # Volume or weight
    current_status = Column(SQLEnum(TruckStatusEnum), default=TruckStatusEnum.available)
    cooling_unit_status = Column(String, default="OK")

    driver = relationship("User")

class Shipment(Base):
    __tablename__ = "shipments"
    shipment_id = Column(Integer, primary_key=True, index=True)
    truck_id = Column(Integer, ForeignKey("trucks.truck_id"))
    sender_id = Column(Integer, ForeignKey("users.user_id"))
    start_time = Column(DateTime, nullable=True)
    expected_end_time = Column(DateTime, nullable=True)
    actual_end_time = Column(DateTime, nullable=True)
    shipment_status = Column(SQLEnum(ShipmentStatusEnum), default=ShipmentStatusEnum.planned)

    orders = relationship("ShipmentOrder", back_populates="shipment")
    logs = relationship("SensorLog", back_populates="shipment")
    alerts = relationship("Alert", back_populates="shipment")

class ShipmentOrder(Base):
    __tablename__ = "shipment_orders"
    shipment_order_id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.shipment_id"))
    order_id = Column(Integer, ForeignKey("orders.order_id"))
    delivery_sequence = Column(Integer)
    receiver_id = Column(Integer, ForeignKey("users.user_id"))
    delivery_status = Column(String, default="pending") # pending, delivered, failed

    shipment = relationship("Shipment", back_populates="orders")
    order = relationship("Order")
    receiver = relationship("User")

class SensorLog(Base):
    __tablename__ = "sensor_logs"
    log_id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.shipment_id"))
    truck_id = Column(Integer, ForeignKey("trucks.truck_id"))
    temperature = Column(Float)
    humidity = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    door_status = Column(String) # closed, open
    battery_level = Column(Float)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    shipment = relationship("Shipment", back_populates="logs")

class Alert(Base):
    __tablename__ = "alerts"
    alert_id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.shipment_id"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=True)
    alert_type = Column(SQLEnum(AlertTypeEnum))
    severity = Column(SQLEnum(SeverityEnum))
    message = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)
    status = Column(String, default="active") # active, resolved

    shipment = relationship("Shipment", back_populates="alerts")
    order = relationship("Order")

class DeliveryProof(Base):
    __tablename__ = "delivery_proofs"
    proof_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), unique=True)
    shipment_id = Column(Integer, ForeignKey("shipments.shipment_id"))
    receiver_id = Column(Integer, ForeignKey("users.user_id"))
    delivered_quantity = Column(Integer)
    delivery_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    temperature_status = Column(SQLEnum(TempStatusEnum))
    receiver_signature = Column(String) # path/hash
    qr_verified = Column(Boolean, default=False)
    remarks = Column(Text, nullable=True)

    order = relationship("Order")
    shipment = relationship("Shipment")
    receiver = relationship("User")

class UserSession(Base):
    __tablename__ = "user_sessions"
    session_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    role = Column(SQLEnum(RoleEnum))
    login_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    logout_time = Column(DateTime, nullable=True)
    ip_address = Column(String, nullable=True)
    device_info = Column(String, nullable=True)
    status = Column(String, default="active") # active, logged_out

    user = relationship("User")

class UserActivityLog(Base):
    __tablename__ = "user_activity_logs"
    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True) # Optional for system actions
    role = Column(SQLEnum(RoleEnum), nullable=True)
    activity_type = Column(String) # e.g. login, logout, order_created
    description = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

class Complaint(Base):
    __tablename__ = "complaints"
    complaint_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=True)
    complaint_type = Column(String)
    message = Column(Text)
    status = Column(String, default="open") # open, investigating, resolved
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    order = relationship("Order")

class DriverIssueReport(Base):
    __tablename__ = "driver_issue_reports"
    report_id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.user_id"))
    shipment_id = Column(Integer, ForeignKey("shipments.shipment_id"))
    stop_id = Column(Integer, ForeignKey("shipment_orders.shipment_order_id"), nullable=True)
    issue_type = Column(String)
    description = Column(Text)
    severity = Column(SQLEnum(SeverityEnum))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
