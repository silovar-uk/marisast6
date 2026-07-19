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

    let wasTraining = lab.classList.contains("training-active");
    const observer = new MutationObserver(() => {
      const isTraining = lab.classList.contains("training-active");
      if (wasTraining && !isTraining) {
        const neutral = lab.querySelector('[data-direction="neutral"]');
        neutral?.click();
      }
      wasTraining = isTraining;
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
