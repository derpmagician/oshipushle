import { renderGuessRow } from "../render.js";
import { showEndlessWinModal } from "../modals.js";

// ── Endless Mode ──────────────────────────────────────────────────────────────
export function playEndlessMode(cards, gameRef, session, clearBoard) {
  // Reset pool once all cards have been used this session
  if (session.usedIndices.size >= cards.length) {
    session.usedIndices.clear();
  }

  session.challengeNumber++;
  updateEndlessStats(session);

  const available = cards.map((_, i) => i).filter((i) => !session.usedIndices.has(i));
  const randIdx   = available[Math.floor(Math.random() * available.length)];
  session.usedIndices.add(randIdx);
  const answer = cards[randIdx];

  clearBoard();

  const input     = document.getElementById("guess-input");
  const listEl    = document.getElementById("autocomplete-list");
  const container = document.getElementById("guesses-container");

  const guessedNames = new Set();
  const guesses = [];
  let solved = false;

  gameRef.guessedNames = guessedNames;

  gameRef.onSelect = function submitEndlessGuess(card) {
    if (solved) return;

    guessedNames.add(card.cardNumber);
    guesses.push(card);
    session.totalGuesses++;
    container.prepend(renderGuessRow(card, answer));

    input.value = "";
    listEl.classList.add("hidden");
    updateEndlessStats(session);

    if (card.cardNumber === answer.cardNumber) {
      solved = true;
      session.solvedCount++;
      updateEndlessStats(session);
      input.disabled = true;
      setTimeout(
        () =>
          showEndlessWinModal(answer, guesses, session, () => {
            playEndlessMode(cards, gameRef, session, clearBoard);
          }),
        600
      );
    }

    input.focus();
  };
}

export function updateEndlessStats(session) {
  document.getElementById("endless-challenge-num").textContent =
    `Challenge #${session.challengeNumber}`;
  document.getElementById("endless-total-stats").textContent =
    `${session.solvedCount} solved · ${session.totalGuesses} guess${session.totalGuesses !== 1 ? "es" : ""}`;
}
