/**
 * Universal Enterprise Data Export Utility for BusinessOS-AI.
 * Generates and downloads CSV, JSON, and formatted Printable PDF/HTML documents.
 */

export interface ExportColumn<T = any> {
  header: string
  key: keyof T | string | ((row: T) => string | number | boolean | null | undefined | any)
}

export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  data: T[],
  columns?: ExportColumn<T>[]
) {
  if (!data || data.length === 0) {
    alert('No data available to export.')
    return
  }

  // 1. Determine headers and value extractors
  let headers: string[] = []
  let extractors: ((row: T) => any)[] = []

  if (columns && columns.length > 0) {
    headers = columns.map((c) => c.header)
    extractors = columns.map((c) => {
      if (typeof c.key === 'function') {
        return c.key
      }
      return (row: T) => row[c.key as keyof T]
    })
  } else {
    // Automatically infer keys from first object
    const sampleKeys = Object.keys(data[0])
    headers = sampleKeys.map((k) => k.replace(/_/g, ' ').toUpperCase())
    extractors = sampleKeys.map((k) => (row: T) => row[k])
  }

  // 2. Build CSV rows with proper quote escaping
  const csvLines: string[] = []
  csvLines.push(headers.map(escapeCsvCell).join(','))

  for (const row of data) {
    const rowValues = extractors.map((extractor) => {
      const val = extractor(row)
      return escapeCsvCell(val)
    })
    csvLines.push(rowValues.join(','))
  }

  const csvString = csvLines.join('\r\n')
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename.replace(/\.csv$/i, '')}_${getDateStamp()}.csv`)
}

export function exportToJson<T>(filename: string, data: T[]) {
  if (!data || data.length === 0) {
    alert('No data available to export.')
    return
  }
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
  downloadBlob(blob, `${filename.replace(/\.json$/i, '')}_${getDateStamp()}.json`)
}

export function exportToPrintableReport<T extends Record<string, any>>(
  title: string,
  subtitle: string,
  data: T[],
  columns: ExportColumn<T>[]
) {
  if (!data || data.length === 0) {
    alert('No data available to generate report.')
    return
  }

  const dateStamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const tableHeaderHtml = columns
    .map((c) => `<th style="padding: 8px 12px; background: #f0f7ff; color: #0369a1; border-bottom: 2px solid #bae6fd; text-align: left; font-size: 11px; text-transform: uppercase;">${c.header}</th>`)
    .join('')

  const tableRowsHtml = data
    .map((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc'
      const cells = columns
        .map((c) => {
          const val = typeof c.key === 'function' ? c.key(row) : row[c.key as keyof T]
          return `<td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #1e293b;">${val !== undefined && val !== null ? String(val) : '-'}</td>`
        })
        .join('')
      return `<tr style="background: ${bg};">${cells}</tr>`
    })
    .join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - BusinessOS Export</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 24px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px; }
          .logo { font-size: 20px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; }
          .meta { font-size: 11px; color: #64748b; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">⚡ BusinessOS-AI Enterprise</div>
            <h2 style="margin: 4px 0 0 0; font-size: 16px; color: #0f172a;">${title}</h2>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">${subtitle}</p>
          </div>
          <div class="meta">
            <div>Generated: <strong>${dateStamp}</strong></div>
            <div>Total Records: <strong>${data.length}</strong></div>
          </div>
        </div>

        <table>
          <thead><tr>${tableHeaderHtml}</tr></thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>

        <div style="margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px;">
          BusinessOS Autonomous Enterprise Operating System • Confidential Operational Record
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  } else {
    alert('Please allow popups to print/export reports.')
  }
}

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  if (typeof val === 'object') {
    str = JSON.stringify(val)
  }
  // If string contains comma, quote, or newline, escape quotes and wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return `"${str}"`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getDateStamp(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}
