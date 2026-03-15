/**
 * merge-caja.ts
 *
 * Lee los registros del CAJA posteriores al corte e incorpora las filas
 * directamente en la hoja "Diario" de "Operativa estanco.xlsx", que es
 * la fuente de verdad del seed-prod.
 *
 * Ejecutar: npm run merge:caja
 */

import * as XLSX from 'xlsx';

const OPERATIVA_FILE = '/home/jjpg95/Descargas/Operativa estanco.xlsx';
const CAJA_FILE      = '/home/jjpg95/Descargas/CAJA.ods.xlsx';

// Fecha de corte: se importan registros del Caja POSTERIORES a esta fecha.
// El Operativa ya tiene los datos hasta Caja-4-dic (guardado como 2-dic en BD).
const CUTOFF = new Date('2025-12-04T00:00:00.000Z');

// Meses en inglés (como aparecen en el Caja) → índice 0-based
const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3,  May: 4,  Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9,  Nov: 10, Dec: 11,
};

interface DiarioRow {
  Fecha: Date;
  Tipo:  string;
  Monto: number;
  Año:   number;
}

/**
 * Cada hoja cubre un año fiscal: Jul(año N) → Jun(año N+1).
 * Año 1 empieza en Jul 2012, por tanto Año N empieza en Jul(2011+N).
 */
function parseFecha(dia: string, sheetName: string): Date | null {
  const match = dia.match(/^(\d+)-([A-Za-z]+)$/);
  if (!match) return null;

  const day      = parseInt(match[1], 10);
  const monthStr = match[2];
  const month    = MONTH_MAP[monthStr];
  if (month === undefined) return null;

  const yearNum  = parseInt(sheetName.replace(/\D/g, ''), 10);
  if (isNaN(yearNum)) return null;

  const startYear = 2011 + yearNum; // Año 1 → 2012, Año 14 → 2025
  // Jul-Dec pertenecen al año de inicio; Ene-Jun al siguiente
  const year = month >= 6 ? startYear : startYear + 1;

  return new Date(Date.UTC(year, month, day));
}

/** Convierte strings tipo " 2,047.55 € " o " -   € " a número */
function parseAmount(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = String(val).replace(/[€\s]/g, '').replace(/,/g, '');
  if (clean === '-' || clean === '') return 0;
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

function readCajaRows(): DiarioRow[] {
  console.log(`Leyendo Caja: ${CAJA_FILE}`);
  const wb = XLSX.readFile(CAJA_FILE, { cellDates: true });

  const rows: DiarioRow[] = [];
  let skipped = 0;

  for (const sheetName of wb.SheetNames) {
    if (sheetName === 'TOTALES') continue;

    const sheet = wb.Sheets[sheetName];
    const data: Array<Record<string, any>> = XLSX.utils.sheet_to_json(sheet, { raw: false });

    for (const row of data) {
      const dia = row['DIA'];
      if (!dia || typeof dia !== 'string') { skipped++; continue; }

      const fecha = parseFecha(dia.trim(), sheetName);
      if (!fecha)          { skipped++; continue; }
      if (fecha <= CUTOFF) continue; // ya está en Operativa

      const resto  = parseAmount(row[' RESTO ']  ?? row['RESTO']);
      const gastos = parseAmount(row[' GASTOS '] ?? row['GASTOS']);
      const año    = fecha.getUTCFullYear();

      // Día sin datos (festivo o cerrado)
      if (resto === 0 && gastos === 0) { skipped++; continue; }

      if (resto > 0) {
        rows.push({ Fecha: fecha, Tipo: 'Ingreso', Monto: resto,  Año: año });
      }
      if (gastos > 0) {
        rows.push({ Fecha: fecha, Tipo: 'Gasto',   Monto: gastos, Año: año });
      }
    }
  }

  console.log(`  Filas nuevas del Caja: ${rows.length} (saltadas: ${skipped})`);
  return rows;
}

/** Convierte un JS Date (UTC) al número serial de Excel (sistema 1900) */
function dateToSerial(date: Date): number {
  const EXCEL_EPOCH = Date.UTC(1899, 11, 30); // 30-dic-1899
  return Math.round((date.getTime() - EXCEL_EPOCH) / 86400000);
}

function mergeIntoOperativa(newRows: DiarioRow[]): void {
  console.log(`\nLeyendo Operativa: ${OPERATIVA_FILE}`);
  const wb    = XLSX.readFile(OPERATIVA_FILE, { cellDates: true });
  const sheet = wb.Sheets['Diario'];
  if (!sheet) throw new Error('Hoja "Diario" no encontrada en Operativa estanco');

  const range  = XLSX.utils.decode_range(sheet['!ref']!);
  let lastRow  = range.e.r;

  console.log(`  Filas existentes en Diario: ${lastRow} (+ cabecera)`);

  for (const row of newRows) {
    lastRow++;

    // Col A: Fecha como serial numérico de Excel
    sheet[XLSX.utils.encode_cell({ r: lastRow, c: 0 })] = {
      t: 'n', v: dateToSerial(row.Fecha), z: 'dd/mm/yyyy',
    };
    // Col B: Tipo
    sheet[XLSX.utils.encode_cell({ r: lastRow, c: 1 })] = {
      t: 's', v: row.Tipo,
    };
    // Col C: Monto
    sheet[XLSX.utils.encode_cell({ r: lastRow, c: 2 })] = {
      t: 'n', v: row.Monto,
    };
    // Col D: Año
    sheet[XLSX.utils.encode_cell({ r: lastRow, c: 3 })] = {
      t: 'n', v: row.Año,
    };
  }

  range.e.r     = lastRow;
  sheet['!ref'] = XLSX.utils.encode_range(range);

  XLSX.writeFile(wb, OPERATIVA_FILE);
  console.log(`\nGuardado: ${OPERATIVA_FILE}`);
  console.log(`Filas añadidas: ${newRows.length}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const newRows = readCajaRows();

if (newRows.length === 0) {
  console.log('No hay registros nuevos que añadir.');
  process.exit(0);
}

newRows.sort((a, b) => a.Fecha.getTime() - b.Fecha.getTime());

mergeIntoOperativa(newRows);
