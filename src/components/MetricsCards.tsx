import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  MessageSquare,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MetricsCardsProps {
  orders: Order[];
  onFilterByStatus?: (status: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled') => void;
  onFilterBySource?: (source: 'all' | 'whatsapp' | 'spreadsheet' | 'handwritten' | 'direct') => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  orders,
  onFilterByStatus,
  onFilterBySource,
}) => {
  // Non-cancelled orders represent valid sales/demand
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const completedRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const pendingRevenue = pendingOrders.reduce((acc, o) => acc + o.total, 0);

  const processingOrders = orders.filter((o) => o.status === 'processing');
  const processingRevenue = processingOrders.reduce((acc, o) => acc + o.total, 0);

  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  // Channel Breakdown
  const whatsappRevenue = orders
    .filter((o) => o.source === 'whatsapp' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const spreadsheetRevenue = orders
    .filter((o) => o.source === 'spreadsheet' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const handwrittenRevenue = orders
    .filter((o) => o.source === 'handwritten' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const directRevenue = orders
    .filter((o) => o.source === 'direct' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <section className="space-y-4">
      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Revenue */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 sm:p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Total Gross Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight font-mono">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
            <span>Completed: <strong className="text-stone-800 dark:text-stone-200">{formatCurrency(completedRevenue)}</strong></span>
            <span>·</span>
            <span>AOV: <strong className="text-stone-800 dark:text-stone-200">{formatCurrency(averageOrderValue)}</strong></span>
          </div>
        </div>

        {/* Total Orders & Status Velocity */}
        <div 
          onClick={() => onFilterByStatus?.('all')} 
          className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 sm:p-5 shadow-2xs cursor-pointer hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight font-mono">
              {orders.length}
            </span>
            <span className="text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
              ({completedOrders.length} fulfilled)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
            <span className="text-amber-700 dark:text-amber-400 font-medium">{pendingOrders.length} pending</span>
            <span>·</span>
            <span className="text-blue-700 dark:text-blue-400 font-medium">{processingOrders.length} active</span>
            <span>·</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">{cancelledOrders.length} void</span>
          </div>
        </div>

        {/* Pending Orders & Revenue at Risk */}
        <div 
          onClick={() => onFilterByStatus?.('pending')}
          className="bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-amber-700/60 rounded-xl p-4 sm:p-5 shadow-2xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 transition-colors bg-gradient-to-b from-amber-50/50 dark:from-amber-950/30 to-white dark:to-stone-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Pending Fulfillment
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-amber-950 dark:text-amber-100 tracking-tight font-mono">
              {formatCurrency(pendingRevenue)}
            </span>
            <span className="text-2xs sm:text-xs font-semibold text-amber-800 dark:text-amber-300">
              {pendingOrders.length} orders
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 dark:border-amber-900/60 flex items-center justify-between text-2xs sm:text-xs text-amber-700 dark:text-amber-300">
            <span>Action required to capture</span>
            <span className="font-semibold underline">Filter</span>
          </div>
        </div>

        {/* Channel Dispersal & Ingestion */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 sm:p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-2xs sm:text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Channel Contribution
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1 text-2xs sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> WhatsApp: {formatCurrency(whatsappRevenue)}
              </span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full mt-2 overflow-hidden flex">
              <div 
                style={{ width: `${totalRevenue > 0 ? (whatsappRevenue / totalRevenue) * 100 : 0}%` }} 
                className="bg-emerald-500 h-full" 
                title={`WhatsApp: ${formatCurrency(whatsappRevenue)}`} 
              />
              <div 
                style={{ width: `${totalRevenue > 0 ? (spreadsheetRevenue / totalRevenue) * 100 : 0}%` }} 
                className="bg-sky-500 h-full" 
                title={`Spreadsheet: ${formatCurrency(spreadsheetRevenue)}`} 
              />
              <div 
                style={{ width: `${totalRevenue > 0 ? (handwrittenRevenue / totalRevenue) * 100 : 0}%` }} 
                className="bg-amber-500 h-full" 
                title={`Handwritten: ${formatCurrency(handwrittenRevenue)}`} 
              />
              <div 
                style={{ width: `${totalRevenue > 0 ? (directRevenue / totalRevenue) * 100 : 0}%` }} 
                className="bg-stone-400 dark:bg-stone-600 h-full" 
                title={`Direct: ${formatCurrency(directRevenue)}`} 
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
            <span className="text-sky-700 dark:text-sky-400">Sheets: {formatCurrency(spreadsheetRevenue)}</span>
            <span>·</span>
            <span className="text-amber-700 dark:text-amber-400">Notes: {formatCurrency(handwrittenRevenue)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
