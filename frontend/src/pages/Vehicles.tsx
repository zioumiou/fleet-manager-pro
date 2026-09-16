import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getVehicleTCO, exportVehiclesCSV, exportVehiclesExcel, downloadFile } from '../services/api';
import { Vehicle, VehicleTCO } from '../types';
import { Plus, Trash2, FileSpreadsheet, FileText, FolderOpen, Calculator, X, Edit } from 'lucide-react';
import DataTable from '../components/DataTable';
import DocumentManager from '../components/DocumentManager';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVehicleDocs, setSelectedVehicleDocs] = useState<{ id: number; name: string } | null>(null);
  const [tcoData, setTcoData] = useState<VehicleTCO | null>(null);

  const [formData, setFormData] = useState<any>({
    license_plate: '',
    brand: 'Geely',
    model: 'Coolray',
    year: new Date().getFullYear(),
    engine_type: 'BHE15',
    transmission: 'DCT EVO 300',
    initial_mileage: 0,
    current_mileage: 0,
    driver_name: '',
    purchase_price: null,
    purchase_date: null,
    resale_price: null,
    resale_date: null,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await getVehicles();
      setVehicles(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des véhicules");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateVehicle(editingId, formData);
        toast.success("Véhicule modifié avec succès !");
      } else {
        await createVehicle(formData);
        toast.success("Véhicule ajouté avec succès !");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        license_plate: '',
        brand: 'Geely',
        model: 'Coolray',
        year: new Date().getFullYear(),
        engine_type: 'BHE15',
        transmission: 'DCT EVO 300',
        initial_mileage: 0,
        current_mileage: 0,
        driver_name: '',
        purchase_price: null,
        purchase_date: null,
        resale_price: null,
        resale_date: null,
      });
      loadVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'enregistrement");
    }
    setLoading(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setFormData({
      license_plate: vehicle.license_plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      engine_type: vehicle.engine_type,
      transmission: vehicle.transmission,
      initial_mileage: vehicle.initial_mileage,
      current_mileage: vehicle.current_mileage,
      driver_name: vehicle.driver_name || '',
      purchase_price: vehicle.purchase_price,
      purchase_date: vehicle.purchase_date || '',
      resale_price: vehicle.resale_price,
      resale_date: vehicle.resale_date || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer ce véhicule et toutes ses données ?')) {
      try {
        await deleteVehicle(id);
        toast.success("Véhicule supprimé");
        loadVehicles();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleOpenTCO = async (vehicle: Vehicle) => {
    try {
      const res = await getVehicleTCO(vehicle.id);
      setTcoData(res.data);
    } catch (error) {
      toast.error("Erreur lors du calcul du TCO");
    }
  };

  const columns = [
    { key: 'license_plate', label: 'Immatriculation', sortable: true },
    { key: 'brand_model', label: 'Véhicule', sortable: true },
    { key: 'driver_name', label: 'Conducteur', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const tableData = vehicles.map(v => ({
    ...v,
    brand_model: `${v.brand} ${v.model} (${v.year})`,
    driver_name: v.driver_name || 'Non assigné',
    actions: (
      <div className="flex gap-1">
        <button onClick={() => setSelectedVehicleDocs({ id: v.id, name: `${v.license_plate} - ${v.brand} ${v.model}` })} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded" title="Documents">
          <FolderOpen size={18} />
        </button>
        <button onClick={() => handleOpenTCO(v)} className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded" title="Calcul TCO">
          <Calculator size={18} />
        </button>
        <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded" title="Modifier">
          <Edit size={18} />
        </button>
        <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded" title="Supprimer">
          <Trash2 size={18} />
        </button>
      </div>
    )
  }));

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Véhicules</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={async () => { toast.promise(downloadFile(await exportVehiclesCSV(), 'vehicules.csv'), { loading: 'Export...', success: 'CSV téléchargé !', error: 'Erreur export' }); }} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 text-sm">
            <FileText size={18} /> CSV
          </button>
          <button onClick={async () => { toast.promise(downloadFile(await exportVehiclesExcel(), 'vehicules.xlsx'), { loading: 'Export...', success: 'Excel téléchargé !', error: 'Erreur export' }); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 text-sm">
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ license_plate: '', brand: 'Geely', model: 'Coolray', year: new Date().getFullYear(), engine_type: 'BHE15', transmission: 'DCT EVO 300', initial_mileage: 0, current_mileage: 0, driver_name: '', purchase_price: null, purchase_date: null, resale_price: null, resale_date: null }); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm">
            <Plus size={18} /> Ajouter
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier le véhicule' : 'Nouveau Véhicule'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation *</label>
              <input type="text" required value={formData.license_plate} onChange={(e) => setFormData({...formData, license_plate: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
              <input type="text" required value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modèle *</label>
              <input type="text" required value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année *</label>
              <input type="number" required value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moteur</label>
              <select value={formData.engine_type} onChange={(e) => setFormData({...formData, engine_type: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="BHE15">BHE15 (1.5T)</option>
                <option value="4G14T">4G14T (1.4T)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select value={formData.transmission} onChange={(e) => setFormData({...formData, transmission: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="Manuelle">Manuelle</option>
                <option value="DCT EVO 300">DCT EVO 300</option>
                <option value="CVT">CVT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Km initial</label>
              <input type="number" value={formData.initial_mileage || ''} onChange={(e) => setFormData({...formData, initial_mileage: e.target.value === '' ? null : parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Km actuel *</label>
              <input type="number" required value={formData.current_mileage} onChange={(e) => setFormData({...formData, current_mileage: parseInt(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conducteur</label>
              <input type="text" value={formData.driver_name || ''} onChange={(e) => setFormData({...formData, driver_name: e.target.value || null})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="lg:col-span-3 border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Données Financières (TCO)</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat (DA)</label>
              <input type="number" step="0.01" value={formData.purchase_price || ''} onChange={(e) => setFormData({...formData, purchase_price: e.target.value === '' ? null : parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'achat</label>
              <input type="date" value={formData.purchase_date || ''} onChange={(e) => setFormData({...formData, purchase_date: e.target.value === '' ? null : e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix de revente (DA)</label>
              <input type="number" step="0.01" value={formData.resale_price || ''} onChange={(e) => setFormData({...formData, resale_price: e.target.value === '' ? null : parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de revente</label>
              <input type="date" value={formData.resale_date || ''} onChange={(e) => setFormData({...formData, resale_date: e.target.value === '' ? null : e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="lg:col-span-3 flex gap-3 mt-4 pt-4 border-t">
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                {loading ? '...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-300">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable data={tableData} columns={columns} searchPlaceholder="Rechercher par immatriculation, marque ou conducteur..." />

      {selectedVehicleDocs && (
        <DocumentManager vehicleId={selectedVehicleDocs.id} vehicleName={selectedVehicleDocs.name} onClose={() => setSelectedVehicleDocs(null)} />
      )}

      {tcoData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calculator className="text-purple-600" /> TCO : {tcoData.license_plate}
              </h2>
              <button onClick={() => setTcoData(null)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Dépréciation (Achat - Revente)</span>
                <span className="font-semibold">{(tcoData.purchase_price - tcoData.resale_price).toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded">
                <span>Carburant</span>
                <span className="font-semibold text-blue-700">{tcoData.fuel_cost.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between p-3 bg-green-50 rounded">
                <span>Entretien</span>
                <span className="font-semibold text-green-700">{tcoData.maintenance_cost.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between p-3 bg-orange-50 rounded">
                <span>Autres Dépenses</span>
                <span className="font-semibold text-orange-700">{tcoData.expense_cost.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between p-3 bg-yellow-50 rounded">
                <span>Pneus</span>
                <span className="font-semibold text-yellow-700">{(tcoData.tire_cost || 0).toLocaleString()} DA</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Coût Total (TCO)</span>
                <span className="text-2xl font-bold text-purple-700">{tcoData.total_tco.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between items-center bg-purple-100 p-4 rounded-lg">
                <span className="font-bold text-purple-900">Coût réel au kilomètre</span>
                <span className="text-xl font-bold text-purple-900">{tcoData.cost_per_km.toFixed(3)} DA / km</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Calculé sur {tcoData.mileage.toLocaleString()} km parcourus</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}