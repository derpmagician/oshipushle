import { isAllowedImageUrl } from "./sanitize.js";
import { numFmt } from "./constants.js";

// ── Autocomplete ──────────────────────────────────────────────────────────────
export function setupAutocomplete(input, listEl, gameRef) {
  let activeIndex = -1;
  const statusEl = document.getElementById("autocomplete-status");

  function announceStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function buildOptionLabel(card) {
    if (gameRef.mode === "platform") {
      const tags = (card.tags || []).join(", ") || "none";
      const subs = card.subscriberCount ? numFmt.format(card.subscriberCount) : "unknown";
      const pop = card.popularityThreshold ?? "unknown";
      return `${card.name}, ${card.cardNumber}. Tags: ${tags}. Subscribers: ${subs}. Popularity: ${pop}.`;
    }

    const type = card.cardType || "unknown";
    const color = (card.color || []).join(", ") || "none";
    const genre = (card.genre || []).join(", ") || "none";
    return `${card.name}, ${card.cardNumber}. Type: ${type}. Color: ${color}. Genre: ${genre}.`;
  }

  function closeList() {
    listEl.classList.add("hidden");
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  }

  function openList() {
    listEl.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
  }

  input.addEventListener("input", () => {
    const val = input.value.trim().toLowerCase();
    listEl.innerHTML = "";
    activeIndex = -1;
    input.removeAttribute("aria-activedescendant");

    if (val.length < 1) {
      closeList();
      announceStatus("Type a card name to see suggestions.");
      return;
    }

    const matches = gameRef.cards
      .filter(
        (c) =>
          !gameRef.guessedNames.has(c.cardNumber) &&
          (c.name.toLowerCase().includes(val) || c.cardNumber.toLowerCase().includes(val))
      )
      .slice(0, 8);

    if (matches.length === 0) {
      closeList();
      announceStatus("No suggestions found.");
      return;
    }

    for (const [i, card] of matches.entries()) {
      const li = document.createElement("li");
      li.id = `ac-option-${i}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.setAttribute("aria-setsize", String(matches.length));
      li.setAttribute("aria-posinset", String(i + 1));
      li.setAttribute("aria-label", buildOptionLabel(card));

      // Thumbnail (safe DOM creation)
      const thumb = card.variants?.[0]?.myUrl || "";
      if (thumb && isAllowedImageUrl(thumb)) {
        const img = document.createElement("img");
        img.className = "ac-thumb";
        img.src = thumb;
        img.title = card.cardNumber;
        img.alt = "";
        img.width = 44;
        img.height = 60;
        img.loading = "lazy";
        img.crossOrigin = "anonymous";
        li.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "ac-thumb ac-thumb-empty";
        li.appendChild(placeholder);
      }

      // Info wrapper (matches guess-info structure)
      const infoDiv = document.createElement("div");
      infoDiv.className = "ac-info";

      // Row 1: Name + card number
      const nameRow = document.createElement("div");
      nameRow.className = "ac-info-name";
      const nameSpan = document.createElement("span");
      nameSpan.className = "ac-name";
      nameSpan.textContent = card.name;
      const numberSpan = document.createElement("span");
      numberSpan.className = "ac-number";
      numberSpan.textContent = card.cardNumber;
      nameRow.appendChild(nameSpan);
      nameRow.appendChild(numberSpan);
      infoDiv.appendChild(nameRow);

      // Row 2: Details tags
      const detailsDiv = document.createElement("div");
      detailsDiv.className = "ac-details";

      function createTag(cls, title, text) {
        const span = document.createElement("span");
        span.className = `ac-tag ${cls}`;
        span.title = title;
        span.textContent = text;
        return span;
      }

      if (gameRef.mode === "platform") {
        const tags = (card.tags || []).join(", ") || "—";
        const subs = card.subscriberCount ? numFmt.format(card.subscriberCount) : "—";
        const pop = card.popularityThreshold ?? "—";
        detailsDiv.appendChild(createTag("ac-pt-tags", "Tags", tags));
        detailsDiv.appendChild(createTag("ac-pt-subs", "Subscribers", subs));
        detailsDiv.appendChild(createTag("ac-pt-pop", "Popularity", pop));
      } else {
        const cost = card.cost ?? "—";
        const color = (card.color || []).join("/") || "—";
        const genre = (card.genre || []).join(", ") || "—";
        const bits = card.bits ?? "—";
        const influence = card.influence ?? "—";
        detailsDiv.appendChild(createTag("ac-type", "Type", card.cardType));
        detailsDiv.appendChild(createTag("ac-color", "Color", color));
        detailsDiv.appendChild(createTag("ac-genre", "Genre", genre));
        detailsDiv.appendChild(createTag("ac-cost", "Cost", cost));
        detailsDiv.appendChild(createTag("ac-bits", "Bits", bits));
        detailsDiv.appendChild(createTag("ac-influence", "Influence", influence));
      }
      li.appendChild(detailsDiv);
      infoDiv.appendChild(detailsDiv);
      li.appendChild(infoDiv);

      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        announceStatus(`Selected ${card.name}.`);
        gameRef.onSelect(card);
      });
      listEl.appendChild(li);
    }
    openList();
    announceStatus(`${matches.length} suggestion${matches.length === 1 ? "" : "s"} available. Use up and down arrows to navigate.`);
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
      } else if (items[0]) {
        items[0].dispatchEvent(new MouseEvent("mousedown"));
      }
    } else if (e.key === "Escape") {
      closeList();
      announceStatus("Suggestions closed.");
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(closeList, 150);
  });

  function updateActive(items) {
    items.forEach((li, i) => {
      const isActive = i === activeIndex;
      li.classList.toggle("active", isActive);
      li.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    if (activeIndex >= 0 && items[activeIndex]) {
      input.setAttribute("aria-activedescendant", items[activeIndex].id);
      const optionNumber = activeIndex + 1;
      const optionText = items[activeIndex].querySelector(".ac-name")?.textContent || "Suggestion";
      announceStatus(`${optionText}. Suggestion ${optionNumber} of ${items.length}.`);
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }
}
