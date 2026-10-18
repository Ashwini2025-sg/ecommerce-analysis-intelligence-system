import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TOPIC_KEYWORDS } from '../data/mockData';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Meh, 
  Sparkles, 
  Tag, 
  Star 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';

export function SentimentNLP() {
  const { reviews } = useApp();
  const [sentimentFilter, setSentimentFilter] = useState('ALL');

  const filteredReviews = reviews.filter(r => {
    if (sentimentFilter !== 'ALL' && r.sentiment !== sentimentFilter) return false;
    return true;
  });

  const posCount = reviews.filter(r => r.sentiment === 'Positive').length;
  const neuCount = reviews.filter(r => r.sentiment === 'Neutral').length;
  const negCount = reviews.filter(r => r.sentiment === 'Negative').length;

  const pieData = [
    { name: 'Positive', value: posCount, color: '#10b981' },
    { name: 'Neutral', value: neuCount, color: '#f59e0b' },
    { name: 'Negative', value: negCount, color: '#f43f5e' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Customer Sentiment & Voice of Customer (VoC) NLP
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Natural language processing sentiment breakdown, topic keyword extractors, and review insights.
        </p>
      </div>

      {/* Sentiment Overview & Keyword Cloud Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Sentiment Pie Breakdown */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <MessageSquare size={18} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Sentiment Split</h3>
          </div>

          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{posCount}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Positive</span>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{neuCount}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Neutral</span>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-rose)' }}>{negCount}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Negative</span>
            </div>
          </div>
        </div>

        {/* NLP Topic Keyword Cloud */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Extracted Sentiment Keywords & Topics</h3>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '0.5rem 0' }}>
            {TOPIC_KEYWORDS.map((kw, i) => {
              let bg = 'rgba(16, 185, 129, 0.12)';
              let border = 'var(--accent-emerald)';
              let color = 'var(--accent-emerald)';

              if (kw.sentiment === 'negative') {
                bg = 'rgba(244, 63, 94, 0.12)';
                border = 'var(--accent-rose)';
                color = 'var(--accent-rose)';
              } else if (kw.sentiment === 'neutral') {
                bg = 'rgba(245, 158, 11, 0.12)';
                border = 'var(--accent-amber)';
                color = 'var(--accent-amber)';
              }

              return (
                <div 
                  key={i}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    color: color,
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Tag size={12} />
                  <span>{kw.text}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({kw.count})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Reviews Explorer Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Customer Voice Feed</h3>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn-secondary ${sentimentFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSentimentFilter('ALL')}
            >
              All ({reviews.length})
            </button>
            <button 
              className={`btn-secondary ${sentimentFilter === 'Positive' ? 'active' : ''}`}
              onClick={() => setSentimentFilter('Positive')}
              style={{ color: 'var(--accent-emerald)' }}
            >
              Positive ({posCount})
            </button>
            <button 
              className={`btn-secondary ${sentimentFilter === 'Negative' ? 'active' : ''}`}
              onClick={() => setSentimentFilter('Negative')}
              style={{ color: 'var(--accent-rose)' }}
            >
              Negative ({negCount})
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Sentiment Score</th>
                <th>Extracted Topic</th>
                <th>Customer Review</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map(rev => (
                <tr key={rev.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{rev.productName}</td>
                  <td>{rev.customerName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-amber)' }}>
                      <Star size={14} fill="currentColor" />
                      <strong>{rev.rating}.0</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill status-${rev.sentiment === 'Positive' ? 'completed' : rev.sentiment === 'Negative' ? 'returned' : 'pending'}`}>
                      {rev.sentiment} ({rev.score > 0 ? `+${rev.score}` : rev.score})
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rev.topic}</td>
                  <td style={{ maxWidth: '340px', fontStyle: 'italic', color: 'var(--text-primary)' }}>"{rev.comment}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
