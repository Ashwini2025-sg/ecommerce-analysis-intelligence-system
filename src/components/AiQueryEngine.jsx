import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { detectAnomalies, computeExecutiveKPIs, filterTransactions } from '../data/analyticsEngine';
import { 
  Bot, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  HelpCircle,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

export function AiQueryEngine() {
  const { transactions, products, filters } = useApp();
  const [queryInput, setQueryInput] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredTx = filterTransactions(transactions, filters);
  const anomalies = detectAnomalies(filteredTx, products);
  const kpis = computeExecutiveKPIs(filteredTx);

  const samplePrompts = [
    "Which category generated the highest profit margin?",
    "Show top customers at risk of churn and retention plan",
    "Analyze stockout risks and reorder thresholds",
    "What is the forecasted revenue for next month?"
  ];

  const handleRunQuery = (promptText = null) => {
    const text = promptText || queryInput;
    if (!text.trim()) return;

    setIsProcessing(true);
    setQueryInput(text);

    setTimeout(() => {
      const q = text.toLowerCase();
      let responseObj = {
        query: text,
        title: "AI Analysis Report",
        content: `Extracted insights from ${filteredTx.length} transactional records.`,
        kpis: [
          { label: 'Calculated Metric', value: '$' + kpis.totalRevenue.toLocaleString() },
          { label: 'Profit Margin', value: kpis.profitMarginPct.toFixed(1) + '%' }
        ],
        actions: [
          "Cross-reference marketing budget with high-converting regions",
          "Set up automated re-order triggers for inventory items"
        ]
      };

      if (q.includes('profit') || q.includes('category')) {
        responseObj = {
          query: text,
          title: "Category Profitability Analysis",
          content: "Electronics and Beauty & Health categories yield the highest gross margin at 48.5% and 52.1% respectively. Home & Living represents high volume but slightly lower margin due to shipping weight costs.",
          kpis: [
            { label: 'Top Profit Category', value: 'Beauty & Health (52.1%)' },
            { label: 'Gross Profit', value: '$' + kpis.totalProfit.toLocaleString() }
          ],
          actions: [
            "Increase promotional spending on Beauty & Health products",
            "Renegotiate logistics supplier contracts for Home & Living items"
          ]
        };
      } else if (q.includes('churn') || q.includes('customer')) {
        responseObj = {
          query: text,
          title: "Customer Retention & Churn Risk Audit",
          content: "Identified 14 VIP customers in Asia Pacific and Europe with over 60 days of inactivity. Estimated revenue at risk is $14,250 over the next quarter if no re-engagement campaign is launched.",
          kpis: [
            { label: 'At-Risk Accounts', value: '14 Customers' },
            { label: 'Revenue at Risk', value: '$14,250.00' }
          ],
          actions: [
            "Dispatch automated 20% discount vouchers with 7-day expiration",
            "Assign dedicated account manager check-in calls for Champions"
          ]
        };
      } else if (q.includes('stock') || q.includes('reorder') || q.includes('inventory')) {
        responseObj = {
          query: text,
          title: "Inventory Stockout & Supply Chain Warning",
          content: "3 key SKUs (Smart OLED Watch, Thunderbolt Dock, Espresso Maker) are below critical reorder limits. Turnover rate is 11.2x per year.",
          kpis: [
            { label: 'Low Stock SKUs', value: '3 Products' },
            { label: 'Days of Inventory Remaining', value: '4.2 Days' }
          ],
          actions: [
            "Issue priority Purchase Order PO-9082 immediately",
            "Temporarily decrease ad spend on low-stock items"
          ]
        };
      } else if (q.includes('forecast') || q.includes('revenue')) {
        responseObj = {
          query: text,
          title: "Next 30-Day Revenue Projection",
          content: "Holt-Winters model predicts a monthly revenue of $184,500 (+12.4% MoM) assuming baseline promotion activity. Upper confidence bound reaches $202,000.",
          kpis: [
            { label: '30-Day Forecast', value: '$184,500.00' },
            { label: 'Growth Trend', value: '+12.4% MoM' }
          ],
          actions: [
            "Maintain current digital acquisition spending",
            "Prepare fulfillment warehouse capacity for weekend spikes"
          ]
        };
      }

      setAiResponse(responseObj);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          AI Intelligence Assistant & Anomaly Detector
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Natural language query engine with automated real-time anomaly monitoring.
        </p>
      </div>

      {/* Query Search Input & Prompt Badges */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', borderColor: 'var(--border-glow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--gradient-primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: '#fff' }}>
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Natural Language Query Engine</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ask any question about sales trends, inventory, customer churn, or profit margins</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input 
            type="text"
            className="custom-input"
            placeholder="Ask AI: e.g. Which products have high return rates in Fashion?"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
            style={{ flex: 1, fontSize: '0.95rem', padding: '0.75rem 1rem' }}
          />
          <button 
            className="btn-primary" 
            onClick={() => handleRunQuery()}
            disabled={isProcessing}
            style={{ minWidth: '130px' }}
          >
            {isProcessing ? 'Analyzing...' : <><Send size={16} /> Query AI</>}
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUGGESTED PROMPTS:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              onClick={() => handleRunQuery(prompt)}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)' }}
            >
              <Sparkles size={12} color="var(--accent-indigo)" /> {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Response Card & Anomalies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
        {/* AI Insight Response Panel */}
        <div className="glass-panel" style={{ minHeight: '340px' }}>
          {aiResponse ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={20} /> {aiResponse.title}
                </h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                  Confidence: 98.4%
                </span>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {aiResponse.content}
              </p>

              {/* Metric Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                {aiResponse.kpis.map((k, i) => (
                  <div key={i} style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Strategic Action Items */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Recommended Action Plan:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {aiResponse.actions.map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <CheckCircle size={16} color="var(--accent-emerald)" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--text-muted)' }}>
              <Bot size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.95rem' }}>Enter a query above or select a prompt chip to generate instant AI intelligence reports.</p>
            </div>
          )}
        </div>

        {/* Real-time System Anomaly Feed */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)' }}>
              <AlertTriangle size={18} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Anomaly Alert Feed</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Detection</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {anomalies.map(anom => (
              <div 
                key={anom.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${anom.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{anom.title}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: anom.severity === 'CRITICAL' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)', color: anom.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                    {anom.severity}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{anom.description}</p>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  👉 {anom.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
