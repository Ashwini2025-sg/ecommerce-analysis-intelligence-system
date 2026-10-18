import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { filterTransactions, computeExecutiveKPIs } from '../data/analyticsEngine';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { 
  Database, 
  Upload, 
  FileText, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  FileSpreadsheet,
  Printer,
  Sparkles
} from 'lucide-react';

export function DataHub() {
  const { transactions, products, filters, importDataset, resetDataset, showToast } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);

  const filteredTx = filterTransactions(transactions, filters);
  const kpis = computeExecutiveKPIs(filteredTx);

  // Handle CSV Upload via PapaParse
  const handleFileUpload = (file) => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const parsedTransactions = results.data.map((row, idx) => ({
            id: row['Order ID'] || row.id || `ORD-IMP-${1000 + idx}`,
            date: row.Date || row.date || new Date().toISOString(),
            customerName: row.Customer || row.customerName || 'Anonymous Customer',
            customerId: row['Customer ID'] || row.customerId || `CUST-IMP-${idx}`,
            region: row.Region || row.region || 'North America',
            productCategory: row.Category || row.productCategory || 'Electronics',
            productName: row.Product || row.productName || 'Custom Product Item',
            quantity: parseInt(row.Quantity || row.quantity || '1', 10),
            unitPrice: parseFloat(row.Price || row.unitPrice || '99.99'),
            totalAmount: parseFloat(row.Total || row.totalAmount || '99.99'),
            profit: parseFloat(row.Profit || row.profit || '30.00'),
            status: row.Status || row.status || 'Completed'
          }));

          importDataset(parsedTransactions);
          setUploadStats({
            fileName: file.name,
            recordCount: parsedTransactions.length,
            importedAt: new Date().toLocaleTimeString()
          });

          // Trigger festive confetti!
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } else {
          showToast('Uploaded CSV file appears empty or unparseable.', 'error');
        }
      },
      error: (err) => {
        showToast(`CSV Parsing Error: ${err.message}`, 'error');
      }
    });
  };

  // Export Filtered CSV
  const handleExportCSV = () => {
    const csvContent = Papa.unparse(filteredTx);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ecommerce_Analytics_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Filtered transactions exported to CSV!', 'success');
  };

  // Download Sample Template CSV
  const handleDownloadSampleCSV = () => {
    const sampleData = [
      { id: 'ORD-9001', date: '2026-10-01', customerId: 'CUST-201', customerName: 'Alice Smith', region: 'North America', productCategory: 'Electronics', productName: 'Noise-Canceling Headphones', quantity: 1, unitPrice: 299.99, totalAmount: 299.99, profit: 140.00, status: 'Completed' },
      { id: 'ORD-9002', date: '2026-10-02', customerId: 'CUST-202', customerName: 'Bob Jones', region: 'Europe', productCategory: 'Fashion', productName: 'Wool Sweater', quantity: 2, unitPrice: 119.00, totalAmount: 238.00, profit: 110.00, status: 'Completed' }
    ];
    const csvContent = Papa.unparse(sampleData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_ecommerce_dataset_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Executive PDF Report
  const handleExportPDF = async () => {
    showToast('Generating high-resolution Executive PDF report...', 'info');
    
    // Create print preview printable window / jsPDF output
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(15, 23, 42);
    pdf.text("E-COMMERCE EXECUTIVE INTELLIGENCE REPORT", 15, 20);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated on: ${new Date().toLocaleString()} | Scope: ${filters.timeRange} (${filters.category} Category)`, 15, 27);
    
    pdf.setDrawColor(99, 102, 241);
    pdf.setLineWidth(0.5);
    pdf.line(15, 30, 195, 30);

    // KPI Summary Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text("1. Executive Key Performance Indicators", 15, 40);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Gross Revenue:  $${kpis.totalRevenue.toLocaleString()}`, 20, 48);
    pdf.text(`Net Operating Profit:  $${kpis.totalProfit.toLocaleString()} (Margin: ${kpis.profitMarginPct.toFixed(1)}%)`, 20, 55);
    pdf.text(`Total Completed Orders:  ${kpis.totalOrders} Orders`, 20, 62);
    pdf.text(`Average Order Value (AOV):  $${kpis.avgOrderValue.toFixed(2)}`, 20, 69);
    pdf.text(`Active Customer Base:  ${kpis.uniqueCustomers} Unique Shoppers`, 20, 76);

    // Top Transaction Preview Table
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text("2. Key Transaction Audit Log (Latest 5)", 15, 90);

    let yPos = 98;
    filteredTx.slice(0, 5).forEach((tx, i) => {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${i+1}. ${tx.id} | ${tx.customerName} | ${tx.productName} | $${tx.totalAmount.toFixed(2)} [${tx.status}]`, 20, yPos);
      yPos += 7;
    });

    pdf.save(`Executive_Intelligence_Report_${new Date().toISOString().substring(0, 10)}.pdf`);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    showToast('Executive PDF Report downloaded successfully!', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Data Hub & Custom Dataset Importer
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Import custom transactional CSV data, validate schemas, or export structured executive PDF/CSV reports.
        </p>
      </div>

      {/* Drag and Drop Uploader & Export Hub Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* CSV Drag and Drop Box */}
        <div 
          className="glass-panel"
          style={{
            border: dragOver ? '2px dashed var(--accent-indigo)' : '2px dashed var(--border-color)',
            background: dragOver ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer'
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <div style={{ background: 'var(--gradient-cyan)', padding: '0.85rem', borderRadius: '50%', color: '#fff', marginBottom: '1rem' }}>
            <Upload size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Drag & Drop Custom CSV Dataset Here
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Supports standard e-commerce CSV schemas with columns for Order ID, Date, Customer, Amount, Category.
          </p>

          <label className="btn-primary" style={{ cursor: 'pointer' }}>
            Browse Computer Files
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
          </label>

          <button 
            className="btn-secondary" 
            style={{ marginTop: '0.75rem', fontSize: '0.75rem', border: 'none' }}
            onClick={handleDownloadSampleCSV}
          >
            <Download size={14} /> Download Sample CSV Template
          </button>
        </div>

        {/* Export & Report Generation Hub */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FileSpreadsheet size={20} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Executive PDF & CSV Export Hub</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Generate branded executive PDF intelligence reports containing current KPI breakdowns, customer segment distributions, and recent transactional logs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={handleExportPDF} style={{ width: '100%', justifyContent: 'center' }}>
                <Printer size={18} /> Export Executive PDF Intelligence Report
              </button>

              <button className="btn-secondary" onClick={handleExportCSV} style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={18} /> Export Filtered Transactions to CSV
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Restore default dataset:</span>
            <button className="btn-secondary" onClick={resetDataset} style={{ fontSize: '0.8rem' }}>
              <RotateCcw size={14} /> Reset System Data
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Statistics Box */}
      {uploadStats && (
        <div className="glass-panel" style={{ borderColor: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="var(--accent-emerald)" />
            <div>
              <strong style={{ color: 'var(--accent-emerald)' }}>Dataset Successfully Loaded!</strong>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                File: <strong>{uploadStats.fileName}</strong> | Loaded <strong>{uploadStats.recordCount}</strong> custom transactional rows at {uploadStats.importedAt}.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
