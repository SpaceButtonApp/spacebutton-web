function buildXls(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const headerRow = headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')
  const dataRows = rows.map(row => {
    const cells = headers.map(h => {
      const val = row[h] ?? ''
      return `<Cell><Data ss:Type="String">${String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`
    }).join('')
    return `<Row>${cells}</Row>`
  }).join('')
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table><Row>${headerRow}</Row>${dataRows}</Table></Worksheet></Workbook>`
}

function downloadXls(xml: string, filename: string) {
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportSupportTable(rows: Record<string, unknown>[], filename: string) {
  downloadXls(buildXls(rows), filename)
}
