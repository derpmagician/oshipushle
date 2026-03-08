// ── PRNG: Mulberry32 ─────────────────────────────────────────────────────────
export function mulberry32(seed) {
  // Ensure the seed is a 32-bit unsigned integer
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0; // Add a large constant to the seed to avoid zero
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}
