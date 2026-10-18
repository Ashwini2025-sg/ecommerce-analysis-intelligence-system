import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function KpiCard({ title, value, change, isPositive = true, icon: Icon, color = 'var(--accent-indigo)', subtitle = '' }) {
  return (
    <div className="glass-panel kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon" style={{ color: color, background: `${color}18` }}>
          <Icon size={20} />
        </div>
      </div>

      <div>
        <div className="kpi-value">{value}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{subtitle}</div>}
      </div>

      <div className="kpi-footer">
        {change !== undefined && change !== null && (
          <span className={isPositive ? "badge-positive" : "badge-negative"}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change > 0 ? `+${change}%` : `${change}%`}
          </span>
        )}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vs previous period</span>
      </div>
    </div>
  );
}
