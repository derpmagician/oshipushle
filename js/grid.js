// ── Grid headers & mode switching ─────────────────────────────────────────────
export const GRID_HEADERS = {
  default:  ["Type", "Color", "Genre", "Cost", "Bits", "Influence", "VTuber"],
  platform: ["Tags", "Subscribers", "Popularity"],
};

export function setGridMode(mode) {
  const header = document.getElementById("grid-header");
  const labels = mode === "platform" ? GRID_HEADERS.platform : GRID_HEADERS.default;
  header.innerHTML =
    `<span class="gh-thumb"></span>` +
    `<div class="gh-info">` +
      `<div class="gh-name">Card</div>` +
      `<div class="gh-attrs">${labels.map((l) => `<span>${l}</span>`).join("")}</div>` +
    `</div>`;
  document.querySelector("main").classList.toggle("platform-mode", mode === "platform");
}
