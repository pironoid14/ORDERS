import { OrderSource, OrderStatus, PaymentStatus } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getSourceInfo(source: OrderSource) {
  switch (source) {
    case 'whatsapp':
      return {
        label: 'WhatsApp',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'spreadsheet':
      return {
        label: 'Spreadsheet',
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        badgeBg: 'bg-sky-100 text-sky-800',
        dot: 'bg-sky-500',
      };
    case 'handwritten':
      return {
        label: 'Handwritten',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-800',
        dot: 'bg-amber-500',
      };
    case 'direct':
    default:
      return {
        label: 'Direct / Walk-in',
        bg: 'bg-stone-100 text-stone-800 border-stone-200',
        badgeBg: 'bg-stone-200 text-stone-800',
        dot: 'bg-stone-500',
      };
  }
}

export function getStatusInfo(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        dot: 'bg-amber-500',
      };
    case 'processing':
      return {
        label: 'Processing',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        dot: 'bg-blue-500',
      };
    case 'completed':
      return {
        label: 'Completed',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        badge: 'bg-rose-100 text-rose-800',
        dot: 'bg-rose-500',
      };
  }
}

export function getPaymentStatusInfo(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        badge: 'bg-emerald-100 text-emerald-800',
      };
    case 'unpaid':
      return {
        label: 'Unpaid',
        badge: 'bg-rose-100 text-rose-800',
      };
    case 'partial':
      return {
        label: 'Partial',
        badge: 'bg-amber-100 text-amber-800',
      };
    case 'refunded':
      return {
        label: 'Refunded',
        badge: 'bg-stone-200 text-stone-700',
      };
  }
}
