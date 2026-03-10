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

    // reset tilt
    img.style.transform = "";

    // move focus into the dialog
    closeBtn.focus();
  }

  function closeImageViewer() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // reset tilt
    img.style.transform = "";

    // restore previous focus
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  // 3D tilt on mouse move
  const MAX_TILT = 15; // degrees

  img.addEventListener("mousemove", (e) => {
    const rect = img.getBoundingClientRect();
    // normalise to -1 … 1 from centre
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    // rotateY follows X axis, rotateX inverted Y axis
    const rotY =  x * MAX_TILT;
    const rotX = -y * MAX_TILT;
    img.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
  });

  img.addEventListener("mouseleave", () => {
    img.style.transform = "";
  });

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
