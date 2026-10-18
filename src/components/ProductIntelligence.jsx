import React from 'react';
import { useApp } from '../context/AppContext';
import { filterTransactions, computeBCGProductMatrix, computeMarketBasketAnalysis } from '../data/analyticsEngine';
import { 
  Package, 
  Sparkles, 
  AlertTriangle, 
  ShoppingCart, 
  ArrowRight,
  TrendingUp,
  Layers,
  Zap
} from 'lucide-react';

export function ProductIntelligence() {
  const { products, transactions, filters, setSelectedItemModal, showToast } = useApp();

  const filteredTx = filterTransactions(transactions, filters);
  const bcgProducts = computeBCGProductMatrix(products, filteredTx);
  const basketRules = computeMarketBasketAnalysis(filteredTx);

  const stars = bcgProducts.filter(p => p.bcgCategory === 'Star');
  const cashCows = bcgProducts.filter(p => p.bcgCategory === 'Cash Cow');
  const questionMarks = bcgProducts.filter(p => p.bcgCategory === 'Question Mark');
  const dogs = bcgProducts.filter(p => p.bcgCategory === 'Dog');

  const lowStockItems = bcgProducts.filter(p => p.stockLevel <= p.reorderPoint);

  const handleCreateBundle = (rule) => {
    showToast(`Cross-selling promotion bundle created for '${rule.itemA}' + '${rule.itemB}'!`, 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Product Portfolio Intelligence & Inventory Matrix
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          BCG Matrix classification, stockout reorder triggers, and Market Basket co-occurrence rules.
        </p>
      </div>

      {/* BCG Matrix & Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* BCG Matrix Quad */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>BCG Growth-Share Product Matrix</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volume vs Margin Breakdown</span>
          </div>

          <div className="bcg-grid-container">
            {/* Stars */}
            <div className="bcg-quadrant bcg-quadrant-star">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--accent-purple)', fontSize: '0.85rem' }}>⭐ STARS (High Volume, High Margin)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stars.length} Items</span>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {stars.map(p => (
                  <div key={p.id} style={{ fontSize: '0.8rem', background: 'rgba(168,85,247,0.1)', padding: '0.35rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedItemModal(p)}>
                    {p.name} <span style={{ float: 'right', fontWeight: 600 }}>${p.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Marks */}
            <div className="bcg-quadrant bcg-quadrant-question">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--accent-amber)', fontSize: '0.85rem' }}>❓ QUESTION MARKS (Low Vol, High Margin)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{questionMarks.length} Items</span>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {questionMarks.map(p => (
                  <div key={p.id} style={{ fontSize: '0.8rem', background: 'rgba(245,158,11,0.1)', padding: '0.35rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedItemModal(p)}>
                    {p.name} <span style={{ float: 'right', fontWeight: 600 }}>${p.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cash Cows */}
            <div className="bcg-quadrant bcg-quadrant-cow">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>🐄 CASH COWS (High Vol, Mod Margin)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cashCows.length} Items</span>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {cashCows.map(p => (
                  <div key={p.id} style={{ fontSize: '0.8rem', background: 'rgba(16,185,129,0.1)', padding: '0.35rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedItemModal(p)}>
                    {p.name} <span style={{ float: 'right', fontWeight: 600 }}>${p.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dogs */}
            <div className="bcg-quadrant bcg-quadrant-dog">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>⚠️ DOGS (Low Vol, Low Margin)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dogs.length} Items</span>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {dogs.map(p => (
                  <div key={p.id} style={{ fontSize: '0.8rem', background: 'rgba(244,63,94,0.1)', padding: '0.35rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedItemModal(p)}>
                    {p.name} <span style={{ float: 'right', fontWeight: 600 }}>${p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Feed */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-amber)' }}>
            <AlertTriangle size={18} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Reorder Threshold Alerts</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {lowStockItems.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                All inventory levels operating within safe stock bounds!
              </div>
            ) : (
              lowStockItems.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-amber)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Stock Left: <strong style={{ color: 'var(--accent-rose)' }}>{p.stockLevel} units</strong> | Reorder level: {p.reorderPoint}
                  </div>
                  <button 
                    className="btn-secondary" 
                    style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem', padding: '0.25rem' }}
                    onClick={() => showToast(`Automated purchase order generated for 50 units of ${p.name}`, 'success')}
                  >
                    Generate Purchase Order
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Market Basket Co-occurrence Rules */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShoppingCart size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Market Basket Cross-Selling Intelligence</h3>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Primary Category (Item A)</th>
                <th>Co-Purchased (Item B)</th>
                <th>Support %</th>
                <th>Confidence %</th>
                <th>Lift Multiplier</th>
                <th>Strategic Bundle Recommendation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {basketRules.map((rule, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{rule.itemA}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{rule.itemB}</td>
                  <td>{rule.support}%</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{rule.confidence}%</td>
                  <td><strong style={{ color: 'var(--accent-purple)' }}>{rule.lift}x</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{rule.recommendation}</td>
                  <td>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleCreateBundle(rule)}
                    >
                      <Zap size={14} /> Launch Promo
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
