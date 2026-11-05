'use client';
import { useState, useEffect } from 'react';

export default function DispatchConsole({ onDispatchSuccess }) {
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [camps, setCamps] = useState([
    { Camp_ID: 1, Camp_Name: 'Udupi Town Hall Relief Base' },
    { Camp_ID: 2, Camp_Name: 'Meppadi High School Shelter' }
  ]);
  
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [selectedCamp, setSelectedCamp] = useState('');
  const [quantity, setQuantity] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Isolated fetch for Warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setWarehouses(data.data);
      } else {
        setApiError(`Warehouse API Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setApiError(`Warehouse Fetch Failed: ${err.message}`);
    }
  };

  // Isolated fetch for Inventory
  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setInventory(data.data);
      }
    } catch (err) {
      console.error('Inventory Fetch Error:', err);
    }
  };

  const loadData = () => {
    setApiError('');
    fetchWarehouses();
    fetchInventory();
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredResources = inventory.filter(
    item => String(item.Warehouse_ID) === String(selectedWarehouse)
  );

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
        setSelectedResource('');
        loadData();
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
    <div style={{ padding: '20px', border: '2px solid #0284c7', borderRadius: '8px', background: '#ffffff', marginBottom: '25px', color: '#0f172a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0369a1' }}>📦 Dispatch Console (Execute Transaction)</h2>
        <button 
          type="button" 
          onClick={loadData}
          style={{ padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #0284c7', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔄 Sync Database
        </button>
      </div>

      {apiError && (
        <div style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '12px', fontWeight: 'bold' }}>
          {apiError}
        </div>
      )}

      {statusMessage && (
        <div style={{
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '4px',
          color: '#ffffff',
          backgroundColor: statusMessage.type === 'success' ? '#15803d' : '#b91c1c',
          fontWeight: 'bold'
        }}>
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleDispatch} style={{ display: 'grid', gap: '14px', maxWidth: '600px' }}>
        {/* 1. SELECT SOURCE WAREHOUSE */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}>
            1. Select Source Warehouse (`WAREHOUSE` Table):
          </label>
          <select 
            value={selectedWarehouse} 
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              setSelectedResource('');
            }}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              color: '#0f172a', 
              backgroundColor: '#f8fafc', 
              border: '2px solid #94a3b8', 
              borderRadius: '6px' 
            }}
          >
            <option value="" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
              -- Choose Source Warehouse ({warehouses.length} Active) --
            </option>
            {warehouses.map((wh) => (
              <option 
                key={wh.Warehouse_ID} 
                value={wh.Warehouse_ID}
                style={{ color: '#0f172a', backgroundColor: '#ffffff', padding: '6px' }}
              >
                {wh.Warehouse_Name} — ({wh.City}, {wh.State}) [Cap: {wh.Max_Capacity}]
              </option>
            ))}
          </select>
        </div>

        {/* 2. SELECT RESOURCE STOCKED AT THAT WAREHOUSE */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}>
            2. Select Resource Item (`STORED_IN` Stock):
          </label>
          <select 
            value={selectedResource} 
            onChange={(e) => setSelectedResource(e.target.value)}
            disabled={!selectedWarehouse}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              color: '#0f172a', 
              backgroundColor: !selectedWarehouse ? '#e2e8f0' : '#f8fafc', 
              border: '2px solid #94a3b8', 
              borderRadius: '6px' 
            }}
          >
            <option value="" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
              {!selectedWarehouse 
                ? '-- Select a Warehouse First --' 
                : filteredResources.length === 0 
                  ? '-- No Stock Available in this Warehouse --' 
                  : `-- Choose Resource (${filteredResources.length} Types Available) --`}
            </option>
            {filteredResources.map((item) => (
              <option 
                key={item.Resource_ID} 
                value={item.Resource_ID}
                style={{ color: '#0f172a', backgroundColor: '#ffffff', padding: '6px' }}
              >
                {item.Resource_Name} — Available Stock: {item.Quantity_In_Stock} {item.Unit_Of_Measure}
              </option>
            ))}
          </select>
        </div>

        {/* 3. SELECT DESTINATION RELIEF CAMP */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}>
            3. Destination Relief Camp (`RELIEF_CAMP` Table):
          </label>
          <select 
            value={selectedCamp} 
            onChange={(e) => setSelectedCamp(e.target.value)} 
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              color: '#0f172a', 
              backgroundColor: '#f8fafc', 
              border: '2px solid #94a3b8', 
              borderRadius: '6px' 
            }}
          >
            <option value="" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
              -- Select Relief Camp --
            </option>
            {camps.map((camp) => (
              <option key={camp.Camp_ID} value={camp.Camp_ID} style={{ color: '#0f172a', backgroundColor: '#ffffff', padding: '6px' }}>
                {camp.Camp_Name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. DISPATCH QUANTITY */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}>
            4. Dispatch Quantity:
          </label>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            placeholder="Enter quantity to dispatch"
            required 
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '14px', 
              color: '#0f172a', 
              backgroundColor: '#f8fafc', 
              border: '2px solid #94a3b8', 
              borderRadius: '6px' 
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !selectedResource}
          style={{
            padding: '12px 15px',
            backgroundColor: loading || !selectedResource ? '#94a3b8' : '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || !selectedResource ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '15px',
            marginTop: '5px'
          }}
        >
          {loading ? 'Executing Transaction...' : 'Dispatch Resources'}
        </button>
      </form>
    </div>
  );
}