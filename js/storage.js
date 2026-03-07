// ── Local Storage ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "oshipushle_state";

export function saveState(puzzleNumber, guessedNames, won) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ puzzleNumber, guessedNames: [...guessedNames], won })
  );
}

export function loadState(puzzleNumber) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (state.puzzleNumber !== puzzleNumber) return null; // stale
    return state;
  } catch {
    return null;
  }
}
