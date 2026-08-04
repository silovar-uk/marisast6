const fs = require("fs");
const vm = require("vm");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);

function run(file) {
  vm.runInContext(read(file), context, { filename: file });
}

run("data-core.js");
run("situations-data-v2.js");
run("playbook-data.js");
run("playbook-expanded.js");

context.document = { readyState: "complete" };
context.window.document = context.document;
run("year4-tactical-additions.js");

const situationIds = [
  "conversion-wall-impact-normal-save",
  "conversion-wall-impact-normal-drive",
  "conversion-wall-impact-sa2",
  "conversion-wall-impact-burnout-stun",
  "neutral-vs-repeated-crmk",
  "neutral-vs-sweep",
  "neutral-vs-crmk-drive-rush"
];

const playbookIds = [
  "year4-wall-impact-decision",
  "year4-low-poke-approach",
  "year4-low-poke-lab"
];

const situations = context.window.MARISA_SITUATIONS;
const playbook = context.window.MARISA_PLAYBOOK;
assert(situations, "MARISA_SITUATIONS was not created");
assert(playbook, "MARISA_PLAYBOOK was not created");

for (const id of situationIds) {
  assert(situations.items.some(item => item.id === id), `Missing tactical situation: ${id}`);
}
for (const id of playbookIds) {
  assert(playbook.cards.some(card => card.id === id), `Missing tactical playbook card: ${id}`);
}

assert(situations.gameVersion === "2026-08-03", `Unexpected situation basis: ${situations.gameVersion}`);
assert(situations.filters.opponent.some(item => item.id === "low-poke"), "Missing low-poke opponent filter");

const wallSave = situations.items.find(item => item.id === "conversion-wall-impact-normal-save");
const wallStun = situations.items.find(item => item.id === "conversion-wall-impact-burnout-stun");
const wallDrive = situations.items.find(item => item.id === "conversion-wall-impact-normal-drive");
const wallSa2 = situations.items.find(item => item.id === "conversion-wall-impact-sa2");
assert(wallSave.conditions.opponentBurnout === false, "Normal wall splat must be separated from burnout stun");
assert(wallStun.conditions.opponentBurnout === true, "Burnout stun route is not marked correctly");
assert(wallDrive.verification.status === "candidate", "OD wall route must remain candidate");
assert(wallSa2.verification.status === "candidate", "SA2 wall route must remain candidate");

const newContent = JSON.stringify([
  ...situations.items.filter(item => situationIds.includes(item.id)),
  ...playbook.cards.filter(card => playbookIds.includes(card.id))
]);
assert(!newContent.includes("dimachaerusOD"), "New tactical content must not restore OD Dimachaerus");
assert(newContent.includes("ワンボタングラディウス"), "Anti-low-poke training must retain one-button Gladius anti-air");
assert(newContent.includes("グラディウスのアーマーは下段への万能回答ではない"), "Low armor caution is missing");

const guideCss = read("page-guides.css");
assert(guideCss.includes("--guide-bg: #f4efe5"), "Reading guide solid background token is missing");
assert(guideCss.includes("--guide-text: #191512"), "Reading guide dark text token is missing");
assert(guideCss.includes("color-scheme: light"), "Reading guide must isolate a light color scheme");
assert(guideCss.includes("background: var(--guide-bg)"), "Reading guide background is not solid");
assert(guideCss.includes("transform: none"), "Japanese hero headings must remove skew transform");
assert(guideCss.includes("word-break: auto-phrase"), "Japanese phrase-aware line breaking is missing");
assert(guideCss.includes("YEAR 4 / AUG 03"), "Old fixed-count hero decoration was not overridden");

const headingJs = read("heading-layout.js");
assert(headingJs.includes("このサイトは、技表ではなく"), "Home reading guide line map is missing");
assert(headingJs.includes("editorial-title-line"), "Semantic title line wrapper is missing");
assert(headingJs.includes("setTimeout(apply, 0)"), "Heading fix must run after page guide injection");

const core = read("data-core.js");
assert(core.includes("year4-tactical-additions.js?v=0.23.3"), "Tactical additions are not loaded by data-core");
assert(core.includes("heading-layout.js?v=0.23.3"), "Heading layout is not loaded by data-core");

const version = JSON.parse(read("version.json"));
assert(version.appVersion === "0.23.2", `Unexpected app version: ${version.appVersion}`);
assert(version.moveDataBasis === "2026-08-03", `Unexpected move data basis: ${version.moveDataBasis}`);

console.log(`Readability and tactical validation passed: ${situationIds.length} situations, ${playbookIds.length} playbook cards.`);
