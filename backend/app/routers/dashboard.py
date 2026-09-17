from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/kpis")
def get_kpis(vehicle_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    try:
        # Fonctions utilitaires pour filtrer dynamiquement
        def get_sum(model, column, filter_by_vehicle=False):
            q = db.query(func.sum(column))
            if filter_by_vehicle and vehicle_id:
                q = q.filter(model.vehicle_id == vehicle_id)
            return float(q.scalar() or 0.0)

        def get_count(model, filter_by_vehicle=False):
            q = db.query(func.count(model.id))
            if filter_by_vehicle and vehicle_id:
                q = q.filter(model.vehicle_id == vehicle_id)
            return int(q.scalar() or 0)

        # 1. KPIs de base
        if vehicle_id:
            vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
            total_vehicles = 1 if vehicle else 0
            total_mileage = float(vehicle.current_mileage) if vehicle else 0.0
        else:
            total_vehicles = get_count(models.Vehicle)
            total_mileage = get_sum(models.Vehicle, models.Vehicle.current_mileage)

        total_fuel_cost = get_sum(models.Fuel, models.Fuel.total_cost, True)
        total_maintenance_cost = get_sum(models.Maintenance, models.Maintenance.cost, True)
        total_expenses = get_sum(models.Expense, models.Expense.amount, True)
        total_tire_cost = get_sum(models.Tire, models.Tire.cost, True)
        
        total_liters = get_sum(models.Fuel, models.Fuel.liters, True)
        
        # 2. Calculs dérivés (avec protection division par zéro)
        average_consumption = (total_liters / total_mileage * 100) if total_mileage > 0 else 0.0
        total_cost = total_fuel_cost + total_maintenance_cost + total_expenses + total_tire_cost
        cost_per_km = (total_cost / total_mileage) if total_mileage > 0 else 0.0

        # 3. Alertes (simplifié pour l'exemple)
        active_alerts = 0
        if vehicle_id:
            v = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
            if v and v.current_mileage > 100000:
                active_alerts = 1
        else:
            active_alerts = db.query(func.count(models.Vehicle.id)).filter(models.Vehicle.current_mileage > 100000).scalar() or 0

        # 4. KPIs avancés (Distance entre pleins, etc.)
        avg_distance_between_fuels = 0.0
        daily_cost = 0.0
        monthly_cost = 0.0
        daily_distance = 0.0
        fuels_this_month = 0
        most_expensive_vehicle = None
        avg_holding_days = 0
        depreciation_per_day = 0.0
        total_fuel_count = 0
        maintenance_count = 0

        if vehicle_id:
            # Calculs spécifiques au véhicule
            v = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
            if v:
                total_fuel_count = get_count(models.Fuel, True)
                maintenance_count = get_count(models.Maintenance, True)
                
                # Jours de détention
                if v.purchase_date:
                    days = (date.today() - v.purchase_date).days
                    if days > 0:
                        avg_holding_days = days
                        daily_cost = total_cost / days
                        monthly_cost = daily_cost * 30
                        daily_distance = total_mileage / days
                        if v.purchase_price and v.resale_price:
                            depreciation_per_day = (v.purchase_price - v.resale_price) / days
                
                # Pleins ce mois
                first_day = date.today().replace(day=1)
                fuels_this_month = db.query(func.count(models.Fuel.id)).filter(
                    models.Fuel.vehicle_id == vehicle_id,
                    models.Fuel.fuel_date >= first_day
                ).scalar() or 0

                # Distance entre pleins
                fuels = db.query(models.Fuel).filter(models.Fuel.vehicle_id == vehicle_id).order_by(models.Fuel.fuel_date).all()
                distances = []
                for i in range(1, len(fuels)):
                    d = fuels[i].mileage - fuels[i-1].mileage
                    if 0 < d < 5000: distances.append(d)
                avg_distance_between_fuels = sum(distances) / len(distances) if distances else 0.0
        else:
            # Calculs globaux (moyennes)
            total_fuel_count = get_count(models.Fuel)
            maintenance_count = get_count(models.Maintenance)
            # ... (On garde les valeurs à 0 pour le global pour simplifier le code, ou on peut faire des moyennes)

        return {
            "total_vehicles": total_vehicles,
            "total_mileage": int(total_mileage),
            "total_fuel_cost": total_fuel_cost,
            "total_maintenance_cost": total_maintenance_cost,
            "total_expenses": total_expenses,
            "total_tire_cost": total_tire_cost,
            "average_consumption": average_consumption,
            "cost_per_km": cost_per_km,
            "active_alerts": active_alerts,
            "avg_distance_between_fuels": avg_distance_between_fuels,
            "daily_distance": daily_distance,
            "daily_cost": daily_cost,
            "monthly_cost": monthly_cost,
            "fuels_this_month": fuels_this_month,
            "most_expensive_vehicle": most_expensive_vehicle,
            "avg_holding_days": avg_holding_days,
            "depreciation_per_day": depreciation_per_day,
            "total_fuel_count": total_fuel_count,
            "maintenance_count": maintenance_count
        }
    except Exception as e:
        print(f"ERREUR DASHBOARD: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    try:
        alerts = []
        vehicles = db.query(models.Vehicle).all()
        for v in vehicles:
            if v.current_mileage > 100000:
                alerts.append({
                    "vehicle_id": v.id,
                    "license_plate": v.license_plate,
                    "item_name": "Révision majeure",
                    "alert_type": "km",
                    "current_value": v.current_mileage,
                    "threshold_value": 120000,
                    "km_remaining": max(0, 120000 - v.current_mileage),
                    "severity": "critical"
                })
        return alerts
    except Exception as e:
        return []