/**
 * Corporate PDF Invoice Generator for BusinessOS-AI.
 * Generates an executive, print-ready corporate invoice matching Northwind & BusinessOS standards.
 */

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status: 'Paid' | 'Pending' | 'Overdue'
  client: {
    name: string
    code?: string
    address?: string
    city?: string
    country?: string
    email?: string
    phone?: string
  }
  organization: {
    name: string
    address: string
    email: string
    phone: string
    taxNumber: string
  }
  items: InvoiceLineItem[]
  subtotal: number
  taxRate: number // e.g. 0.08 for 8%
  taxAmount: number
  discount: number
  totalAmount: number
  notes?: string
}

export function printCorporateInvoice(invoice: InvoiceData) {
  const itemsHtml = invoice.items
    .map(
      (item, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #1e293b;">
        <strong>${item.description}</strong>
      </td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #475569;">
        ${item.quantity}
      </td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #475569;">
        $${item.unitPrice.toFixed(2)}
      </td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: 700; color: #0f172a;">
        $${item.total.toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('')

  const statusBg =
    invoice.status === 'Paid'
      ? '#dcfce7; color: #15803d; border-color: #86efac;'
      : invoice.status === 'Pending'
      ? '#fef9c3; color: #a16207; border-color: #fde047;'
      : '#fee2e2; color: #b91c1c; border-color: #fca5a5;'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber} - ${invoice.client.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 32px auto;
            max-width: 800px;
            color: #0f172a;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .company-brand {
            font-size: 24px;
            font-weight: 800;
            color: #0284c7;
            letter-spacing: -0.5px;
          }
          .invoice-tag {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid;
            background: ${statusBg}
            margin-top: 6px;
          }
          .grid-info {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 28px;
            font-size: 12px;
          }
          .info-block h4 {
            margin: 0 0 6px 0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #f0f7ff;
            color: #0369a1;
            padding: 10px 14px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #bae6fd;
            text-align: left;
          }
          .totals-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 16px;
          }
          .totals-table {
            width: 300px;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 6px 12px;
            font-size: 12px;
          }
          .grand-total {
            font-size: 15px !important;
            font-weight: 800 !important;
            color: #0284c7 !important;
            border-top: 2px solid #0284c7;
            border-bottom: 2px solid #0284c7;
          }
          .footer {
            margin-top: 48px;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            body { margin: 16px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-brand">⚡ ${invoice.organization.name}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">
              ${invoice.organization.address}<br>
              ${invoice.organization.email} • ${invoice.organization.phone}<br>
              Tax / VAT ID: ${invoice.organization.taxNumber}
            </div>
          </div>
          <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #0f172a;">INVOICE</h1>
            <div style="font-family: monospace; font-size: 14px; font-weight: 700; color: #0284c7; margin-top: 2px;">
              #${invoice.invoiceNumber}
            </div>
            <div class="invoice-tag">${invoice.status}</div>
          </div>
        </div>

        <div class="grid-info">
          <div class="info-block" style="flex: 1;">
            <h4>Billed To (Client)</h4>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${invoice.client.name}</div>
            <div style="color: #475569;">
              ${invoice.client.code ? `Account Code: <strong>${invoice.client.code}</strong><br>` : ''}
              ${invoice.client.address || ''}<br>
              ${invoice.client.city || ''} ${invoice.client.country || ''}<br>
              ${invoice.client.email || ''}
            </div>
          </div>

          <div class="info-block" style="text-align: right; width: 220px;">
            <h4>Invoice Metadata</h4>
            <div style="color: #475569;">
              Issue Date: <strong>${invoice.issueDate}</strong><br>
              Payment Due: <strong>${invoice.dueDate}</strong><br>
              Payment Method: <strong>Direct Bank Transfer</strong><br>
              Currency: <strong>USD ($)</strong>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center; width: 80px;">Qty</th>
              <th style="text-align: right; width: 120px;">Unit Price</th>
              <th style="text-align: right; width: 120px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-container">
          <table class="totals-table">
            <tr>
              <td style="color: #64748b;">Subtotal:</td>
              <td style="text-align: right; font-weight: 600;">$${invoice.subtotal.toFixed(2)}</td>
            </tr>
            ${
              invoice.discount > 0
                ? `
            <tr>
              <td style="color: #64748b;">Discount:</td>
              <td style="text-align: right; color: #16a34a;">-$${invoice.discount.toFixed(2)}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="color: #64748b;">Estimated Tax (${(invoice.taxRate * 100).toFixed(0)}%):</td>
              <td style="text-align: right; font-weight: 600;">$${invoice.taxAmount.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td>Total Amount:</td>
              <td style="text-align: right;">$${invoice.totalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        ${
          invoice.notes
            ? `
        <div style="margin-top: 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11px; color: #475569;">
          <strong>Payment Terms & Notes:</strong><br>
          ${invoice.notes}
        </div>`
            : ''
        }

        <div class="footer">
          Thank you for your business! For billing inquiries, contact accounting@northwind.com.<br>
          Generated by BusinessOS Autonomous Enterprise Platform
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  } else {
    alert('Please allow popups to print/download invoice PDF.')
  }
}
