const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exists = file => fs.existsSync(path.join(root, file));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const publicPages = [
  "index.html",
  "situations.html",
  "moves.html",
  "advantage.html",
  "strategy.html",
  "drill.html"
];
const navTargets = publicPages;
const forbiddenPublicText = [
  "基準：2026年3月17日調整",
  "全48技",
  "48 MOVES",
  "24ルート",
  "ODディマ対空"
];

for (const page of publicPages) {
  assert(exists(page), `Missing public page: ${page}`);
  const html = read(page);
  assert(html.includes("2026年8月3日調整"), `${page} does not state the August 3 basis`);
  assert(html.includes("v0.23.2"), `${page} does not use v0.23.2 assets or footer`);

  for (const target of navTargets) {
    assert(html.includes(`href="${target}"`), `${page} navigation is missing ${target}`);
  }
  for (const token of forbiddenPublicText) {
    assert(!html.includes(token), `${page} contains stale public text: ${token}`);
  }

  if (page !== "advantage.html") {
    assert(html.includes("page-guides.css?v=0.23.2"), `${page} does not load page guide CSS explicitly`);
    assert(html.includes("page-guides.js?v=0.23.2"), `${page} does not load page guide JS explicitly`);
  }

  const refs = [...html.matchAll(/(?:href|src)="([^"?#]+\.(?:css|js))(?:\?[^\"]*)?"/g)]
    .map(match => match[1])
    .filter(ref => !/^https?:/.test(ref));
  for (const ref of refs) assert(exists(ref), `${page} references missing file: ${ref}`);
}

const movePage = read("moves.html");
assert(movePage.includes("2026年3月17日 調整内容"), "Historical March source link is missing");
assert(movePage.includes("旧基準"), "Historical March source is not labeled as an old basis");

const version = JSON.parse(read("version.json"));
assert(version.appVersion === "0.23.2", `Unexpected appVersion: ${version.appVersion}`);
assert(version.moveDataBasis === "2026-08-03", `Unexpected moveDataBasis: ${version.moveDataBasis}`);

const workflowDir = path.join(root, ".github/workflows");
const deployWorkflows = fs.readdirSync(workflowDir)
  .filter(file => /\.ya?ml$/.test(file))
  .filter(file => /^name:\s*Deploy static site to Pages\s*$/m.test(fs.readFileSync(path.join(workflowDir, file), "utf8")));
assert(deployWorkflows.length === 1, `Expected one Pages workflow, found: ${deployWorkflows.join(", ")}`);
assert(deployWorkflows[0] === "pages.yml", `Canonical Pages workflow must be pages.yml, got ${deployWorkflows[0]}`);

function createContext() {
  const storage = new Map();
  const document = {
    readyState: "complete",
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return { dataset: {}, style: {}, appendChild() {} }; },
    head: { appendChild() {} }
  };
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }
  };
  const context = {
    window: {},
    document,
    localStorage,
    console,
    Date,
    JSON,
    URLSearchParams,
    setTimeout() { return 0; },
    clearTimeout() {}
  };
  context.window.window = context.window;
  context.window.document = document;
  context.window.localStorage = localStorage;
  vm.createContext(context);
  return context;
}

function run(context, file) {
  vm.runInContext(read(file), context, { filename: file });
}

const context = createContext();
for (const file of [
  "data-core.js",
  "year4-phase1.js",
  "year4-phase2.js",
  "year4-phase3.js",
  "year4-phase4.js",
  "year4-playbook-guard.js",
  "situations.js",
  "data-1.js",
  "data-2.js",
  "data-3.js",
  "data-4.js",
  "data-5.js",
  "data-6.js",
  "playbook-data.js",
  "playbook-expanded.js",
  "drill-data.js",
  "drill-route-schema.js",
  "drill-scenarios.js",
  "combo-learning-data.js",
  "followups-data.js",
  "situations-data-v2.js"
]) run(context, file);

const year4 = context.window.MARISA_YEAR4;
assert(year4?.basisDate === "2026-08-03", `Unexpected Year 4 basis: ${year4?.basisDate}`);
year4.api.finalizeDrillRoutes();
const validation = year4.validate();
assert(validation.ok, `Year 4 validation failed: ${validation.errors.join(", ")}`);

const moves = context.window.MARISA_DATA.moves;
const moveIds = new Set(moves.map(move => move.id));
assert(!moveIds.has("dimachaerusOD"), "OD Dimachaerus remains in active moves");
for (const id of ["quadrigaL", "quadrigaM", "quadrigaH", "quadrigaOD"]) {
  assert(moveIds.has(id), `Missing Year 4 move: ${id}`);
}
assert(moveIds.size === moves.length, "Active move IDs are not unique");

const routes = context.window.MARISA_DRILL.routes;
for (const retiredId of year4.retiredRouteIds) {
  assert(!routes.some(route => route.id === retiredId), `Retired route remains active: ${retiredId}`);
}
assert((year4.comboCandidates || []).length === 9, "Expected nine Quadriga verification candidates");
assert(context.window.MARISA_COMBO_LEARNING.pendingFamilies?.some(item => item.id === "quadriga-year4"), "Quadriga pending learning family is missing");

const activeCards = context.window.MARISA_PLAYBOOK.cards;
assert(!activeCards.some(card => year4.api.containsRetired(card)), "A retired move remains in an active playbook card");

const advantageContext = {
  window: {},
  location: { search: "" },
  document: { addEventListener() {}, querySelector() { return null; } },
  console,
  URLSearchParams
};
advantageContext.window.window = advantageContext.window;
vm.createContext(advantageContext);
run(advantageContext, "advantage-page.js");
const frameTests = advantageContext.window.MARISA_ADVANTAGE.selfTest();
assert(frameTests.every(test => test.ok), `Frame-gap self-test failed: ${JSON.stringify(frameTests)}`);

console.log(JSON.stringify({
  publicPages: publicPages.length,
  basisDate: year4.basisDate,
  activeMoves: moves.length,
  activeRoutes: routes.length,
  activePlaybookCards: activeCards.length,
  scenarios: context.window.MARISA_DECISION_DRILL.scenarios.length,
  quadrigaCandidates: year4.comboCandidates.length,
  pagesWorkflow: deployWorkflows[0],
  frameGapTests: frameTests.length
}, null, 2));
