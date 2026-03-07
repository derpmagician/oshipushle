import { DATA_URL } from "./constants.js";
import { setGridMode } from "./grid.js";
import { setupAutocomplete } from "./autocomplete.js";
import { playDailyMode } from "./modes/daily-mode.js";
import { playEndlessMode } from "./modes/endless-mode.js";
import { playPlatformMode } from "./modes/platform-mode.js";

// ── Board reset ───────────────────────────────────────────────────────────────
export function clearBoard() {
  document.getElementById("guesses-container").innerHTML = "";
  const input = document.getElementById("guess-input");
  input.value   = "";
  input.disabled = false;
  document.getElementById("autocomplete-list").classList.add("hidden");
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function main() {
  const res  = await fetch(DATA_URL);
  const data = await res.json();
  const cards            = data.cards; // 209 unique cards
  const nonPlatformCards = cards.filter((c) => c.cardType !== "Platform");

  // Shared gameRef — updated each round so autocomplete always uses current state
  const gameRef = { guessedNames: new Set(), onSelect: null, mode: "daily", cards: nonPlatformCards };

  const input  = document.getElementById("guess-input");
  const listEl = document.getElementById("autocomplete-list");
  setupAutocomplete(input, listEl, gameRef);

  // Session state (persists across challenges within a tab; resets on mode switch)
  const session = {
    usedIndices:   new Set(),
    challengeNumber: 0,
    solvedCount:   0,
    totalGuesses:  0,
  };

  let currentMode = "daily";

  // Mode tab switching
  const modeTabs = Array.from(document.querySelectorAll(".mode-btn"));

  function updateTabState(mode) {
    modeTabs.forEach((tab) => {
      const isActive = tab.dataset.mode === mode;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.tabIndex = isActive ? 0 : -1;
    });
  }

  function activateMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    updateTabState(mode);

    const isEndless  = mode === "endless";
    const isPlatform = mode === "platform";
    document.getElementById("endless-stats").classList.toggle("hidden", !isEndless);
    document.getElementById("platform-stats").classList.toggle("hidden", !isPlatform);
    document.getElementById("puzzle-footer").classList.toggle("hidden", isEndless || isPlatform);
    document.getElementById("win-modal").classList.add("hidden");
    document.getElementById("win-modal").setAttribute("aria-hidden", "true");
    clearBoard();

    if (mode === "daily") {
      gameRef.mode  = "daily";
      gameRef.cards = nonPlatformCards;
      setGridMode("default");
      playDailyMode(nonPlatformCards, gameRef);
    } else if (mode === "endless") {
      gameRef.mode  = "endless";
      gameRef.cards = nonPlatformCards;
      setGridMode("default");
      session.usedIndices.clear();
      session.challengeNumber = 0;
      session.solvedCount     = 0;
      session.totalGuesses    = 0;
      playEndlessMode(nonPlatformCards, gameRef, session, clearBoard);
    } else {
      setGridMode("platform");
      session.usedIndices.clear();
      session.challengeNumber = 0;
      session.solvedCount     = 0;
      session.totalGuesses    = 0;
      playPlatformMode(cards, gameRef, session, clearBoard);
    }
  }

  modeTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateMode(tab.dataset.mode);
    });

    tab.addEventListener("keydown", (event) => {
      let targetIndex = null;
      if (event.key === "ArrowRight") {
        targetIndex = (index + 1) % modeTabs.length;
      } else if (event.key === "ArrowLeft") {
        targetIndex = (index - 1 + modeTabs.length) % modeTabs.length;
      } else if (event.key === "Home") {
        targetIndex = 0;
      } else if (event.key === "End") {
        targetIndex = modeTabs.length - 1;
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateMode(tab.dataset.mode);
        return;
      } else {
        return;
      }

      event.preventDefault();
      modeTabs[targetIndex].focus();
    });
  });

  // Boot into daily mode
  updateTabState(currentMode);
  playDailyMode(nonPlatformCards, gameRef);
}

main();
