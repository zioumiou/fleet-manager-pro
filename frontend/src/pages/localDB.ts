import { openDB, DBSchema } from 'idb';
import { Vehicle, Maintenance, Fuel, Expense, Tire, Reminder } from '../types';

interface FleetDB extends DBSchema {
  vehicles: { key: number; value: Vehicle };
  maintenances: { key: number; value: Maintenance };
  fuels: { key: number; value: Fuel };
  expenses: { key: number; value: Expense };
  tires: { key: number; value: Tire };
  reminders: { key: number; value: Reminder };
}

export const db = await openDB<FleetDB>('FleetManagerDB', 1, {
  upgrade(db) {
    db.createObjectStore('vehicles', { keyPath: 'id' });
    db.createObjectStore('maintenances', { keyPath: 'id' });
    db.createObjectStore('fuels', { keyPath: 'id' });
    db.createObjectStore('expenses', { keyPath: 'id' });
    db.createObjectStore('tires', { keyPath: 'id' });
    db.createObjectStore('reminders', { keyPath: 'id' });
  },
});