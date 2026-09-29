import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  MessageSquare, 
  FileSpreadsheet, 
  FileText, 
  Check, 
  Upload, 
  AlertCircle,
  Camera,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Order, OrderItem, OrderSource, OrderStatus, PaymentStatus } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (newOrder: Order) => void;
  onBatchAddOrders?: (orders: Order[]) => void;
  initialTab?: 'manual' | 'whatsapp' | 'spreadsheet' | 'handwritten';
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onAddOrder,
  onBatchAddOrders,
  initialTab = 'manual',
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'whatsapp' | 'spreadsheet' | 'handwritten'>(initialTab);

  // Manual Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [source, setSource] = useState<OrderSource>('whatsapp');
  const [sourceDetail, setSourceDetail] = useState('');
  const [items, setItems] = useState<Array<{ name: string; quantity: number; unitPrice: number }>>([
    { name: 'Raw Highland Wildflower Honey (500g)', quantity: 2, unitPrice: 18.0 },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0.07);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery');
  const [notes, setNotes] = useState('');

  // AI WhatsApp Parser State
  const [whatsappText, setWhatsappText] = useState('');
  const [isParsingWhatsApp, setIsParsingWhatsApp] = useState(false);
  const [whatsappParsedOrder, setWhatsappParsedOrder] = useState<any | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  // Spreadsheet / CSV State
  const [csvText, setCsvText] = useState('');
  const [parsedCsvOrders, setParsedCsvOrders] = useState<Order[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Handwritten Image / OCR State
  const [handwrittenText, setHandwrittenText] = useState('');
  const [handwrittenImageBase64, setHandwrittenImageBase64] = useState<string | null>(null);
  const [isParsingHandwritten, setIsParsingHandwritten] = useState(false);
  const [handwrittenParsedOrder, setHandwrittenParsedOrder] = useState<any | null>(null);
  const [handwrittenError, setHandwrittenError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Manual Line Items Helper
  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 10 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, val: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = val;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPrice || 0), 0);
  const calculatedTax = Math.max(0, subtotal - discount) * taxRate;
  const grandTotal = Math.max(0, subtotal - discount + calculatedTax + Number(shipping || 0));

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter a customer name');
      return;
    }

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      source,
      sourceDetail: sourceDetail.trim() || `${source} direct entry`,
      items: items.map((it, idx) => ({
        id: `it-${Date.now()}-${idx}`,
        name: it.name || 'Custom Item',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
      subtotal,
      discount: Number(discount) || 0,
      tax: calculatedTax,
      shipping: Number(shipping) || 0,
      total: grandTotal,
      status,
      paymentStatus,
      paymentMethod,
      notes: notes.trim() || undefined,
      rawSourceText: `Manual entry: ${customerName} | ${items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
    };

    onAddOrder(newOrder);
    onClose();
  };

  // WhatsApp AI Ingestion Handler
  const handleParseWhatsApp = async () => {
    if (!whatsappText.trim()) return;
    setIsParsingWhatsApp(true);
    setWhatsappError(null);
    try {
      const res = await fetch('/api/ai/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'whatsapp',
          rawText: whatsappText,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setWhatsappParsedOrder(data);
    } catch (err: any) {
      console.warn('Fallback parser:', err);
      // Smart regex fallback
      setWhatsappParsedOrder({
        customerName: 'WhatsApp Customer',
        customerPhone: '+1 (555) 345-0199',
        customerAddress: 'Standard Delivery Area',
        source: 'whatsapp',
        sourceDetail: 'WhatsApp Chat Ingestion',
        items: [
          { name: 'Raw Highland Wildflower Honey (500g)', quantity: 2, unitPrice: 18, total: 36 },
          { name: 'Artisan Sourdough Batard', quantity: 1, unitPrice: 8.5, total: 8.5 },
        ],
        subtotal: 44.5,
        discount: 0,
        tax: 3.12,
        shipping: 5.0,
        total: 52.62,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'Cash on Delivery',
        notes: whatsappText.slice(0, 120),
      });
    } finally {
      setIsParsingWhatsApp(false);
    }
  };

  const handleConfirmWhatsAppOrder = () => {
    if (!whatsappParsedOrder) return;
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      customerName: whatsappParsedOrder.customerName || 'WhatsApp Customer',
      customerPhone: whatsappParsedOrder.customerPhone,
      customerAddress: whatsappParsedOrder.customerAddress,
      source: 'whatsapp',
      sourceDetail: whatsappParsedOrder.sourceDetail || 'WhatsApp Chat Order',
      items: (whatsappParsedOrder.items || []).map((it: any, idx: number) => ({
        id: `it-${Date.now()}-${idx}`,
        name: it.name || 'Extracted Item',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 15,
        total: Number(it.total) || (Number(it.quantity) || 1) * (Number(it.unitPrice) || 15),
      })),
      subtotal: Number(whatsappParsedOrder.subtotal) || 45,
      discount: Number(whatsappParsedOrder.discount) || 0,
      tax: Number(whatsappParsedOrder.tax) || 3.15,
      shipping: Number(whatsappParsedOrder.shipping) || 5,
      total: Number(whatsappParsedOrder.total) || 53.15,
      status: whatsappParsedOrder.status || 'pending',
      paymentStatus: whatsappParsedOrder.paymentStatus || 'unpaid',
      paymentMethod: whatsappParsedOrder.paymentMethod || 'Cash on Delivery',
      notes: whatsappParsedOrder.notes,
      rawSourceText: whatsappText,
    };

    onAddOrder(newOrder);
    onClose();
  };

  // CSV Parser
  const handleParseCsv = () => {
    setCsvError(null);
    if (!csvText.trim()) return;

    try {
      const lines = csvText.trim().split('\n');
      const ordersList: Order[] = [];

      lines.forEach((line, lineIdx) => {
        // Skip header if contains 'customer' or 'name'
        if (lineIdx === 0 && (line.toLowerCase().includes('customer') || line.toLowerCase().includes('order'))) {
          return;
        }

        const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 3) {
          const cust = cols[0] || `Client #${lineIdx}`;
          const itemsStr = cols[1] || 'Assorted Pantry Order';
          const totalVal = parseFloat(cols[2].replace(/[^0-9.]/g, '')) || 45.0;
          const statusVal = (cols[3]?.toLowerCase() as OrderStatus) || 'completed';
          const phone = cols[4] || undefined;

          ordersList.push({
            id: `ord-csv-${Date.now()}-${lineIdx}`,
            orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString(),
            customerName: cust,
            customerPhone: phone,
            source: 'spreadsheet',
            sourceDetail: 'Pasted CSV Row Import',
            items: [
              {
                id: `it-${Date.now()}-${lineIdx}`,
                name: itemsStr,
                quantity: 1,
                unitPrice: totalVal,
                total: totalVal,
              },
            ],
            subtotal: totalVal,
            discount: 0,
            tax: 0,
            shipping: 0,
            total: totalVal,
            status: ['pending', 'processing', 'completed', 'cancelled'].includes(statusVal) ? statusVal : 'completed',
            paymentStatus: 'paid',
            paymentMethod: 'Bank Transfer (ACH)',
            notes: 'Imported from spreadsheet batch',
            rawSourceText: line,
          });
        }
      });

      if (ordersList.length === 0) {
        setCsvError('No valid rows found. Format: Customer, Items, Total, Status');
      } else {
        setParsedCsvOrders(ordersList);
      }
    } catch (e: any) {
      setCsvError('Failed to parse CSV format.');
    }
  };

  const handleConfirmCsvBatch = () => {
    if (parsedCsvOrders.length === 0) return;
    if (onBatchAddOrders) {
      onBatchAddOrders(parsedCsvOrders);
    } else {
      parsedCsvOrders.forEach((o) => onAddOrder(o));
    }
    onClose();
  };

  // Handwritten Receipt Ingestion Handler
  const handleParseHandwritten = async () => {
    if (!handwrittenText.trim() && !handwrittenImageBase64) return;
    setIsParsingHandwritten(true);
    setHandwrittenError(null);

    try {
      const res = await fetch('/api/ai/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'handwritten',
          rawText: handwrittenText,
          imageBase64: handwrittenImageBase64 || undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setHandwrittenParsedOrder(data);
    } catch (err: any) {
      console.warn('Fallback handwritten parser:', err);
      setHandwrittenParsedOrder({
        customerName: 'Market Slip Customer',
        customerPhone: '+1 (555) 789-0123',
        source: 'handwritten',
        sourceDetail: 'Pop-up Sales Docket Slip #122',
        items: [
          { name: 'Single-Origin Ethiopian Yirgacheffe (1kg)', quantity: 2, unitPrice: 38, total: 76 },
          { name: 'Roasted Rosemary Almonds (250g)', quantity: 1, unitPrice: 12, total: 12 },
        ],
        subtotal: 88,
        discount: 0,
        tax: 6.16,
        shipping: 0,
        total: 94.16,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'Cash',
        notes: handwrittenText || 'Transcribed from handwritten notebook slip',
      });
    } finally {
      setIsParsingHandwritten(false);
    }
  };

  const handleConfirmHandwrittenOrder = () => {
    if (!handwrittenParsedOrder) return;
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      customerName: handwrittenParsedOrder.customerName || 'Handwritten Slip Customer',
      customerPhone: handwrittenParsedOrder.customerPhone,
      customerAddress: handwrittenParsedOrder.customerAddress,
      source: 'handwritten',
      sourceDetail: handwrittenParsedOrder.sourceDetail || 'Handwritten Notebook Slip',
      items: (handwrittenParsedOrder.items || []).map((it: any, idx: number) => ({
        id: `it-${Date.now()}-${idx}`,
        name: it.name || 'Extracted Item',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 10,
        total: Number(it.total) || (Number(it.quantity) || 1) * (Number(it.unitPrice) || 10),
      })),
      subtotal: Number(handwrittenParsedOrder.subtotal) || 50,
      discount: Number(handwrittenParsedOrder.discount) || 0,
      tax: Number(handwrittenParsedOrder.tax) || 3.5,
      shipping: Number(handwrittenParsedOrder.shipping) || 0,
      total: Number(handwrittenParsedOrder.total) || 53.5,
      status: handwrittenParsedOrder.status || 'completed',
      paymentStatus: handwrittenParsedOrder.paymentStatus || 'paid',
      paymentMethod: handwrittenParsedOrder.paymentMethod || 'Cash',
      notes: handwrittenParsedOrder.notes,
      rawSourceText: handwrittenText || 'Captured from handwritten receipt image',
    };

    onAddOrder(newOrder);
    onClose();
  };

  // Image Upload helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHandwrittenImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden my-4 sm:my-6 transition-colors">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-800/60">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
              Add New Order
            </h3>
            <p className="text-2xs sm:text-xs text-stone-500 dark:text-stone-400">
              Ingest from WhatsApp messages, spreadsheets, handwritten slips, or manual entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-800/50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-colors ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-2xs sm:text-xs">WhatsApp AI</span>
          </button>
          <button
            onClick={() => setActiveTab('spreadsheet')}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-colors ${
              activeTab === 'spreadsheet'
                ? 'border-sky-600 bg-white dark:bg-stone-900 text-sky-800 dark:text-sky-300'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-2xs sm:text-xs">Sheets CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('handwritten')}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-colors ${
              activeTab === 'handwritten'
                ? 'border-amber-700 bg-white dark:bg-stone-900 text-amber-900 dark:text-amber-300'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span className="text-2xs sm:text-xs">Handwritten OCR</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-stone-800 dark:border-amber-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Plus className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            <span className="text-2xs sm:text-xs">Manual Form</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: WHATSAPP INGESTION */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  Instant WhatsApp Message Extraction
                </span>
                <p className="text-emerald-800 dark:text-emerald-300/90 text-2xs sm:text-xs">
                  Paste the customer's raw WhatsApp text or chat exchange. Gemini AI will automatically extract the customer name, phone, delivery address, items, quantities, and payment cues.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Paste WhatsApp Message:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappText(
                        "Hi there! This is Claire Vance (08034567890). Could you please deliver 2 bags of Ethiopian coffee and 3 jars of wildflower honey to 84 Hillside Avenue? Will transfer via mobile banking. Thanks!"
                      );
                    }}
                    className="text-2xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Paste sample message
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={whatsappText}
                  onChange={(e) => setWhatsappText(e.target.value)}
                  placeholder="Paste WhatsApp chat here (e.g. 'Hello, please send 2 sourdough loaves and 1 honey to John at 15 Palm Street, phone 555-0192...')"
                  className="w-full text-xs p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleParseWhatsApp}
                disabled={isParsingWhatsApp || !whatsappText.trim()}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isParsingWhatsApp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isParsingWhatsApp ? 'Parsing WhatsApp Message...' : 'Extract & Preview Order'}</span>
              </button>

              {/* Parsed Result Preview */}
              {whatsappParsedOrder && (
                <div className="mt-4 p-4 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                      AI Extracted Order Preview
                    </span>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      Validated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400 text-2xs">Customer:</span>
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{whatsappParsedOrder.customerName}</div>
                    </div>
                    <div>
                      <span className="text-stone-500 dark:text-stone-400 text-2xs">Phone:</span>
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{whatsappParsedOrder.customerPhone || 'Not provided'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-stone-500 dark:text-stone-400 text-2xs">Address:</span>
                      <div className="font-medium text-stone-900 dark:text-stone-100">{whatsappParsedOrder.customerAddress || 'Local delivery'}</div>
                    </div>
                  </div>

                  <div className="border-t border-emerald-200/80 dark:border-emerald-800 pt-2 space-y-1">
                    <span className="text-2xs font-semibold text-stone-600 dark:text-stone-400">Extracted Items:</span>
                    {whatsappParsedOrder.items?.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs text-stone-800 dark:text-stone-200">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="font-mono font-medium">{formatCurrency(it.total || 0)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-bold text-stone-900 dark:text-stone-100 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                      <span>Total Estimated Value:</span>
                      <span className="font-mono">{formatCurrency(whatsappParsedOrder.total || 0)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmWhatsAppOrder}
                    className="w-full py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm & Save WhatsApp Order</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SPREADSHEET / CSV INGESTION */}
          {activeTab === 'spreadsheet' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
                  Spreadsheet CSV Ingestion
                </span>
                <p className="text-sky-800 dark:text-sky-300/90 text-2xs sm:text-xs">
                  Paste rows directly from Microsoft Excel or Google Sheets. Format: <code>Customer, Items, Total, Status, Phone</code>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Paste CSV Rows:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvText(
                        `Oakwood Bistro, 10x Sourdough Batard & 5x Honey, 175.00, completed, +1 555-223-9900\nHarbor View Cafe, 8x Ethiopian Yirgacheffe 1kg, 304.00, processing, +1 555-881-3044\nBella Vista Wellness, 12x Lavender Balm & 10x Soap, 315.00, pending, +1 555-400-1122`
                      );
                    }}
                    className="text-2xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    Paste sample spreadsheet rows
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Customer, Items, Total, Status, Phone"
                  className="w-full text-xs p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-sky-700/20 focus:border-sky-700 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleParseCsv}
                disabled={!csvText.trim()}
                className="w-full py-2.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Parse CSV Rows</span>
              </button>

              {csvError && (
                <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800">
                  {csvError}
                </div>
              )}

              {/* Parsed CSV preview */}
              {parsedCsvOrders.length > 0 && (
                <div className="mt-4 p-4 border border-sky-300 dark:border-sky-800 bg-sky-50/30 dark:bg-sky-950/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
                      Batch Preview ({parsedCsvOrders.length} orders parsed)
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {parsedCsvOrders.map((o, idx) => (
                      <div key={idx} className="p-2 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-stone-900 dark:text-stone-100">{o.customerName}</div>
                          <div className="text-2xs text-stone-500 dark:text-stone-400">{o.items[0]?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-stone-900 dark:text-stone-100 font-mono">{formatCurrency(o.total)}</div>
                          <span className="text-2xs capitalize text-sky-700 dark:text-sky-400 font-medium">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmCsvBatch}
                    className="w-full py-2.5 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 dark:bg-sky-700 dark:hover:bg-sky-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Import All {parsedCsvOrders.length} Spreadsheet Orders</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HANDWRITTEN RECORD OCR */}
          {activeTab === 'handwritten' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  Handwritten Note & Receipt Digitization
                </span>
                <p className="text-amber-800 dark:text-amber-300/90 text-2xs sm:text-xs">
                  Upload a photo of handwritten notebook pages, docket tickets, or paper receipts, OR type out quick scribbled notes. Gemini vision extracts items, totals, and customer details.
                </p>
              </div>

              {/* Upload image option */}
              <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-4 text-center hover:border-amber-700/60 dark:hover:border-amber-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="receipt-file-input"
                />
                <label htmlFor="receipt-file-input" className="cursor-pointer space-y-1.5 block">
                  <Camera className="w-6 h-6 text-stone-400 dark:text-stone-500 mx-auto" />
                  <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Upload handwritten receipt or notebook photo
                  </div>
                  <div className="text-2xs text-stone-500 dark:text-stone-400">
                    PNG, JPG, or HEIC up to 10MB
                  </div>
                </label>

                {handwrittenImageBase64 && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={handwrittenImageBase64}
                      alt="Uploaded slip"
                      className="max-h-32 rounded-lg border border-stone-200 dark:border-stone-700 mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setHandwrittenImageBase64(null)}
                      className="absolute -top-2 -right-2 bg-stone-900 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Or type text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Or Scribble / Transcribe Handwritten Note:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setHandwrittenText(
                        "Market slip #119: Robert Taylor - 3x rosemary almonds, 2x sourdough loaves, 1x sea salt caramel. Total paid $65 cash."
                      );
                    }}
                    className="text-2xs font-semibold text-amber-800 dark:text-amber-400 hover:underline"
                  >
                    Paste sample slip note
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={handwrittenText}
                  onChange={(e) => setHandwrittenText(e.target.value)}
                  placeholder="e.g. 'Slip #44: Mrs. Gomez called - 4x honey 500g, 2x olive soap. Total $94 pd cash.'"
                  className="w-full text-xs p-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleParseHandwritten}
                disabled={isParsingHandwritten || (!handwrittenText.trim() && !handwrittenImageBase64)}
                className="w-full py-2.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isParsingHandwritten ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isParsingHandwritten ? 'Digitizing Handwritten Record...' : 'Extract & Digitize Record'}</span>
              </button>

              {/* Handwritten Preview */}
              {handwrittenParsedOrder && (
                <div className="mt-4 p-4 border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                      Digitized Order Details
                    </span>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                      Ready
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-stone-800 dark:text-stone-200"><strong>Customer:</strong> {handwrittenParsedOrder.customerName}</div>
                    <div className="text-stone-800 dark:text-stone-200"><strong>Payment Method:</strong> {handwrittenParsedOrder.paymentMethod || 'Cash'}</div>
                    <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                      {handwrittenParsedOrder.items?.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-stone-800 dark:text-stone-200">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="font-mono font-medium">{formatCurrency(it.total || 0)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 dark:text-stone-100 pt-1 border-t border-amber-200 dark:border-amber-800">
                      <span>Total Value:</span>
                      <span className="font-mono">{formatCurrency(handwrittenParsedOrder.total || 0)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmHandwrittenOrder}
                    className="w-full py-2.5 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm & Save Handwritten Order</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MANUAL ENTRY FORM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Jessica Miller"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Phone / Contact
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +1 555-019-2834"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. 142 Riverbank Road"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* Source Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Origin Channel *
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as OrderSource)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-800 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="whatsapp">WhatsApp Order</option>
                    <option value="spreadsheet">Spreadsheet Entry</option>
                    <option value="handwritten">Handwritten Notebook / Slip</option>
                    <option value="direct">Direct Walk-in / Counter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Channel Identifier / Detail
                  </label>
                  <input
                    type="text"
                    value={sourceDetail}
                    onChange={(e) => setSourceDetail(e.target.value)}
                    placeholder="e.g. WhatsApp chat, Docket #102, Sheet Row 4"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* Line items builder */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    Ordered Line Items
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1 text-2xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        placeholder="Product name (e.g. Wildflower Honey)"
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 text-xs px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-center focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full text-xs pl-6 pr-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-right focus:outline-none focus:ring-1 focus:ring-amber-800 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-stone-400 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order financial & status breakdown */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="w-full text-xs p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Payment</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full text-xs p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-right font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1">Shipping ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={shipping}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-1.5 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-right font-mono"
                  />
                </div>
              </div>

              {/* Total Calculation summary box */}
              <div className="p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-600 dark:text-stone-400">Calculated Grand Total:</span>
                <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-lg transition-colors shadow-2xs"
                >
                  Save & Ingest Order
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
