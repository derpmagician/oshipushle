import { MAX_GUESSES } from "../constants.js";
import { getDailyCardIndex } from "../day.js";
import { renderGuessRow } from "../render.js";
import { saveState, loadState } from "../storage.js";
import { showWinModal } from "../modals.js";

// ── Daily Mode ────────────────────────────────────────────────────────────────
export function playDailyMode(cards, gameRef) {
  const { cardIndex, puzzleNumber, cycleNumber } = getDailyCardIndex(cards.length);
  const answer = cards[cardIndex];

  document.getElementById("puzzle-number").textContent = `#${puzzleNumber}`;
  document.getElementById("cycle-number").textContent  = `${cycleNumber}/${Math.ceil(cards.length)}`;

  const input     = document.getElementById("guess-input");
  const listEl    = document.getElementById("autocomplete-list");
  const container = document.getElementById("guesses-container");

  const guessedNames = new Set();
  const guesses = [];
  let won = false;

  gameRef.guessedNames = guessedNames;

  // Restore saved state
  const saved = loadState(puzzleNumber);
  if (saved) {
    for (const num of saved.guessedNames) {
      const card = cards.find((c) => c.cardNumber === num);
      if (card) {
        guessedNames.add(card.cardNumber);
        guesses.push(card);
        container.prepend(renderGuessRow(card, answer));
      }
    }
    if (saved.won) {
      won = true;
      input.disabled = true;
      showWinModal(answer, guesses, puzzleNumber);
    } else if (guesses.length >= MAX_GUESSES) {
      input.disabled = true;
      revealDailyAnswer(answer, container);
    }
  }

  gameRef.onSelect = function submitGuess(card) {
    if (won || guesses.length >= MAX_GUESSES) return;

    guessedNames.add(card.cardNumber);
    guesses.push(card);
    container.prepend(renderGuessRow(card, answer));

    input.value = "";
    listEl.classList.add("hidden");

    if (card.cardNumber === answer.cardNumber) {
      won = true;
      input.disabled = true;
      saveState(puzzleNumber, guessedNames, true);
      setTimeout(() => showWinModal(answer, guesses, puzzleNumber), 600);
    } else if (guesses.length >= MAX_GUESSES) {
      input.disabled = true;
      saveState(puzzleNumber, guessedNames, false);
      revealDailyAnswer(answer, container);
    } else {
      saveState(puzzleNumber, guessedNames, false);
    }

    input.focus();
  };
}

// ── Reveal answer on loss ─────────────────────────────────────────────────────
export function revealDailyAnswer(answer, container) {
  const row = renderGuessRow(answer, answer);
  row.style.opacity      = "0.6";
  row.style.border       = "1px solid var(--accent)";
  row.style.borderRadius = "var(--radius)";
  container.prepend(row);

  const msg = document.createElement("p");
  msg.style.textAlign  = "center";
  msg.style.marginTop  = "1rem";
  msg.style.color      = "var(--accent)";
  msg.textContent      = `The answer was: ${answer.name} (${answer.cardNumber})`;
  container.appendChild(msg);
}
