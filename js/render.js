import { compareExact, compareArrays, compareNumeric } from "./compare.js";

// ── Cell factories ────────────────────────────────────────────────────────────
export function makeCell(text, status) {
  const cell = document.createElement("div");
  cell.className = `guess-cell ${status}`;
  cell.textContent = text;
  return cell;
}

export function makeNumericCell(text, { status, direction }) {
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
    cell.appendChild(arrow);
  }
  return cell;
}

// ── Standard guess row ────────────────────────────────────────────────────────
export function renderGuessRow(guess, answer) {
  const row = document.createElement("div");
  row.className = "guess-row";

  // 0. Thumbnail
  const thumbCell = document.createElement("div");
  thumbCell.className = "guess-cell thumb-cell has-tooltip";
  thumbCell.setAttribute("data-tooltip", guess.cardNumber);
  const thumbUrl = guess.variants?.[0]?.myUrl;
  if (thumbUrl) {
    thumbCell.innerHTML = `<img src="${thumbUrl}" alt="" loading="lazy" />`;
  }
  row.appendChild(thumbCell);

  // 1. Name
  const nameCell = makeCell(guess.name, compareExact(guess.name, answer.name));
  nameCell.classList.add("name-cell");
  row.appendChild(nameCell);

  // 2. Card Type
  row.appendChild(makeCell(guess.cardType, compareExact(guess.cardType, answer.cardType)));

  // 3. Color
  const colorText = (guess.color ?? []).join(", ") || "—";
  row.appendChild(makeCell(colorText, compareArrays(guess.color, answer.color)));

  // 4. Genre
  const genreText = (guess.genre ?? []).join(", ") || "—";
  row.appendChild(makeCell(genreText, compareArrays(guess.genre, answer.genre)));

  // 5. Cost (numeric)
  const costCmp = compareNumeric(guess.cost, answer.cost);
  row.appendChild(makeNumericCell(guess.cost ?? "—", costCmp));

  // 6. Bits (numeric)
  const bitsCmp = compareNumeric(guess.bits, answer.bits);
  row.appendChild(makeNumericCell(guess.bits ?? "—", bitsCmp));

  // 7. Influence (numeric)
  const infCmp = compareNumeric(guess.influence, answer.influence);
  row.appendChild(makeNumericCell(guess.influence ?? "—", infCmp));

  // 8. VTuber
  const vtuberArr = guess.vtuber ?? [];
  const vtuberText = vtuberArr.join(", ") || "—";
  const vtuberCell = makeCell("", compareArrays(guess.vtuber, answer.vtuber));
  vtuberCell.setAttribute("data-tooltip", vtuberText);
  vtuberCell.classList.add("vtuber-cell", "has-tooltip");
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

  // 0. Thumbnail
  const thumbCell = document.createElement("div");
  thumbCell.className = "guess-cell thumb-cell has-tooltip";
  thumbCell.setAttribute("data-tooltip", guess.cardNumber);
  const thumbUrl = guess.variants?.[0]?.myUrl;
  if (thumbUrl) thumbCell.innerHTML = `<img src="${thumbUrl}" alt="" loading="lazy" />`;
  row.appendChild(thumbCell);

  // 1. Name
  const nameCell = makeCell(guess.name, compareExact(guess.name, answer.name));
  nameCell.classList.add("name-cell");
  row.appendChild(nameCell);

  // 2. Tags
  const tagsText = (guess.tags ?? []).join(", ") || "—";
  row.appendChild(makeCell(tagsText, compareArrays(guess.tags, answer.tags)));

  // 3. Subscriber count (numeric)
  const subsCmp = compareNumeric(guess.subscriberCount, answer.subscriberCount);
  const subsDisplay = guess.subscriberCount
    ? Number(guess.subscriberCount).toLocaleString()
    : "—";
  row.appendChild(makeNumericCell(subsDisplay, subsCmp));

  // 4. Popularity threshold (numeric)
  const popCmp = compareNumeric(guess.popularityThreshold, answer.popularityThreshold);
  row.appendChild(makeNumericCell(guess.popularityThreshold ?? "—", popCmp));

  return row;
}
