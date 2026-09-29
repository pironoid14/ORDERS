export type OrderSource = 'whatsapp' | 'spreadsheet' | 'handwritten' | 'direct';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'refunded';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category?: string;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  source: OrderSource;
  sourceDetail?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  rawSourceText?: string;
}

export interface AIInsightsResponse {
  executiveSummary: string;
  revenueTrend: string;
  channelBreakdown: string;
  pendingAlert: {
    title: string;
    description: string;
    riskLevel: 'high' | 'medium' | 'low';
  };
  topProductInsight: string;
  actionableSteps: string[];
}

export interface AIQuestionResponse {
  answer: string;
  highlightMetric?: string;
  relevantOrderIds?: string[];
  suggestedFollowUps?: string[];
}

export interface ProductPerformance {
  name: string;
  category: string;
  unitsSold: number;
  totalRevenue: number;
  orderCount: number;
  averagePrice: number;
  primaryChannel: OrderSource;
}
