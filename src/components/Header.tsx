import React from 'react';
import { 
  Sparkles, 
  Plus, 
  MessageSquare, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  RotateCcw,
  Store
} from 'lucide-react';
import { Order } from '../types';

interface HeaderProps {
  orders: Order[];
  onOpenAddModal: (initialTab?: 'manual' | 'whatsapp' | 'spreadsheet' | 'handwritten') => void;
  onOpenAIAdvisor: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  orders,
  onOpenAddModal,
  onOpenAIAdvisor,
  onResetData,
  onExportCSV,
}) => {
  const whatsappCount = orders.filter((o) => o.source === 'whatsapp').length;
  const sheetCount = orders.filter((o) => o.source === 'spreadsheet').length;
  const handwrittenCount = orders.filter((o) => o.source === 'handwritten').length;

  return (
    <header className="border-b border-stone-200/80 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-lg shadow-inner">
              <Store className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900">
                  OmniSales
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-stone-100 text-stone-700 border border-stone-200">
                  Unified Ingestion
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Turning scattered WhatsApp, Spreadsheets & Handwritten notes into decisions
              </p>
            </div>
          </div>

          {/* Channel Pulse Indicators */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-stone-600 bg-stone-50/90 border border-stone-200/80 rounded-lg px-3 py-1.5">
            <span className="text-stone-400 font-medium">Active Channels:</span>
            <button
              onClick={() => onOpenAddModal('whatsapp')}
              title="Click to add WhatsApp order"
              className="inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp ({whatsappCount})</span>
            </button>
            <span className="text-stone-300">·</span>
            <button
              onClick={() => onOpenAddModal('spreadsheet')}
              title="Click to add Spreadsheet order"
              className="inline-flex items-center gap-1.5 hover:text-sky-700 transition-colors font-medium"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
              <span>Sheets ({sheetCount})</span>
            </button>
            <span className="text-stone-300">·</span>
            <button
              onClick={() => onOpenAddModal('handwritten')}
              title="Click to add Handwritten order"
              className="inline-flex items-center gap-1.5 hover:text-amber-800 transition-colors font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Handwritten ({handwrittenCount})</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAIAdvisor}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-800 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-lg transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>AI Insights & Q&A</span>
            </button>

            <button
              onClick={onExportCSV}
              title="Export all orders to CSV"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset to sample demo orders"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 text-xs text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenAddModal('manual')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Order</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
