import React from 'react';
import { 
  Sparkles, 
  Plus, 
  MessageSquare, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  RotateCcw,
  Store,
  Sun,
  Moon
} from 'lucide-react';
import { Order } from '../types';

interface HeaderProps {
  orders: Order[];
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAddModal: (initialTab?: 'manual' | 'whatsapp' | 'spreadsheet' | 'handwritten') => void;
  onOpenAIAdvisor: () => void;
  onResetData: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  orders,
  isDark,
  onToggleTheme,
  onOpenAddModal,
  onOpenAIAdvisor,
  onResetData,
  onExportCSV,
}) => {
  const whatsappCount = orders.filter((o) => o.source === 'whatsapp').length;
  const sheetCount = orders.filter((o) => o.source === 'spreadsheet').length;
  const handwrittenCount = orders.filter((o) => o.source === 'handwritten').length;

  return (
    <header className="border-b border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand & Subtitle */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-800 dark:bg-amber-700 text-amber-50 flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                <Store className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                    OmniSales
                  </h1>
                  <span className="text-2xs sm:text-xs font-semibold px-2 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    Unified Ingestion
                  </span>
                </div>
                <p className="text-2xs sm:text-xs text-stone-500 dark:text-stone-400 font-medium line-clamp-1 sm:line-clamp-none">
                  Turning scattered WhatsApp, Spreadsheets & Handwritten notes into decisions
                </p>
              </div>
            </div>

            {/* Mobile-only theme toggle */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                type="button"
                onClick={onToggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
              </button>
            </div>
          </div>

          {/* Channel Pulse Indicators (scrollable on tablet, visible on lg) */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 rounded-lg px-3 py-1.5">
            <span className="text-stone-400 dark:text-stone-500 font-medium">Channels:</span>
            <button
              onClick={() => onOpenAddModal('whatsapp')}
              title="Click to add WhatsApp order"
              className="inline-flex items-center gap-1.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp ({whatsappCount})</span>
            </button>
            <span className="text-stone-300 dark:text-stone-600">·</span>
            <button
              onClick={() => onOpenAddModal('spreadsheet')}
              title="Click to add Spreadsheet order"
              className="inline-flex items-center gap-1.5 hover:text-sky-700 dark:hover:text-sky-400 transition-colors font-medium"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Sheets ({sheetCount})</span>
            </button>
            <span className="text-stone-300 dark:text-stone-600">·</span>
            <button
              onClick={() => onOpenAddModal('handwritten')}
              title="Click to add Handwritten order"
              className="inline-flex items-center gap-1.5 hover:text-amber-800 dark:hover:text-amber-300 transition-colors font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Handwritten ({handwrittenCount})</span>
            </button>
          </div>

          {/* Action CTAs & Desktop Theme Toggle */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Desktop Theme Mode Switcher */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors shadow-2xs"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-2xs font-semibold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-stone-600" />
                  <span className="text-2xs font-semibold">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenAIAdvisor}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 dark:text-amber-100 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-lg transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">AI Insights</span>
            </button>

            <button
              onClick={onExportCSV}
              title="Export all orders to CSV"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>Export</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset to sample demo orders"
              className="hidden lg:inline-flex items-center gap-1.5 px-2 py-2 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenAddModal('manual')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Order</span>
            </button>
          </div>
        </div>

        {/* Mobile Channel Ingestion Pills (visible only on mobile) */}
        <div className="flex lg:hidden items-center gap-2 mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 overflow-x-auto text-2xs scrollbar-none pb-0.5">
          <span className="text-stone-400 dark:text-stone-500 font-medium shrink-0">Quick Add:</span>
          <button
            onClick={() => onOpenAddModal('whatsapp')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-medium shrink-0"
          >
            <MessageSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp ({whatsappCount})</span>
          </button>
          <button
            onClick={() => onOpenAddModal('spreadsheet')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 font-medium shrink-0"
          >
            <FileSpreadsheet className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>Sheets ({sheetCount})</span>
          </button>
          <button
            onClick={() => onOpenAddModal('handwritten')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium shrink-0"
          >
            <FileText className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            <span>Notes ({handwrittenCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};

