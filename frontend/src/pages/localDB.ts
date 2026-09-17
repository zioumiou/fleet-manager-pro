import { openDB, DBSchema } from 'idb';
import { Vehicle, Maintenance, Fuel, Expense, Tire, Reminder, KPIs, Alert } from '../types';

interface FleetDB extends DBSchema {
  vehicles: { key: number; value: Vehicle };
  maintenances: { key: number; value: Maintenance };
  fuels: { key: number; value: Fuel };
  expenses: { key: number; value: Expense };
  tires: { key: number; value: Tire };
  reminders: { key: number; value: Reminder };
  kpis: { key: string; value: KPIs };
  alerts: { key: string; value: Alert[] };
}

export const db = await openDB<FleetDB>('FleetManagerDB', 1, {
  upgrade(db) {
    db.createObjectStore('vehicles', { keyPath: 'id' });
    db.createObjectStore('maintenances', { keyPath: 'id' });
    db.createObjectStore('fuels', { keyPath: 'id' });
    db.createObjectStore('expenses', { keyPath: 'id' });
    db.createObjectStore('tires', { keyPath: 'id' });
    db.createObjectStore('reminders', { keyPath: 'id' });
    db.createObjectStore('kpis', { keyPath: 'key' });
    db.createObjectStore('alerts', { keyPath: 'key' });
  },
});

export const isOnline = () => navigator.onLine;

export const showOfflineAlert = () => {
  alert('⚠️ Vous êtes hors ligne. Les modifications ne peuvent pas être enregistrées. Reconnectez-vous pour sauvegarder.');
};