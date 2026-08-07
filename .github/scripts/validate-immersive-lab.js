const fs = require("fs");
const vm = require("vm");

const read = file => fs.readFileSync(file, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const css = read("immersive-lab.css");
const js = read("immersive-lab.js");
const core = read("data-core.js");
const version = JSON.parse(read("version.json"));
const pages = ["index.html", "situations.html", "moves.html", "advantage.html", "matchups.html", "strategy.html", "drill.html"];

for (const token of [
  ".lab-atmosphere",
  ".lab-session-ribbon",
  ".lab-mission-brief",
  ".lab-command-summary",
  ".lab-card-meter",
  ".lab-reward-toast",
  ".lab-reveal",
  "prefers-reduced-motion"
]) {
  assert(css.includes(token), `Immersive CSS is missing ${token}`);
}

assert(css.includes("position: sticky"), "The lab control rail is not persistent");
assert(css.includes("--lab-pointer-x"), "Pointer atmosphere variables are missing");
assert(css.includes("body.page-advantage.lab-immersive-ready"), "Advantage paper has no immersive framing rule");
assert(css.includes("body.page-drill.lab-immersive-ready"), "Drill tension styling is missing");

for (const token of [
  "modern-marisa-lab-session-v1",
  "modern-marisa-combo-route-summary-v1",
  "modern-marisa-drill-analysis-v1",
  "marisa-decision-drill-v2",
  "TRAINING SESSION / ACTIVE",
  "LAB MAP UPDATED",
  "今日の探索",
  "IntersectionObserver",
  "MutationObserver"
]) {
  assert(js.includes(token), `Immersive JS is missing ${token}`);
}

const missionCodes = [...js.matchAll(/code:\s*"([A-Z]{3}-\d{2})"/g)].map(match => match[1]);
assert(missionCodes.length === 7, `Expected seven page missions, found ${missionCodes.length}`);
assert(new Set(missionCodes).size === 7, "Page mission codes are not unique");

for (const bodyClass of ["page-home", "page-situations", "page-moves", "page-advantage", "page-matchups", "page-strategy", "page-drill"]) {
  assert(js.includes(`"${bodyClass}"`), `Mission configuration missing ${bodyClass}`);
}

assert(!js.includes("setInterval("), "Immersive layer must not run a continuous timer");
assert(!/Audio\s*\(|new\s+Audio|\.play\s*\(/.test(js), "Immersive layer must remain soundless");
assert(js.includes("必要な場所だけ回れば十分です"), "Lab map feedback should avoid completion pressure");

const styleIndex = core.indexOf("immersive-lab.css?v=20260806-2");
const iconScriptIndex = core.indexOf("icon-system.js?v=20260806");
const immersiveScriptIndex = core.indexOf("immersive-lab.js?v=20260806-2");
const contrastScriptIndex = core.indexOf("contrast-guard.js?v=20260805");
assert(styleIndex >= 0, "data-core does not load immersive CSS");
assert(iconScriptIndex >= 0 && immersiveScriptIndex > iconScriptIndex, "Immersive JS must load after the icon API");
assert(contrastScriptIndex > immersiveScriptIndex, "Contrast audit must run after immersive UI creation");

for (const page of pages) {
  assert(read(page).includes("data-core.js"), `${page} would miss the immersive layer`);
}

assert(version.immersiveLabVersion === "1.0.0", "immersiveLabVersion is not recorded");
for (const feature of [
  "personal-fight-lab-atmosphere",
  "daily-seven-page-lab-map",
  "page-specific-mission-briefings",
  "real-local-progress-command-stats",
  "reduced-motion-immersive-fallback"
]) {
  assert(version.features.includes(feature), `Version manifest missing ${feature}`);
}

// The file must remain safe in non-browser validation contexts.
const context = { globalThis: {}, console };
vm.createContext(context);
vm.runInContext(js, context, { filename: "immersive-lab.js" });

console.log(`Immersive lab validation passed: ${missionCodes.join(", ")}.`);
