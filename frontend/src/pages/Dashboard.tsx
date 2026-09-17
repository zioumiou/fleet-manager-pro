import { useEffect, useState } from 'react';
import { getKPIs, getAlerts, getVehicles } from '../services/api';
import { KPIs, Alert, Vehicle } from '../types';
import { Car, TrendingUp, Fuel, DollarSign, AlertTriangle, Filter, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVehicles()
      .then(res => setVehicles(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erreur chargement véhicules:", err));
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedVehicleId]);

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

  // Données pour le graphique camembert
  const costData = [
    { name: 'Carburant', value: kpis.total_fuel_cost, color: '#3B82F6' },
    { name: 'Entretien', value: kpis.total_maintenance_cost, color: '#10B981' },
    { name: 'Pneus', value: kpis.total_tire_cost, color: '#F59E0B' },
    { name: 'Autres', value: kpis.total_expenses, color: '#F97316' },
  ].filter(item => item.value > 0);

  const totalCost = kpis.total_fuel_cost + kpis.total_maintenance_cost + kpis.total_tire_cost + kpis.total_expenses;
  const fmt = (n: number, decimals = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="p-2">
      {/* En-tête avec Sélecteur */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
        
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <Filter size={20} className="text-gray-500" />
          <select 
            value={selectedVehicleId || ''} 
            onChange={(e) => setSelectedVehicleId(e.target.value ? parseInt(e.target.value) : null)}
            className="border-none focus:ring-0 text-gray-700 font-medium bg-transparent cursor-pointer outline-none"
          >
            <option value="">🌍 Tous les véhicules (Global)</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>🚗 {v.license_plate} - {v.brand} {v.model}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Titre contextuel */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-600">
          {selectedVehicleId 
            ? `Analyse pour : ${vehicles.find(v => v.id === selectedVehicleId)?.license_plate || 'Véhicule'}` 
            : 'Vue Globale de la Flotte'}
        </h2>
      </div>

      {/* Indicateurs Principaux */}
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        Indicateurs Principaux
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
          <div className="flex items-center gap-3 mb-2"><Car className="text-blue-500" size={24} /><span className="text-sm text-gray-600">Véhicules</span></div>
          <p className="text-3xl font-bold text-gray-800">{kpis.total_vehicles}</p>
          <p className="text-xs text-gray-500 mt-1">Flotte active</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="text-green-500" size={24} /><span className="text-sm text-gray-600">Kilométrage Total</span></div>
          <p className="text-3xl font-bold text-gray-800">{kpis.total_mileage.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">km parcourus</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-2"><Fuel className="text-purple-500" size={24} /><span className="text-sm text-gray-600">Consommation Moy.</span></div>
          <p className="text-3xl font-bold text-gray-800">{kpis.average_consumption.toFixed(1)} L/100km</p>
          <p className="text-xs text-gray-500 mt-1">Flotte complète</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
          <div className="flex items-center gap-3 mb-2"><DollarSign className="text-orange-500" size={24} /><span className="text-sm text-gray-600">Coût au km</span></div>
          <p className="text-3xl font-bold text-gray-800">{fmt(kpis.cost_per_km)} DA</p>
          <p className="text-xs text-gray-500 mt-1">Coût moyen</p>
        </div>
      </div>

      {/* Analyse Avancée */}
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        Analyse Avancée
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center gap-3 mb-2"><Filter className="text-blue-600" size={24} /><span className="text-sm text-blue-700 font-medium">Distance entre pleins</span></div>
          <p className="text-3xl font-bold text-blue-900">{kpis.avg_distance_between_fuels.toFixed(0)} km</p>
          <p className="text-xs text-blue-600 mt-1">Moyenne entre 2 pleins</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="text-green-600" size={24} /><span className="text-sm text-green-700 font-medium">Distance quotidienne</span></div>
          <p className="text-3xl font-bold text-green-900">{kpis.daily_distance.toFixed(0)} km/j</p>
          <p className="text-xs text-green-600 mt-1">Moyenne journalière</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-center gap-3 mb-2"><DollarSign className="text-red-600" size={24} /><span className="text-sm text-red-700 font-medium">Dépenses / jour</span></div>
          <p className="text-3xl font-bold text-red-900">{fmt(kpis.daily_cost)} DA</p>
          <p className="text-xs text-red-600 mt-1">Coût journalier moyen</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
          <div className="flex items-center gap-3 mb-2"><Fuel className="text-purple-600" size={24} /><span className="text-sm text-purple-700 font-medium">Dépenses / mois</span></div>
          <p className="text-3xl font-bold text-purple-900">{fmt(kpis.monthly_cost)} DA</p>
          <p className="text-xs text-purple-600 mt-1">Coût mensuel moyen</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg shadow-sm border border-amber-200">
          <div className="flex items-center gap-3 mb-2"><Car className="text-amber-600" size={24} /><span className="text-sm text-amber-700 font-medium">Durée de détention</span></div>
          <p className="text-3xl font-bold text-amber-900">{kpis.avg_holding_days} j</p>
          <p className="text-xs text-amber-600 mt-1">Moyenne depuis l'achat</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg shadow-sm border border-indigo-200">
          <div className="flex items-center gap-3 mb-2"><TrendingUp className="text-indigo-600" size={24} /><span className="text-sm text-indigo-700 font-medium">Dépréciation / jour</span></div>
          <p className="text-3xl font-bold text-indigo-900">{fmt(kpis.depreciation_per_day)} DA</p>
          <p className="text-xs text-indigo-600 mt-1">Perte de valeur journalière</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg shadow-sm border border-cyan-200">
          <div className="flex items-center gap-3 mb-2"><Fuel className="text-cyan-600" size={24} /><span className="text-sm text-cyan-700 font-medium">Pleins ce mois</span></div>
          <p className="text-3xl font-bold text-cyan-900">{kpis.fuels_this_month}</p>
          <p className="text-xs text-cyan-600 mt-1">Total: {kpis.total_fuel_count} pleins</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-lg shadow-sm border border-rose-200">
          <div className="flex items-center gap-3 mb-2"><AlertTriangle className="text-rose-600" size={24} /><span className="text-sm text-rose-700 font-medium">Véhicule + coûteux</span></div>
          <p className="text-2xl font-bold text-rose-900 truncate">{kpis.most_expensive_vehicle || 'N/A'}</p>
          <p className="text-xs text-rose-600 mt-1">Coût au km le plus élevé</p>
        </div>
      </div>

      {/* Graphiques et Résumé Financier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique Camembert */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="text-blue-500" size={24} />
            Répartition des Coûts
          </h3>
          {costData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune donnée de coût disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={costData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${fmt(value)} DA`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Résumé Financier */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Résumé Financier</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-l-4 border-blue-500 pl-4">
              <div>
                <p className="text-sm text-gray-600">Carburant</p>
                <p className="text-2xl font-bold">{fmt(kpis.total_fuel_cost)} DA</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-l-4 border-green-500 pl-4">
              <div>
                <p className="text-sm text-gray-600">Entretien</p>
                <p className="text-2xl font-bold">{fmt(kpis.total_maintenance_cost)} DA</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-l-4 border-yellow-500 pl-4">
              <div>
                <p className="text-sm text-gray-600">Pneus</p>
                <p className="text-2xl font-bold">{fmt(kpis.total_tire_cost)} DA</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-l-4 border-orange-500 pl-4">
              <div>
                <p className="text-sm text-gray-600">Autres Dépenses</p>
                <p className="text-2xl font-bold">{fmt(kpis.total_expenses)} DA</p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-gray-800">Total Général</p>
                <p className="text-3xl font-bold text-purple-700">{fmt(totalCost)} DA</p>
              </div>
            </div>
          </div>
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