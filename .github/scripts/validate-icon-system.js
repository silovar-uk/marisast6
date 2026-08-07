const fs = require("fs");
const vm = require("vm");

const read = file => fs.readFileSync(file, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const core = read("data-core.js");
const iconJs = read("icon-system.js");
const iconCss = read("icon-system.css");
const densityCss = read("icon-density.css");

for (const token of [
  "icon-system.css?v=20260806",
  "icon-density.css?v=20260806",
  "icon-system.js?v=20260806"
]) {
  assert(core.includes(token), `data-core does not load ${token}`);
}

for (const token of [
  ".mi-icon",
  ".mi-page-legend",
  ".mi-concept-chip",
  ".mi-guide-icon",
  ".mi-explanation",
  ".mi-entry-icon"
]) {
  assert(iconCss.includes(token), `Icon CSS is missing ${token}`);
}

for (const token of [
  ".mi-section-brief",
  ".mi-section-details",
  ".mi-section-details-body"
]) {
  assert(densityCss.includes(token), `Density CSS is missing ${token}`);
}

for (const token of [
  "PAGE_LEGENDS",
  "GUIDE_CARD_MAP",
  "ADVANTAGE_SECTION_MAP",
  "MutationObserver",
  "mi-card-summary",
  "mi-explanation",
  "mi-concept-row"
]) {
  assert(iconJs.includes(token), `Icon behavior is missing ${token}`);
}

const context = { window: {}, globalThis: {}, console };
context.globalThis = context.window;
vm.createContext(context);
vm.runInContext(iconJs, context, { filename: "icon-system.js" });

const api = context.window.MARISA_ICONS;
assert(api, "MARISA_ICONS API was not exported without a DOM");
assert(api.icons.length >= 30, `Expected at least 30 icons, got ${api.icons.length}`);

function iconNames(text) {
  return api.resolveConcepts(text, 6).map(item => item.icon);
}

assert(iconNames("壁インパクト後、相手がバーンアウトしてスタン").includes("wall"), "Wall concept was not detected");
assert(iconNames("壁インパクト後、相手がバーンアウトしてスタン").includes("fire"), "Burnout concept was not detected");
assert(iconNames("壁インパクト後、相手がバーンアウトしてスタン").includes("star"), "Stun concept was not detected");
assert(iconNames("中足と大足で下段をこすられる").includes("low"), "Low-poke concept was not detected");
assert(iconNames("連続ガード、暴れ潰し、相打ち、割り込み可能").includes("chain"), "True blockstring concept was not detected");
assert(iconNames("連続ガード、暴れ潰し、相打ち、割り込み可能").includes("bolt"), "Frame-trap concept was not detected");
assert(iconNames("安定・標準・最大").includes("stable"), "Stable tier was not detected");
assert(iconNames("安定・標準・最大").includes("scale"), "Standard tier was not detected");
assert(iconNames("安定・標準・最大").includes("max"), "Maximum tier was not detected");
assert(api.svgMarkup("shield").includes("<svg"), "SVG markup was not generated");
assert(api.svgMarkup("shield").includes("aria-hidden=\"true\""), "Decorative SVG lacks aria-hidden");

for (const page of ["index.html", "situations.html", "moves.html", "advantage.html", "matchups.html", "strategy.html", "drill.html"]) {
  assert(read(page).includes("data-core.js"), `${page} would not load the shared icon system`);
}

console.log(`Icon validation passed: ${api.icons.length} SVG icons, seven page legends, semantic concepts and collapsible prose.`);
