import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Package, 
  MessageSquare, 
  Bot, 
  Database,
  ShieldCheck,
  Zap
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, transactions, products } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales & Forecasting', icon: TrendingUp },
    { id: 'customers', label: 'Customer RFM Matrix', icon: Users },
    { id: 'products', label: 'Product & Inventory', icon: Package },
    { id: 'sentiment', label: 'Customer Sentiment NLP', icon: MessageSquare },
    { id: 'ai', label: 'AI Query & Anomalies', icon: Bot },
    { id: 'data', label: 'Data Hub & Importer', icon: Database },
  ];

  return (
    <aside className="app-sidebar">
      <div>
        <div className="sidebar-title">MODULES & ANALYTICS</div>
        <nav className="nav-menu" style={{ marginTop: '0.75rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Summary Widget */}
      <div style={{ 
        marginTop: 'auto', 
        background: 'var(--bg-tertiary)', 
        borderRadius: 'var(--radius-md)', 
        padding: '1rem',
        border: '1px solid var(--border-color)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
          <ShieldCheck size={16} />
          <span>SYSTEM ACTIVE</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Loaded: <strong style={{ color: 'var(--text-primary)' }}>{transactions.length}</strong> Orders
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Catalog: <strong style={{ color: 'var(--text-primary)' }}>{products.length}</strong> Products
        </div>
        <div style={{ 
          marginTop: '0.75rem', 
          fontSize: '0.7rem', 
          background: 'rgba(99, 102, 241, 0.1)', 
          color: 'var(--accent-indigo)', 
          padding: '0.35rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <Zap size={12} /> Holt-Winters Engine Ready
        </div>
      </div>
    </aside>
  );
}
