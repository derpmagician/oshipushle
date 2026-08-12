// ── Constants ────────────────────────────────────────────────────────────────
export const EPOCH       = new Date("2026-03-06T00:00:00Z"); // day 0 (first puzzle)
export const MS_PER_DAY  = 86_400_000;
export const DATA_URL    = "all_vault_cards.json";
export const MAX_GUESSES = 8;

// ── Native Formatters ────────────────────────────────────────────────────────
export const numFmt = new Intl.NumberFormat(navigator.language);
export const dateFmt = new Intl.DateTimeFormat(navigator.language, {
  year: "numeric",
  month: "long",
  day: "numeric",
});
