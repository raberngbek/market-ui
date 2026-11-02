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
    <div className="container admin-dashboard">
      <div className="admin-header">
        <div>
          <span className="eyebrow">STORE ADMINISTRATION</span>
          <h1>Admin Dashboard</h1>
        </div>
      </div>
      
      <div className="admin-card">
        <h2>{editingId ? 'Edit Measurement Unit' : 'Create New Unit'}</h2>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded" style={{ borderRadius: 'var(--radius-md)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '220px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Unit Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                outline: 0,
                fontSize: '14px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="e.g., Kilogram"
            />
          </div>
          <div style={{ flex: '1', minWidth: '220px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Abbreviation</label>
            <input 
              type="text" 
              required
              value={formData.abbreviation}
              onChange={(e) => setFormData({...formData, abbreviation: e.target.value})}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                outline: 0,
                fontSize: '14px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="e.g., kg"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="button primary">
              {editingId ? 'Update Unit' : 'Create Unit'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setFormData({name: '', abbreviation: ''}); }}
                className="button secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2>Manage Units</h2>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading units...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Abbreviation</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map(unit => (
                  <tr key={unit.id}>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{unit.id}</td>
                    <td style={{ fontWeight: '600' }}>{unit.name}</td>
                    <td>{unit.abbreviation}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-actions" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEdit(unit)} 
                          className="button small ghost"
                          style={{ color: 'var(--color-primary)', fontWeight: '600' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(unit.id)} 
                          className="button small ghost"
                          style={{ color: 'var(--color-danger)', fontWeight: '600' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {units.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No units configured yet.
                    </td>
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
