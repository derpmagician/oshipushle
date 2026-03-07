// ── Autocomplete ──────────────────────────────────────────────────────────────
export function setupAutocomplete(input, listEl, gameRef) {
  let activeIndex = -1;

  input.addEventListener("input", () => {
    const val = input.value.trim().toLowerCase();
    listEl.innerHTML = "";
    activeIndex = -1;

    if (val.length < 1) { listEl.classList.add("hidden"); return; }

    const matches = gameRef.cards
      .filter(
        (c) =>
          !gameRef.guessedNames.has(c.cardNumber) &&
          (c.name.toLowerCase().includes(val) || c.cardNumber.toLowerCase().includes(val))
      )
      .slice(0, 8);

    if (matches.length === 0) { listEl.classList.add("hidden"); return; }

    for (const card of matches) {
      const li = document.createElement("li");
      const thumb = card.variants?.[0]?.myUrl || "";
      const thumbHtml = thumb
        ? `<img class="ac-thumb" src="${thumb}" title="${card.cardNumber}" alt="" loading="lazy" />`
        : `<div class="ac-thumb ac-thumb-empty"></div>`;

      let detailsHtml;
      if (gameRef.mode === "platform") {
        const tags = (card.tags || []).join(", ") || "—";
        const subs = card.subscriberCount ? Number(card.subscriberCount).toLocaleString() : "—";
        const pop = card.popularityThreshold ?? "—";
        detailsHtml = `
          <span class="ac-tag ac-pt-tags" title="Tags">${tags}</span>
          <span class="ac-tag ac-pt-subs" title="Subscribers">${subs}</span>
          <span class="ac-tag ac-pt-pop" title="Popularity">${pop}</span>`;
      } else {
        const cost = card.cost ?? "—";
        const color = (card.color || []).join("/") || "—";
        const genre = (card.genre || []).join(", ") || "—";
        const bits = card.bits ?? "—";
        const influence = card.influence ?? "—";
        detailsHtml = `
          <span class="ac-tag ac-type" title="Type">${card.cardType}</span>
          <span class="ac-tag ac-color" title="Color">${color}</span>
          <span class="ac-tag ac-genre" title="Genre">${genre}</span>
          <span class="ac-tag ac-cost" title="Cost">${cost}</span>
          <span class="ac-tag ac-bits" title="Bits">${bits}</span>
          <span class="ac-tag ac-influence" title="Influence">${influence}</span>`;
      }

      li.innerHTML = `
        ${thumbHtml}
        <div class="ac-main">
          <span class="ac-name">${card.name}</span>
          <span class="ac-number">${card.cardNumber}</span>
        </div>
        <div class="ac-details">${detailsHtml}</div>`;

      li.addEventListener("mousedown", (e) => { e.preventDefault(); gameRef.onSelect(card); });
      listEl.appendChild(li);
    }
    listEl.classList.remove("hidden");
  });

  input.addEventListener("keydown", (e) => {
    const items = listEl.querySelectorAll("li");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateActive(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].dispatchEvent(new MouseEvent("mousedown"));
      }
    } else if (e.key === "Escape") {
      listEl.classList.add("hidden");
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => listEl.classList.add("hidden"), 150);
  });

  function updateActive(items) {
    items.forEach((li, i) => li.classList.toggle("active", i === activeIndex));
  }
}
