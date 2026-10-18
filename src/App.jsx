import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { SalesAnalytics } from './components/SalesAnalytics';
import { CustomerIntelligence } from './components/CustomerIntelligence';
import { ProductIntelligence } from './components/ProductIntelligence';
import { SentimentNLP } from './components/SentimentNLP';
import { AiQueryEngine } from './components/AiQueryEngine';
import { DataHub } from './components/DataHub';
import { Modal } from './components/Modal';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react';

function AppContent() {
  const { activeTab, toastMessage, selectedItemModal, setSelectedItemModal } = useApp();

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'sales':
        return <SalesAnalytics />;
      case 'customers':
        return <CustomerIntelligence />;
      case 'products':
        return <ProductIntelligence />;
      case 'sentiment':
        return <SentimentNLP />;
      case 'ai':
        return <AiQueryEngine />;
      case 'data':
        return <DataHub />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-body">
          <FilterBar />
          {renderActiveModule()}
        </main>
      </div>

      {/* Detail Inspector Modal */}
      <Modal 
        isOpen={Boolean(selectedItemModal)} 
        onClose={() => setSelectedItemModal(null)} 
        data={selectedItemModal} 
        title="Inspector Details"
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            {toastMessage.type === 'success' ? (
              <CheckCircle size={18} color="var(--accent-emerald)" />
            ) : toastMessage.type === 'error' ? (
              <AlertTriangle size={18} color="var(--accent-rose)" />
            ) : (
              <Info size={18} color="var(--accent-cyan)" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
