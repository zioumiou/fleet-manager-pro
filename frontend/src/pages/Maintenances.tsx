import { useEffect, useState } from 'react';
import { getMaintenances, createMaintenance, updateMaintenance, deleteMaintenance, getVehicles } from '../services/api';
import { Maintenance, Vehicle } from '../types';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function Maintenances() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: 0,
    maintenance_date: new Date().toISOString().split('T')[0],
    mileage: 0,
    maintenance_type: 'Vidange',
    description: '',
    cost: 0,
    garage: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [maintRes, vehRes] = await Promise.all([getMaintenances(), getVehicles()]);
      setMaintenances(Array.isArray(maintRes.data) ? maintRes.data : []);
      setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);
    } catch (error) {
      console.error("Erreur chargement", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        vehicle_id: parseInt(String(formData.vehicle_id)),
        mileage: parseInt(String(formData.mileage)),
        cost: parseFloat(String(formData.cost))
      };
      if (editingId) {
        await updateMaintenance(editingId, payload);
      } else {
        await createMaintenance(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ vehicle_id: 0, maintenance_date: new Date().toISOString().split('T')[0], mileage: 0, maintenance_type: 'Vidange', description: '', cost: 0, garage: '' });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (maintenance: Maintenance) => {
    setEditingId(maintenance.id);
    setFormData({
      vehicle_id: maintenance.vehicle_id,
      maintenance_date: maintenance.maintenance_date,
      mileage: maintenance.mileage,
      maintenance_type: maintenance.maintenance_type,
      description: maintenance.description || '',
      cost: maintenance.cost,
      garage: maintenance.garage || ''
    });
    setShowForm(true);
  };

  const getVehiclePlate = (id: number) => vehicles.find(v => v.id === id)?.license_plate || 'N/A';

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Entretiens</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ vehicle_id: 0, maintenance_date: new Date().toISOString().split('T')[0], mileage: 0, maintenance_type: 'Vidange', description: '', cost: 0, garage: '' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier l\'entretien' : 'Nouvel Entretien'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
              <select required value={formData.vehicle_id} onChange={(e) => setFormData({...formData, vehicle_id: parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value={0}>Sélectionner</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" required value={formData.maintenance_date} onChange={(e) => setFormData({...formData, maintenance_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage *</label>
              <input type="number" required value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={formData.maintenance_type} onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="Vidange">Vidange</option>
                <option value="Révision">Révision</option>
                <option value="Freins">Freins</option>
                <option value="Pneus">Pneus</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coût (DA) *</label>
              <input type="number" step="0.01" required value={formData.cost} onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Garage</label>
              <input type="text" value={formData.garage} onChange={(e) => setFormData({...formData, garage: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Enregistrer</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300">Annuler</button>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Km</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coût</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Garage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {maintenances.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun entretien enregistré</td></tr>
            ) : (
              maintenances.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(m.maintenance_date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 font-semibold">{getVehiclePlate(m.vehicle_id)}</td>
                  <td className="px-6 py-4">{m.mileage.toLocaleString()} km</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{m.maintenance_type}</span></td>
                  <td className="px-6 py-4 font-semibold text-green-600">{m.cost.toFixed(2)} DA</td>
                  <td className="px-6 py-4">{m.garage || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(m)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                      <button onClick={async () => { if(confirm('Supprimer ?')) { await deleteMaintenance(m.id); loadData(); } }} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
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