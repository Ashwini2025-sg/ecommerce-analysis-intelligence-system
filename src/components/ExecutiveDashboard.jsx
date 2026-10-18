import React from 'react';
import { useApp } from '../context/AppContext';
import { filterTransactions, computeExecutiveKPIs } from '../data/analyticsEngine';
import { KpiCard } from './KpiCard';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Percent, 
  Sparkles, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#a855f7'];

export function ExecutiveDashboard() {
  const { transactions, filters, setSelectedItemModal, setActiveTab } = useApp();

  const filteredTx = filterTransactions(transactions, filters);
  const kpis = computeExecutiveKPIs(filteredTx);

  // Group data by month for Area Chart
  const monthlyData = {};
  filteredTx.forEach(t => {
    if (t.status !== 'Returned') {
      const month = t.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { month, revenue: 0, profit: 0, orders: 0 };
      }
      monthlyData[month].revenue += t.totalAmount;
      monthlyData[month].profit += t.profit;
      monthlyData[month].orders += 1;
    }
  });

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({
      ...d,
      revenue: Math.round(d.revenue),
      profit: Math.round(d.profit)
    }));

  // Category Distribution for Donut Chart
  const categoryData = {};
  filteredTx.forEach(t => {
    if (t.status !== 'Returned') {
      categoryData[t.productCategory] = (categoryData[t.productCategory] || 0) + t.totalAmount;
    }
  });

  const pieData = Object.keys(categoryData).map(cat => ({
    name: cat,
    value: Math.round(categoryData[cat])
  }));

  return (
    <div>
      {/* Executive AI Insights Alert Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          marginBottom: '1.5rem', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--gradient-primary)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#fff' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              AI Executive Summary: Performance Accelerating
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Gross revenue is tracking at <strong style={{ color: 'var(--accent-emerald)' }}>+14.2% MoM growth</strong>. Electronics & Beauty lead profit margins, while 14 high-value customers show churn indicators in Asia Pacific.
            </p>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => setActiveTab('ai')}
          style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}
        >
          View AI Recommendations <ArrowRight size={16} />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Gross Revenue"
          value={`$${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={kpis.momGrowth}
          isPositive={kpis.momGrowth >= 0}
          icon={DollarSign}
          color="var(--accent-indigo)"
          subtitle="Net after discounts"
        />
        <KpiCard
          title="Net Profit"
          value={`$${kpis.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={11.8}
          isPositive={true}
          icon={TrendingUp}
          color="var(--accent-emerald)"
          subtitle={`Margin: ${kpis.profitMarginPct.toFixed(1)}%`}
        />
        <KpiCard
          title="Total Orders"
          value={kpis.totalOrders.toLocaleString()}
          change={8.4}
          isPositive={true}
          icon={ShoppingBag}
          color="var(--accent-cyan)"
          subtitle={`Refund Rate: ${kpis.refundRate.toFixed(1)}%`}
        />
        <KpiCard
          title="Avg Order Value (AOV)"
          value={`$${kpis.avgOrderValue.toFixed(2)}`}
          change={3.2}
          isPositive={true}
          icon={Percent}
          color="var(--accent-purple)"
          subtitle="Per completed cart"
        />
        <KpiCard
          title="Unique Customers"
          value={kpis.uniqueCustomers.toLocaleString()}
          change={15.0}
          isPositive={true}
          icon={Users}
          color="var(--accent-amber)"
          subtitle="Active shoppers"
        />
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Revenue & Profit Area Chart */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Revenue & Profit Dynamics</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Trend Breakdown</span>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                  formatter={(value) => [`$${value.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Category Revenue Share</h3>
          </div>

          <div style={{ height: '240px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {pieData.map((item, idx) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name}: ${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Recent Transaction Stream</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing latest {Math.min(10, filteredTx.length)} orders</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.slice(0, 10).map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{tx.id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{tx.date.substring(0, 10)}</td>
                  <td>{tx.customerName}</td>
                  <td style={{ fontWeight: 500 }}>{tx.productName}</td>
                  <td>{tx.productCategory}</td>
                  <td style={{ fontWeight: 700 }}>${tx.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-pill status-${tx.status.toLowerCase()}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedItemModal(tx)}
                    >
                      <Eye size={14} /> Inspect
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
