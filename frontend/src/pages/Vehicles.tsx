import { useEffect, useState } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getVehicleTCO, exportVehiclesCSV, exportVehiclesExcel, downloadFile } from '../services/api';
import { Vehicle, VehicleTCO } from '../types';
import { Plus, Trash2, Edit, Download, FileUp } from 'lucide-react';
import DocumentManager from '../components/DocumentManager';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedVehicleId, setExpandedVehicleId] = useState<number | null>(null);
  const [tco, setTco] = useState<VehicleTCO | null>(null);
  const [formData, setFormData] = useState({
    license_plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    fuel_type: 'Essence',
    current_mileage: 0,
    initial_mileage: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: 0,
    resale_price: 0,
    status: 'Actif'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getVehicles();
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Erreur chargement véhicules", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        year: parseInt(String(formData.year)),
        current_mileage: parseInt(String(formData.current_mileage)),
        initial_mileage: parseInt(String(formData.initial_mileage)),
        purchase_price: parseFloat(String(formData.purchase_price)),
        resale_price: parseFloat(String(formData.resale_price))
      };
      if (editingId) {
        await updateVehicle(editingId, payload);
      } else {
        await createVehicle(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        license_plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        fuel_type: 'Essence',
        current_mileage: 0,
        initial_mileage: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price: 0,
        resale_price: 0,
        status: 'Actif'
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      license_plate: vehicle.license_plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      fuel_type: vehicle.fuel_type,
      current_mileage: vehicle.current_mileage,
      initial_mileage: vehicle.initial_mileage,
      purchase_date: vehicle.purchase_date,
      purchase_price: vehicle.purchase_price,
      resale_price: vehicle.resale_price || 0,
      status: vehicle.status
    });
    setShowForm(true);
  };

  const handleTCO = async (id: number) => {
    try {
      const res = await getVehicleTCO(id);
      setTco(res.data);
      alert(`Coût Total de Possession: ${res.data.total_cost.toFixed(2)} DA`);
    } catch (error) {
      alert("Erreur lors du calcul du TCO");
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await exportVehiclesCSV();
      downloadFile(res.data, 'vehicles.csv');
    } catch (error) {
      alert("Erreur lors de l'export CSV");
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await exportVehiclesExcel();
      downloadFile(res.data, 'vehicles.xlsx');
    } catch (error) {
      alert("Erreur lors de l'export Excel");
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedVehicleId(expandedVehicleId === id ? null : id);
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Véhicules</h1>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
            <Download size={18} /> CSV
          </button>
          <button onClick={handleExportExcel} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Download size={18} /> Excel
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} /> Ajouter
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier le véhicule' : 'Nouveau Véhicule'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plaque *</label>
              <input required value={formData.license_plate} onChange={(e) => setFormData({...formData, license_plate: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
              <input required value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modèle *</label>
              <input required value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
              <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carburant</label>
              <select value={formData.fuel_type} onChange={(e) => setFormData({...formData, fuel_type: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="Essence">Essence</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybride">Hybride</option>
                <option value="Électrique">Électrique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage actuel *</label>
              <input type="number" required value={formData.current_mileage} onChange={(e) => setFormData({...formData, current_mileage: parseInt(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage initial</label>
              <input type="number" value={formData.initial_mileage} onChange={(e) => setFormData({...formData, initial_mileage: parseInt(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'achat</label>
              <input type="date" value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat (DA)</label>
              <input type="number" step="0.01" value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix de revente (DA)</label>
              <input type="number" step="0.01" value={formData.resale_price} onChange={(e) => setFormData({...formData, resale_price: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Vendu">Vendu</option>
              </select>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plaque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque/Modèle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Année</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kilométrage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vehicles.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucun véhicule enregistré</td></tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{vehicle.license_plate}</td>
                  <td className="px-6 py-4">{vehicle.brand} {vehicle.model}</td>
                  <td className="px-6 py-4">{vehicle.year}</td>
                  <td className="px-6 py-4">{vehicle.current_mileage.toLocaleString()} km</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      vehicle.status === 'Actif' ? 'bg-green-100 text-green-800' :
                      vehicle.status === 'Inactif' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => toggleExpand(vehicle.id)} className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded" title="Documents">
                        <FileUp size={18} />
                      </button>
                      <button onClick={() => handleTCO(vehicle.id)} className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded" title="TCO">
                        <Download size={18} />
                      </button>
                      <button onClick={() => handleEdit(vehicle)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                        <Edit size={18} />
                      </button>
                      <button onClick={async () => { if(confirm('Supprimer ?')) { await deleteVehicle(vehicle.id); loadData(); } }} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded">
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

      {/* Section Documents pour le véhicule sélectionné */}
      {expandedVehicleId && (
        <DocumentManager 
          vehicleId={expandedVehicleId}
          vehiclePlate={vehicles.find(v => v.id === expandedVehicleId)?.license_plate || ''}
        />
      )}
    </div>
  );
}