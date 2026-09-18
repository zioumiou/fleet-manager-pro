import { useState, useEffect } from 'react';
import { uploadDocument, getVehicleDocuments, deleteDocument } from '../services/api';
import { Document as DocumentType } from '../types';
import { Upload, Trash2, Download, FileText, Image, File } from 'lucide-react';

interface DocumentManagerProps {
  vehicleId: number;
  vehiclePlate: string;
}

export default function DocumentManager({ vehicleId, vehiclePlate }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('Carte grise');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => { loadDocuments(); }, [vehicleId]);

  const loadDocuments = async () => {
    try {
      const res = await getVehicleDocuments(vehicleId);
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (error) { console.error(error); }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      await uploadDocument(vehicleId, documentType, selectedFile);
      setSelectedFile(null);
      setShowUploadForm(false);
      await loadDocuments();
      alert('Document uploadé avec succès !');
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erreur upload");
    }
    setUploading(false);
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await deleteDocument(docId);
      await loadDocuments();
    } catch (error) { alert("Erreur suppression"); }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return <Image size={20} className="text-blue-500" />;
    if (ext === 'pdf') return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / 1048576).toFixed(1) + ' Mo';
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📄 Documents - {vehiclePlate}</h3>
        <button onClick={() => setShowUploadForm(!showUploadForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Upload size={18} /> {showUploadForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {showUploadForm && (
        <form onSubmit={handleUpload} className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-white">
                <option value="Carte grise">Carte grise</option>
                <option value="Assurance">Assurance</option>
                <option value="Contrôle technique">Contrôle technique</option>
                <option value="Permis de conduire">Permis de conduire</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fichier (PDF, JPG, PNG)</label>
              <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" className="w-full border rounded-lg px-3 py-2" required />
            </div>
          </div>
          <button type="submit" disabled={uploading || !selectedFile} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400">
            {uploading ? 'Upload...' : 'Uploader'}
          </button>
        </form>
      )}

      {documents.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Aucun document</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.file_name)}
                <div>
                  <p className="font-medium">{doc.document_type}</p>
                  <p className="text-sm text-gray-500">{doc.file_name} • {formatSize(doc.file_size)} • {new Date(doc.upload_date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`${API_URL}/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Download size={18} /></a>
                <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}