import * as XLSX from 'xlsx';

export function exportToExcel<T extends Record<string, any>>(data: T[], fileName: string, sheetName: string) {
  if (!Array.isArray(data)) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Sheet1');
  XLSX.writeFile(workbook, `${fileName || 'export'}.xlsx`);
}