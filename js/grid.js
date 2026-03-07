// ── Grid headers & mode switching ─────────────────────────────────────────────
export const GRID_HEADERS = {
  default:  ["", "Card", "Type", "Color", "Genre", "Cost", "Bits", "Influence", "VTuber"],
  platform: ["", "Card", "Tags", "Subscribers", "Popularity"],
};

export function setGridMode(mode) {
  const header = document.getElementById("grid-header");
  const labels = mode === "platform" ? GRID_HEADERS.platform : GRID_HEADERS.default;
  header.innerHTML = labels.map((l) => `<span>${l}</span>`).join("");
  document.querySelector("main").classList.toggle("platform-mode", mode === "platform");
}
