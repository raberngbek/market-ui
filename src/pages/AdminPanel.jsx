import React, { useState, useEffect } from 'react';
import { getUnits, createUnit, updateUnit, deleteUnit } from '../api/unitService';

const AdminPanel = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', abbreviation: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const data = await getUnits();
      setUnits(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch units.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUnit(editingId, formData);
      } else {
        await createUnit(formData);
      }
      setFormData({ name: '', abbreviation: '' });
      setEditingId(null);
      fetchUnits();
    } catch (err) {
      setError(editingId ? 'Failed to update unit.' : 'Failed to create unit.');
    }
  };

  const handleEdit = (unit) => {
    setEditingId(unit.id);
    setFormData({ name: unit.name, abbreviation: unit.abbreviation });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await deleteUnit(id);
        fetchUnits();
      } catch (err) {
        setError('Failed to delete unit.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Unit' : 'Create New Unit'}</h2>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Kilogram"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Abbreviation</label>
            <input 
              type="text" 
              required
              value={formData.abbreviation}
              onChange={(e) => setFormData({...formData, abbreviation: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., kg"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
            <button type="submit" className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setFormData({name: '', abbreviation: ''}); }}
                className="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b bg-gray-50">Manage Units</h2>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading units...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Abbreviation</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {units.map(unit => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.abbreviation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleEdit(unit)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
                {units.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No units configured yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
