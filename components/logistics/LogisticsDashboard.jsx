'use client';
import { useState, useEffect } from 'react';

export default function LogisticsDashboard() {
  const [disasters, setDisasters] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [dispatches, setDispatches] = useState([]);

  const fetchData = async () => {
    try {
      const [resDisasters, resInventory, resDispatches] = await Promise.all([
        fetch('/api/disasters').then(r => r.json()),
        fetch('/api/inventory').then(r => r.json()),
        fetch('/api/dispatches').then(r => r.json())
      ]);

      if (resDisasters.success) setDisasters(resDisasters.data);
      if (resInventory.success) setInventory(resInventory.data);
      if (resDispatches.success) setDispatches(resDispatches.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Active Disasters Section */}
      <section style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
        <h3>🚨 Active Disasters Overview</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f0f0f0' }}>
            <tr>
              <th>Disaster Name</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Location</th>
              <th>Camps</th>
              <th>Occupants</th>
            </tr>
          </thead>
          <tbody>
            {disasters.map((d) => (
              <tr key={d.Disaster_ID}>
                <td><strong>{d.Disaster_Name}</strong></td>
                <td>{d.Type}</td>
                <td><span style={{ color: d.Severity_Level === 'Critical' ? 'red' : 'orange', fontWeight: 'bold' }}>{d.Severity_Level}</span></td>
                <td>{d.City}, {d.State}</td>
                <td>{d.Total_Camps}</td>
                <td>{d.Total_Occupants}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Warehouse Stock Overview */}
      <section style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
        <h3>🏭 Live Warehouse Inventory (`STORED_IN`)</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f0f0f0' }}>
            <tr>
              <th>Resource</th>
              <th>Category</th>
              <th>Warehouse</th>
              <th>Stock Level</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, idx) => (
              <tr key={idx}>
                <td>{item.Resource_Name}</td>
                <td>{item.Category}</td>
                <td>{item.Warehouse_Name} ({item.Warehouse_City})</td>
                <td><strong>{item.Quantity_In_Stock}</strong></td>
                <td>{item.Unit_Of_Measure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Dispatch History Log */}
      <section style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
        <h3>🚚 Recent Dispatches Log (`DISPATCHES`)</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f0f0f0' }}>
            <tr>
              <th>Date</th>
              <th>Resource</th>
              <th>From Warehouse</th>
              <th>To Relief Camp</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((log, idx) => (
              <tr key={idx}>
                <td>{new Date(log.Dispatch_Date).toLocaleString()}</td>
                <td>{log.Resource_Name}</td>
                <td>{log.Warehouse_Name}</td>
                <td>{log.Camp_Name}</td>
                <td>{log.Quantity_Dispatched} {log.Unit_Of_Measure}</td>
                <td><span style={{ color: 'green', fontWeight: 'bold' }}>{log.Status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}