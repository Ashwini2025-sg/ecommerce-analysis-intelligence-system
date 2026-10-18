import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { filterTransactions, generateRevenueForecast } from '../data/analyticsEngine';
import { 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  Globe, 
  Calendar, 
  CreditCard 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

export function SalesAnalytics() {
  const { transactions, filters } = useApp();
  const [forecastDays, setForecastDays] = useState(30);
  const [promoMultiplier, setPromoMultiplier] = useState(1.1); // +10% promo simulation

  const filteredTx = filterTransactions(transactions, filters);
  const { historical, forecast } = generateRevenueForecast(filteredTx, forecastDays, promoMultiplier);

  // Combine historical and forecast for seamless rendering in Recharts
  const combinedChartData = [
    ...historical.map(h => ({
      date: h.date,
      historicalRev: h.revenue,
      forecastRev: null,
      upperBound: null,
      lowerBound: null
    })),
    // Link point
    {
      date: historical.length > 0 ? historical[historical.length - 1].date : '',
      historicalRev: historical.length > 0 ? historical[historical.length - 1].revenue : null,
      forecastRev: historical.length > 0 ? historical[historical.length - 1].revenue : null,
      upperBound: historical.length > 0 ? historical[historical.length - 1].revenue : null,
      lowerBound: historical.length > 0 ? historical[historical.length - 1].revenue : null
    },
    ...forecast.map(f => ({
      date: f.date,
      historicalRev: null,
      forecastRev: f.revenue,
      upperBound: f.upperBound,
      lowerBound: f.lowerBound
    }))
  ];

  // Region breakdown
  const regionMap = {};
  filteredTx.forEach(t => {
    if (t.status !== 'Returned') {
      regionMap[t.region] = (regionMap[t.region] || 0) + t.totalAmount;
    }
  });

  const regionData = Object.keys(regionMap).map(r => ({
    region: r,
    revenue: Math.round(regionMap[r])
  })).sort((a, b) => b.revenue - a.revenue);

  // Payment method breakdown
  const paymentMap = {};
  filteredTx.forEach(t => {
    paymentMap[t.paymentMethod] = (paymentMap[t.paymentMethod] || 0) + 1;
  });

  const paymentData = Object.keys(paymentMap).map(p => ({
    method: p,
    count: paymentMap[p]
  }));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Sales Intelligence & AI Revenue Forecasting
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Predictive Holt-Winters exponential smoothing model with interactive scenario simulation.
        </p>
      </div>

      {/* AI Forecast Controller Panel */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'var(--border-glow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--gradient-cyan)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: '#fff' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Predictive Model Parameters</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adjust growth horizon and promo campaign multipliers</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Horizon Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Forecast Window:</span>
              <button 
                className={`btn-secondary ${forecastDays === 30 ? 'active' : ''}`}
                style={forecastDays === 30 ? { background: 'var(--accent-indigo)', color: '#fff' } : {}}
                onClick={() => setForecastDays(30)}
              >
                30 Days
              </button>
              <button 
                className={`btn-secondary ${forecastDays === 60 ? 'active' : ''}`}
                style={forecastDays === 60 ? { background: 'var(--accent-indigo)', color: '#fff' } : {}}
                onClick={() => setForecastDays(60)}
              >
                60 Days
              </button>
              <button 
                className={`btn-secondary ${forecastDays === 90 ? 'active' : ''}`}
                style={forecastDays === 90 ? { background: 'var(--accent-indigo)', color: '#fff' } : {}}
                onClick={() => setForecastDays(90)}
              >
                90 Days
              </button>
            </div>

            {/* Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sliders size={16} color="var(--accent-indigo)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Promo Multiplier:</span>
              <input 
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={promoMultiplier}
                onChange={(e) => setPromoMultiplier(parseFloat(e.target.value))}
                style={{ cursor: 'pointer', accentColor: 'var(--accent-indigo)' }}
              />
              <strong style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', width: '45px' }}>
                {Math.round((promoMultiplier - 1) * 100) >= 0 ? `+${Math.round((promoMultiplier - 1) * 100)}%` : `${Math.round((promoMultiplier - 1) * 100)}%`}
              </strong>
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div style={{ height: '360px', width: '100%', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickFormatter={(d) => d.substring(5)} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                formatter={(val, name) => [`$${Math.round(val || 0).toLocaleString()}`, name]}
              />
              <Area type="monotone" dataKey="upperBound" name="95% Upper Bound" stroke="none" fill="rgba(6, 182, 212, 0.15)" />
              <Line type="monotone" dataKey="historicalRev" name="Historical Revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="forecastRev" name="AI Projected Revenue" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional & Payment Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Regional Sales Breakdown */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Globe size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Regional Revenue Performance</h3>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis dataKey="region" type="category" stroke="var(--text-muted)" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <CreditCard size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Payment Gateway Distribution</h3>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="method" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  formatter={(v) => [`${v} Transactions`, 'Volume']}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
