export interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  current_mileage: number;
  initial_mileage: number;
  purchase_date: string;
  purchase_price: number;
  resale_price?: number;
  status: string;
}

export interface Maintenance {
  id: number;
  vehicle_id: number;
  maintenance_date: string;
  mileage: number;
  maintenance_type: string;
  description?: string;
  cost: number;
  garage?: string;
}

export interface Fuel {
  id: number;
  vehicle_id: number;
  fuel_date: string;
  mileage: number;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  station?: string;
  full_tank: number | boolean;
}

export interface Expense {
  id: number;
  vehicle_id: number;
  category_id: number;
  expense_date: string;
  description: string;
  amount: number;
}

export interface Tire {
  id: number;
  vehicle_id: number;
  change_date: string;
  mileage: number;
  tire_type: string;
  brand?: string;
  cost: number;
  position?: string;
}

export interface Reminder {
  id: number;
  vehicle_plate: string;
  category: string;
  next_due_date: string;
  km_threshold?: number;
  description: string;
  status?: string;
}

export interface Document {
  id: number;
  vehicle_id: number;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number;
  upload_date: string;
}

export interface KPIs {
  total_vehicles: number;
  total_mileage: number;
  total_fuel_cost: number;
  total_maintenance_cost: number;
  total_expenses: number;
  total_tire_cost: number;
  average_consumption: number;
  cost_per_km: number;
  active_alerts: number;
  avg_distance_between_fuels: number;
  daily_distance: number;
  daily_cost: number;
  monthly_cost: number;
  fuels_this_month: number;
  most_expensive_vehicle: string | null;
  avg_holding_days: number;
  depreciation_per_day: number;
  total_fuel_count: number;
  maintenance_count: number;
}

export interface Alert {
  vehicle_id: number;
  license_plate: string;
  item_name: string;
  alert_type: string;
  current_value: number;
  threshold_value: number;
  km_remaining: number;
  severity: string;
}

export interface VehicleTCO {
  vehicle_id: number;
  total_tco: number;
  total_fuel_cost: number;
  total_maintenance_cost: number;
  total_expenses: number;
  total_tire_cost: number;
  depreciation: number;
}