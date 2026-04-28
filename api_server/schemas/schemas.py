from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.models import (
    RoleEnum, InventoryCategoryEnum, BatchStatusEnum, OrderStatusEnum,
    PriorityEnum, OrderItemStatusEnum, TruckStatusEnum, ShipmentStatusEnum,
    AlertTypeEnum, SeverityEnum, TempStatusEnum, ShipmentOrderStatusEnum
)

# ... (rest of imports)

# Driver Issue Report
class DriverIssueReportBase(BaseModel):
    shipment_id: int
    stop_id: Optional[int] = None
    issue_type: str
    description: str
    severity: SeverityEnum
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DriverIssueReportCreate(DriverIssueReportBase):
    pass

class DriverIssueReport(DriverIssueReportBase):
    report_id: int
    driver_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Stop status update
class StopStatusUpdate(BaseModel):
    status: ShipmentOrderStatusEnum

# User
class UserBase(BaseModel):
    username: str
    role: RoleEnum

class UserCreate(UserBase):
    password: str

class User(UserBase):
    user_id: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization_name: Optional[str] = None
    is_verified: bool = False

    class Config:
        from_attributes = True

# Inventory
class InventoryBase(BaseModel):
    item_name: str
    category: InventoryCategoryEnum
    min_temperature: float
    max_temperature: float

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    inventory_id: int
    total_quantity: int
    available_quantity: int
    reserved_quantity: int

    class Config:
        from_attributes = True

# Batch
class BatchBase(BaseModel):
    inventory_id: int
    batch_number: str
    quantity_available: int
    manufacture_date: datetime
    expiry_date: datetime
    supplier_name: Optional[str] = None
    status: BatchStatusEnum = BatchStatusEnum.available

class BatchCreate(BatchBase):
    pass

class Batch(BatchBase):
    batch_id: int

    class Config:
        from_attributes = True

# Order
class OrderBase(BaseModel):
    receiver_id: int
    required_delivery_date: datetime
    priority: PriorityEnum = PriorityEnum.normal

class OrderCreate(OrderBase):
    pass

# OrderItem
class OrderItemBase(BaseModel):
    order_id: int
    inventory_id: int
    requested_quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    order_item_id: int
    batch_id: Optional[int] = None
    approved_quantity: int
    status: OrderItemStatusEnum
    inventory: Optional[Inventory] = None

    class Config:
        from_attributes = True

class Order(OrderBase):
    order_id: int
    order_date: datetime
    status: OrderStatusEnum
    items: List[OrderItem] = []

    class Config:
        from_attributes = True

# Truck
class TruckBase(BaseModel):
    truck_number: str
    driver_id: int
    capacity: float

class TruckCreate(TruckBase):
    pass

class Truck(TruckBase):
    truck_id: int
    current_status: TruckStatusEnum
    cooling_unit_status: str

    class Config:
        from_attributes = True

# SensorLog
class SensorLogBase(BaseModel):
    shipment_id: int
    truck_id: int
    temperature: float
    humidity: float
    latitude: float
    longitude: float
    door_status: str
    battery_level: float

class SensorLogCreate(SensorLogBase):
    pass

class SensorLog(SensorLogBase):
    log_id: int
    recorded_at: datetime

    class Config:
        from_attributes = True

# Shipment
class ShipmentBase(BaseModel):
    truck_id: int
    sender_id: int

class ShipmentCreate(ShipmentBase):
    pass

class Shipment(ShipmentBase):
    shipment_id: int
    start_time: Optional[datetime] = None
    expected_end_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    shipment_status: ShipmentStatusEnum
    latest_telemetry: Optional[SensorLog] = None

    class Config:
        from_attributes = True

# ShipmentOrder
class ShipmentOrderBase(BaseModel):
    shipment_id: int
    order_id: int
    delivery_sequence: int
    receiver_id: int

class ShipmentOrderCreate(ShipmentOrderBase):
    pass

class ShipmentOrder(ShipmentOrderBase):
    shipment_order_id: int
    delivery_status: str

    class Config:
        from_attributes = True

# Alert
class AlertBase(BaseModel):
    shipment_id: Optional[int] = None
    order_id: Optional[int] = None
    alert_type: AlertTypeEnum
    severity: SeverityEnum
    message: str

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    alert_id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True

# DeliveryProof
class DeliveryProofBase(BaseModel):
    order_id: int
    shipment_id: int
    receiver_id: int
    delivered_quantity: int
    temperature_status: TempStatusEnum
    qr_verified: bool = False
    remarks: Optional[str] = None

class DeliveryProofCreate(DeliveryProofBase):
    receiver_signature: str

class DeliveryProof(DeliveryProofBase):
    proof_id: int
    delivery_time: datetime

    class Config:
        from_attributes = True

# Complaint
class ComplaintBase(BaseModel):
    order_id: Optional[int] = None
    complaint_type: str
    message: str

class ComplaintCreate(ComplaintBase):
    pass

class Complaint(ComplaintBase):
    complaint_id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Extended Order schemas for placement
class OrderItemSimple(BaseModel):
    inventory_id: int
    quantity: int

class OrderPlaceRequest(BaseModel):
    sender_id: int
    required_delivery_date: datetime
    priority: PriorityEnum = PriorityEnum.normal
    items: List[OrderItemSimple]
    notes: Optional[str] = None
