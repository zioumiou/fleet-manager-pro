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
  syncQueue: {
    key: number;
    value: {
      id: number;
      type: 'create' | 'update' | 'delete';
      entity: 'vehicles' | 'maintenances' | 'fuels' | 'expenses' | 'tires' | 'reminders';
      data: any;
      timestamp: string;
      synced: boolean;
    };
  };
}

let dbInstance: Promise<any> | null = null;

export const getDB = () => {
  if (!dbInstance) {
    dbInstance = openDB<FleetDB>('FleetManagerDB', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('vehicles')) db.createObjectStore('vehicles', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('maintenances')) db.createObjectStore('maintenances', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('fuels')) db.createObjectStore('fuels', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('tires')) db.createObjectStore('tires', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('reminders')) db.createObjectStore('reminders', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('kpis')) db.createObjectStore('kpis', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('alerts')) db.createObjectStore('alerts', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      },
    });
  }
  return dbInstance;
};

export const isOnline = () => navigator.onLine;

// Ajouter à la file de synchronisation
export const addToSyncQueue = async (type: 'create' | 'update' | 'delete', entity: string, data: any) => {
  const db = await getDB();
  await db.add('syncQueue', {
    type,
    entity,
    data,
    timestamp: new Date().toISOString(),
    synced: false
  });
};

// Récupérer les éléments non synchronisés
export const getPendingSync = async () => {
  const db = await getDB();
  const all = await db.getAll('syncQueue');
  return all.filter((item: any) => !item.synced);
};

// Supprimer de la file après sync réussie
export const removeFromSyncQueue = async (id: number) => {
  const db = await getDB();
  await db.delete('syncQueue', id);
};

// Synchroniser tous les éléments en attente
export const syncPendingChanges = async () => {
  const pending = await getPendingSync();
  if (pending.length === 0) return;

  console.log(` Synchronisation de ${pending.length} élément(s) en attente...`);

  const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

  for (const item of pending) {
    try {
      let endpoint = `${API_BASE}/${item.entity}/`;
      let method = '';

      if (item.type === 'create') {
        method = 'POST';
      } else if (item.type === 'update') {
        method = 'PUT';
        endpoint += `${item.data.id}/`;
      } else if (item.type === 'delete') {
        method = 'DELETE';
        endpoint += `${item.data.id}/`;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' ? JSON.stringify(item.data) : undefined
      });

      if (response.ok) {
        await removeFromSyncQueue(item.id);
        console.log(`✅ Synchronisé: ${item.entity} ${item.type}`);
      } else {
        console.error(`❌ Échec synchronisation ${item.entity}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Erreur synchronisation:`, error);
    }
  }
};

// Écouter les changements de connexion pour sync auto
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🟢 Connexion rétablie ! Synchronisation automatique...');
    syncPendingChanges();
  });
}

export const showOfflineAlert = () => {
  alert('️ Vous êtes hors ligne. Les modifications sont enregistrées localement et seront synchronisées automatiquement.');
};