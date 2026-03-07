import { MAX_GUESSES } from "./constants.js";
import { compareExact, compareArrays, compareNumeric } from "./compare.js";

// ── Daily win modal ───────────────────────────────────────────────────────────
export function showWinModal(answer, guesses, puzzleNumber) {
  const modal = document.getElementById("win-modal");
  const msg   = document.getElementById("win-message");
  const imgDiv = document.getElementById("win-card-image");

  msg.textContent = `${answer.name} (${answer.cardNumber}) — ${guesses.length}/${MAX_GUESSES} guesses`;

  const imgUrl = answer.variants?.[0]?.myUrl;
  if (imgUrl) {
    imgDiv.innerHTML = `<img src="${imgUrl}" alt="${answer.name}" />`;
  }

  document.getElementById("share-btn").onclick = () => {
    const squares = guesses.map((g) => guessToSquares(g, answer)).join("\n");
    const text = `OshiPushle #${puzzleNumber} ${guesses.length}/${MAX_GUESSES}\n\n${squares}`;
    navigator.clipboard.writeText(text).then(() => {
      document.getElementById("share-btn").textContent = "✅ Copied!";
    });
  };

  document.getElementById("daily-modal-section").classList.remove("hidden");
  document.getElementById("endless-modal-section").classList.add("hidden");

  startCountdown();

  modal.classList.remove("hidden");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

// ── Endless / Platform win modal ──────────────────────────────────────────────
export function showEndlessWinModal(answer, guesses, session, onNextChallenge) {
  const modal  = document.getElementById("win-modal");
  const msg    = document.getElementById("win-message");
  const imgDiv = document.getElementById("win-card-image");

  msg.textContent = `${answer.name} (${answer.cardNumber}) — solved in ${guesses.length} guess${guesses.length !== 1 ? "es" : ""}`;

  const imgUrl = answer.variants?.[0]?.myUrl;
  if (imgUrl) {
    imgDiv.innerHTML = `<img src="${imgUrl}" alt="${answer.name}" />`;
  }

  document.getElementById("daily-modal-section").classList.add("hidden");
  document.getElementById("endless-modal-section").classList.remove("hidden");

  document.getElementById("endless-session-stats").textContent =
    `Session: ${session.solvedCount} solved · ${session.totalGuesses} total guess${session.totalGuesses !== 1 ? "es" : ""}`;

  // Replace button node to remove stale listeners
  const oldBtn = document.getElementById("next-challenge-btn");
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    onNextChallenge();
  });

  modal.classList.remove("hidden");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

// ── Share squares helper ──────────────────────────────────────────────────────
export function guessToSquares(guess, answer) {
  const cells = [
    compareExact(guess.name, answer.name),
    compareExact(guess.cardType, answer.cardType),
    compareArrays(guess.color, answer.color),
    compareArrays(guess.genre, answer.genre),
    compareArrays(guess.vtuber, answer.vtuber),
    compareNumeric(guess.cost, answer.cost).status,
    compareNumeric(guess.influence, answer.influence).status,
  ];

  return cells
    .map((s) => {
      if (s === "correct") return "🟩";
      if (s === "partial") return "🟨";
      return "⬛";
    })
    .join("");
}

// ── Countdown timer ───────────────────────────────────────────────────────────
export function startCountdown() {
  const timerEl = document.getElementById("next-puzzle-timer");

  function tick() {
    const now = new Date();
    const tomorrowUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const diff = tomorrowUTC - now;

    const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");

    timerEl.textContent = `Next puzzle in ${h}:${m}:${s}`;
  }

  tick();
  setInterval(tick, 1_000);
}
