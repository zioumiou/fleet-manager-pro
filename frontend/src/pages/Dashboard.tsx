import { useEffect, useState } from 'react';
import { getKPIs, getAlerts } from '../services/api';
import { KPIs, Alert } from '../types';
import { 
  Car, TrendingUp, Fuel, DollarSign, AlertTriangle,
  Route, Calendar, Clock, Gauge, Award, TrendingDown,
  Activity, BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [kpisRes, alertsRes] = await Promise.all([getKPIs(), getAlerts()]);
      setKpis(kpisRes.data);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
    } catch (error) {
      console.error("Erreur chargement dashboard", error);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64">Chargement...</div>;
  if (!kpis) return <div className="flex items-center justify-center h-64 text-red-500">Erreur de chargement</div>;

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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tableau de Bord</h1>

      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <BarChart3 size={20} /> Indicateurs Principaux
      </h2>
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
          <p className="text-3xl font-bold text-gray-800">{kpis.cost_per_km.toFixed(2)} €</p>
          <p className="text-xs text-gray-500 mt-1">Coût moyen</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Activity size={20} /> Analyse Avancée
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center gap-3 mb-2"><Route className="text-blue-600" size={24} /><span className="text-sm text-blue-700 font-medium">Distance entre pleins</span></div>
          <p className="text-3xl font-bold text-blue-900">{fmt(kpis.avg_distance_between_fuels, 0)} km</p>
          <p className="text-xs text-blue-600 mt-1">Moyenne entre 2 pleins</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center gap-3 mb-2"><Gauge className="text-green-600" size={24} /><span className="text-sm text-green-700 font-medium">Distance quotidienne</span></div>
          <p className="text-3xl font-bold text-green-900">{fmt(kpis.daily_distance, 0)} km/j</p>
          <p className="text-xs text-green-600 mt-1">Moyenne journalière</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-center gap-3 mb-2"><DollarSign className="text-red-600" size={24} /><span className="text-sm text-red-700 font-medium">Dépenses / jour</span></div>
          <p className="text-3xl font-bold text-red-900">{fmt(kpis.daily_cost)} €</p>
          <p className="text-xs text-red-600 mt-1">Coût journalier moyen</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
          <div className="flex items-center gap-3 mb-2"><Calendar className="text-purple-600" size={24} /><span className="text-sm text-purple-700 font-medium">Dépenses / mois</span></div>
          <p className="text-3xl font-bold text-purple-900">{fmt(kpis.monthly_cost)} €</p>
          <p className="text-xs text-purple-600 mt-1">Coût mensuel moyen</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg shadow-sm border border-amber-200">
          <div className="flex items-center gap-3 mb-2"><Clock className="text-amber-600" size={24} /><span className="text-sm text-amber-700 font-medium">Durée de détention</span></div>
          <p className="text-3xl font-bold text-amber-900">{kpis.avg_holding_days} j</p>
          <p className="text-xs text-amber-600 mt-1">Moyenne depuis l'achat</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg shadow-sm border border-indigo-200">
          <div className="flex items-center gap-3 mb-2"><TrendingDown className="text-indigo-600" size={24} /><span className="text-sm text-indigo-700 font-medium">Dépréciation / jour</span></div>
          <p className="text-3xl font-bold text-indigo-900">{fmt(kpis.depreciation_per_day)} €</p>
          <p className="text-xs text-indigo-600 mt-1">Perte de valeur journalière</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg shadow-sm border border-cyan-200">
          <div className="flex items-center gap-3 mb-2"><Fuel className="text-cyan-600" size={24} /><span className="text-sm text-cyan-700 font-medium">Pleins ce mois</span></div>
          <p className="text-3xl font-bold text-cyan-900">{kpis.fuels_this_month}</p>
          <p className="text-xs text-cyan-600 mt-1">Total: {kpis.total_fuel_count} pleins</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-lg shadow-sm border border-rose-200">
          <div className="flex items-center gap-3 mb-2"><Award className="text-rose-600" size={24} /><span className="text-sm text-rose-700 font-medium">Véhicule + coûteux</span></div>
          <p className="text-2xl font-bold text-rose-900 truncate">{kpis.most_expensive_vehicle || 'N/A'}</p>
          <p className="text-xs text-rose-600 mt-1">Coût au km le plus élevé</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Répartition des Coûts</h2>
          {costData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune donnée de coût</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={costData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}>
                  {costData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(value: any) => `${(value as number).toFixed(2)} €`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résumé Financier</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-l-4 border-blue-500 pl-4">
              <div><p className="text-sm text-gray-600">Carburant</p><p className="text-2xl font-bold">{fmt(kpis.total_fuel_cost)} €</p></div>
            </div>
            <div className="flex justify-between items-center border-l-4 border-green-500 pl-4">
              <div><p className="text-sm text-gray-600">Entretien</p><p className="text-2xl font-bold">{fmt(kpis.total_maintenance_cost)} €</p></div>
            </div>
            <div className="flex justify-between items-center border-l-4 border-yellow-500 pl-4">
              <div><p className="text-sm text-gray-600">Pneus</p><p className="text-2xl font-bold">{fmt(kpis.total_tire_cost)} €</p></div>
            </div>
            <div className="flex justify-between items-center border-l-4 border-orange-500 pl-4">
              <div><p className="text-sm text-gray-600">Autres Dépenses</p><p className="text-2xl font-bold">{fmt(kpis.total_expenses)} €</p></div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total Général</p>
                <p className="text-3xl font-bold text-purple-700">{fmt(totalCost)} €</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {kpis.active_alerts > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Alertes Actives ({kpis.active_alerts})
          </h2>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{alert.license_plate}</p>
                    <p className="text-sm text-gray-600">{alert.item_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {alert.alert_type === 'km' ? `${alert.km_remaining} km restants` : `${alert.days_remaining} jours restants`}
                    </p>
                    <p className="text-xs text-gray-500">Seuil: {alert.threshold_value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}