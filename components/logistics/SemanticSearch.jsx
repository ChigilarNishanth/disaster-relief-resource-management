'use client';
import { useState } from 'react';

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyDescription: query })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setSearched(true);
      }
    } catch (err) {
      console.error('Semantic search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#f0f4f8', marginBottom: '20px' }}>
      <h2>🔍 Vector Similarity Matcher (Unstructured Request Search)</h2>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>
        Paste raw camp coordinator status reports or emergency needs to automatically vector-match stock in warehouses.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="e.g. Urgent need for medical supplies, first aid kits and drinking water in Mangaluru..." 
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required 
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Vectorizing...' : 'Find Matches'}
        </button>
      </form>

      {searched && (
        <div>
          <h4>Match Results ({results.length} items found):</h4>
          {results.length === 0 ? (
            <p>No high-confidence warehouse stock matches found for this request.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff' }}>
              <thead style={{ background: '#e2e8f0' }}>
                <tr>
                  <th>Resource</th>
                  <th>Category</th>
                  <th>Warehouse</th>
                  <th>Stock Available</th>
                  <th>Vector Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.Resource_Name}</strong></td>
                    <td>{item.Category}</td>
                    <td>{item.Warehouse_Name} ({item.Warehouse_City})</td>
                    <td>{item.Quantity_In_Stock} {item.Unit_Of_Measure}</td>
                    <td><span style={{ color: '#2b6cb0', fontWeight: 'bold' }}>{(item.similarityScore * 100).toFixed(1)}% match</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}