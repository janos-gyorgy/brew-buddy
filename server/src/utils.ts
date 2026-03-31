export const toNum = (v: string | null | undefined): number | null =>
  v !== null && v !== undefined ? parseFloat(v) : null;
