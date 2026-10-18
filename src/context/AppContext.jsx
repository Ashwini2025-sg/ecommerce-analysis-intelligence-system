import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, generateSyntheticTransactions } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => INITIAL_PRODUCTS);
  const [reviews, setReviews] = useState(() => INITIAL_REVIEWS);
  const [transactions, setTransactions] = useState(() => generateSyntheticTransactions(600));
  
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [filters, setFilters] = useState({
    timeRange: 'ALL',
    category: 'ALL',
    region: 'ALL',
    status: 'ALL',
    searchQuery: ''
  });

  const [isLiveSimulating, setIsLiveSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedItemModal, setSelectedItemModal] = useState(null);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toast Notification helper
  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Live Stream Simulator Effect
  useEffect(() => {
    let interval = null;
    if (isLiveSimulating) {
      interval = setInterval(() => {
        const randProduct = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        const total = Number((randProduct.price * qty).toFixed(2));
        const profit = Number(((randProduct.price - randProduct.cost) * qty).toFixed(2));
        
        const newTx = {
          id: `ORD-LIVE-${Math.floor(Math.random() * 89999 + 10000)}`,
          date: new Date().toISOString(),
          timestamp: Date.now(),
          customerId: `CUST-${Math.floor(Math.random() * 90 + 1000)}`,
          customerName: ['Alex Mercer', 'Sarah Connor', 'John Doe', 'Emily Blunt', 'Michael Chang'][Math.floor(Math.random() * 5)],
          region: ['North America', 'Europe', 'Asia Pacific'][Math.floor(Math.random() * 3)],
          productCategory: randProduct.category,
          productId: randProduct.id,
          productName: randProduct.name,
          quantity: qty,
          unitPrice: randProduct.price,
          discountPct: 0,
          totalAmount: total,
          totalCost: Number((randProduct.cost * qty).toFixed(2)),
          profit: profit,
          paymentMethod: ['Credit Card', 'Apple Pay', 'PayPal'][Math.floor(Math.random() * 3)],
          status: 'Completed'
        };

        setTransactions(prev => [newTx, ...prev]);
        showToast(`⚡ Live Order: ${newTx.customerName} bought ${qty}x ${newTx.productName} ($${total})`, 'success');
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveSimulating, products]);

  // Reset Dataset to default
  const resetDataset = () => {
    setProducts(INITIAL_PRODUCTS);
    setReviews(INITIAL_REVIEWS);
    setTransactions(generateSyntheticTransactions(600));
    showToast('Dataset reset to default 600 synthetic transactional records!', 'success');
  };

  // Bulk Import Custom CSV/JSON
  const importDataset = (newTransactions, newProducts = null) => {
    if (Array.isArray(newTransactions) && newTransactions.length > 0) {
      setTransactions(newTransactions);
      if (newProducts && newProducts.length > 0) {
        setProducts(newProducts);
      }
      showToast(`Successfully imported ${newTransactions.length} custom records!`, 'success');
    }
  };

  const value = {
    products,
    setProducts,
    reviews,
    setReviews,
    transactions,
    setTransactions,
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    isLiveSimulating,
    setIsLiveSimulating,
    toastMessage,
    showToast,
    selectedItemModal,
    setSelectedItemModal,
    resetDataset,
    importDataset
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
