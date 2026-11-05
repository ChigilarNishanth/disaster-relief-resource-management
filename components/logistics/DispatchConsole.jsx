'use client';
import { useState, useEffect } from 'react';

export default function DispatchConsole({ onDispatchSuccess }) {
  const [inventory, setInventory] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [camps, setCamps] = useState([
    { Camp_ID: 1, Camp_Name: 'Udupi Town Hall Relief Base' },
    { Camp_ID: 2, Camp_Name: 'Meppadi High School Shelter' }
  ]);
  
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCamp, setSelectedCamp] = useState('');
  const [quantity, setQuantity] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.success) setInventory(data.data);
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Resource_ID: Number(selectedResource),
          Warehouse_ID: Number(selectedWarehouse),
          Camp_ID: Number(selectedCamp),
          Quantity: Number(quantity)
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setQuantity('');
        fetchInventory();
        if (onDispatchSuccess) onDispatchSuccess();
      } else {
        setStatusMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error processing dispatch.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9', marginBottom: '20px' }}>
      <h2>📦 Dispatch Console (Execute Transaction)</h2>
      
      {statusMessage && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          borderRadius: '4px',
          color: '#fff',
          backgroundColor: statusMessage.type === 'success' ? '#2e7d32' : '#c62828'
        }}>
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleDispatch} style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
        <div>
          <label><strong>Select Inventory Item:</strong></label>
          <select 
            value={selectedResource ? `${selectedResource}-${selectedWarehouse}` : ''} 
            onChange={(e) => {
              if (e.target.value) {
                const [rId, wId] = e.target.value.split('-');
                setSelectedResource(rId);
                setSelectedWarehouse(wId);
              } else {
                setSelectedResource('');
                setSelectedWarehouse('');
              }
            }}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          >
            <option value="">-- Choose Stocked Resource & Warehouse --</option>
            {inventory.map((item) => (
              <option key={`${item.Resource_ID}-${item.Warehouse_ID}`} value={`${item.Resource_ID}-${item.Warehouse_ID}`}>
                {item.Resource_Name} ({item.Quantity_In_Stock} {item.Unit_Of_Measure}) @ {item.Warehouse_Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label><strong>Destination Relief Camp:</strong></label>
          <select 
            value={selectedCamp} 
            onChange={(e) => setSelectedCamp(e.target.value)} 
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          >
            <option value="">-- Select Relief Camp --</option>
            {camps.map((camp) => (
              <option key={camp.Camp_ID} value={camp.Camp_ID}>
                {camp.Camp_Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label><strong>Dispatch Quantity:</strong></label>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            placeholder="Enter quantity"
            required 
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Processing Dispatch...' : 'Dispatch Resources'}
        </button>
      </form>
    </div>
  );
}