import { MAX_GUESSES } from "./constants.js";
import { compareExact, compareArrays, compareNumeric } from "./compare.js";
import { isAllowedImageUrl } from "./sanitize.js";

let modalHandlersBound = false;
let lastFocusedElement = null;
let countdownIntervalId = null;

function getModal() {
  return document.getElementById("win-modal");
}

function getFocusableElements(modal) {
  return Array.from(
    modal.querySelectorAll(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
    )
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function onModalKeydown(event) {
  const modal = getModal();
  if (modal.classList.contains("hidden")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeWinModal();
    return;
  }

  if (event.key !== "Tab") return;

  const focusables = getFocusableElements(modal);
  if (!focusables.length) {
    event.preventDefault();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function bindModalHandlers() {
  if (modalHandlersBound) return;

  const modal = getModal();
  const closeBtn = document.getElementById("win-close-btn");

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeWinModal();
  });

  closeBtn.addEventListener("click", () => {
    closeWinModal();
  });

  modal.addEventListener("keydown", onModalKeydown);
  modalHandlersBound = true;
}

function openWinModal() {
  const modal = getModal();
  bindModalHandlers();

  if (document.activeElement instanceof HTMLElement) {
    lastFocusedElement = document.activeElement;
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  const dailySectionHidden = document.getElementById("daily-modal-section").classList.contains("hidden");
  const preferredFocusId = dailySectionHidden ? "next-challenge-btn" : "share-btn";
  const target = document.getElementById(preferredFocusId) || document.getElementById("win-close-btn");
  target.focus();
}

export function closeWinModal() {
  const modal = getModal();
  if (modal.classList.contains("hidden")) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");

  if (lastFocusedElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
}

function setCardImage(container, url, altText) {
  container.textContent = "";
  if (!url || !isAllowedImageUrl(url)) return;
  const img = document.createElement("img");
  img.src = url;
  img.alt = altText;
  container.appendChild(img);
}

// ── Daily win modal ───────────────────────────────────────────────────────────
export function showWinModal(answer, guesses, puzzleNumber) {
  const msg   = document.getElementById("win-message");
  const imgDiv = document.getElementById("win-card-image");
  const shareBtn = document.getElementById("share-btn");

  msg.textContent = `${answer.name} (${answer.cardNumber}) — ${guesses.length}/${MAX_GUESSES} guesses`;

  const imgUrl = answer.variants?.[0]?.myUrl;
  setCardImage(imgDiv, imgUrl, answer.name);

  shareBtn.textContent = "📋 Share Result";
  shareBtn.onclick = () => {
    const squares = guesses.map((g) => guessToSquares(g, answer)).join("\n");
    const text = `OshiPushle #${puzzleNumber} ${guesses.length}/${MAX_GUESSES}\n\n${squares}`;
    navigator.clipboard.writeText(text).then(() => {
      shareBtn.textContent = "✅ Copied!";
    });
  };

  document.getElementById("daily-modal-section").classList.remove("hidden");
  document.getElementById("endless-modal-section").classList.add("hidden");

  startCountdown();
  openWinModal();
}

// ── Endless / Platform win modal ──────────────────────────────────────────────
export function showEndlessWinModal(answer, guesses, session, onNextChallenge) {
  const msg    = document.getElementById("win-message");
  const imgDiv = document.getElementById("win-card-image");

  msg.textContent = `${answer.name} (${answer.cardNumber}) — solved in ${guesses.length} guess${guesses.length !== 1 ? "es" : ""}`;

  const imgUrl = answer.variants?.[0]?.myUrl;
  setCardImage(imgDiv, imgUrl, answer.name);

  document.getElementById("daily-modal-section").classList.add("hidden");
  document.getElementById("endless-modal-section").classList.remove("hidden");

  document.getElementById("endless-session-stats").textContent =
    `Session: ${session.solvedCount} solved · ${session.totalGuesses} total guess${session.totalGuesses !== 1 ? "es" : ""}`;

  // Replace button node to remove stale listeners
  const oldBtn = document.getElementById("next-challenge-btn");
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.addEventListener("click", () => {
    closeWinModal();
    onNextChallenge();
  });

  openWinModal();
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

  if (countdownIntervalId !== null) {
    clearInterval(countdownIntervalId);
  }

  tick();
  countdownIntervalId = setInterval(tick, 1_000);
}
