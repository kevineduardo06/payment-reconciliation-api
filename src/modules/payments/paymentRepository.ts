import { Payment, Refund } from './paymentTypes';

const payments = new Map<string, Payment>();
const refunds = new Map<string, Refund>();

export const paymentRepository = {
  savePayment(payment: Payment): Payment {
    payments.set(payment.id, payment);
    return payment;
  },

  findPaymentById(id: string): Payment | undefined {
    return payments.get(id);
  },

  findPaymentByExternalReference(externalReference: string): Payment | undefined {
    return Array.from(payments.values()).find(payment => payment.externalReference === externalReference);
  },

  findPaymentsByInvoice(invoiceId: string): Payment[] {
    return Array.from(payments.values()).filter(payment => payment.invoiceId === invoiceId);
  },

  saveRefund(refund: Refund): Refund {
    refunds.set(refund.id, refund);
    return refund;
  },

  findRefundsByInvoice(invoiceId: string): Refund[] {
    return Array.from(refunds.values()).filter(refund => refund.invoiceId === invoiceId);
  },

  findAllPayments(): Payment[] {
    return Array.from(payments.values());
  },

  findAllRefunds(): Refund[] {
    return Array.from(refunds.values());
  },

  clear(): void {
    payments.clear();
    refunds.clear();
  }
};
