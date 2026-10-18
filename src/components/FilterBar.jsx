import React from 'react';
import { useApp } from '../context/AppContext';
import { Filter, Calendar, MapPin, Tag, RefreshCw } from 'lucide-react';

export function FilterBar() {
  const { filters, setFilters } = useApp();

  const handleReset = () => {
    setFilters({
      timeRange: 'ALL',
      category: 'ALL',
      region: 'ALL',
      status: 'ALL',
      searchQuery: ''
    });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-indigo)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Filter size={16} />
          <span>GLOBAL FILTERS:</span>
        </div>

        {/* Time Range */}
        <select 
          className="custom-select"
          value={filters.timeRange}
          onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
        >
          <option value="ALL">📅 All Time</option>
          <option value="7D">Past 7 Days</option>
          <option value="30D">Past 30 Days</option>
          <option value="90D">Past 90 Days</option>
          <option value="1Y">Past 1 Year</option>
        </select>

        {/* Category */}
        <select 
          className="custom-select"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="ALL">🏷️ All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home & Living">Home & Living</option>
          <option value="Beauty & Health">Beauty & Health</option>
          <option value="Sports & Fitness">Sports & Fitness</option>
        </select>

        {/* Region */}
        <select 
          className="custom-select"
          value={filters.region}
          onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
        >
          <option value="ALL">🌍 All Regions</option>
          <option value="North America">North America</option>
          <option value="Europe">Europe</option>
          <option value="Asia Pacific">Asia Pacific</option>
          <option value="Latin America">Latin America</option>
          <option value="Middle East & Africa">Middle East & Africa</option>
        </select>

        {/* Status */}
        <select 
          className="custom-select"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="ALL">⚡ All Order Status</option>
          <option value="Completed">Completed</option>
          <option value="Returned">Returned</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div>
        <button 
          className="btn-secondary" 
          onClick={handleReset}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
        >
          <RefreshCw size={14} /> Clear Filters
        </button>
      </div>
    </div>
  );
}
