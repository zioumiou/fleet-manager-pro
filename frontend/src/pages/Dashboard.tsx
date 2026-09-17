import { useEffect, useState } from 'react';
import { getKPIs, getAlerts, getVehicles } from '../services/api';
import { KPIs, Alert, Vehicle } from '../types';
import { Car, TrendingUp, Fuel, DollarSign, AlertTriangle, Filter } from 'lucide-react';

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Charger la liste des véhicules une seule fois au démarrage
    getVehicles()
      .then(res => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedVehicleId]); // Se relance à chaque changement de véhicule

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [kpisRes, alertsRes] = await Promise.all([
        getKPIs(selectedVehicleId || undefined), 
        getAlerts()
      ]);
      setKpis(kpisRes.data);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      setError("Impossible de charger les données. Vérifiez la connexion au serveur.");
    }
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-blue-600">Chargement des KPIs...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;
  if (!kpis) return <div className="flex items-center justify-center h-64 text-gray-500">Aucune donnée</div>;

  const fmt = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-2">
      {/* En-tête avec Sélecteur de Véhicule */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <Filter size={18} className="text-gray-500" />
          <select 
            value={selectedVehicleId || ''} 
            onChange={(e) => setSelectedVehicleId(e.target.value ? parseInt(e.target.value) : null)}
            className="border-none focus:ring-0 text-gray-700 font-medium bg-transparent cursor-pointer"
          >
            <option value="">🌍 Tous les véhicules (Global)</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>🚗 {v.license_plate} - {v.brand} {v.model}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Titre contextuel */}
      <h2 className="text-lg font-semibold text-gray-600 mb-4">
        {selectedVehicleId 
          ? `Analyse pour : ${vehicles.find(v => v.id === selectedVehicleId)?.license_plate || 'Véhicule'}` 
          : 'Vue Globale de la Flotte'}
      </h2>

      {/* Grille de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
          <div className="flex items-center gap-3 mb-2"><Car className="text-blue-500" size={24} /><span className="text-sm text-gray-600">Véhicules</span></div>
          <p className="text-3xl font-bold text-gray-800">{kpis.total_vehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="text-green-500" size={24} /><span className="text-sm text-gray-600">Kilométrage</span></div>
          <p className="text-3xl font-bold text-gray-800">{kpis.total_mileage.toLocaleString()} km</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-2"><Fuel className="text-purple-500" size={24} /><span className="text-sm text-gray-600">Conso. Moy.</span></div>
          <p className="text-3xl font-bold text-gray-800">{kpis.average_consumption.toFixed(1)} L/100km</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
          <div className="flex items-center gap-3 mb-2"><DollarSign className="text-orange-500" size={24} /><span className="text-sm text-gray-600">Coût au km</span></div>
          <p className="text-3xl font-bold text-gray-800">{fmt(kpis.cost_per_km)} €</p>
        </div>
      </div>

      {/* Alertes */}
      {kpis.active_alerts > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-yellow-600" size={20} />
            <h2 className="text-lg font-semibold text-yellow-800">Alertes Actives ({kpis.active_alerts})</h2>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className="bg-white p-3 rounded shadow-sm">
                <p className="font-semibold">{alert.license_plate}</p>
                <p className="text-sm text-gray-600">{alert.item_name} - {alert.km_remaining} km restants</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}