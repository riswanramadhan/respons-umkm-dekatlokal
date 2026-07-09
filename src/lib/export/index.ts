import "server-only";

import ExcelJS from "exceljs";

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function rowsToCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return "\uFEFF";
  const headers = Object.keys(rows[0] ?? {});
  return `\uFEFF${[headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\r\n")}`;
}

export async function rowsToXlsx(rows: Array<Record<string, unknown>>) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DekatLokal Dashboard";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Digital Checkup", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const headers = Object.keys(rows[0] ?? { informasi: "" });
  sheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.min(Math.max(header.length + 3, 14), 35),
  }));
  rows.forEach((row) => sheet.addRow(row));
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0255F5" },
  };
  header.alignment = { vertical: "middle" };
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headers.length },
  };
  return workbook.xlsx.writeBuffer();
}
