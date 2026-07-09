import { Invoice } from './invoiceTypes';

const invoices = new Map<string, Invoice>();

export const invoiceRepository = {
  save(invoice: Invoice): Invoice {
    invoices.set(invoice.id, invoice);
    return invoice;
  },

  findById(id: string): Invoice | undefined {
    return invoices.get(id);
  },

  findAll(): Invoice[] {
    return Array.from(invoices.values());
  },

  clear(): void {
    invoices.clear();
  }
};
