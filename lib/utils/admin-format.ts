export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  if (diffMonth < 12) return `about ${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;
  return `about ${diffYear} year${diffYear === 1 ? "" : "s"} ago`;
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function truncateId(id: string, len = 8): string {
  if (id.length <= len) return id;
  return `${id.slice(0, len)}...`;
}

/**
 * Downloads an array of flat objects as an Excel (.xls) file using
 * SpreadsheetML format — no external library required.
 */
export function exportToExcel(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);

  function esc(val: unknown): string {
    return String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const headerCells = headers
    .map((h) => `<Cell ss:StyleID="h"><Data ss:Type="String">${esc(h)}</Data></Cell>`)
    .join("");

  const dataRows = rows
    .map((row) => {
      const cells = headers
        .map((h) => {
          const v = row[h];
          const type = typeof v === "number" ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${esc(v)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="h">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#6D28D9" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Data">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const name = filename.replace(/\.(csv|xlsx?|xls)$/i, "");
  link.setAttribute("download", `${name}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** @deprecated Use exportToExcel instead */
export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  exportToExcel(filename, rows);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
