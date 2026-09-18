import { useEffect, useState } from 'react';
import { getFuels, createFuel, updateFuel, deleteFuel, getVehicles } from '../services/api';
import { Fuel, Vehicle } from '../types';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function Fuels() {
  const [fuels, setFuels] = useState<Fuel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: 0,
    fuel_date: new Date().toISOString().split('T')[0],
    mileage: 0,
    liters: 0,
    price_per_liter: 0,
    total_cost: 0,
    station: '',
    full_tank: 'Oui'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fuelRes, vehRes] = await Promise.all([getFuels(), getVehicles()]);
      setFuels(Array.isArray(fuelRes.data) ? fuelRes.data : []);
      setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);
    } catch (error) {
      console.error("Erreur chargement", error);
    }
  };

  // Calcul automatique des litres quand le prix/litre ou le coût total change
  useEffect(() => {
    if (formData.price_per_liter > 0 && formData.total_cost > 0) {
      const calculatedLiters = formData.total_cost / formData.price_per_liter;
      setFormData(prev => ({
        ...prev,
        liters: parseFloat(calculatedLiters.toFixed(2))
      }));
    }
  }, [formData.price_per_liter, formData.total_cost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        vehicle_id: parseInt(String(formData.vehicle_id)),
        mileage: parseInt(String(formData.mileage)),
        liters: parseFloat(String(formData.liters)),
        price_per_liter: parseFloat(String(formData.price_per_liter)),
        total_cost: parseFloat(String(formData.total_cost)),
        full_tank: formData.full_tank === 'Oui' ? 1 : 0
      };
      if (editingId) {
        await updateFuel(editingId, payload);
      } else {
        await createFuel(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        vehicle_id: 0,
        fuel_date: new Date().toISOString().split('T')[0],
        mileage: 0,
        liters: 0,
        price_per_liter: 0,
        total_cost: 0,
        station: '',
        full_tank: 'Oui'
      });
      loadData();
    } catch (error: any) {
      const errorMsg = typeof error.response?.data?.detail === 'object'
        ? JSON.stringify(error.response?.data?.detail)
        : error.response?.data?.detail;
      alert(errorMsg || "Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (fuel: Fuel) => {
    setEditingId(fuel.id);
    setFormData({
      vehicle_id: fuel.vehicle_id,
      fuel_date: fuel.fuel_date,
      mileage: fuel.mileage,
      liters: fuel.liters,
      price_per_liter: fuel.price_per_liter,
      total_cost: fuel.total_cost,
      station: fuel.station || '',
      full_tank: (Number(fuel.full_tank) === 1 || fuel.full_tank === true) ? 'Oui' : 'Non'
    });
    setShowForm(true);
  };

  const getVehiclePlate = (id: number) => vehicles.find(v => v.id === id)?.license_plate || 'N/A';

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Carburant</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              vehicle_id: 0,
              fuel_date: new Date().toISOString().split('T')[0],
              mileage: 0,
              liters: 0,
              price_per_liter: 0,
              total_cost: 0,
              station: '',
              full_tank: 'Oui'
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier le plein' : 'Nouveau Plein'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
              <select
                required
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: parseInt(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 bg-white"
              >
                <option value={0}>Sélectionner</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.license_plate}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.fuel_date}
                onChange={(e) => setFormData({ ...formData, fuel_date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage *</label>
              <input
                type="number"
                required
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix/Litre (DA) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price_per_liter}
                onChange={(e) => setFormData({ ...formData, price_per_liter: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coût Total (DA) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.total_cost}
                onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité (Litres) - Calculé</label>
              <input
                type="number"
                step="0.01"
                value={formData.liters.toFixed(2)}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Calculé automatiquement</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
              <input
                type="text"
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plein complet</label>
              <select
                value={formData.full_tank}
                onChange={(e) => setFormData({ ...formData, full_tank: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-white"
              >
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Litres</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix/L</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fuels.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  Aucun plein enregistré
                </td>
              </tr>
            ) : (
              fuels.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(f.fuel_date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 font-semibold">{getVehiclePlate(f.vehicle_id)}</td>
                  <td className="px-6 py-4">{f.mileage.toLocaleString()} km</td>
                  <td className="px-6 py-4">{f.liters.toFixed(2)} L</td>
                  <td className="px-6 py-4">{f.price_per_liter.toFixed(2)} DA</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{f.total_cost.toFixed(2)} DA</td>
                  <td className="px-6 py-4">{f.station || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(f)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Supprimer ?')) {
                            await deleteFuel(f.id);
                            loadData();
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}