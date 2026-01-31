// Shared utility functions for Edge Functions

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get periodo string from month and year (YYYY-MM)
 */
export function getPeriodo(mes: number, anio: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}`;
}

/**
 * Parse periodo string (YYYY-MM) to month and year
 */
export function parsePeriodo(periodo: string): { mes: number; anio: number } {
  const [anio, mes] = periodo.split('-').map(Number);
  return { mes, anio };
}

/**
 * Get first and last day of a month
 */
export function getMonthRange(mes: number, anio: number): { inicio: string; fin: string } {
  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 0); // Last day of month
  return {
    inicio: formatDate(inicio),
    fin: formatDate(fin),
  };
}

/**
 * Generate a sequential number with prefix (e.g., FAC-2026-0001)
 */
export function generateNumero(prefix: string, anio: number, sequence: number): string {
  return `${prefix}-${anio}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Validate month (1-12) and year
 */
export function validatePeriodo(mes: number, anio: number): boolean {
  return mes >= 1 && mes <= 12 && anio >= 2000 && anio <= 2100;
}

/**
 * Calculate percentage
 */
export function calcularPorcentaje(monto: number, porcentaje: number): number {
  return Number((monto * porcentaje / 100).toFixed(2));
}

/**
 * Round to 2 decimal places
 */
export function redondear(valor: number): number {
  return Number(valor.toFixed(2));
}
