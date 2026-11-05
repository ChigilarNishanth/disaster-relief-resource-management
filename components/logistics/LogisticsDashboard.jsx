'use client';
import { useState, useEffect } from 'react';

export default function LogisticsDashboard() {
  const [disasters, setDisasters] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [dispatches, setDispatches] = useState([]);

  const fetchData = async () => {
    try {
      const [resD, resW, resI, resDisp] = await Promise.all([
        fetch('/api/disasters', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/warehouses', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/inventory', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/dispatches', { cache: 'no-store' }).then(r => r.json())
      ]);

      if (resD.success) setDisasters(resD.data);
      if (resW.success) setWarehouses(resW.data);
      if (resI.success) setInventory(resI.data);
      if (resDisp.success) setDispatches(resDisp.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ display: 'grid', gap: '20px', color: '#0f172a' }}>
      {/* Registered Warehouses Section */}
      <section style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', background: '#ffffff' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>🏬 Registered Warehouses (`WAREHOUSE`)</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#0f172a' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th>ID</th>
              <th>Warehouse Name</th>
              <th>Location</th>
              <th>Pincode</th>
              <th>Max Capacity</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.Warehouse_ID}>
                <td><strong>{w.Warehouse_ID}</strong></td>
                <td>{w.Warehouse_Name}</td>
                <td>{w.City}, {w.State}</td>
                <td>{w.Pincode}</td>
                <td><strong>{w.Max_Capacity.toLocaleString()} units</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Active Disasters Section */}
      <section style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', background: '#ffffff' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>🚨 Active Disasters Overview (`DISASTER`)</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#0f172a' }}>
          <thead style={{ background: '#f1f5f9' }}>
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
                <td><span style={{ color: d.Severity_Level === 'Critical' ? '#dc2626' : '#d97706', fontWeight: 'bold' }}>{d.Severity_Level}</span></td>
                <td>{d.City}, {d.State}</td>
                <td>{d.Total_Camps}</td>
                <td>{d.Total_Occupants}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Warehouse Stock Overview */}
      <section style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', background: '#ffffff' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>🏭 Live Stock Inventory (`STORED_IN`)</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#0f172a' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th>Resource Name</th>
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
      <section style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', background: '#ffffff' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>🚚 Recent Dispatches Log (`DISPATCHES`)</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#0f172a' }}>
          <thead style={{ background: '#f1f5f9' }}>
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
                <td><span style={{ color: '#16a34a', fontWeight: 'bold' }}>{log.Status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}