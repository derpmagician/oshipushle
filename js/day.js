import { EPOCH, MS_PER_DAY } from "./constants.js";
import { mulberry32 } from "./prng.js";

// ── Day index (UTC, relative to EPOCH) ───────────────────────────────────────
export function getDayIndex() {
  const now = new Date();
  // Calculate the number of whole days between EPOCH and today in UTC
  const todayUTC  = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const epochUTC  = Date.UTC(EPOCH.getUTCFullYear(), EPOCH.getUTCMonth(), EPOCH.getUTCDate());
  // Use floor to get the number of complete days, ensuring it works correctly even if today is before EPOCH
  return Math.floor((todayUTC - epochUTC) / MS_PER_DAY);
}

// ── Full-cycle shuffle — no repeats until all cards used ─────────────────────
export function getDailyCardIndex(totalCards) {
  const dayIndex    = getDayIndex();
  const cycleLength = totalCards;
  const cycleNumber = Math.floor(dayIndex / cycleLength);
  const dayInCycle  = ((dayIndex % cycleLength) + cycleLength) % cycleLength;

  // Create a seeded RNG based on the cycle number to ensure the same shuffle each cycle
  const rng     = mulberry32(cycleNumber * 7919 + 31); // prime salt
  const indices = Array.from({ length: cycleLength }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return { cardIndex: indices[dayInCycle], puzzleNumber: dayIndex + 1, cycleNumber: cycleNumber + 1 };
}
