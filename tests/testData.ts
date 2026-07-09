import { resetIds } from '../src/shared/id';
import { invoiceRepository } from '../src/modules/invoices/invoiceRepository';
import { paymentRepository } from '../src/modules/payments/paymentRepository';

export function resetTestData(): void {
  resetIds();
  invoiceRepository.clear();
  paymentRepository.clear();
}
