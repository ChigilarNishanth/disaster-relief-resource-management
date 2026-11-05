'use client';
import { useState } from 'react';
import DispatchConsole from '@/components/logistics/DispatchConsole';
import LogisticsDashboard from '@/components/logistics/LogisticsDashboard';
import SemanticSearch from '@/components/logistics/SemanticSearch';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDispatchSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#1a365d' }}>Disaster Relief Resource Management System</h1>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>
          Module: Central Logistics Hub, Stock Tracking, Stored Procedures & Vector Search Engine
        </p>
      </header>

      <SemanticSearch />
      <DispatchConsole onDispatchSuccess={handleDispatchSuccess} />
      <LogisticsDashboard key={refreshKey} />
    </main>
  );
}