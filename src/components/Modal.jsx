import React from 'react';
import { X, CheckCircle, AlertTriangle, Package, User, ShoppingBag } from 'lucide-react';

export function Modal({ isOpen, onClose, data, title = 'Details View' }) {
  if (!isOpen || !data) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }} onClick={onClose}>
      <div 
        className="glass-panel"
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glow)',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="var(--accent-indigo)" />
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="btn-secondary"
            style={{ padding: '0.4rem 0.6rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
          {Object.entries(data).map(([key, val]) => {
            if (typeof val === 'object' && val !== null) return null;
            return (
              <div key={key} style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {String(val)}
                </strong>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button className="btn-primary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
