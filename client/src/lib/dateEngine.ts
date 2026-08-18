export const LOG_MIN = 1;
export const LOG_MAX = 13_800_000_000; // 13.8 billion years BP (Big Bang)

const LOG_MAX_VAL = Math.log10(LOG_MAX + 1);

/**
 * Converts years_before_present into a percentage position (0% to 100%).
 * 0% represents 13.8 billion years ago (Big Bang, far left).
 * 100% represents present day (0 years BP, far right).
 * Logarithmic scaling ensures deep time is compressed while recent centuries expand.
 */
export function yearsBPtoPos(yearsBP: number): number {
  if (yearsBP <= 0) return 100;
  if (yearsBP >= LOG_MAX) return 0;

  const logVal = Math.log10(yearsBP + 1);
  const ratio = logVal / LOG_MAX_VAL;
  
  // 13.8B BP -> ratio = 1 -> pos = 0%
  // 0 BP -> ratio = 0 -> pos = 100%
  const pos = (1 - ratio) * 100;
  return Number(pos.toFixed(4));
}

/**
 * Converts a timeline percentage position (0% to 100%) back into years_before_present.
 */
export function posToYearsBP(posPercent: number): number {
  const clampedPos = Math.max(0, Math.min(100, posPercent));
  const ratio = (100 - clampedPos) / 100;
  const logVal = ratio * LOG_MAX_VAL;
  const yearsBP = Math.pow(10, logVal) - 1;
  return Math.round(yearsBP);
}

/**
 * Formats years_before_present into a human-readable display string.
 * Example: "~13.8 billion years ago", "~3300 BCE", "1947 CE".
 */
export function formatYearsBP(
  yearsBP: number,
  calendar?: string,
  yearStart?: number
): string {
  if (yearsBP >= 1_000_000_000) {
    const bill = (yearsBP / 1_000_000_000).toFixed(1);
    return `~${bill.endsWith('.0') ? Math.round(yearsBP / 1_000_000_000) : bill} billion years ago`;
  }

  if (yearsBP >= 1_000_000) {
    const mill = (yearsBP / 1_000_000).toFixed(1);
    return `~${mill.endsWith('.0') ? Math.round(yearsBP / 1_000_000) : mill} million years ago`;
  }

  if (yearStart !== undefined && yearStart !== null && calendar === 'ce_bce') {
    if (yearStart <= 0) {
      const bceYear = Math.abs(yearStart) === 0 ? 1 : Math.abs(yearStart);
      return `~${bceYear} BCE`;
    }
    return `${yearStart} CE`;
  }

  if (calendar === 'ya' || yearsBP > 2026) {
    const bceYear = yearsBP - 2026;
    return `~${bceYear.toLocaleString()} BCE`;
  }

  const ceYear = 2026 - Math.round(yearsBP);
  return `${ceYear} CE`;
}
