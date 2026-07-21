(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => document.body.classList.add("is-entered"));

  const revealTargets = document.querySelectorAll([
    ".entry-link",
    ".home-method",
    ".first-six-band",
    ".move-group",
    ".situation-group",
    ".playbook-stage"
  ].join(","));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(target => target.classList.add("is-revealed"));
  } else {
    revealTargets.forEach(target => target.classList.add("arena-reveal"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9%", threshold: .08 });
    revealTargets.forEach(target => observer.observe(target));
  }

  document.addEventListener("click", event => {
    const summary = event.target.closest(".move-summary");
    if (summary && !reduceMotion) {
      const card = summary.closest(".move-card");
      card?.classList.remove("is-impacting");
      requestAnimationFrame(() => {
        card?.classList.add("is-impacting");
        window.setTimeout(() => card?.classList.remove("is-impacting"), 380);
      });
    }

    const stateTab = event.target.closest("[data-followup-tab]");
    if (stateTab && !reduceMotion) {
      const panel = stateTab.closest(".hit-followups");
      panel?.classList.remove("is-state-changing");
      requestAnimationFrame(() => {
        panel?.classList.add("is-state-changing");
        window.setTimeout(() => panel?.classList.remove("is-state-changing"), 300);
      });
    }
  });

  document.querySelectorAll(".entry-link").forEach(card => {
    card.addEventListener("pointermove", event => {
      if (reduceMotion) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--arena-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--arena-y", `${event.clientY - rect.top}px`);
    });
  });
})();
