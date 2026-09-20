import { useEffect, useState } from 'react';
import { getReminders, createReminder, updateReminder, deleteReminder, getVehicles } from '../services/api';
import { Reminder, Vehicle } from '../types';
import { Plus, Trash2, Edit, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    vehicle_id: 0,
    category: 'Vidange',
    next_due_date: '',
    next_due_mileage: '' as string | number,
    notes: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [remRes, vehRes] = await Promise.all([getReminders(), getVehicles()]);
      setReminders(Array.isArray(remRes.data) ? remRes.data : []);
      setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);
    } catch (error) {
      console.error("Erreur chargement rappels", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      vehicle_id: parseInt(String(formData.vehicle_id)),
      category: formData.category,
      next_due_date: formData.next_due_date === '' ? null : formData.next_due_date,
      next_due_mileage: formData.next_due_mileage === '' ? null : parseInt(String(formData.next_due_mileage)),
      notes: formData.notes
    };

    if (!payload.vehicle_id || payload.vehicle_id === 0) { alert("Veuillez sélectionner un véhicule"); return; }
    if (!payload.category) { alert("Veuillez sélectionner un type de rappel"); return; }
    if (!payload.next_due_date && (!payload.next_due_mileage || payload.next_due_mileage === 0)) { alert("Veuillez renseigner au moins une échéance"); return; }

    try {
      if (editingId) await updateReminder(editingId, payload);
      else await createReminder(payload);
      setShowForm(false); setEditingId(null);
      setFormData({ vehicle_id: 0, category: 'Vidange', next_due_date: '', next_due_mileage: '', notes: '' });
      loadData();
    } catch (error: any) {
      let errorMessage = "Erreur lors de l'enregistrement";
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      }
      alert(errorMessage);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setFormData({
      vehicle_id: reminder.vehicle_id,
      category: reminder.category,
      next_due_date: reminder.next_due_date || '',
      next_due_mileage: reminder.next_due_mileage || '',
      notes: reminder.notes || ''
    });
    setShowForm(true);
  };

  const getStatusBadge = (status: string, days: number | null | undefined, km: number | null | undefined) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    const icons: Record<string, JSX.Element> = {
      green: <CheckCircle size={16} className="mr-1" />,
      orange: <Clock size={16} className="mr-1" />,
      red: <AlertTriangle size={16} className="mr-1" />
    };
    
    let text = "OK";
    if (status === 'red') text = "Dépassé !";
    else if (status === 'orange') {
      const parts = [];
      if (days !== null && days !== undefined && days <= 30) parts.push(`${days}j`);
      if (km !== null && km !== undefined && km <= 2000) parts.push(`${km}km`);
      text = `Bientôt (${parts.join(' ou ')})`;
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}>
        {icons[status]} {text}
      </span>
    );
  };

  const redCount = reminders.filter(r => r.status === 'red').length;
  const orangeCount = reminders.filter(r => r.status === 'orange').length;

  return (
    <div className="p-2 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Rappels & Entretiens</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {redCount > 0 && <span className="text-red-600 font-semibold">{redCount} critique(s)</span>}
            {redCount > 0 && orangeCount > 0 && <span className="mx-2">•</span>}
            {orangeCount > 0 && <span className="text-orange-600 font-semibold">{orangeCount} à prévoir bientôt</span>}
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ vehicle_id: 0, category: 'Vidange', next_due_date: '', next_due_mileage: '', notes: '' }); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={20} /> Nouveau Rappel
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">{editingId ? 'Modifier le rappel' : 'Nouveau Rappel'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Véhicule *</label>
              <select required value={formData.vehicle_id} onChange={(e) => setFormData({...formData, vehicle_id: parseInt(e.target.value)})} className="w-full border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg px-3 py-2">
                <option value={0}>Sélectionner</option>
                {vehicles.map(v => (<option key={v.id} value={v.id}>{v.license_plate} - {v.brand} {v.model}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de rappel *</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg px-3 py-2">
                <option value="Vidange">Vidange Huile</option><option value="Révision">Révision Générale</option><option value="Pneus">Changement Pneus</option><option value="Assurance">Échéance Assurance</option><option value="Visite Technique">Visite Technique</option><option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'échéance</label>
              <input type="date" value={formData.next_due_date} onChange={(e) => setFormData({...formData, next_due_date: e.target.value})} className="w-full border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kilométrage d'échéance</label>
              <input type="number" value={formData.next_due_mileage} onChange={(e) => setFormData({...formData, next_due_mileage: e.target.value})} className="w-full border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg px-3 py-2" placeholder="Ex: 120000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg px-3 py-2" placeholder="Ex: Huile 5W30..." />
            </div>
            <div className="flex gap-2 items-end">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex-1">Enregistrer</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-200 dark:bg-gray-600 dark:text-white px-6 py-2 rounded-lg hover:bg-gray-300 transition">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Véhicule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Échéance Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Échéance Km</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reminders.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Aucun rappel configuré</td></tr>
            ) : (
              reminders.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 font-semibold dark:text-gray-200">{r.vehicle_plate || 'N/A'}</td>
                  <td className="px-6 py-4 dark:text-gray-200">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">{r.category}</span>
                    {r.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.notes}</p>}
                  </td>
                  <td className="px-6 py-4 dark:text-gray-200">{r.next_due_date ? new Date(r.next_due_date).toLocaleDateString('fr-FR') : '-'}</td>
                  <td className="px-6 py-4 dark:text-gray-200">{r.next_due_mileage ? `${Number(r.next_due_mileage).toLocaleString()} km` : '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(r.status, r.days_remaining, r.km_remaining)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                      <button onClick={async () => { if(confirm('Supprimer ce rappel ?')) { await deleteReminder(r.id); loadData(); } }} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
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