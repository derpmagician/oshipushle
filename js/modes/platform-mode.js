import { renderPlatformGuessRow } from "../render.js";
import { showEndlessWinModal } from "../modals.js";

// ── Platform Mode ─────────────────────────────────────────────────────────────
export function playPlatformMode(allCards, gameRef, session, clearBoard) {
  const platformCards = allCards.filter((c) => c.cardType === "Platform");

  if (session.usedIndices.size >= platformCards.length) {
    session.usedIndices.clear();
  }

  session.challengeNumber++;
  updatePlatformStats(session);

  const available = platformCards.map((_, i) => i).filter((i) => !session.usedIndices.has(i));
  const randIdx   = available[Math.floor(Math.random() * available.length)];
  session.usedIndices.add(randIdx);
  const answer = platformCards[randIdx];

  clearBoard();

  const input     = document.getElementById("guess-input");
  const listEl    = document.getElementById("autocomplete-list");
  const container = document.getElementById("guesses-container");

  const guessedNums = new Set();
  const guesses = [];
  let solved = false;

  gameRef.guessedNames  = guessedNums;
  gameRef.cards         = platformCards;
  gameRef.mode          = "platform";

  gameRef.onSelect = function submitPlatformGuess(card) {
    if (solved) return;

    guessedNums.add(card.cardNumber);
    guesses.push(card);
    session.totalGuesses++;
    container.prepend(renderPlatformGuessRow(card, answer));

    input.value = "";
    listEl.classList.add("hidden");
    updatePlatformStats(session);

    if (card.cardNumber === answer.cardNumber) {
      solved = true;
      session.solvedCount++;
      updatePlatformStats(session);
      input.disabled = true;
      setTimeout(
        () =>
          showEndlessWinModal(answer, guesses, session, () => {
            playPlatformMode(allCards, gameRef, session, clearBoard);
          }),
        600
      );
    }
    input.focus();
  };
}

export function updatePlatformStats(session) {
  document.getElementById("platform-challenge-num").textContent =
    `Challenge #${session.challengeNumber}`;
  document.getElementById("platform-total-stats").textContent =
    `${session.solvedCount} solved · ${session.totalGuesses} guess${session.totalGuesses !== 1 ? "es" : ""}`;
}
