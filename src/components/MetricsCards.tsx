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
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Gross Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tracking-tight">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Completed: <strong className="text-stone-800">{formatCurrency(completedRevenue)}</strong></span>
            <span>·</span>
            <span>AOV: <strong className="text-stone-800">{formatCurrency(averageOrderValue)}</strong></span>
          </div>
        </div>

        {/* Total Orders & Status Velocity */}
        <div 
          onClick={() => onFilterByStatus?.('all')} 
          className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-2xs cursor-pointer hover:border-stone-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tracking-tight">
              {orders.length}
            </span>
            <span className="text-xs text-stone-500">
              ({completedOrders.length} fulfilled)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="text-amber-700 font-medium">{pendingOrders.length} pending</span>
            <span>·</span>
            <span className="text-blue-700 font-medium">{processingOrders.length} in progress</span>
            <span>·</span>
            <span className="text-rose-600 font-medium">{cancelledOrders.length} cancelled</span>
          </div>
        </div>

        {/* Pending Orders & Revenue at Risk */}
        <div 
          onClick={() => onFilterByStatus?.('pending')}
          className="bg-white border border-amber-300/80 rounded-xl p-5 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors bg-gradient-to-b from-amber-50/40 to-white"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending Fulfillment
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-950 tracking-tight">
              {formatCurrency(pendingRevenue)}
            </span>
            <span className="text-xs font-semibold text-amber-800">
              {pendingOrders.length} orders
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-700">
            <span>Action required to capture cash</span>
            <span className="font-semibold underline">Filter Pending</span>
          </div>
        </div>

        {/* Channel Dispersal & Ingestion */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Channel Contribution
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs font-medium text-stone-700">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> WhatsApp: {formatCurrency(whatsappRevenue)}
              </span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden flex">
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
                className="bg-stone-400 h-full" 
                title={`Direct: ${formatCurrency(directRevenue)}`} 
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="text-sky-700">Sheets: {formatCurrency(spreadsheetRevenue)}</span>
            <span>·</span>
            <span className="text-amber-700">Notes: {formatCurrency(handwrittenRevenue)}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
