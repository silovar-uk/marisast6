(() => {
  if (typeof document === "undefined" || typeof getComputedStyle === "undefined") return;

  const TEXT_SELECTOR = [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "li", "dt", "dd", "small", "label",
    "span", "b", "strong", "code", "kbd",
    "a", "button", "summary", "input", "textarea", "select"
  ].join(",");

  const DARK_TEXT = { r: 25, g: 21, b: 18, a: 1 };
  const LIGHT_TEXT = { r: 247, g: 244, b: 238, a: 1 };
  const PAGE_FALLBACK = { r: 7, g: 8, b: 10, a: 1 };
  let auditTimer = 0;

  function parseColor(value) {
    const source = String(value || "").trim().toLowerCase();
    if (!source || source === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

    const match = source.match(/^rgba?\(([^)]+)\)$/);
    if (!match) return null;
    const parts = match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    return {
      r: Math.max(0, Math.min(255, parts[0])),
      g: Math.max(0, Math.min(255, parts[1])),
      b: Math.max(0, Math.min(255, parts[2])),
      a: Math.max(0, Math.min(1, parts[3] ?? 1))
    };
  }

  function composite(foreground, background) {
    const outA = foreground.a + background.a * (1 - foreground.a);
    if (outA <= 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / outA,
      g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / outA,
      b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / outA,
      a: outA
    };
  }

  function effectiveBackground(element) {
    let result = { r: 0, g: 0, b: 0, a: 0 };
    let node = element;

    while (node && node.nodeType === 1) {
      const color = parseColor(getComputedStyle(node).backgroundColor);
      if (color && color.a > 0) result = composite(result, color);
      if (result.a >= .995) break;
      node = node.parentElement;
    }

    return result.a >= .995 ? result : composite(result, PAGE_FALLBACK);
  }

  function channel(value) {
    const normalized = value / 255;
    return normalized <= .04045
      ? normalized / 12.92
      : Math.pow((normalized + .055) / 1.055, 2.4);
  }

  function luminance(color) {
    return .2126 * channel(color.r) + .7152 * channel(color.g) + .0722 * channel(color.b);
  }

  function contrastRatio(first, second) {
    const a = luminance(first);
    const b = luminance(second);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }

  function isVisible(element) {
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    return element.getClientRects().length > 0;
  }

  function hasReadableContent(element) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName)) return true;
    return Boolean(element.textContent && element.textContent.trim());
  }

  function applyCorrection(element, background) {
    const darkRatio = contrastRatio(DARK_TEXT, background);
    const lightRatio = contrastRatio(LIGHT_TEXT, background);
    const useDark = darkRatio >= lightRatio;

    element.classList.toggle("contrast-text-dark", useDark);
    element.classList.toggle("contrast-text-light", !useDark);
    element.dataset.contrastCorrected = useDark ? "dark-text" : "light-text";

    return Math.max(darkRatio, lightRatio);
  }

  function audit(root = document.querySelector("main")) {
    if (!root) return { checked: 0, corrected: 0, unresolved: [] };

    const elements = Array.from(root.querySelectorAll(TEXT_SELECTOR));
    let checked = 0;
    let corrected = 0;
    const unresolved = [];

    elements.forEach(element => {
      if (element.closest("svg, canvas, [hidden], [aria-hidden='true'], [data-contrast-lock]")) return;
      if (!hasReadableContent(element) || !isVisible(element)) return;

      checked += 1;
      const foreground = parseColor(getComputedStyle(element).color);
      const background = effectiveBackground(element);
      if (!foreground || !background) return;

      const currentRatio = contrastRatio(foreground, background);
      if (currentRatio >= 4.5 || element.classList.contains("contrast-text-dark") || element.classList.contains("contrast-text-light")) return;

      const correctedRatio = applyCorrection(element, background);
      corrected += 1;
      if (correctedRatio < 4.5) {
        unresolved.push({
          tag: element.tagName.toLowerCase(),
          className: element.className,
          ratio: Number(correctedRatio.toFixed(2)),
          text: String(element.textContent || element.value || "").trim().slice(0, 80)
        });
      }
    });

    const result = { checked, corrected, unresolved };
    window.MARISA_CONTRAST.lastAudit = result;
    return result;
  }

  function scheduleAudit() {
    window.clearTimeout(auditTimer);
    auditTimer = window.setTimeout(() => audit(), 40);
  }

  function start() {
    audit();
    const main = document.querySelector("main");
    if (!main || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(scheduleAudit);
    observer.observe(main, { childList: true, subtree: true });
    window.MARISA_CONTRAST.observer = observer;
  }

  window.MARISA_CONTRAST = {
    version: "1.0.0",
    audit,
    contrastRatio,
    effectiveBackground,
    observer: null,
    lastAudit: null
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
