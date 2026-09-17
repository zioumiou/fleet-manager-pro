import axios from 'axios';
import { Vehicle, Maintenance, Fuel, Expense, KPIs, Alert, Document, Tire, Reminder, VehicleTCO } from '../types';
import { getDB, isOnline, showOfflineAlert } from './localDB';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
const api = axios.create({ baseURL: API_BASE });

// ✅ Type explicite pour les noms de stores IndexedDB
type StoreName = 'vehicles' | 'maintenances' | 'fuels' | 'expenses' | 'tires' | 'reminders' | 'kpis' | 'alerts';

// Helper avec typage correct et getDB() asynchrone
const fetchWithCache = async <T>(
  endpoint: string,
  storeName: StoreName,
  params?: any,
  cacheKey?: string
): Promise<{ data: T }> => {
  const db = await getDB();

  if (isOnline()) {
    try {
      const response = await api.get<T>(endpoint, { params });
      const tx = db.transaction(storeName, 'readwrite');
      await tx.store.clear();
      if (Array.isArray(response.data)) {
        await Promise.all(response.data.map((item: any) => tx.store.put(item)));
      } else if (cacheKey) {
        await tx.store.put({ key: cacheKey, ...response.data } as any);
      }
      await tx.done;
      return response;
    } catch (error) {
      console.warn(`Réseau indisponible, utilisation du cache pour ${endpoint}`);
    }
  }

  // Fallback : données locales
  if (cacheKey) {
    const cached = await db.get(storeName, cacheKey);
    return { data: (cached as T) || ([] as any) };
  }
  const localData = await db.getAll(storeName);
  return { data: localData as T };
};

// ==================== VÉHICULES ====================
export const getVehicles = () => fetchWithCache<Vehicle[]>('/vehicles/', 'vehicles');

export const createVehicle = async (data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.post<Vehicle>('/vehicles/', data);
  const db = await getDB();
  await db.put('vehicles', res.data);
  return res;
};

export const updateVehicle = async (id: number, data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.put<Vehicle>(`/vehicles/${id}`, data);
  const db = await getDB();
  await db.put('vehicles', res.data);
  return res;
};

export const deleteVehicle = async (id: number) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  await api.delete(`/vehicles/${id}`);
  const db = await getDB();
  await db.delete('vehicles', id);
  return { data: { id } };
};

export const getVehicleTCO = (id: number) => api.get<VehicleTCO>(`/vehicles/${id}/tco`);

// ==================== DOCUMENTS ====================
export const uploadDocument = async (vehicleId: number, documentType: string, file: File) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const formData = new FormData();
  formData.append('file', file);
  return api.post<Document>(`/documents/vehicles/${vehicleId}/?document_type=${documentType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getVehicleDocuments = (vehicleId: number) => api.get<Document[]>(`/documents/vehicles/${vehicleId}/`);

export const deleteDocument = async (docId: number) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  return api.delete(`/documents/${docId}`);
};

// ==================== ENTRETIENS ====================
export const getMaintenances = (vehicleId?: number) =>
  fetchWithCache<Maintenance[]>('/maintenances/', 'maintenances', { vehicle_id: vehicleId });

export const createMaintenance = async (data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.post<Maintenance>('/maintenances/', data);
  const db = await getDB();
  await db.put('maintenances', res.data);
  return res;
};

export const updateMaintenance = async (id: number, data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.put<Maintenance>(`/maintenances/${id}`, data);
  const db = await getDB();
  await db.put('maintenances', res.data);
  return res;
};

export const deleteMaintenance = async (id: number) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  await api.delete(`/maintenances/${id}`);
  const db = await getDB();
  await db.delete('maintenances', id);
  return { data: { id } };
};

// ==================== CARBURANT ====================
export const getFuels = (vehicleId?: number) =>
  fetchWithCache<Fuel[]>('/fuels/', 'fuels', { vehicle_id: vehicleId });

export const createFuel = async (data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.post<Fuel>('/fuels/', data);
  const db = await getDB();
  await db.put('fuels', res.data);
  return res;
};

export const updateFuel = async (id: number, data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.put<Fuel>(`/fuels/${id}`, data);
  const db = await getDB();
  await db.put('fuels', res.data);
  return res;
};

export const deleteFuel = async (id: number) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  await api.delete(`/fuels/${id}`);
  const db = await getDB();
  await db.delete('fuels', id);
  return { data: { id } };
};

// ==================== DÉPENSES ====================
export const getExpenses = (vehicleId?: number) =>
  fetchWithCache<Expense[]>('/expenses/', 'expenses', { vehicle_id: vehicleId });

export const createExpense = async (data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.post<Expense>('/expenses/', data);
  const db = await getDB();
  await db.put('expenses', res.data);
  return res;
};

export const updateExpense = async (id: number, data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.put<Expense>(`/expenses/${id}`, data);
  const db = await getDB();
  await db.put('expenses', res.data);
  return res;
};

export const deleteExpense = async (id: number) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  await api.delete(`/expenses/${id}`);
  const db = await getDB();
  await db.delete('expenses', id);
  return { data: { id } };
};

export const getCategories = () => api.get('/expenses/categories');

// ==================== PNEUS ====================
export const getTires = (vehicleId?: number) =>
  fetchWithCache<Tire[]>('/tires/', 'tires', { vehicle_id: vehicleId });

export const createTire = async (data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.post<Tire>('/tires/', data);
  const db = await getDB();
  await db.put('tires', res.data);
  return res;
};

export const deleteTire = async (id: number) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  await api.delete(`/tires/${id}`);
  const db = await getDB();
  await db.delete('tires', id);
  return { data: { id } };
};

// ==================== RAPPELS ====================
export const getReminders = () => fetchWithCache<Reminder[]>('/reminders/', 'reminders');

export const createReminder = async (data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.post<Reminder>('/reminders/', data);
  const db = await getDB();
  await db.put('reminders', res.data);
  return res;
};

export const updateReminder = async (id: number, data: any) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  const res = await api.put<Reminder>(`/reminders/${id}`, data);
  const db = await getDB();
  await db.put('reminders', res.data);
  return res;
};

export const deleteReminder = async (id: number) => {
  if (!isOnline()) { showOfflineAlert(); throw new Error('Hors ligne'); }
  await api.delete(`/reminders/${id}`);
  const db = await getDB();
  await db.delete('reminders', id);
  return { data: { id } };
};

// ==================== DASHBOARD ====================
export const getKPIs = (vehicleId?: number) =>
  fetchWithCache<KPIs>('/dashboard/kpis', 'kpis', { vehicle_id: vehicleId }, 'default');

export const getAlerts = () =>
  fetchWithCache<Alert[]>('/dashboard/alerts', 'alerts', undefined, 'default');

// ==================== EXPORTS ====================
export const exportVehiclesCSV = () => api.get('/export/vehicles/csv', { responseType: 'blob' });
export const exportVehiclesExcel = () => api.get('/export/vehicles/excel', { responseType: 'blob' });
export const exportGlobalReportPDF = () => api.get('/export/report/global/pdf', { responseType: 'blob' });
export const exportVehicleReportPDF = (vehicleId: number) =>
  api.get(`/export/vehicle/${vehicleId}/pdf`, { responseType: 'blob' });

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