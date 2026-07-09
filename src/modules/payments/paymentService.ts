import { z } from 'zod';
import { HttpError } from '../../shared/httpError';
import { nextId } from '../../shared/id';
import { invoiceService } from '../invoices/invoiceService';
import { paymentRepository } from './paymentRepository';
import { Payment, Refund } from './paymentTypes';

const createPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  externalReference: z.string().min(1),
  amountCents: z.number().int().positive(),
  paidAt: z.string().min(10)
});

const createRefundSchema = z.object({
  amountCents: z.number().int().positive(),
  refundedAt: z.string().min(10)
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;

export const paymentService = {
  createPayment(input: CreatePaymentInput): Payment {
    const data = createPaymentSchema.parse(input);
    const existing = paymentRepository.findPaymentByExternalReference(data.externalReference);

    if (existing) {
      if (existing.invoiceId === data.invoiceId && existing.amountCents === data.amountCents) {
        return existing;
      }
      throw new HttpError(409, 'External reference already used for a different payment');
    }

    invoiceService.applyPayment(data.invoiceId, data.amountCents);

    return paymentRepository.savePayment({
      id: nextId('pay'),
      invoiceId: data.invoiceId,
      externalReference: data.externalReference,
      amountCents: data.amountCents,
      paidAt: data.paidAt,
      status: 'SUCCEEDED'
    });
  },

  refundPayment(paymentId: string, input: CreateRefundInput): Refund {
    const data = createRefundSchema.parse(input);
    const payment = paymentRepository.findPaymentById(paymentId);

    if (!payment) {
      throw new HttpError(404, 'Payment not found');
    }
    if (payment.status === 'REFUNDED') {
      throw new HttpError(409, 'Payment has already been fully refunded');
    }
    if (data.amountCents !== payment.amountCents) {
      throw new HttpError(409, 'Only full refunds are currently supported');
    }

    const invoice = invoiceService.applyRefund(payment.invoiceId, data.amountCents);
    payment.status = 'REFUNDED';
    paymentRepository.savePayment(payment);

    return paymentRepository.saveRefund({
      id: nextId('ref'),
      paymentId: payment.id,
      invoiceId: invoice.id,
      amountCents: data.amountCents,
      refundedAt: data.refundedAt
    });
  }
};
