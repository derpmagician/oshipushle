// ── Comparison helpers ────────────────────────────────────────────────────────
export function compareExact(guessVal, answerVal) {
  if (guessVal === answerVal) return "correct";
  return "wrong";
}

export function compareArrays(guessArr, answerArr) {
  const g = guessArr ?? [];
  const a = answerArr ?? [];
  if (g.length === a.length && g.every((v) => a.includes(v))) return "correct";
  if (g.some((v) => a.includes(v))) return "partial";
  return "wrong";
}

export function compareNumeric(guessVal, answerVal) {
  const g = guessVal != null ? Number(guessVal) : null;
  const a = answerVal != null ? Number(answerVal) : null;

  if (g === a)            return { status: "correct", direction: null };
  if (g == null && a == null) return { status: "correct", direction: null };
  if (g == null && a != null) return { status: "wrong",   direction: "up" };
  if (g != null && a == null) return { status: "wrong",   direction: "down" };
  return {
    status: "wrong",
    direction: g < a ? "up" : "down",
  };
}
