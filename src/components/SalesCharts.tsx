import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Package, 
  Layers, 
  MessageSquare, 
  FileSpreadsheet, 
  FileText,
  DollarSign
} from 'lucide-react';
import { Order, OrderSource, ProductPerformance } from '../types';
import { formatCurrency, formatShortDate, getSourceInfo } from '../utils/formatters';

interface SalesChartsProps {
  orders: Order[];
  onFilterProduct?: (productName: string) => void;
  onFilterSource?: (source: OrderSource) => void;
}

export const SalesCharts: React.FC<SalesChartsProps> = ({
  orders,
  onFilterProduct,
  onFilterSource,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'channels'>('overview');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number; count: number } | null>(null);

  // Group revenue by date (last 7 days or chronologically)
  const timelineData = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const map = new Map<string, { revenue: number; count: number; dateStr: string }>();

    // Sort ascending by date
    const sorted = [...validOrders].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((o) => {
      const dayKey = o.date.split('T')[0];
      const existing = map.get(dayKey) || { revenue: 0, count: 0, dateStr: dayKey };
      existing.revenue += o.total;
      existing.count += 1;
      map.set(dayKey, existing);
    });

    return Array.from(map.values()).slice(-8); // Show up to last 8 active days
  }, [orders]);

  const maxTimelineRevenue = Math.max(...timelineData.map((d) => d.revenue), 100);

  // Channel Breakdown
  const channelData = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const channels: OrderSource[] = ['whatsapp', 'spreadsheet', 'handwritten', 'direct'];
    
    return channels.map((src) => {
      const srcOrders = validOrders.filter((o) => o.source === src);
      const rev = srcOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        source: src,
        revenue: rev,
        orderCount: srcOrders.length,
        info: getSourceInfo(src),
      };
    });
  }, [orders]);

  const totalValidRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0);

  // Status Breakdown
  const statusData = useMemo(() => {
    const statuses = ['pending', 'processing', 'completed', 'cancelled'] as const;
    return statuses.map((st) => {
      const matched = orders.filter((o) => o.status === st);
      const rev = matched.reduce((sum, o) => sum + o.total, 0);
      return {
        status: st,
        count: matched.length,
        revenue: rev,
      };
    });
  }, [orders]);

  // Product Performance Calculation
  const productPerformance: ProductPerformance[] = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const pMap = new Map<string, {
      name: string;
      category: string;
      unitsSold: number;
      totalRevenue: number;
      orderCount: number;
      channels: Record<OrderSource, number>;
    }>();

    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = pMap.get(item.name) || {
          name: item.name,
          category: item.category || 'General',
          unitsSold: 0,
          totalRevenue: 0,
          orderCount: 0,
          channels: { whatsapp: 0, spreadsheet: 0, handwritten: 0, direct: 0 },
        };
        existing.unitsSold += item.quantity;
        existing.totalRevenue += item.total;
        existing.orderCount += 1;
        existing.channels[o.source] = (existing.channels[o.source] || 0) + item.quantity;
        pMap.set(item.name, existing);
      });
    });

    return Array.from(pMap.values())
      .map((p) => {
        // determine primary channel
        let topChannel: OrderSource = 'whatsapp';
        let maxQty = -1;
        (Object.keys(p.channels) as OrderSource[]).forEach((ch) => {
          if (p.channels[ch] > maxQty) {
            maxQty = p.channels[ch];
            topChannel = ch;
          }
        });

        return {
          name: p.name,
          category: p.category,
          unitsSold: p.unitsSold,
          totalRevenue: p.totalRevenue,
          orderCount: p.orderCount,
          averagePrice: p.unitsSold > 0 ? p.totalRevenue / p.unitsSold : 0,
          primaryChannel: topChannel,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [orders]);

  const top5Products = productPerformance.slice(0, 5);
  const maxProductRevenue = Math.max(...top5Products.map((p) => p.totalRevenue), 10);

  return (
    <section className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
      {/* Sub-navigation tabs */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50 dark:bg-stone-800/40">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-800 dark:text-amber-400" />
            <span>Sales Analytics & Product Performance</span>
          </h3>
          <p className="text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
            Compare channel velocity, item demand, and daily revenue trajectory
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Revenue & Channels
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'products'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Product Performance ({productPerformance.length})
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Over Time Chart (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Revenue Trajectory
                  </h4>
                  <p className="text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
                    Daily sales across all incoming sources
                  </p>
                </div>
                {hoveredPoint && (
                  <div className="text-xs text-right bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(hoveredPoint.value)}</span>
                    <span className="text-stone-500 dark:text-stone-400 ml-1 text-2xs">({hoveredPoint.count} orders)</span>
                  </div>
                )}
              </div>

              {/* Bar Chart Representation with horizontal overflow scroll on very small screens */}
              <div className="overflow-x-auto pb-1">
                <div className="h-48 sm:h-52 min-w-[280px] w-full pt-4 pb-2 flex items-end justify-between gap-1.5 sm:gap-2 border-b border-stone-200 dark:border-stone-800">
                  {timelineData.map((d, idx) => {
                    const heightPct = Math.max((d.revenue / maxTimelineRevenue) * 100, 8);
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredPoint({ label: d.dateStr, value: d.revenue, count: d.count })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end"
                      >
                        <div className="w-full max-w-[42px] relative flex flex-col items-center justify-end h-full">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-amber-800/85 dark:bg-amber-600/80 hover:bg-amber-900 dark:hover:bg-amber-500 rounded-t-sm transition-all duration-200 relative"
                          >
                            {/* Tooltip on bar */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-stone-800 text-white dark:text-stone-100 border border-stone-700 text-2xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none shadow-md">
                              {formatCurrency(d.revenue)}
                            </div>
                          </div>
                        </div>
                        <span className="text-2xs text-stone-500 dark:text-stone-400 mt-2 font-medium truncate max-w-full">
                          {formatShortDate(d.dateStr)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-2xs text-stone-500 dark:text-stone-400 pt-1">
                <span>Earliest recorded date</span>
                <span>Latest recorded date</span>
              </div>
            </div>

            {/* Channel Ingestion Breakdown (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Ingestion Channel Split
                </h4>
                <p className="text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
                  Revenue origin and volume by capture mode
                </p>
              </div>

              <div className="space-y-2.5">
                {channelData.map((ch) => {
                  const pct = totalValidRevenue > 0 ? (ch.revenue / totalValidRevenue) * 100 : 0;
                  return (
                    <div
                      key={ch.source}
                      onClick={() => onFilterSource?.(ch.source)}
                      className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ch.info.dot}`} />
                          <span className="font-semibold text-stone-800 dark:text-stone-200">{ch.info.label}</span>
                          <span className="text-stone-400 dark:text-stone-500 text-2xs">({ch.orderCount})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">{formatCurrency(ch.revenue)}</span>
                          <span className="text-stone-400 dark:text-stone-500 ml-1.5 font-mono text-2xs">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full ${
                            ch.source === 'whatsapp' ? 'bg-emerald-500' :
                            ch.source === 'spreadsheet' ? 'bg-sky-500' :
                            ch.source === 'handwritten' ? 'bg-amber-500' : 'bg-stone-400 dark:bg-stone-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status breakdown meter */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between text-2xs text-stone-500 dark:text-stone-400 mb-1.5">
                  <span>Order Status Balance</span>
                  <span>{orders.length} Total</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-2xs">
                  {statusData.map((st) => (
                    <div key={st.status} className="p-1.5 bg-stone-50 dark:bg-stone-800/80 rounded border border-stone-200 dark:border-stone-700">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{st.count}</div>
                      <div className="text-stone-500 dark:text-stone-400 capitalize text-2xs">{st.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Product Performance Tab */
          <div className="space-y-5">
            {/* Top 5 Products Bar Chart */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Top Revenue Generating Products
              </h4>
              <div className="space-y-2">
                {top5Products.map((prod, idx) => {
                  const barWidth = maxProductRevenue > 0 ? (prod.totalRevenue / maxProductRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-800 dark:text-stone-200 truncate max-w-[200px] sm:max-w-[360px]">
                          {prod.name}
                        </span>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-stone-500 dark:text-stone-400 text-2xs">{prod.unitsSold} units</span>
                          <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">{formatCurrency(prod.totalRevenue)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${barWidth}%` }}
                          className="bg-amber-800 dark:bg-amber-600 h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Product Breakdown Table */}
            <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-700 uppercase tracking-wider text-2xs">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Units Sold</th>
                    <th className="py-2.5 px-3 text-right">Avg Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total Revenue</th>
                    <th className="py-2.5 px-3">Top Channel</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {productPerformance.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-stone-900 dark:text-stone-100">
                        {prod.name}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 dark:text-stone-400">
                        {prod.category}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-stone-800 dark:text-stone-200 font-mono">
                        {prod.unitsSold}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300 font-mono">
                        {formatCurrency(prod.averagePrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-stone-900 dark:text-stone-100 font-mono">
                        {formatCurrency(prod.totalRevenue)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize text-stone-700 dark:text-stone-300 font-medium">
                          {prod.primaryChannel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onFilterProduct?.(prod.name)}
                          className="text-2xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200 underline"
                        >
                          Filter Orders
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
