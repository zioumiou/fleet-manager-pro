from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/kpis", response_model=schemas.KPIResponse)
def get_kpis(db: Session = Depends(get_db)):
    try:
        # 1. Nombre de véhicules
        total_vehicles = db.query(models.Vehicle).count() or 0
        
        # 2. Kilométrage total
        total_mileage_result = db.query(func.sum(models.Vehicle.current_mileage)).scalar()
        total_mileage = total_mileage_result or 0
        
        # 3. Coût total carburant
        total_fuel_cost_result = db.query(func.sum(models.Fuel.total_cost)).scalar()
        total_fuel_cost = float(total_fuel_cost_result) if total_fuel_cost_result else 0.0
        
        # 4. Coût total entretien
        total_maintenance_cost_result = db.query(func.sum(models.Maintenance.cost)).scalar()
        total_maintenance_cost = float(total_maintenance_cost_result) if total_maintenance_cost_result else 0.0
        
        # 5. Coût total dépenses
        total_expenses_result = db.query(func.sum(models.Expense.amount)).scalar()
        total_expenses = float(total_expenses_result) if total_expenses_result else 0.0
        
        # 6. Coût total pneus
        total_tire_cost_result = db.query(func.sum(models.Tire.cost)).scalar()
        total_tire_cost = float(total_tire_cost_result) if total_tire_cost_result else 0.0
        
        # 7. Consommation moyenne (L/100km) - ÉVITER DIVISION PAR ZÉRO
        total_liters_result = db.query(func.sum(models.Fuel.liters)).scalar()
        total_liters = total_liters_result or 0.0
        average_consumption = (total_liters / total_mileage * 100) if total_mileage > 0 else 0.0
        
        # 8. Coût au km - ÉVITER DIVISION PAR ZÉRO
        total_cost = total_fuel_cost + total_maintenance_cost + total_expenses + total_tire_cost
        cost_per_km = (total_cost / total_mileage) if total_mileage > 0 else 0.0
        
        # 9. Alertes actives
        active_alerts = db.query(models.Vehicle).filter(
            models.Vehicle.current_mileage > 100000
        ).count() or 0
        
        # 10. NOUVEAUX KPIs
        # Distance entre pleins
        all_fuels = db.query(models.Fuel).order_by(models.Fuel.vehicle_id, models.Fuel.fuel_date).all()
        fuel_distances = []
        vehicle_fuels = {}
        for f in all_fuels:
            if f.vehicle_id not in vehicle_fuels:
                vehicle_fuels[f.vehicle_id] = []
            vehicle_fuels[f.vehicle_id].append(f)
        
        for vid, fuels in vehicle_fuels.items():
            fuels_sorted = sorted(fuels, key=lambda x: x.fuel_date)
            for i in range(1, len(fuels_sorted)):
                dist = fuels_sorted[i].mileage - fuels_sorted[i-1].mileage
                if dist > 0 and dist < 5000:
                    fuel_distances.append(dist)
        avg_distance_between_fuels = sum(fuel_distances) / len(fuel_distances) if fuel_distances else 0.0
        
        # Jours de détention
        today = date.today()
        vehicles_with_date = db.query(models.Vehicle).filter(models.Vehicle.purchase_date != None).all()
        holding_days_list = []
        for v in vehicles_with_date:
            if v.purchase_date:
                days = (today - v.purchase_date).days
                if days > 0:
                    holding_days_list.append(days)
        avg_holding_days = int(sum(holding_days_list) / len(holding_days_list)) if holding_days_list else 0
        
        # Coût journalier et mensuel
        daily_cost = total_cost / avg_holding_days if avg_holding_days > 0 else 0.0
        monthly_cost = total_cost / (avg_holding_days / 30) if avg_holding_days > 0 else 0.0
        
        # Distance quotidienne
        daily_distance = total_mileage / avg_holding_days if avg_holding_days > 0 else 0.0
        
        # Pleins ce mois-ci
        first_day_this_month = today.replace(day=1)
        fuels_this_month = db.query(models.Fuel).filter(
            models.Fuel.fuel_date >= first_day_this_month
        ).count() or 0
        
        # Véhicule le plus coûteux
        most_expensive_vehicle = None
        max_cost_per_km = 0
        for v in db.query(models.Vehicle).all():
            v_fuel = db.query(func.sum(models.Fuel.total_cost)).filter(models.Fuel.vehicle_id == v.id).scalar() or 0
            v_maint = db.query(func.sum(models.Maintenance.cost)).filter(models.Maintenance.vehicle_id == v.id).scalar() or 0
            v_exp = db.query(func.sum(models.Expense.amount)).filter(models.Expense.vehicle_id == v.id).scalar() or 0
            v_tire = db.query(func.sum(models.Tire.cost)).filter(models.Tire.vehicle_id == v.id).scalar() or 0
            v_total = v_fuel + v_maint + v_exp + v_tire
            v_km = max(1, v.current_mileage - v.initial_mileage)
            v_cpk = v_total / v_km
            if v_cpk > max_cost_per_km:
                max_cost_per_km = v_cpk
                most_expensive_vehicle = v.license_plate
        
        # Dépréciation
        depreciation_per_day = 0.0
        for v in vehicles_with_date:
            if v.purchase_price and v.resale_price and v.purchase_date:
                days = (today - v.purchase_date).days
                if days > 0:
                    depreciation_per_day += (v.purchase_price - v.resale_price) / days
        if vehicles_with_date:
            depreciation_per_day /= len(vehicles_with_date)
        
        # Compteurs
        total_fuel_count = db.query(models.Fuel).count() or 0
        maintenance_count = db.query(models.Maintenance).count() or 0
        
        return schemas.KPIResponse(
            total_vehicles=total_vehicles,
            total_mileage=int(total_mileage),
            total_fuel_cost=total_fuel_cost,
            total_maintenance_cost=total_maintenance_cost,
            total_expenses=total_expenses,
            total_tire_cost=total_tire_cost,
            average_consumption=float(average_consumption),
            cost_per_km=float(cost_per_km),
            active_alerts=active_alerts,
            avg_distance_between_fuels=float(avg_distance_between_fuels),
            daily_distance=float(daily_distance),
            daily_cost=float(daily_cost),
            monthly_cost=float(monthly_cost),
            fuels_this_month=fuels_this_month,
            most_expensive_vehicle=most_expensive_vehicle,
            avg_holding_days=avg_holding_days,
            depreciation_per_day=float(depreciation_per_day),
            total_fuel_count=total_fuel_count,
            maintenance_count=maintenance_count
        )
    except Exception as e:
        # Log l'erreur pour débogage
        print(f"ERREUR DASHBOARD: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

@router.get("/alerts", response_model=list)
def get_alerts(db: Session = Depends(get_db)):
    try:
        alerts = []
        today = date.today()
        vehicles = db.query(models.Vehicle).all()
        
        for v in vehicles:
            if v.current_mileage > 100000:
                km_remaining = max(0, 120000 - v.current_mileage)
                alerts.append({
                    "vehicle_id": v.id,
                    "license_plate": v.license_plate,
                    "item_name": "Révision majeure",
                    "alert_type": "km",
                    "current_value": v.current_mileage,
                    "threshold_value": 120000,
                    "km_remaining": km_remaining,
                    "severity": "critical" if km_remaining < 5000 else "warning"
                })
        
        return alerts
    except Exception as e:
        print(f"ERREUR ALERTS: {str(e)}")
        return []