import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Sun, 
  Moon, 
  Radio, 
  RotateCcw, 
  FileSpreadsheet, 
  Search,
  Sparkles
} from 'lucide-react';

export function Header() {
  const { 
    theme, 
    toggleTheme, 
    isLiveSimulating, 
    setIsLiveSimulating, 
    filters, 
    setFilters, 
    resetDataset,
    setActiveTab
  } = useApp();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-badge">
          <div className="brand-logo-icon">
            <BarChart3 size={22} />
          </div>
          <div>
            <span>NexusCommerce</span>
            <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--accent-indigo)', fontWeight: 600 }}>
              ANALYSIS INTELLIGENCE SYSTEM
            </span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Global Quick Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="custom-input"
            placeholder="Search orders, customers..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            style={{ paddingLeft: '32px', width: '100%', fontSize: '0.825rem' }}
          />
        </div>

        {/* Live Order Simulation Toggle */}
        <button 
          className={isLiveSimulating ? "btn-live-pulsing" : "btn-secondary"}
          onClick={() => setIsLiveSimulating(!isLiveSimulating)}
          title={isLiveSimulating ? "Click to pause live transaction feed" : "Click to start live transaction stream simulator"}
        >
          {isLiveSimulating ? <span className="pulse-dot" /> : <Radio size={16} />}
          <span>{isLiveSimulating ? "LIVE FEED ON" : "Simulate Stream"}</span>
        </button>

        {/* AI Assistant Quick Jump */}
        <button 
          className="btn-secondary"
          onClick={() => setActiveTab('ai')}
          style={{ background: 'rgba(168, 85, 247, 0.12)', color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
        >
          <Sparkles size={16} />
          <span>Ask AI</span>
        </button>

        {/* Reset Dataset Button */}
        <button 
          className="btn-secondary" 
          onClick={resetDataset}
          title="Reset dataset to default synthetic data"
        >
          <RotateCcw size={16} />
        </button>

        {/* Theme Toggle Button */}
        <button 
          className="btn-secondary"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
