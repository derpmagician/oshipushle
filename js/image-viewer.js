import { isAllowedImageUrl } from "./sanitize.js";

// ── Image Viewer Modal ────────────────────────────────────────────────────────
let imageViewerHandlersBound = false;

export function initImageViewer() {
  if (imageViewerHandlersBound) return;
  imageViewerHandlersBound = true;

  const modal = document.getElementById("image-viewer-modal");
  const img = document.getElementById("image-viewer-img");
  const closeBtn = document.getElementById("image-viewer-close-btn");
  const titleEl = document.getElementById("image-viewer-title");
  let lastFocused = null;

  function openImageViewer(srcUrl, altText = "") {
    if (!isAllowedImageUrl(srcUrl)) return;
    lastFocused = document.activeElement;

    img.src = srcUrl;
    img.alt = altText;
    titleEl.textContent = altText;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // move focus into the dialog
    closeBtn.focus();
  }

  function closeImageViewer() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // restore previous focus
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  // Close button
  closeBtn.addEventListener("click", closeImageViewer);

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      e.preventDefault();
      closeImageViewer();
    }
  });

  // Backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeImageViewer();
    }
  });

  window.openImageViewer = openImageViewer;
}

export function attachImageViewerListener(img, cardName = "") {
  img.style.cursor = "pointer";
  img.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.openImageViewer(img.src, cardName);
  });
}
