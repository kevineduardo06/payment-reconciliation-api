export type InvoiceStatus = 'OPEN' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'CANCELED';

export interface Invoice {
  id: string;
  customerId: string;
  description: string;
  dueDate: string;
  amountCents: number;
  paidCents: number;
  refundedCents: number;
  status: InvoiceStatus;
  createdAt: string;
}
