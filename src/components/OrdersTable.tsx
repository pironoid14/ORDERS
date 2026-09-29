import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Trash2, 
  Check, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  X,
  LayoutList,
  Table as TableIcon
} from 'lucide-react';
import { Order, OrderSource, OrderStatus } from '../types';
import { formatCurrency, formatDate, getSourceInfo, getStatusInfo, getPaymentStatusInfo } from '../utils/formatters';

interface OrdersTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  selectedStatusFilter: 'all' | OrderStatus;
  onChangeStatusFilter: (status: 'all' | OrderStatus) => void;
  selectedSourceFilter: 'all' | OrderSource;
  onChangeSourceFilter: (source: 'all' | OrderSource) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  productFilter?: string;
  onClearProductFilter?: () => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onSelectOrder,
  onUpdateStatus,
  onDeleteOrder,
  selectedStatusFilter,
  onChangeStatusFilter,
  selectedSourceFilter,
  onChangeSourceFilter,
  searchQuery,
  onSearchChange,
  productFilter,
  onClearProductFilter,
}) => {
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'total-desc' | 'total-asc'>('date-desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  const toggleRow = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  // Status counts for badge indicators
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  // Filter and sort
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Status filter
        if (selectedStatusFilter !== 'all' && o.status !== selectedStatusFilter) {
          return false;
        }

        // Source channel filter
        if (selectedSourceFilter !== 'all' && o.source !== selectedSourceFilter) {
          return false;
        }

        // Product filter (if clicked from product performance)
        if (productFilter) {
          const hasProduct = o.items.some((item) =>
            item.name.toLowerCase().includes(productFilter.toLowerCase())
          );
          if (!hasProduct) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNumber = o.orderNumber.toLowerCase().includes(q);
          const matchCustomer = o.customerName.toLowerCase().includes(q);
          const matchPhone = o.customerPhone?.toLowerCase().includes(q);
          const matchNotes = o.notes?.toLowerCase().includes(q);
          const matchItem = o.items.some((it) => it.name.toLowerCase().includes(q));
          const matchSource = o.sourceDetail?.toLowerCase().includes(q);
          if (!matchNumber && !matchCustomer && !matchPhone && !matchNotes && !matchItem && !matchSource) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortOption === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortOption === 'total-desc') {
          return b.total - a.total;
        }
        if (sortOption === 'total-asc') {
          return a.total - b.total;
        }
        return 0;
      });
  }, [orders, selectedStatusFilter, selectedSourceFilter, searchQuery, productFilter, sortOption]);

  const statusOptions: Array<{ id: 'all' | OrderStatus; label: string }> = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const sourceOptions: Array<{ id: 'all' | OrderSource; label: string }> = [
    { id: 'all', label: 'All Sources' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'spreadsheet', label: 'Spreadsheets' },
    { id: 'handwritten', label: 'Handwritten' },
    { id: 'direct', label: 'Direct Store' },
  ];

  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-xl overflow-hidden shadow-2xs space-y-0 transition-colors">
      {/* Control Header & Filters */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
                <span>Orders Registry</span>
                <span className="text-2xs sm:text-xs font-semibold px-2 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {filteredOrders.length} of {orders.length}
                </span>
              </h3>
              <p className="text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
                Manage unified orders across WhatsApp, spreadsheets, handwritten slips & counter
              </p>
            </div>

            {/* Mobile View Toggle Button (Cards vs Table on small screens) */}
            <div className="flex md:hidden items-center gap-1 p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMobileViewMode('cards')}
                className={`p-1.5 rounded-md ${mobileViewMode === 'cards' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500'}`}
                title="Card View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('table')}
                className={`p-1.5 rounded-md ${mobileViewMode === 'table' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500'}`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search customer, order #, item or phone..."
              className="w-full text-xs pl-9 pr-8 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/20 dark:focus:ring-amber-500/20 focus:border-amber-800 dark:focus:border-amber-500 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100/90 dark:bg-stone-800/80 rounded-lg overflow-x-auto max-w-full scrollbar-none">
            {statusOptions.map((opt) => {
              const count = statusCounts[opt.id];
              const isSelected = selectedStatusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeStatusFilter(opt.id)}
                  className={`px-2.5 sm:px-3 py-1.5 text-2xs sm:text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-2xs px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-stone-100 dark:bg-stone-600 text-stone-700 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Source filter & Sort */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Active Product Filter Pill */}
            {productFilter && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-lg">
                <span className="truncate max-w-[140px]">Product: {productFilter}</span>
                <button onClick={onClearProductFilter} className="hover:text-amber-950 dark:hover:text-amber-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Source Channel Filter */}
            <div className="relative">
              <select
                value={selectedSourceFilter}
                onChange={(e) => onChangeSourceFilter(e.target.value as any)}
                className="text-2xs sm:text-xs pl-3 pr-7 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-800 appearance-none font-medium cursor-pointer"
              >
                {sourceOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="text-2xs sm:text-xs pl-3 pr-7 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-800 appearance-none font-medium cursor-pointer"
              >
                <option value="date-desc">Newest Date</option>
                <option value="date-asc">Oldest Date</option>
                <option value="total-desc">Highest Revenue</option>
                <option value="total-asc">Lowest Revenue</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW (Displayed on mobile when cards mode is active) */}
      <div className={`${mobileViewMode === 'cards' ? 'block md:hidden' : 'hidden'} p-3 space-y-3`}>
        {filteredOrders.length === 0 ? (
          <div className="py-10 text-center text-stone-500 dark:text-stone-400 text-xs">
            No matching orders found.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedRows.has(order.id);
            const sourceMeta = getSourceInfo(order.source);
            const statusMeta = getStatusInfo(order.status);
            const paymentMeta = getPaymentStatusInfo(order.paymentStatus);

            return (
              <div 
                key={order.id}
                className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-850 space-y-2.5 transition-colors"
              >
                {/* Top row: order number, source badge, total */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
                      {order.orderNumber}
                    </span>
                    <span className="text-stone-400 dark:text-stone-500 text-2xs">·</span>
                    <span className="text-2xs text-stone-500 dark:text-stone-400">
                      {formatDate(order.date)}
                    </span>
                  </div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 font-mono text-sm">
                    {formatCurrency(order.total)}
                  </div>
                </div>

                {/* Customer & channel row */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-stone-900 dark:text-stone-100">{order.customerName}</div>
                    <div className="text-2xs text-stone-500 dark:text-stone-400 truncate max-w-[180px]">
                      {order.customerPhone || order.customerAddress || 'Direct Store'}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-2xs font-medium capitalize"
                    style={{
                      borderColor: order.source === 'whatsapp' ? '#a7f3d0' : order.source === 'spreadsheet' ? '#bae6fd' : order.source === 'handwritten' ? '#fde68a' : '#e7e5e4',
                      backgroundColor: order.source === 'whatsapp' ? '#f0fdf4' : order.source === 'spreadsheet' ? '#f0f9ff' : order.source === 'handwritten' ? '#fffbeb' : '#fafaf9',
                      color: order.source === 'whatsapp' ? '#166534' : order.source === 'spreadsheet' ? '#0369a1' : order.source === 'handwritten' ? '#92400e' : '#44403c',
                    }}
                  >
                    {order.source === 'whatsapp' && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                    {order.source === 'spreadsheet' && <FileSpreadsheet className="w-3 h-3 text-sky-600" />}
                    {order.source === 'handwritten' && <FileText className="w-3 h-3 text-amber-700" />}
                    <span>{sourceMeta.label}</span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 p-2 rounded-lg border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between">
                  <span className="truncate max-w-[220px]">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleRow(order.id)}
                    className="text-2xs font-semibold text-amber-800 dark:text-amber-400 shrink-0 ml-2"
                  >
                    {isExpanded ? 'Less' : 'Items'}
                  </button>
                </div>

                {/* Expanded items breakdown in mobile card */}
                {isExpanded && (
                  <div className="p-2.5 bg-stone-100/70 dark:bg-stone-900 rounded-lg text-2xs space-y-1.5 border border-stone-200 dark:border-stone-800">
                    <div className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Items Breakdown:</div>
                    {order.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-mono">{formatCurrency(it.total)}</span>
                      </div>
                    ))}
                    {order.rawSourceText && (
                      <div className="pt-1.5 border-t border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 italic">
                        Raw: "{order.rawSourceText}"
                      </div>
                    )}
                  </div>
                )}

                {/* Status selector & Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/80 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-2xs font-semibold rounded px-2 py-1 border appearance-none cursor-pointer focus:outline-none ${statusMeta.bg}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-semibold capitalize ${paymentMeta.badge}`}>
                      {paymentMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors"
                      title="View Invoice Slip"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete order ${order.orderNumber}?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL DESKTOP & TABLET TABULAR VIEW */}
      <div className={`${mobileViewMode === 'table' ? 'block' : 'hidden md:block'} overflow-x-auto`}>
        <table className="w-full text-left text-xs divide-y divide-stone-200 dark:divide-stone-800">
          <thead className="bg-stone-50/90 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wider text-2xs border-b border-stone-200 dark:border-stone-800">
            <tr>
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-4">Order Details</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Source Channel</th>
              <th className="py-3 px-4">Items Summary</th>
              <th className="py-3 px-4 text-right">Revenue</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Status & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 bg-white dark:bg-stone-900">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-stone-500 dark:text-stone-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">No matching orders found</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      Try clearing filters or adding an order via WhatsApp, Spreadsheet, or Handwritten slip.
                    </p>
                    {(selectedStatusFilter !== 'all' || selectedSourceFilter !== 'all' || searchQuery || productFilter) && (
                      <button
                        onClick={() => {
                          onChangeStatusFilter('all');
                          onChangeSourceFilter('all');
                          onSearchChange('');
                          onClearProductFilter?.();
                        }}
                        className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-400 underline"
                      >
                        Reset all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isExpanded = expandedRows.has(order.id);
                const sourceMeta = getSourceInfo(order.source);
                const statusMeta = getStatusInfo(order.status);
                const paymentMeta = getPaymentStatusInfo(order.paymentStatus);

                return (
                  <React.Fragment key={order.id}>
                    <tr 
                      className={`hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors ${
                        isExpanded ? 'bg-stone-50/40 dark:bg-stone-800/30' : ''
                      }`}
                    >
                      {/* Expand Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleRow(order.id)}
                          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
                          aria-label="Toggle items"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Order Number & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                          {order.orderNumber}
                        </div>
                        <div className="text-stone-400 dark:text-stone-500 text-2xs">
                          {formatDate(order.date)}
                        </div>
                      </td>

                      {/* Customer Name & Address */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">
                          {order.customerName}
                        </div>
                        <div className="text-stone-500 dark:text-stone-400 text-2xs truncate max-w-[180px]">
                          {order.customerPhone || order.customerAddress || 'Direct'}
                        </div>
                      </td>

                      {/* Source Channel Badge */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-xs font-medium capitalize"
                          style={{
                            borderColor: order.source === 'whatsapp' ? '#a7f3d0' : order.source === 'spreadsheet' ? '#bae6fd' : order.source === 'handwritten' ? '#fde68a' : '#e7e5e4',
                            backgroundColor: order.source === 'whatsapp' ? '#f0fdf4' : order.source === 'spreadsheet' ? '#f0f9ff' : order.source === 'handwritten' ? '#fffbeb' : '#fafaf9',
                            color: order.source === 'whatsapp' ? '#166534' : order.source === 'spreadsheet' ? '#0369a1' : order.source === 'handwritten' ? '#92400e' : '#44403c',
                          }}
                        >
                          {order.source === 'whatsapp' && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                          {order.source === 'spreadsheet' && <FileSpreadsheet className="w-3 h-3 text-sky-600" />}
                          {order.source === 'handwritten' && <FileText className="w-3 h-3 text-amber-700" />}
                          <span>{sourceMeta.label}</span>
                        </div>
                        {order.sourceDetail && (
                          <div className="text-2xs text-stone-400 dark:text-stone-500 truncate max-w-[160px] mt-0.5">
                            {order.sourceDetail}
                          </div>
                        )}
                      </td>

                      {/* Items Summary */}
                      <td className="py-3 px-4">
                        <div className="text-stone-800 dark:text-stone-200 font-medium truncate max-w-[220px]">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <div className="text-2xs text-stone-400 dark:text-stone-500">
                          {order.items.length} unique line item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-stone-900 dark:text-stone-100 font-mono text-sm">
                          {formatCurrency(order.total)}
                        </div>
                        {order.discount > 0 && (
                          <div className="text-2xs text-emerald-600 dark:text-emerald-400">
                            -${order.discount.toFixed(2)} off
                          </div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-2xs font-semibold capitalize ${paymentMeta.badge}`}>
                          {paymentMeta.label}
                        </span>
                        <div className="text-2xs text-stone-400 dark:text-stone-500 truncate max-w-[120px] mt-0.5">
                          {order.paymentMethod || 'Standard'}
                        </div>
                      </td>

                      {/* Status Dropdown & Action Icons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Inline Status Dropdown */}
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                              className={`text-xs font-semibold rounded-md pl-2 pr-6 py-1 border appearance-none cursor-pointer focus:outline-none ${statusMeta.bg}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>

                          {/* View details */}
                          <button
                            onClick={() => onSelectOrder(order)}
                            title="View order invoice & audit details"
                            className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete order ${order.orderNumber}?`)) {
                                onDeleteOrder(order.id);
                              }
                            }}
                            title="Delete order"
                            className="p-1.5 text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Line Items & Raw Audit Log */}
                    {isExpanded && (
                      <tr className="bg-stone-50/60 dark:bg-stone-950/60 border-t border-dashed border-stone-200 dark:border-stone-800">
                        <td colSpan={8} className="py-3.5 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Line items table */}
                            <div className="space-y-2">
                              <h5 className="text-2xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                Order Line Items Breakdown
                              </h5>
                              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-stone-100/60 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 text-2xs uppercase">
                                    <tr>
                                      <th className="py-1.5 px-2.5">Item</th>
                                      <th className="py-1.5 px-2 text-right">Qty</th>
                                      <th className="py-1.5 px-2 text-right">Unit Price</th>
                                      <th className="py-1.5 px-2.5 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {order.items.map((it) => (
                                      <tr key={it.id}>
                                        <td className="py-1.5 px-2.5 font-medium text-stone-800 dark:text-stone-200">{it.name}</td>
                                        <td className="py-1.5 px-2 text-right text-stone-600 dark:text-stone-400">{it.quantity}</td>
                                        <td className="py-1.5 px-2 text-right font-mono text-stone-600 dark:text-stone-400">{formatCurrency(it.unitPrice)}</td>
                                        <td className="py-1.5 px-2.5 text-right font-mono font-bold text-stone-900 dark:text-stone-100">{formatCurrency(it.total)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Raw Ingestion Record / Audit notes */}
                            <div className="space-y-2">
                              <h5 className="text-2xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                Raw Ingestion Record & Audit Slip
                              </h5>
                              <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs space-y-1.5">
                                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-2xs">
                                  <span>Captured via <strong>{sourceMeta.label}</strong></span>
                                  {order.customerPhone && <span>Phone: {order.customerPhone}</span>}
                                </div>
                                {order.rawSourceText ? (
                                  <p className="font-mono text-2xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 p-2 rounded border border-stone-100 dark:border-stone-700 leading-relaxed whitespace-pre-wrap">
                                    {order.rawSourceText}
                                  </p>
                                ) : (
                                  <p className="text-2xs text-stone-400 italic">
                                    Direct order entered manually at counter register.
                                  </p>
                                )}
                                {order.notes && (
                                  <p className="text-2xs text-amber-900 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/50 p-1.5 rounded">
                                    <strong>Fulfillment Note:</strong> {order.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
