/** Convierte Date → YYYY-MM-DD (para inputs type="date") */
export function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Fecha mínima permitida: 2025-01-01 */
export function getMinExpenseDate(): string {
  return "2025-01-01";
}

/** Fecha máxima permitida: hoy (pero nunca fuera de 2025) */
export function getMaxExpenseDate(): string {
  const today = new Date();
  const endOf2025 = new Date("2025-12-31");

  // si hoy pasa de 2025, clamp a 2025-12-31
  return toISODate(today > endOf2025 ? endOf2025 : today);
}

/** Formatea fechas en formato US MM/DD/YYYY */
export function formatDateOnlyUS(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
