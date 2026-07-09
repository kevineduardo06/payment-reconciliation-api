import { paymentRepository } from '../payments/paymentRepository';

export interface DailyReconciliationSummary {
  date: string;
  paymentCount: number;
  refundCount: number;
  grossPaymentsCents: number;
  refundsCents: number;
  netPaymentsCents: number;
}

export const reconciliationService = {
  getDailySummary(date: string): DailyReconciliationSummary {
    const payments = paymentRepository
      .findAllPayments()
      .filter(payment => payment.paidAt.startsWith(date));

    const refunds = paymentRepository
      .findAllRefunds()
      .filter(refund => refund.refundedAt.startsWith(date));

    const grossPaymentsCents = payments.reduce((total, payment) => total + payment.amountCents, 0);
    const refundsCents = refunds.reduce((total, refund) => total + refund.amountCents, 0);

    return {
      date,
      paymentCount: payments.length,
      refundCount: refunds.length,
      grossPaymentsCents,
      refundsCents,
      netPaymentsCents: grossPaymentsCents - refundsCents
    };
  }
};
