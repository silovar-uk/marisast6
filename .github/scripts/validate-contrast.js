const fs = require("fs");
const vm = require("vm");

const read = file => fs.readFileSync(file, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const advantageCss = read("advantage-page.css");
const guardCss = read("contrast-guard.css");
const guardJs = read("contrast-guard.js");
const core = read("data-core.js");

assert(advantageCss.includes("--adv-bg: #f4efe5"), "Advantage page lacks an explicit opaque reading background");
assert(advantageCss.includes("--adv-text: #191512"), "Advantage page lacks explicit dark text");
assert(advantageCss.includes("background: var(--adv-bg)"), "Advantage sections do not use the reading background");
assert(advantageCss.includes("color: var(--adv-text)"), "Advantage sections do not use explicit readable text");
assert(!advantageCss.includes("color: var(--ink-soft)"), "Advantage page still inherits the arena ink-soft token");
assert(!advantageCss.includes("color: var(--muted)"), "Advantage page still inherits the arena muted token");
assert(!advantageCss.includes("background: rgba(255, 253, 248"), "Advantage page still uses translucent pale backgrounds");
assert(advantageCss.includes("color-scheme: light"), "Advantage reading surfaces are not isolated from the dark theme");

assert(guardCss.includes(".contrast-text-dark"), "Dark-text correction class is missing");
assert(guardCss.includes(".contrast-text-light"), "Light-text correction class is missing");
assert(guardCss.includes("!important"), "Runtime corrections cannot override page-theme specificity");
assert(core.includes("contrast-guard.css?v=20260805"), "Global contrast CSS is not loaded by data-core");
assert(core.includes("contrast-guard.js?v=20260805"), "Global contrast audit is not loaded by data-core");

for (const page of ["index.html", "situations.html", "moves.html", "advantage.html", "matchups.html", "strategy.html", "drill.html"]) {
  assert(read(page).includes("data-core.js"), `${page} does not load data-core and would miss the contrast guard`);
}

function makeClassList() {
  const values = new Set();
  return {
    toggle(name, force) {
      if (force === true) values.add(name);
      else if (force === false) values.delete(name);
      else if (values.has(name)) values.delete(name);
      else values.add(name);
    },
    contains(name) { return values.has(name); },
    toString() { return [...values].join(" "); }
  };
}

const body = { nodeType: 1, parentElement: null, role: "body" };
const lightSurface = { nodeType: 1, parentElement: body, role: "light" };
const darkSurface = { nodeType: 1, parentElement: body, role: "dark" };

function textElement(role, parentElement, text) {
  return {
    nodeType: 1,
    role,
    parentElement,
    tagName: "P",
    textContent: text,
    value: "",
    dataset: {},
    className: "",
    classList: makeClassList(),
    closest() { return null; },
    getClientRects() { return [{}]; }
  };
}

const lightOnLight = textElement("light-on-light", lightSurface, "白地に白文字");
const darkOnDark = textElement("dark-on-dark", darkSurface, "黒地に黒文字");
const main = {
  querySelectorAll() { return [lightOnLight, darkOnDark]; }
};

const document = {
  readyState: "complete",
  querySelector(selector) { return selector === "main" ? main : null; },
  addEventListener() {}
};

function styleFor(element) {
  const common = { display: "block", visibility: "visible", opacity: "1" };
  if (element.role === "light-on-light") return { ...common, color: "rgb(247, 244, 238)", backgroundColor: "rgba(0, 0, 0, 0)" };
  if (element.role === "dark-on-dark") return { ...common, color: "rgb(25, 21, 18)", backgroundColor: "rgba(0, 0, 0, 0)" };
  if (element.role === "light") return { ...common, color: "rgb(25, 21, 18)", backgroundColor: "rgb(244, 239, 229)" };
  if (element.role === "dark") return { ...common, color: "rgb(247, 244, 238)", backgroundColor: "rgb(7, 8, 10)" };
  return { ...common, color: "rgb(247, 244, 238)", backgroundColor: "rgb(7, 8, 10)" };
}

class MutationObserver {
  constructor(callback) { this.callback = callback; }
  observe() {}
}

const windowObject = {
  setTimeout(callback) { callback(); return 1; },
  clearTimeout() {},
  MARISA_CONTRAST: null
};

const context = {
  window: windowObject,
  document,
  MutationObserver,
  getComputedStyle: styleFor,
  console
};
vm.createContext(context);
vm.runInContext(guardJs, context, { filename: "contrast-guard.js" });

assert(lightOnLight.classList.contains("contrast-text-dark"), "Light background with light text was not corrected to dark text");
assert(darkOnDark.classList.contains("contrast-text-light"), "Dark background with dark text was not corrected to light text");
assert(windowObject.MARISA_CONTRAST?.lastAudit?.corrected === 2, "Runtime contrast audit did not report both corrections");
assert(windowObject.MARISA_CONTRAST.lastAudit.unresolved.length === 0, "Runtime contrast audit left unresolved samples");

console.log("Contrast validation passed: static advantage surfaces and runtime light/dark correction.");
