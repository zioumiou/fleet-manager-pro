import axios from 'axios';
import { Vehicle, Maintenance, Fuel, Expense, KPIs, Alert, Document, Tire, Reminder, VehicleTCO } from '../types';

// Construction intelligente de l'URL de base
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const api = axios.create({ baseURL: API_BASE });

// ==================== VÉHICULES ====================
export const getVehicles = () => api.get<Vehicle[]>('/vehicles/');
export const createVehicle = (data: any) => api.post<Vehicle>('/vehicles/', data);
export const updateVehicle = (id: number, data: any) => api.put<Vehicle>(`/vehicles/${id}`, data);
export const deleteVehicle = (id: number) => api.delete(`/vehicles/${id}`);
export const getVehicleTCO = (id: number) => api.get<VehicleTCO>(`/vehicles/${id}/tco`);

// ==================== DOCUMENTS ====================
export const uploadDocument = (vehicleId: number, documentType: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<Document>(`/documents/vehicles/${vehicleId}/?document_type=${documentType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const getVehicleDocuments = (vehicleId: number) => api.get<Document[]>(`/documents/vehicles/${vehicleId}/`);
export const deleteDocument = (docId: number) => api.delete(`/documents/${docId}`);

// ==================== ENTRETIENS ====================
export const getMaintenances = (vehicleId?: number) => api.get<Maintenance[]>('/maintenances/', { params: { vehicle_id: vehicleId } });
export const createMaintenance = (data: any) => api.post<Maintenance>('/maintenances/', data);
export const updateMaintenance = (id: number, data: any) => api.put<Maintenance>(`/maintenances/${id}`, data);
export const deleteMaintenance = (id: number) => api.delete(`/maintenances/${id}`);

// ==================== CARBURANT ====================
export const getFuels = (vehicleId?: number) => api.get<Fuel[]>('/fuels/', { params: { vehicle_id: vehicleId } });
export const createFuel = (data: any) => api.post<Fuel>('/fuels/', data);
export const updateFuel = (id: number, data: any) => api.put<Fuel>(`/fuels/${id}`, data);
export const deleteFuel = (id: number) => api.delete(`/fuels/${id}`);

// ==================== DÉPENSES ====================
export const getExpenses = (vehicleId?: number) => api.get<Expense[]>('/expenses/', { params: { vehicle_id: vehicleId } });
export const createExpense = (data: any) => api.post<Expense>('/expenses/', data);
export const updateExpense = (id: number, data: any) => api.put<Expense>(`/expenses/${id}`, data);
export const deleteExpense = (id: number) => api.delete(`/expenses/${id}`);
export const getCategories = () => api.get('/expenses/categories');

// ==================== PNEUS ====================
export const getTires = (vehicleId?: number) => api.get<Tire[]>('/tires/', { params: { vehicle_id: vehicleId } });
export const createTire = (data: any) => api.post<Tire>('/tires/', data);
export const deleteTire = (id: number) => api.delete(`/tires/${id}`);

// ==================== RAPPELS ====================
export const getReminders = () => api.get<Reminder[]>('/reminders/');
export const createReminder = (data: any) => api.post<Reminder>('/reminders/', data);
export const updateReminder = (id: number, data: any) => api.put<Reminder>(`/reminders/${id}`, data);
export const deleteReminder = (id: number) => api.delete(`/reminders/${id}`);

// ==================== DASHBOARD ====================
// Remplacez l'ancienne ligne getKPIs par celle-ci :
export const getKPIs = (vehicleId?: number) => 
  api.get<KPIs>('/dashboard/kpis', { params: { vehicle_id: vehicleId } });export const getKPIs = () => api.get<KPIs>('/dashboard/kpis');
export const getAlerts = () => api.get<Alert[]>('/dashboard/alerts');

// ==================== EXPORTS ====================
export const exportVehiclesCSV = () => api.get('/export/vehicles/csv', { responseType: 'blob' });
export const exportVehiclesExcel = () => api.get('/export/vehicles/excel', { responseType: 'blob' });
export const exportGlobalReportPDF = () => api.get('/export/report/global/pdf', { responseType: 'blob' });
export const exportVehicleReportPDF = (vehicleId: number) => api.get(`/export/vehicle/${vehicleId}/pdf`, { responseType: 'blob' });

// ==================== UTILITAIRES ====================
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};