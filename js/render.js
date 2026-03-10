import { compareExact, compareArrays, compareNumeric } from "./compare.js";
import { isAllowedImageUrl } from "./sanitize.js";
import { attachImageViewerListener } from "./image-viewer.js";
import { numFmt } from "./constants.js";

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
  // mark numeric cells so CSS can switch to Jost/tabular figures
  cell.className = `guess-cell ${status} numeric-cell`;

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

  // ── Col 1: Thumbnail ──
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

  // ── Col 2: Info wrapper ──
  const info = document.createElement("div");
  info.className = "guess-info";

  // Row 1: Name + card number
  const nameRow = document.createElement("div");
  nameRow.className = "guess-info-name";
  const nameCell = makeCell(guess.name, compareExact(guess.name, answer.name), "Card");
  nameCell.classList.add("name-cell");
  const numberSpan = document.createElement("span");
  numberSpan.className = "card-number";
  numberSpan.textContent = guess.cardNumber ?? "";
  nameRow.appendChild(nameCell);
  nameRow.appendChild(numberSpan);
  info.appendChild(nameRow);

  // Row 2: Attributes
  const attrsRow = document.createElement("div");
  attrsRow.className = "guess-info-attrs";

  attrsRow.appendChild(makeCell(guess.cardType, compareExact(guess.cardType, answer.cardType), "Type"));

  const colorText = (guess.color ?? []).join(", ") || "—";
  attrsRow.appendChild(makeCell(colorText, compareArrays(guess.color, answer.color), "Color"));

  const genreText = (guess.genre ?? []).join(", ") || "—";
  attrsRow.appendChild(makeCell(genreText, compareArrays(guess.genre, answer.genre), "Genre"));

  const costCmp = compareNumeric(guess.cost, answer.cost);
  attrsRow.appendChild(makeNumericCell(guess.cost ?? "—", costCmp, "Cost"));

  const bitsCmp = compareNumeric(guess.bits, answer.bits);
  attrsRow.appendChild(makeNumericCell(guess.bits ?? "—", bitsCmp, "Bits"));

  const infCmp = compareNumeric(guess.influence, answer.influence);
  attrsRow.appendChild(makeNumericCell(guess.influence ?? "—", infCmp, "Influence"));

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
  attrsRow.appendChild(vtuberCell);

  info.appendChild(attrsRow);
  row.appendChild(info);

  // apply index property for animation delay
  row.querySelectorAll('.guess-cell').forEach((cell, i) => {
    cell.style.setProperty('--i', i);
  });

  return row;
}

// ── Platform guess row ────────────────────────────────────────────────────────
export function renderPlatformGuessRow(guess, answer) {
  const row = document.createElement("div");
  row.className = "guess-row";
  row.setAttribute("role", "row");
  row.setAttribute("aria-label", `Guess row for ${guess.name}`);

  // ── Col 1: Thumbnail ──
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

  // ── Col 2: Info wrapper ──
  const info = document.createElement("div");
  info.className = "guess-info";

  // Row 1: Name + card number
  const nameRow = document.createElement("div");
  nameRow.className = "guess-info-name";
  const nameCell = makeCell(guess.name, compareExact(guess.name, answer.name), "Card");
  nameCell.classList.add("name-cell");
  const numberSpan = document.createElement("span");
  numberSpan.className = "card-number";
  numberSpan.textContent = guess.cardNumber ?? "";
  nameRow.appendChild(nameCell);
  nameRow.appendChild(numberSpan);
  info.appendChild(nameRow);

  // Row 2: Attributes
  const attrsRow = document.createElement("div");
  attrsRow.className = "guess-info-attrs";

  const tagsText = (guess.tags ?? []).join(", ") || "—";
  attrsRow.appendChild(makeCell(tagsText, compareArrays(guess.tags, answer.tags), "Tags"));

  const subsCmp = compareNumeric(guess.subscriberCount, answer.subscriberCount);
  const subsDisplay = guess.subscriberCount
    ? numFmt.format(guess.subscriberCount)
    : "—";
  attrsRow.appendChild(makeNumericCell(subsDisplay, subsCmp, "Subscribers"));

  const popCmp = compareNumeric(guess.popularityThreshold, answer.popularityThreshold);
  const popDisplay = guess.popularityThreshold != null
    ? numFmt.format(guess.popularityThreshold)
    : "—";
  attrsRow.appendChild(makeNumericCell(popDisplay, popCmp, "Popularity"));

  info.appendChild(attrsRow);
  row.appendChild(info);

  // set index custom property for delay formula
  row.querySelectorAll('.guess-cell').forEach((cell, i) => {
    cell.style.setProperty('--i', i);
  });

  return row;
}
