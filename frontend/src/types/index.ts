export interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;          // ✅ Ajouté
  current_mileage: number;
  initial_mileage: number;
  purchase_date: string;
  purchase_price: number;
  resale_price?: number;
  status: string;             // ✅ Ajouté
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
  full_tank: number | boolean; // ✅ Accepte les deux pour éviter l'erreur de comparaison
}

export interface Document {
  id: number;
  vehicle_id: number;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number;          // ✅ Ajouté
  upload_date: string;
}

export interface VehicleTCO {
  vehicle_id: number;
  total_tco: number;          // ✅ Corrigé (était total_cost)
  total_fuel_cost: number;
  total_maintenance_cost: number;
  total_expenses: number;
  total_tire_cost: number;
  depreciation: number;
}