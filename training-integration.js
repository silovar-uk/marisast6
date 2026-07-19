(() => {
  function setup() {
    const lab = document.querySelector("#controller-lab");
    const trainingButton = document.querySelector(".training-footer-button");
    if (!lab || !trainingButton) return false;

    const footer = lab.querySelector(".controller-footer");
    const startButton = lab.querySelector("[data-open-database]");
    if (footer && startButton && trainingButton.nextElementSibling !== startButton) {
      footer.insertBefore(trainingButton, startButton);
    }

    lab.addEventListener("click", event => {
      const regularMode = event.target.closest("[data-mode-index]");
      if (regularMode && lab.classList.contains("training-active")) {
        lab.querySelector("[data-training-close]")?.click();
      }
    }, true);

    const observer = new MutationObserver(() => {
      if (lab.classList.contains("training-active")) return;
      lab.querySelectorAll("[data-direction]").forEach(button => {
        button.classList.toggle("is-active", button.dataset.direction === "neutral");
      });
      const readout = lab.querySelector("[data-direction-readout]");
      if (readout) readout.textContent = "N";
    });
    observer.observe(lab, { attributes: true, attributeFilter: ["class"] });
    return true;
  }

  if (setup()) return;
  const observer = new MutationObserver(() => {
    if (!setup()) return;
    observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
