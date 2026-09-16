from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String, unique=True, index=True)
    brand = Column(String)
    model = Column(String)
    year = Column(Integer)
    engine_type = Column(String)
    transmission = Column(String)
    initial_mileage = Column(Integer)
    current_mileage = Column(Integer)
    driver_name = Column(String, nullable=True)
    purchase_price = Column(Float, nullable=True)
    resale_price = Column(Float, nullable=True)
    purchase_date = Column(Date, nullable=True)
    resale_date = Column(Date, nullable=True)
    reminders = relationship("Reminder", back_populates="vehicle", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="vehicle", cascade="all, delete-orphan")
    maintenances = relationship("Maintenance", back_populates="vehicle", cascade="all, delete-orphan")
    fuels = relationship("Fuel", back_populates="vehicle", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="vehicle", cascade="all, delete-orphan")
    tires = relationship("Tire", back_populates="vehicle", cascade="all, delete-orphan") # NOUVEAU
    reminders = relationship("Reminder", back_populates="vehicle", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    document_type = Column(String)
    file_name = Column(String)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    vehicle = relationship("Vehicle", back_populates="documents")

class Maintenance(Base):
    __tablename__ = "maintenances"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    maintenance_date = Column(Date)
    mileage = Column(Integer)
    maintenance_type = Column(String)
    description = Column(String, nullable=True)
    cost = Column(Float)
    garage = Column(String, nullable=True)
    vehicle = relationship("Vehicle", back_populates="maintenances")

class Fuel(Base):
    __tablename__ = "fuels"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    fuel_date = Column(Date)
    mileage = Column(Integer)
    liters = Column(Float)
    price_per_liter = Column(Float)
    total_cost = Column(Float)
    station = Column(String, nullable=True)
    full_tank = Column(Integer)
    vehicle = relationship("Vehicle", back_populates="fuels")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    category_id = Column(Integer)
    expense_date = Column(Date)
    description = Column(String)
    amount = Column(Float)
    vehicle = relationship("Vehicle", back_populates="expenses")

# NOUVEAU MODÈLE : SUIVI DES PNEUS
class Tire(Base):
    __tablename__ = "tires"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    change_date = Column(Date)
    mileage = Column(Integer)
    tire_type = Column(String)  # "Été", "Hiver", "4 Saisons"
    brand = Column(String)
    position = Column(String)   # "4 pneus", "Train avant", "Train arrière"
    cost = Column(Float)
    notes = Column(String, nullable=True)
    vehicle = relationship("Vehicle", back_populates="tires")
    
    # À la fin du fichier, ajoutez ce nouveau modèle :
class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    category = Column(String)  # 'Assurance', 'Vidange', 'Révision', 'Pneus', 'Visite Technique'
    next_due_date = Column(Date, nullable=True)
    next_due_mileage = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    
    vehicle = relationship("Vehicle", back_populates="reminders")
    
