# Payment Reconciliation API

A small TypeScript/Express API for invoice payment and reconciliation workflows.

## Domain

The system manages:

- customers
- invoices
- payments
- refunds
- daily reconciliation summaries

Money values are stored in cents as integers.

## Commands

```bash
npm install
npm test
npm run build
npm run dev
```

## Useful endpoints

```http
GET /health
GET /invoices
GET /invoices/:invoiceId
POST /invoices
POST /payments
POST /payments/:paymentId/refund
GET /reconciliation/daily?date=2026-04-28
```

## Notes for future tasks

This project intentionally stays lightweight and uses in-memory repositories. It still has realistic business rules around idempotency, partial payments, refunds, and invoice status transitions.


## Current limitations and future development

This is a personal development prototype, not a production deployment. Repositories currently use in-memory storage. Planned enhancements and estimated work are documented in [ROADMAP.md](ROADMAP.md). No production users or deployments are claimed.

## License

MIT; see [LICENSE](LICENSE).
