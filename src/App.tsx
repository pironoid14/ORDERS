import React, { useState, useEffect } from 'react';
import { initialOrders } from './data/initialOrders';
import { Order, OrderSource, OrderStatus, PaymentStatus } from './types';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { AIAdvisor } from './components/AIAdvisor';
import { SalesCharts } from './components/SalesCharts';
import { OrdersTable } from './components/OrdersTable';
import { AddOrderModal } from './components/AddOrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';

const STORAGE_KEY = 'omnisales_orders_v1';

export default function App() {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load orders from localStorage:', e);
    }
    return initialOrders;
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | OrderSource>('all');
  const [productFilter, setProductFilter] = useState<string | undefined>(undefined);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState<'manual' | 'whatsapp' | 'spreadsheet' | 'handwritten'>('manual');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  }, [orders]);

  // Actions
  const handleAddOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.orderNumber} successfully ingested from ${newOrder.source}!`);
  };

  const handleBatchAddOrders = (newOrders: Order[]) => {
    setOrders((prev) => [...newOrders, ...prev]);
    showToast(`Imported ${newOrders.length} orders from spreadsheet batch!`);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
      setSelectedOrderDetail((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Order status updated to ${newStatus}`);
  };

  const handleUpdatePaymentStatus = (orderId: string, newPaymentStatus: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
    );
    if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
      setSelectedOrderDetail((prev) => prev ? { ...prev, paymentStatus: newPaymentStatus } : null);
    }
    showToast(`Payment status updated to ${newPaymentStatus}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
      setSelectedOrderDetail(null);
    }
    showToast('Order removed from records');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all orders to original sample demonstration records?')) {
      setOrders(initialOrders);
      localStorage.removeItem(STORAGE_KEY);
      setStatusFilter('all');
      setSourceFilter('all');
      setProductFilter(undefined);
      setSearchQuery('');
      showToast('Demo sales records restored.');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Order Number', 'Date', 'Customer', 'Phone', 'Source', 'Total', 'Status', 'Payment Status', 'Items'];
      const rows = orders.map((o) => [
        o.orderNumber,
        o.date,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
        o.source,
        o.total.toFixed(2),
        o.status,
        o.paymentStatus,
        `"${o.items.map((i) => `${i.quantity}x ${i.name}`).join('; ').replace(/"/g, '""')}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `OmniSales_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Orders exported to CSV file.');
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  const openAddModalWithTab = (tab: 'manual' | 'whatsapp' | 'spreadsheet' | 'handwritten' = 'manual') => {
    setAddModalTab(tab);
    setIsAddModalOpen(true);
  };

  const handleSelectOrderById = (orderId: string) => {
    const found = orders.find((o) => o.orderNumber === orderId || o.id === orderId);
    if (found) {
      setSelectedOrderDetail(found);
    } else {
      setSearchQuery(orderId);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/80 text-stone-900 flex flex-col font-sans">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-stone-100 text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg border border-stone-800 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation */}
      <Header
        orders={orders}
        onOpenAddModal={openAddModalWithTab}
        onOpenAIAdvisor={() => {
          window.scrollTo({ top: 180, behavior: 'smooth' });
        }}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Summary Cards */}
        <MetricsCards
          orders={orders}
          onFilterByStatus={(st) => setStatusFilter(st)}
          onFilterBySource={(src) => setSourceFilter(src)}
        />

        {/* AI Sales Insights & Natural Language Decision Q&A */}
        <AIAdvisor
          orders={orders}
          onSelectOrder={handleSelectOrderById}
        />

        {/* Charts & Product Performance */}
        <SalesCharts
          orders={orders}
          onFilterProduct={(prod) => setProductFilter(prod)}
          onFilterSource={(src) => setSourceFilter(src)}
        />

        {/* Tabular Orders Management View */}
        <OrdersTable
          orders={orders}
          onSelectOrder={(ord) => setSelectedOrderDetail(ord)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteOrder={handleDeleteOrder}
          selectedStatusFilter={statusFilter}
          onChangeStatusFilter={setStatusFilter}
          selectedSourceFilter={sourceFilter}
          onChangeSourceFilter={setSourceFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          productFilter={productFilter}
          onClearProductFilter={() => setProductFilter(undefined)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-5 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} OmniSales · Unified Small Business Order & Decision System</p>
          <div className="flex items-center gap-4 text-2xs text-stone-400">
            <span>WhatsApp Ingestion</span>
            <span>·</span>
            <span>Spreadsheets</span>
            <span>·</span>
            <span>Handwritten OCR</span>
            <span>·</span>
            <span>Direct Sales</span>
          </div>
        </div>
      </footer>

      {/* Add Order Ingestion Modal */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddOrder={handleAddOrder}
        onBatchAddOrders={handleBatchAddOrders}
        initialTab={addModalTab}
      />

      {/* Order Details / Printable Receipt Modal */}
      <OrderDetailModal
        order={selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />
    </div>
  );
}
