export type PaymentStatus = 'SUCCEEDED' | 'REFUNDED';

export interface Payment {
  id: string;
  invoiceId: string;
  externalReference: string;
  amountCents: number;
  paidAt: string;
  status: PaymentStatus;
}

export interface Refund {
  id: string;
  paymentId: string;
  invoiceId: string;
  amountCents: number;
  refundedAt: string;
}
