import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from './shared/httpError';
import { invoiceService } from './modules/invoices/invoiceService';
import { paymentService } from './modules/payments/paymentService';
import { reconciliationService } from './modules/reconciliation/reconciliationService';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/invoices', (_req, res) => {
  res.json(invoiceService.list());
});

app.get('/invoices/:invoiceId', (req, res) => {
  res.json(invoiceService.getRequired(req.params.invoiceId));
});

app.post('/invoices', (req, res) => {
  const invoice = invoiceService.create(req.body);
  res.status(201).json(invoice);
});

app.post('/payments', (req, res) => {
  const payment = paymentService.createPayment(req.body);
  res.status(201).json(payment);
});

app.post('/payments/:paymentId/refund', (req, res) => {
  const refund = paymentService.refundPayment(req.params.paymentId, req.body);
  res.status(201).json(refund);
});

app.get('/reconciliation/daily', (req, res) => {
  const date = String(req.query.date ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpError(400, 'Query parameter date must use YYYY-MM-DD');
  }
  res.json(reconciliationService.getDailySummary(date));
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', issues: error.issues });
  }
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
});
