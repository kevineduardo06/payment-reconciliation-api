import { z } from 'zod';
import { HttpError } from '../../shared/httpError';
import { nextId } from '../../shared/id';
import { invoiceRepository } from './invoiceRepository';
import { Invoice, InvoiceStatus } from './invoiceTypes';

const createInvoiceSchema = z.object({
  customerId: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().min(10),
  amountCents: z.number().int().positive()
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const invoiceService = {
  create(input: CreateInvoiceInput): Invoice {
    const data = createInvoiceSchema.parse(input);

    const invoice: Invoice = {
      id: nextId('inv'),
      customerId: data.customerId,
      description: data.description,
      dueDate: data.dueDate,
      amountCents: data.amountCents,
      paidCents: 0,
      refundedCents: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    return invoiceRepository.save(invoice);
  },

  list(): Invoice[] {
    return invoiceRepository.findAll();
  },

  getRequired(id: string): Invoice {
    const invoice = invoiceRepository.findById(id);
    if (!invoice) {
      throw new HttpError(404, 'Invoice not found');
    }
    return invoice;
  },

  applyPayment(invoiceId: string, amountCents: number): Invoice {
    const invoice = this.getRequired(invoiceId);
    if (invoice.status === 'CANCELED') {
      throw new HttpError(409, 'Canceled invoices cannot receive payments');
    }
    if (invoice.paidCents + amountCents > invoice.amountCents) {
      throw new HttpError(409, 'Payment would exceed invoice amount');
    }

    invoice.paidCents += amountCents;
    invoice.status = determineInvoiceStatus(invoice);
    return invoiceRepository.save(invoice);
  },

  applyRefund(invoiceId: string, amountCents: number): Invoice {
    const invoice = this.getRequired(invoiceId);
    if (amountCents > invoice.paidCents - invoice.refundedCents) {
      throw new HttpError(409, 'Refund would exceed refundable amount');
    }

    invoice.refundedCents += amountCents;
    invoice.status = determineInvoiceStatus(invoice);
    return invoiceRepository.save(invoice);
  }
};

function determineInvoiceStatus(invoice: Invoice): InvoiceStatus {
  const netPaid = invoice.paidCents - invoice.refundedCents;

  if (invoice.paidCents > 0 && netPaid === 0) {
    return 'REFUNDED';
  }
  if (netPaid === invoice.amountCents) {
    return 'PAID';
  }
  if (netPaid > 0) {
    return 'PARTIALLY_PAID';
  }
  return 'OPEN';
}
