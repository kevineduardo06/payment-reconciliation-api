import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { resetTestData } from './testData';

describe('payment reconciliation API', () => {
  beforeEach(() => {
    resetTestData();
  });

  async function createInvoice(amountCents = 10000) {
    const response = await request(app).post('/invoices').send({
      customerId: 'cust_1',
      description: 'Monthly subscription',
      dueDate: '2026-04-30',
      amountCents
    });
    return response.body;
  }

  it('creates an invoice as OPEN', async () => {
    const response = await request(app).post('/invoices').send({
      customerId: 'cust_1',
      description: 'Monthly subscription',
      dueDate: '2026-04-30',
      amountCents: 10000
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('OPEN');
    expect(response.body.paidCents).toBe(0);
  });

  it('marks invoice as partially paid when payment is lower than total', async () => {
    const invoice = await createInvoice(10000);

    await request(app).post('/payments').send({
      invoiceId: invoice.id,
      externalReference: 'gateway_1',
      amountCents: 4000,
      paidAt: '2026-04-28T10:00:00.000Z'
    });

    const invoiceResponse = await request(app).get(`/invoices/${invoice.id}`);
    expect(invoiceResponse.body.status).toBe('PARTIALLY_PAID');
    expect(invoiceResponse.body.paidCents).toBe(4000);
  });

  it('marks invoice as paid when total amount has been received', async () => {
    const invoice = await createInvoice(10000);

    await request(app).post('/payments').send({
      invoiceId: invoice.id,
      externalReference: 'gateway_1',
      amountCents: 10000,
      paidAt: '2026-04-28T10:00:00.000Z'
    });

    const invoiceResponse = await request(app).get(`/invoices/${invoice.id}`);
    expect(invoiceResponse.body.status).toBe('PAID');
  });

  it('returns existing payment for identical external reference to keep payment creation idempotent', async () => {
    const invoice = await createInvoice(10000);
    const payload = {
      invoiceId: invoice.id,
      externalReference: 'gateway_same_reference',
      amountCents: 10000,
      paidAt: '2026-04-28T10:00:00.000Z'
    };

    const first = await request(app).post('/payments').send(payload);
    const second = await request(app).post('/payments').send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);

    const invoiceResponse = await request(app).get(`/invoices/${invoice.id}`);
    expect(invoiceResponse.body.paidCents).toBe(10000);
  });

  it('rejects reused external reference with different payment details', async () => {
    const invoice = await createInvoice(10000);

    await request(app).post('/payments').send({
      invoiceId: invoice.id,
      externalReference: 'gateway_conflict',
      amountCents: 4000,
      paidAt: '2026-04-28T10:00:00.000Z'
    });

    const response = await request(app).post('/payments').send({
      invoiceId: invoice.id,
      externalReference: 'gateway_conflict',
      amountCents: 5000,
      paidAt: '2026-04-28T11:00:00.000Z'
    });

    expect(response.status).toBe(409);
  });

  it('rejects overpayment', async () => {
    const invoice = await createInvoice(10000);

    const response = await request(app).post('/payments').send({
      invoiceId: invoice.id,
      externalReference: 'gateway_overpay',
      amountCents: 11000,
      paidAt: '2026-04-28T10:00:00.000Z'
    });

    expect(response.status).toBe(409);
  });

  it('supports full refund and updates invoice status', async () => {
    const invoice = await createInvoice(10000);
    const paymentResponse = await request(app).post('/payments').send({
      invoiceId: invoice.id,
      externalReference: 'gateway_refund',
      amountCents: 10000,
      paidAt: '2026-04-28T10:00:00.000Z'
    });

    const refundResponse = await request(app).post(`/payments/${paymentResponse.body.id}/refund`).send({
      amountCents: 10000,
      refundedAt: '2026-04-28T12:00:00.000Z'
    });

    expect(refundResponse.status).toBe(201);

    const invoiceResponse = await request(app).get(`/invoices/${invoice.id}`);
    expect(invoiceResponse.body.status).toBe('REFUNDED');
    expect(invoiceResponse.body.refundedCents).toBe(10000);
  });

  it('returns daily reconciliation totals', async () => {
    const invoice = await createInvoice(10000);
    const paymentResponse = await request(app).post('/payments').send({
      invoiceId: invoice.id,
      externalReference: 'gateway_recon',
      amountCents: 10000,
      paidAt: '2026-04-28T10:00:00.000Z'
    });

    await request(app).post(`/payments/${paymentResponse.body.id}/refund`).send({
      amountCents: 10000,
      refundedAt: '2026-04-28T12:00:00.000Z'
    });

    const response = await request(app).get('/reconciliation/daily?date=2026-04-28');

    expect(response.body.paymentCount).toBe(1);
    expect(response.body.refundCount).toBe(1);
    expect(response.body.grossPaymentsCents).toBe(10000);
    expect(response.body.refundsCents).toBe(10000);
    expect(response.body.netPaymentsCents).toBe(0);
  });
});
