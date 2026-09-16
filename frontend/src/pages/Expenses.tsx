import { useEffect, useState } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense, getVehicles, getCategories } from '../services/api';
import { Expense, Vehicle } from '../types';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    vehicle_id: 0,
    category_id: 1,
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expRes, vehRes, catRes] = await Promise.all([getExpenses(), getVehicles(), getCategories()]);
      setExpenses(Array.isArray(expRes.data) ? expRes.data : []);
      setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
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
        category_id: parseInt(String(formData.category_id)),
        amount: parseFloat(String(formData.amount))
      };
      
      if (editingId) {
        await updateExpense(editingId, payload);
      } else {
        await createExpense(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ vehicle_id: 0, category_id: 1, expense_date: new Date().toISOString().split('T')[0], description: '', amount: 0 });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      vehicle_id: expense.vehicle_id,
      category_id: expense.category_id,
      expense_date: expense.expense_date,
      description: expense.description,
      amount: expense.amount
    });
    setShowForm(true);
  };

  const getVehiclePlate = (id: number) => vehicles.find(v => v.id === id)?.license_plate || 'N/A';
  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dépenses</h1>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ vehicle_id: 0, category_id: 1, expense_date: new Date().toISOString().split('T')[0], description: '', amount: 0 }); }} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Modifier la dépense' : 'Nouvelle Dépense'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
              <select required value={formData.vehicle_id} onChange={(e) => setFormData({...formData, vehicle_id: parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value={0}>Sélectionner</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})} className="w-full border rounded-lg px-3 py-2 bg-white">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" required value={formData.expense_date} onChange={(e) => setFormData({...formData, expense_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (DA) *</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input type="text" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune dépense enregistrée</td></tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(e.expense_date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 font-semibold">{getVehiclePlate(e.vehicle_id)}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{getCategoryName(e.category_id)}</span></td>
                  <td className="px-6 py-4">{e.description}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{e.amount.toFixed(2)} DA</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(e)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                      <button onClick={async () => { if(confirm('Supprimer ?')) { await deleteExpense(e.id); loadData(); } }} className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
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