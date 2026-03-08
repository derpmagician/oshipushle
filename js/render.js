import { compareExact, compareArrays, compareNumeric } from "./compare.js";
import { isAllowedImageUrl } from "./sanitize.js";
import { attachImageViewerListener } from "./image-viewer.js";

function statusText(status) {
  if (status === "correct") return "correct";
  if (status === "partial") return "partially matches";
  return "does not match";
}

function setCellA11yLabel(cell, columnLabel, valueText, status, direction = null) {
  const value = valueText != null && String(valueText).trim() !== "" ? String(valueText) : "none";
  const parts = [`${columnLabel}: ${value}`, statusText(status)];

  if (direction === "up") {
    parts.push("answer is higher");
  } else if (direction === "down") {
    parts.push("answer is lower");
  }

  cell.setAttribute("role", "gridcell");
  cell.setAttribute("aria-label", `${parts.join(". ")}.`);
}

// ── Cell factories ────────────────────────────────────────────────────────────
export function makeCell(text, status, columnLabel = "Result") {
  const cell = document.createElement("div");
  cell.className = `guess-cell ${status}`;
  cell.textContent = text;
  setCellA11yLabel(cell, columnLabel, text, status);
  return cell;
}

export function makeNumericCell(text, { status, direction }, columnLabel = "Result") {
  const cell = document.createElement("div");
  cell.className = `guess-cell ${status}`;

  const span = document.createElement("span");
  span.textContent = text;
  cell.appendChild(span);

  if (direction) {
    const arrow = document.createElement("span");
    arrow.className = `arrow ${direction === "up" ? "up" : "down"}`;
    // only show the triangle glyph; the word is redundant and wastes space.
    arrow.textContent = direction === "up" ? "▲" : "▼";
    // keep an accessible label so screen‑readers and tooltips still convey meaning
    arrow.setAttribute("title", direction === "up" ? "higher" : "lower");
    arrow.setAttribute("aria-hidden", "true");
    cell.appendChild(arrow);
  }

  setCellA11yLabel(cell, columnLabel, text, status, direction);
  return cell;
}

// ── Standard guess row ────────────────────────────────────────────────────────
export function renderGuessRow(guess, answer) {
  const row = document.createElement("div");
  row.className = "guess-row";
  row.setAttribute("role", "row");
  row.setAttribute("aria-label", `Guess row for ${guess.name}`);

  // 0. Thumbnail
  const thumbCell = document.createElement("div");
  thumbCell.className = "guess-cell thumb-cell has-tooltip";
  thumbCell.setAttribute("data-tooltip", guess.cardNumber);
  thumbCell.setAttribute("role", "gridcell");
  thumbCell.setAttribute("aria-label", `Card image: ${guess.name} (${guess.cardNumber})`);
  const thumbUrl = guess.variants?.[0]?.myUrl;
  if (thumbUrl && isAllowedImageUrl(thumbUrl)) {
    const img = document.createElement("img");
    img.src = thumbUrl;
    img.alt = "";
    img.width = 44;
    img.height = 60;
    img.loading = "lazy";
    img.crossOrigin = "anonymous";
    attachImageViewerListener(img, guess.name);
    thumbCell.appendChild(img);
  }
  row.appendChild(thumbCell);

  // 1. Name
  const nameCell = makeCell(guess.name, compareExact(guess.name, answer.name), "Card");
  nameCell.classList.add("name-cell");
  row.appendChild(nameCell);

  // 2. Card Type
  row.appendChild(makeCell(guess.cardType, compareExact(guess.cardType, answer.cardType), "Type"));

  // 3. Color
  const colorText = (guess.color ?? []).join(", ") || "—";
  row.appendChild(makeCell(colorText, compareArrays(guess.color, answer.color), "Color"));

  // 4. Genre
  const genreText = (guess.genre ?? []).join(", ") || "—";
  row.appendChild(makeCell(genreText, compareArrays(guess.genre, answer.genre), "Genre"));

  // 5. Cost (numeric)
  const costCmp = compareNumeric(guess.cost, answer.cost);
  row.appendChild(makeNumericCell(guess.cost ?? "—", costCmp, "Cost"));

  // 6. Bits (numeric)
  const bitsCmp = compareNumeric(guess.bits, answer.bits);
  row.appendChild(makeNumericCell(guess.bits ?? "—", bitsCmp, "Bits"));

  // 7. Influence (numeric)
  const infCmp = compareNumeric(guess.influence, answer.influence);
  row.appendChild(makeNumericCell(guess.influence ?? "—", infCmp, "Influence"));

  // 8. VTuber
  const vtuberArr = guess.vtuber ?? [];
  const vtuberText = vtuberArr.join(", ") || "—";
  const vtuberCell = makeCell("", compareArrays(guess.vtuber, answer.vtuber), "VTuber");
  vtuberCell.setAttribute("data-tooltip", vtuberText);
  vtuberCell.classList.add("vtuber-cell", "has-tooltip");
  setCellA11yLabel(vtuberCell, "VTuber", vtuberText, compareArrays(guess.vtuber, answer.vtuber));
  const inner = document.createElement("div");
  inner.className = "vtuber-text";
  inner.textContent = vtuberText;
  vtuberCell.appendChild(inner);
  row.appendChild(vtuberCell);

  return row;
}

// ── Platform guess row ────────────────────────────────────────────────────────
export function renderPlatformGuessRow(guess, answer) {
  const row = document.createElement("div");
  row.className = "guess-row";
  row.setAttribute("role", "row");
  row.setAttribute("aria-label", `Guess row for ${guess.name}`);

  // 0. Thumbnail
  const thumbCell = document.createElement("div");
  thumbCell.className = "guess-cell thumb-cell has-tooltip";
  thumbCell.setAttribute("data-tooltip", guess.cardNumber);
  thumbCell.setAttribute("role", "gridcell");
  thumbCell.setAttribute("aria-label", `Card image: ${guess.name} (${guess.cardNumber})`);
  const thumbUrl = guess.variants?.[0]?.myUrl;
  if (thumbUrl && isAllowedImageUrl(thumbUrl)) {
    const img = document.createElement("img");
    img.src = thumbUrl;
    img.alt = "";
    img.width = 84;
    img.height = 52;
    img.loading = "lazy";
    img.crossOrigin = "anonymous";
    attachImageViewerListener(img, guess.name);
    thumbCell.appendChild(img);
  }
  row.appendChild(thumbCell);

  // 1. Name
  const nameCell = makeCell(guess.name, compareExact(guess.name, answer.name), "Card");
  nameCell.classList.add("name-cell");
  row.appendChild(nameCell);

  // 2. Tags
  const tagsText = (guess.tags ?? []).join(", ") || "—";
  row.appendChild(makeCell(tagsText, compareArrays(guess.tags, answer.tags), "Tags"));

  // 3. Subscriber count (numeric)
  const subsCmp = compareNumeric(guess.subscriberCount, answer.subscriberCount);
  const subsDisplay = guess.subscriberCount
    ? Number(guess.subscriberCount).toLocaleString()
    : "—";
  row.appendChild(makeNumericCell(subsDisplay, subsCmp, "Subscribers"));

  // 4. Popularity threshold (numeric)
  const popCmp = compareNumeric(guess.popularityThreshold, answer.popularityThreshold);
  row.appendChild(makeNumericCell(guess.popularityThreshold ?? "—", popCmp, "Popularity"));

  return row;
}
