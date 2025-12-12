    // ------------- HERO PARALLAX EFFECT -------------
    (function () {
      const heroSection = document.querySelector(".hero-visual");
      const bgLayer = document.querySelector(".hero-parallax-layer.bg");

      if (!heroSection || !bgLayer) return;

      window.addEventListener("scroll", () => {
        const rect = heroSection.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const progress = (windowHeight - rect.top) / (windowHeight + rect.height);

        const clamped = Math.max(0, Math.min(1, progress));
        const translateY = (clamped - 0.5) * 26; // slight movement
        const scale = 1.02 + clamped * 0.04;

        bgLayer.style.transform = `translateY(${translateY}px) scale(${scale})`;
      });
    })();

    // ------------- TIMELINE HOVER PREVIEW (FOLLOW CURSOR) -------------
// ------------- TIMELINE HOVER PREVIEW (FOLLOW CURSOR) -------------
(function () {
  const preview = document.getElementById("hoverPreview");
  const previewInner = preview?.querySelector(".hover-preview-inner");
  const previewImg = document.getElementById("hoverPreviewImg");
  const timelineItems = document.querySelectorAll(".timeline-item");

  if (!preview || !previewInner || !previewImg || !timelineItems.length) return;

  let active = false;

  function showPreview(imgSrc) {
    if (!imgSrc) return;

    // Only change src when needed, reduces tiny flickers
    if (previewImg.getAttribute("src") !== imgSrc) {
      previewImg.src = imgSrc;
    }

    preview.style.opacity = "1";
    active = true;
  }

  function hidePreview() {
    preview.style.opacity = "0";
    active = false;
  }


function movePreview(e) {
  if (!active) return;

  const offsetX = 24;
  const offsetY = 24;

  // Base position: a bit to the bottom-right of the cursor
  let x = e.clientX + offsetX;
  let y = e.clientY + offsetY;

  const rect = previewInner.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - 16;
  const maxY = window.innerHeight - rect.height - 16;

  // Clamp so it stays inside the screen instead of flipping sides
  x = Math.max(16, Math.min(x, maxX));
  y = Math.max(16, Math.min(y, maxY));

  previewInner.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}


  timelineItems.forEach((item) => {
    item.addEventListener("mouseenter", (e) => {
      const imgSrc = item.getAttribute("data-image");
      showPreview(imgSrc);
      movePreview(e);
    });

    item.addEventListener("mousemove", movePreview);

    item.addEventListener("mouseleave", () => {
      hidePreview();
    });
  });
})();


    // ------------- MODAL LOGIC (View more / Photo view) -------------
    const modalBackdrop = document.getElementById("modalBackdrop");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");
    const modalImg = document.getElementById("modalImg");
    const modalMeta = document.getElementById("modalMeta");
    const modalPhotoWrapper = document.getElementById("modalPhotoWrapper");
    const modalClose = document.getElementById("modalClose");
    const modalDayTimeline = document.getElementById("modalDayTimeline");


function openModal({ title, text, imgSrc, meta, steps }) {
  if (!modalBackdrop) return;

  modalTitle.textContent = title || "";
  modalText.textContent = text || "";
  modalMeta.textContent = meta || "";

  // Clear the day timeline
  if (modalDayTimeline) {
    modalDayTimeline.innerHTML = "";
  }

  // If steps are provided → build the "day in a life" view
  if (steps && steps.length && modalDayTimeline) {
    steps.forEach((step) => {
const stepEl = document.createElement("div");
const isCompany = step.type === "company";

stepEl.className = "day-step" + (isCompany ? " day-step--company" : "");

stepEl.innerHTML = `
  <div class="day-step-img">
    ${step.imgSrc ? `<img src="${step.imgSrc}" alt="${step.title || ""}">` : ""}
  </div>
  <div class="day-step-body">
    <div class="day-step-time">${step.time || ""}</div>
    <div class="day-step-title">${step.title || ""}</div>
    <div class="day-step-desc">${step.text || ""}</div>

    ${
      isCompany
        ? `
      <div class="day-step-company-block">
        <div class="day-step-company-header">
          <span class="company-name">${step.company || ""}</span>
          ${
            step.facilitator
              ? `<span class="company-facilitator">Facilitator: ${step.facilitator}</span>`
              : ""
          }
        </div>
        ${
          step.companyInfo
            ? `<p>${step.companyInfo}</p>`
            : ""
        }
        ${
          step.observation
            ? `<p><span class="company-note-label">My observation:</span> ${step.observation}</p>`
            : ""
        }
        ${
          step.learning
            ? `<p><span class="company-note-label">What I learned:</span> ${step.learning}</p>`
            : ""
        }
      </div>`
        : ""
    }
  </div>
`;
      modalDayTimeline.appendChild(stepEl);
    });

    // When using steps, hide the single big image
    modalPhotoWrapper.style.display = "none";
    modalImg.src = "";
  } else {
    // No steps: behave like before (used by Photo Gallery)
    if (imgSrc) {
      modalPhotoWrapper.style.display = "block";
      modalImg.src = imgSrc;
    } else {
      modalPhotoWrapper.style.display = "none";
      modalImg.src = "";
    }
  }

  modalBackdrop.style.display = "flex";
  document.body.style.overflow = "hidden";
}

    function closeModal() {
      if (!modalBackdrop) return;
      modalBackdrop.style.display = "none";
      document.body.style.overflow = "";
    }

    if (modalBackdrop && modalClose) {
      modalClose.addEventListener("click", closeModal);

      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) {
          closeModal();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalBackdrop.style.display === "flex") {
          closeModal();
        }
      });
    }

    // ------------- GALLERY: AUTO HORIZONTAL SCROLL + CLICK TO VIEW -------------
    (function () {
      const galleryStrip = document.getElementById("galleryStrip");
      if (!galleryStrip) return;

      const items = Array.from(galleryStrip.children);
      if (!items.length) return;

      let scrollPos = 0;
      let animationFrame;
      let isHovering = false;

      const style = window.getComputedStyle(galleryStrip);
      const gap =
        parseFloat(style.columnGap || style.gap || "0") || 0;

      function loop() {
        if (!isHovering) {
          // slower & smoother movement
          scrollPos += 0.25;
          galleryStrip.style.transform = `translate3d(-${scrollPos}px, 0, 0)`;

          const firstItem = galleryStrip.children[0];
          if (firstItem) {
            const firstWidth = firstItem.offsetWidth + gap;
            if (scrollPos > firstWidth) {
              scrollPos -= firstWidth;
              galleryStrip.appendChild(firstItem);
            }
          }
        }
        animationFrame = requestAnimationFrame(loop);
      }

      galleryStrip.addEventListener("mouseenter", () => {
        isHovering = true;
      });

      galleryStrip.addEventListener("mouseleave", () => {
        isHovering = false;
      });

      // Click to open in modal
      galleryStrip.querySelectorAll(".gallery-item").forEach((item) => {
        item.addEventListener("click", () => {
          const title = item.getAttribute("data-title") || "Photo";
          const description = item.getAttribute("data-description") || "";
          const meta = item.getAttribute("data-meta") || "";
          const imgSrc =
            item.getAttribute("data-image") ||
            item.querySelector("img")?.getAttribute("src") ||
            "";

          openModal({
            title,
            text: description,
            imgSrc,
            meta,
          });
        });
      });

      loop();
    })();