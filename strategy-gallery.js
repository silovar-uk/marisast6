(() => {
  const gallery = document.querySelector(".strategy-gallery");
  const carousel = document.querySelector("#strategy-carousel");
  const dialog = document.querySelector("#strategy-dialog");

  if (!gallery || !carousel || !dialog) return;

  const spritePath = "assets/strategy/strategy-sprite.webp";
  const slides = [...carousel.querySelectorAll(".strategy-slide")];
  const current = document.querySelector("#gallery-current");
  const status = gallery.querySelector("[data-gallery-status]");
  const dialogArt = dialog.querySelector(".strategy-dialog-art");
  const dialogTitle = dialog.querySelector("#strategy-dialog-title");
  let spritePromise;
  let scrollTimer;

  function loadSprite() {
    if (spritePromise) return spritePromise;

    spritePromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const spriteUrl = `url("${spritePath}")`;
        document.documentElement.style.setProperty("--strategy-sprite", spriteUrl);
        gallery.classList.add("is-ready");
        dialog.classList.add("is-ready");
        resolve();
      };
      image.onerror = () => reject(new Error("Strategy sprite failed to load"));
      image.src = spritePath;
    }).catch(error => {
      console.error(error);
      gallery.classList.add("is-error");
      if (status) status.textContent = "画像を読み込めませんでした。少し時間をおいて再読み込みしてください。";
      throw error;
    });

    return spritePromise;
  }

  function nearestSlideIndex() {
    const left = carousel.scrollLeft;
    return slides.reduce((nearest, slide, index) => {
      const currentDistance = Math.abs(slide.offsetLeft - carousel.offsetLeft - left);
      const nearestDistance = Math.abs(slides[nearest].offsetLeft - carousel.offsetLeft - left);
      return currentDistance < nearestDistance ? index : nearest;
    }, 0);
  }

  function updateCounter(index = nearestSlideIndex()) {
    if (current) current.textContent = String(index + 1);
  }

  function moveCarousel(direction) {
    const index = nearestSlideIndex();
    const next = Math.min(slides.length - 1, Math.max(0, index + direction));
    slides[next].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    updateCounter(next);
  }

  function openDialog(slide) {
    const frame = slide.dataset.strategySlide || "0";
    const title = slide.querySelector(".strategy-caption b")?.textContent || "立ち回り画像";
    dialogArt.style.setProperty("--frame", frame);
    dialogArt.setAttribute("aria-label", title);
    dialogTitle.textContent = `${String(Number(frame) + 1).padStart(2, "0")} / 07　${title}`;

    loadSprite().then(() => {
      if (typeof dialog.showModal === "function") dialog.showModal();
    }).catch(() => {});
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  gallery.addEventListener("toggle", () => {
    if (gallery.open) loadSprite().catch(() => {});
  });

  carousel.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => updateCounter(), 80);
  }, { passive: true });

  carousel.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveCarousel(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveCarousel(1);
    }
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-gallery-prev]")) return moveCarousel(-1);
    if (event.target.closest("[data-gallery-next]")) return moveCarousel(1);
    if (event.target.closest("[data-dialog-close]")) return closeDialog();

    const slide = event.target.closest(".strategy-slide");
    if (slide) openDialog(slide);
  });

  dialog.addEventListener("click", event => {
    if (event.target === dialog) closeDialog();
  });

  updateCounter(0);
})();
