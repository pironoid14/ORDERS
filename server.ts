import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Initialize server-side Gemini client with User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // API Route: Generate business insights from sales data
  app.post('/api/ai/insights', async (req, res) => {
    try {
      const { ordersSummary } = req.body;
      if (!ordersSummary) {
        return res.status(400).json({ error: 'Missing ordersSummary in request body' });
      }

      const prompt = `You are an expert small business financial and operations advisor.
Analyze the following sales, orders, and channel performance data from a small business:

${JSON.stringify(ordersSummary, null, 2)}

Provide clear, executive-level insights and actionable recommendations to help the business owner make quick decisions.
Focus specifically on:
1. Executive summary of overall health and revenue momentum
2. Key revenue drivers and channel performance (WhatsApp vs Spreadsheets vs Handwritten records vs Direct)
3. Urgent pending order bottleneck alerts (uncollected cash flow, fulfillment delays)
4. Product performance & demand patterns
5. 3-4 specific, actionable next steps for today/this week.

Format the response strictly as valid JSON matching this schema:
{
  "executiveSummary": "string",
  "revenueTrend": "string",
  "channelBreakdown": "string",
  "pendingAlert": {
    "title": "string",
    "description": "string",
    "riskLevel": "high" | "medium" | "low"
  },
  "topProductInsight": "string",
  "actionableSteps": [
    "string",
    "string",
    "string"
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error generating insights:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate AI insights',
      });
    }
  });

  // API Route: Ask natural language questions about sales data
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { question, dataset } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Missing question in request body' });
      }

      const prompt = `You are OmniSales Intelligence, an operational AI assistant for a small business owner.
The business owner is asking: "${question}"

Here is the exact current database of orders and sales:
Total Orders: ${dataset?.totalOrders || 0}
Total Revenue: $${dataset?.totalRevenue || 0}
Pending Orders Count: ${dataset?.pendingCount || 0}
Pending Revenue: $${dataset?.pendingRevenue || 0}
Channel Totals: ${JSON.stringify(dataset?.channelTotals || {})}
Recent Orders Table:
${JSON.stringify(dataset?.orders || [], null, 2)}

Answer the user's question accurately, concisely, and directly.
- Cite specific customer names, order IDs, product names, dates, amounts, and channels when relevant.
- Highlight exact figures (e.g. "$450.00", "3 pending orders").
- Be encouraging, pragmatic, and decision-oriented.
- Suggest 2 quick follow-up questions the owner might want to know next.

Format the response strictly as valid JSON:
{
  "answer": "string (formatted with clean markdown: paragraphs, bolding, bullet points)",
  "highlightMetric": "string (e.g. '$1,240.00 from WhatsApp' or 'ORD-1049 is highest')",
  "relevantOrderIds": ["string"],
  "suggestedFollowUps": ["string", "string"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error answering question:', error);
      return res.status(500).json({
        error: error.message || 'Failed to answer question',
      });
    }
  });

  // API Route: Smart parse order from WhatsApp text, Spreadsheet row/CSV, or Handwritten image/text
  app.post('/api/ai/parse-order', async (req, res) => {
    try {
      const { source, rawText, imageBase64, mimeType } = req.body;

      if (!rawText && !imageBase64) {
        return res.status(400).json({ error: 'Either rawText or imageBase64 is required' });
      }

      let parts: any[] = [];

      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
          },
        });
        parts.push({
          text: `This image shows a handwritten sales record, order receipt, notebook ledger, or order slip for a small business.
Please transcribe and extract all order details from this handwritten document.
Extract:
- Customer name (if visible, otherwise "Walk-in Customer" or guest)
- Customer phone/contact (if visible)
- Customer delivery address (if visible)
- Order items (item name, quantity, estimated/written unit price, total line price)
- Date (if visible, otherwise use current date ISO string)
- Payment method or status (e.g. Cash, Paid, Unpaid, Transfer)
- Notes / special instructions
- Source: 'handwritten'`,
        });
      } else {
        parts.push({
          text: `You are an AI order parser for small businesses.
The user provided a raw input from source: "${source || 'whatsapp'}".
Raw text content:
"""
${rawText}
"""

Parse this raw message / row / text into a structured order.
If it is a WhatsApp chat message, extract customer greetings, address, phone number, ordered items, quantities, and delivery notes.
If it is spreadsheet CSV or row data, map columns appropriately.
If prices are omitted, estimate a standard realistic price based on common retail values (e.g., $15-$45).
Suggest a default status: 'pending' (unless clearly marked delivered/completed).
Suggest paymentStatus: 'unpaid' or 'paid' based on clues.`,
        });
      }

      parts.push({
        text: `Respond strictly with JSON adhering to this exact schema:
{
  "customerName": "string",
  "customerPhone": "string",
  "customerAddress": "string",
  "source": "whatsapp" | "spreadsheet" | "handwritten" | "direct",
  "sourceDetail": "string (e.g. 'WhatsApp chat message', 'Handwritten ledger slip #88', 'Pasted CSV row')",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unitPrice": number,
      "total": number
    }
  ],
  "subtotal": number,
  "discount": number,
  "tax": number,
  "shipping": number,
  "total": number,
  "status": "pending" | "processing" | "completed" | "cancelled",
  "paymentStatus": "paid" | "unpaid" | "partial",
  "paymentMethod": "string",
  "notes": "string"
}`,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error parsing order:', error);
      return res.status(500).json({
        error: error.message || 'Failed to parse order',
      });
    }
  });

  // Serve Frontend
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${isProduction ? 'production' : 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer();
