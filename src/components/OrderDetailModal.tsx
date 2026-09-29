import React from 'react';
import { 
  X, 
  Printer, 
  MessageSquare, 
  FileSpreadsheet, 
  FileText, 
  Store, 
  Clock, 
  DollarSign, 
  MapPin, 
  Phone, 
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { formatCurrency, formatDate, getSourceInfo, getStatusInfo, getPaymentStatusInfo } from '../utils/formatters';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdatePaymentStatus: (orderId: string, newPaymentStatus: PaymentStatus) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
}) => {
  if (!order) return null;

  const sourceMeta = getSourceInfo(order.source);
  const statusMeta = getStatusInfo(order.status);
  const paymentMeta = getPaymentStatusInfo(order.paymentStatus);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-6 print:border-none print:shadow-none print:m-0">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70 print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-stone-900">
              {order.orderNumber}
            </span>
            <span className={`text-2xs font-semibold px-2 py-0.5 rounded-sm capitalize ${statusMeta.badge}`}>
              {statusMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Printable Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-stone-900">
                OmniSales Provisions
              </h2>
              <p className="text-xs text-stone-500">
                Small Business Unified Order Receipt
              </p>
              <div className="mt-2 text-xs text-stone-600 space-y-0.5">
                <div>Order Number: <strong className="font-mono text-stone-900">{order.orderNumber}</strong></div>
                <div>Date Captured: {formatDate(order.date)}</div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold"
                style={{
                  backgroundColor: order.source === 'whatsapp' ? '#f0fdf4' : order.source === 'spreadsheet' ? '#f0f9ff' : order.source === 'handwritten' ? '#fffbeb' : '#fafaf9',
                  color: order.source === 'whatsapp' ? '#166534' : order.source === 'spreadsheet' ? '#0369a1' : order.source === 'handwritten' ? '#92400e' : '#44403c',
                }}
              >
                {order.source === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                {order.source === 'spreadsheet' && <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />}
                {order.source === 'handwritten' && <FileText className="w-3.5 h-3.5 text-amber-700" />}
                <span>Captured via {sourceMeta.label}</span>
              </div>
              {order.sourceDetail && (
                <div className="text-2xs text-stone-400">
                  {order.sourceDetail}
                </div>
              )}
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50/60 p-4 rounded-xl border border-stone-200/80">
            <div>
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Customer Details
              </span>
              <div className="font-semibold text-stone-900 text-sm">
                {order.customerName}
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-1 text-stone-600 mt-1">
                  <Phone className="w-3 h-3 text-stone-400" />
                  <span>{order.customerPhone}</span>
                </div>
              )}
              {order.customerEmail && (
                <div className="text-stone-600">
                  {order.customerEmail}
                </div>
              )}
            </div>

            <div>
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Delivery / Dispatch Info
              </span>
              <div className="flex items-start gap-1 text-stone-800">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>{order.customerAddress || 'Local pickup / in-store collection'}</span>
              </div>
              <div className="mt-2 text-2xs text-stone-500">
                Payment: <strong className="text-stone-800 font-medium">{order.paymentMethod || 'Standard'}</strong> ({paymentMeta.label})
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Items Purchased
            </h4>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase text-2xs font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-stone-900">{item.name}</div>
                        {item.category && <div className="text-2xs text-stone-400">{item.category}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-stone-800">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-600">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-stone-900">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-mono">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div className="flex justify-between">
                  <span>Delivery / Shipping:</span>
                  <span className="font-mono text-stone-900">{formatCurrency(order.shipping)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Sales Tax:</span>
                  <span className="font-mono text-stone-900">{formatCurrency(order.tax)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
                <span>Total Amount:</span>
                <span className="font-mono text-base">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Raw Source Audit Trail */}
          {order.rawSourceText && (
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
              <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider block">
                Original Ingested Source Slip / Chat Record
              </span>
              <p className="font-mono text-2xs text-stone-700 whitespace-pre-wrap leading-relaxed">
                "{order.rawSourceText}"
              </p>
            </div>
          )}

          {/* Interactive Status & Payment Switcher (Hidden in print) */}
          <div className="p-4 bg-stone-100/60 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-700">Update Status:</label>
              <select
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-700">Update Payment:</label>
              <select
                value={order.paymentStatus}
                onChange={(e) => onUpdatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
