import { useEffect, useState } from 'react';
import { getTires, createTire, deleteTire, getVehicles } from '../services/api';
import { Tire, Vehicle } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export default function Tires() {
  const [tires, setTires] = useState<Tire[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({
    vehicle_id: 0,
    change_date: new Date().toISOString().split('T')[0],
    mileage: 0,
    tire_type: '4 Saisons',
    brand: '',
    position: '4 pneus',
    cost: 0,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 1. On charge les véhicules en premier (indépendamment des pneus)
    try {
      const vehRes = await getVehicles();
      console.log("Véhicules chargés :", vehRes.data); // Pour déboguer dans la console (F12)
      setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des véhicules", error);
    }

    // 2. On charge les pneus ensuite
    try {
      const tiresRes = await getTires();
      setTires(Array.isArray(tiresRes.data) ? tiresRes.data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des pneus (la route existe-t-elle ?)", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTire(formData);
      setShowForm(false);
      setFormData({
        vehicle_id: 0,
        change_date: new Date().toISOString().split('T')[0],
        mileage: 0,
        tire_type: '4 Saisons',
        brand: '',
        position: '4 pneus',
        cost: 0,
        notes: ''
      });
      loadData(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de l'ajout", error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const getVehiclePlate = (id: number) => {
    const v = vehicles.find(v => v.id === id);
    return v ? v.license_plate : 'Véhicule inconnu';
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Suivi des Pneus</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={20} /> Ajouter un changement
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">Nouveau Changement de Pneus</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
              <select 
                required 
                value={formData.vehicle_id} 
                onChange={(e) => setFormData({...formData, vehicle_id: parseInt(e.target.value)})} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value={0}>-- Sélectionner un véhicule --</option>
                {vehicles.length === 0 && <option disabled>Chargement...</option>}
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.license_plate} - {v.brand} {v.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" required value={formData.change_date} onChange={(e) => setFormData({...formData, change_date: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage *</label>
              <input type="number" required value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de pneu *</label>
              <select value={formData.tire_type} onChange={(e) => setFormData({...formData, tire_type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="Été">Été</option>
                <option value="Hiver">Hiver</option>
                <option value="4 Saisons">4 Saisons</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
              <input type="text" required value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <select value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="4 pneus">4 pneus</option>
                <option value="Train avant">Train avant</option>
                <option value="Train arrière">Train arrière</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coût total (DA) *</label>
              <input type="number" step="0.01" required value={formData.cost} onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="md:col-span-3 flex gap-2 mt-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition">Annuler</button>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Marque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coût</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tires.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun changement de pneu enregistré</td></tr>
            ) : (
              tires.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{new Date(t.change_date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 font-semibold">{getVehiclePlate(t.vehicle_id)}</td>
                  <td className="px-6 py-4">{t.mileage.toLocaleString()} km</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{t.tire_type}</span> {t.brand}</td>
                  <td className="px-6 py-4">{t.position}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{t.cost.toFixed(2)} DA</td>
                  <td className="px-6 py-4">
                    <button onClick={async () => { if(confirm('Supprimer cette entrée ?')) { await deleteTire(t.id); loadData(); } }} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition" title="Supprimer">
                      <Trash2 size={18} />
                    </button>
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