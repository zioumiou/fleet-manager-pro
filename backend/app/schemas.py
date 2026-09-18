from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date, datetime

class DocumentBase(BaseModel):
    document_type: str
    file_name: str
    file_path: str

class Document(DocumentBase):
    id: int
    vehicle_id: int
    upload_date: datetime
    class Config: from_attributes = True

class VehicleBase(BaseModel):
    license_plate: str
    brand: str
    model: str
    year: int
    engine_type: str
    transmission: str
    initial_mileage: int
    current_mileage: int
    driver_name: Optional[str] = None
    purchase_price: Optional[float] = None
    resale_price: Optional[float] = None
    purchase_date: Optional[date] = None
    resale_date: Optional[date] = None

    @field_validator('purchase_date', 'resale_date', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        return None if v == "" else v

class VehicleCreate(VehicleBase): pass

class VehicleUpdate(BaseModel):
    license_plate: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    engine_type: Optional[str] = None
    transmission: Optional[str] = None
    initial_mileage: Optional[int] = None
    current_mileage: Optional[int] = None
    driver_name: Optional[str] = None
    purchase_price: Optional[float] = None
    resale_price: Optional[float] = None
    purchase_date: Optional[date] = None
    resale_date: Optional[date] = None

    @field_validator('purchase_date', 'resale_date', mode='before')
    @classmethod
    def empty_str_to_none_update(cls, v):
        return None if v == "" else v

class Vehicle(VehicleBase):
    id: int
    documents: List[Document] = []
    class Config: from_attributes = True

class MaintenanceBase(BaseModel):
    vehicle_id: int
    maintenance_date: date
    mileage: int
    maintenance_type: str
    description: Optional[str] = None
    cost: float
    garage: Optional[str] = None
class MaintenanceCreate(MaintenanceBase): pass
class Maintenance(MaintenanceBase):
    id: int
    class Config: from_attributes = True

class FuelBase(BaseModel):
    vehicle_id: int
    fuel_date: date
    mileage: int
    liters: float
    price_per_liter: float
    total_cost: float
    station: Optional[str] = None
    full_tank: int
class FuelCreate(FuelBase): pass
class Fuel(FuelBase):
    id: int
    class Config: from_attributes = True

class ExpenseBase(BaseModel):
    vehicle_id: int
    category_id: int
    expense_date: date
    description: str
    amount: float
class ExpenseCreate(ExpenseBase): pass
class Expense(ExpenseBase):
    id: int
    class Config: from_attributes = True

class TireBase(BaseModel):
    vehicle_id: int
    change_date: date
    mileage: int
    tire_type: str
    brand: str
    position: str
    cost: float
    notes: Optional[str] = None
class TireCreate(TireBase): pass
class Tire(TireBase):
    id: int
    class Config: from_attributes = True

class ReminderBase(BaseModel):
    vehicle_id: int
    category: str
    next_due_date: Optional[date] = None
    next_due_mileage: Optional[int] = None
    notes: Optional[str] = None

class ReminderCreate(ReminderBase): pass

class Reminder(ReminderBase):
    id: int
    vehicle_plate: str
    days_remaining: Optional[int] = None
    km_remaining: Optional[int] = None
    status: str  # 'green', 'orange', 'red'
    class Config: from_attributes = True

class ReminderBase(BaseModel):
    vehicle_id: int
    category: str
    next_due_date: Optional[date] = None
    next_due_mileage: Optional[int] = None
    notes: Optional[str] = None

class ReminderCreate(ReminderBase): pass

class Reminder(ReminderBase):
    id: int
    vehicle_plate: str
    days_remaining: Optional[int] = None
    km_remaining: Optional[int] = None
    status: str  # 'green', 'orange', 'red'
    class Config: from_attributes = True
    
# ✅ MODIFIÉ : Ajout de total_tire_cost
class KPIResponse(BaseModel):
    # KPIs existants
    total_vehicles: int
    total_mileage: int
    total_fuel_cost: float
    total_maintenance_cost: float
    total_expenses: float
    total_tire_cost: float
    average_consumption: float
    cost_per_km: float
    active_alerts: int
    
    # NOUVEAUX KPIs
    avg_distance_between_fuels: float  # km entre 2 pleins
    daily_distance: float              # km parcourus par jour
    daily_cost: float                  # € dépensés par jour
    monthly_cost: float                # € dépensés par mois
    fuels_this_month: int              # nombre de pleins ce mois
    most_expensive_vehicle: Optional[str]  # immatriculation du + coûteux
    avg_holding_days: int              # jours de détention moyen
    depreciation_per_day: float        # dépréciation journalière
    total_fuel_count: int              # nombre total de pleins
    maintenance_count: int             # nombre total d'entretiens
class AlertResponse(BaseModel):
    vehicle_id: int
    license_plate: str
    item_name: str
    alert_type: str
    current_value: int
    threshold_value: int
    days_remaining: Optional[int] = None
    km_remaining: Optional[int] = None
    severity: str
    
class DocumentBase(BaseModel):
    document_type: str
    file_name: str
    file_size: int

class Document(DocumentBase):
    id: int
    vehicle_id: int
    file_path: str
    upload_date: date
    
    class Config:
        from_attributes = True