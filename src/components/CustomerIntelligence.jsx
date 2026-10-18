import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { filterTransactions, computeRFMSegmentation } from '../data/analyticsEngine';
import { 
  Users, 
  Target, 
  AlertTriangle, 
  Mail, 
  Award, 
  Search,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export function CustomerIntelligence() {
  const { transactions, filters, setSelectedItemModal, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('rfm'); // 'rfm' or 'kmeans'

  const filteredTx = filterTransactions(transactions, filters);
  const { segments, customers, kMeansClusters } = computeRFMSegmentation(filteredTx);

  const filteredCustomers = customers.filter(c => {
    if (selectedSegmentFilter !== 'ALL' && c.rfmSegment !== selectedSegmentFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(q) || String(c.id).toLowerCase().includes(q) || (c.country && c.country.toLowerCase().includes(q));
    }
    return true;
  });

  const scatterData = customers.map(c => ({
    x: c.recencyDays,
    y: c.totalSpend,
    z: c.orders * 10,
    name: c.name,
    segment: c.rfmSegment,
    cluster: c.cluster,
    id: c.id
  }));

  const handleSendRetention = (customer) => {
    showToast(`VIP Re-engagement email & 20% coupon sent to ${customer.name} (${customer.id})!`, 'success');
  };

  const segmentColors = {
    'Champions': '#10b981',
    'Loyal Customers': '#6366f1',
    'Potential Loyalists': '#06b6d4',
    'At Risk': '#f43f5e',
    'High Value At Risk': '#e11d48',
    'Lost Customers': '#64748b',
    'Regular Customers': '#f59e0b'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Customer Intelligence, RFM & K-Means Clustering
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Multi-dimensional customer segmentation powered by quantile RFM scoring and scikit-learn K-Means algorithm.
          </p>
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn-secondary ${viewMode === 'rfm' ? 'active' : ''}`}
            onClick={() => setViewMode('rfm')}
            style={viewMode === 'rfm' ? { background: 'var(--accent-indigo)', color: '#fff' } : {}}
          >
            <Award size={16} /> RFM Segments
          </button>
          <button 
            className={`btn-secondary ${viewMode === 'kmeans' ? 'active' : ''}`}
            onClick={() => setViewMode('kmeans')}
            style={viewMode === 'kmeans' ? { background: 'var(--accent-indigo)', color: '#fff' } : {}}
          >
            <Layers size={16} /> K-Means ML Clusters
          </button>
        </div>
      </div>

      {/* RFM Segment Summary Cards */}
      {viewMode === 'rfm' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {Object.entries(segments).map(([segName, info]) => {
            const isSelected = selectedSegmentFilter === segName;
            const color = segmentColors[segName] || '#6366f1';

            return (
              <div 
                key={segName}
                className="glass-panel"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? color : 'var(--border-color)',
                  background: isSelected ? `${color}18` : 'var(--bg-card)',
                  padding: '1rem'
                }}
                onClick={() => setSelectedSegmentFilter(isSelected ? 'ALL' : segName)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: color }}>{segName}</span>
                  <Award size={16} color={color} />
                </div>

                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {info.count} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({info.pct}%)</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Revenue: <strong>${info.totalSpend.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Avg Recency: <strong>{info.avgRecency}d</strong>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* K-Means Clusters Summary Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {kMeansClusters.map(cl => (
            <div key={cl.cluster} className="glass-panel" style={{ borderColor: 'var(--border-glow)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} /> {cl.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {cl.customers} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customers</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div>Mean Monetary Spend: <strong style={{ color: 'var(--accent-emerald)' }}>${cl.meanMonetary}</strong></div>
                <div>Mean Recency: <strong>{cl.meanRecency} days</strong></div>
                <div>Mean Order Frequency: <strong>{cl.meanFrequency} orders</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive 2D Customer Map & High Churn Risk List */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Recency vs Spend Scatter Chart */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} color="var(--accent-indigo)" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {viewMode === 'rfm' ? 'RFM Behavioral Customer Landscape' : 'K-Means 4-Cluster Distribution'}
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recency (Days) vs Monetary Spend ($)</span>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" dataKey="x" name="Recency (Days)" stroke="var(--text-muted)" fontSize={11} unit="d" />
                <YAxis type="number" dataKey="y" name="Total Spend" stroke="var(--text-muted)" fontSize={11} unit="$" />
                <ZAxis type="number" dataKey="z" range={[60, 300]} name="Orders" />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(val, name) => [
                    name === 'Total Spend' ? `$${val.toLocaleString()}` : `${val} days`,
                    name
                  ]}
                />
                <Scatter name="Customers" data={scatterData} fill="#6366f1" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* At Risk Customer List */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-rose)' }}>
            <AlertTriangle size={18} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>At-Risk VIP Accounts</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '310px', overflowY: 'auto' }}>
            {customers
              .filter(c => c.rfmSegment === 'At Risk' || c.rfmSegment === 'High Value At Risk' || c.churnRisk >= 60)
              .sort((a, b) => b.totalSpend - a.totalSpend)
              .slice(0, 6)
              .map(cust => (
                <div 
                  key={cust.id} 
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--accent-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{cust.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Spend: <strong style={{ color: 'var(--accent-emerald)' }}>${cust.totalSpend.toFixed(2)}</strong> | Recency: {cust.recencyDays}d
                    </div>
                  </div>

                  <button 
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.3)' }}
                    onClick={() => handleSendRetention(cust)}
                  >
                    <Mail size={14} /> Offer
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Customer Master Intelligence Table</h3>
          
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="custom-input"
              placeholder="Search customer or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '30px', width: '100%', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Country</th>
                <th>Transactions</th>
                <th>Total Spend ($)</th>
                <th>Recency (Days)</th>
                <th>RFM Score</th>
                <th>RFM Segment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.slice(0, 15).map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{c.id}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.gender}</td>
                  <td>{c.country}</td>
                  <td style={{ fontWeight: 600 }}>{c.orders}</td>
                  <td style={{ fontWeight: 700 }}>${c.totalSpend.toFixed(2)}</td>
                  <td>{c.recencyDays}d</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-cyan)' }}>{c.rfmScore}</td>
                  <td>
                    <span 
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: `${segmentColors[c.rfmSegment] || '#6366f1'}20`,
                        color: segmentColors[c.rfmSegment] || '#6366f1'
                      }}
                    >
                      {c.rfmSegment}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedItemModal(c)}
                    >
                      <Eye size={14} /> Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
