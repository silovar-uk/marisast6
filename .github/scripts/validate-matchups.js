const fs = require("fs");
const vm = require("vm");

const read = file => fs.readFileSync(file, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(read("matchup-data.js"), context, { filename: "matchup-data.js" });

const data = context.window.MARISA_MATCHUPS;
assert(data, "MARISA_MATCHUPS is not exported");
const validation = data.validate();
assert(validation.ok, `Data validation failed: ${validation.errors.join(", ")}`);
assert(data.basisDate === "2026-08-03", `Unexpected basis: ${data.basisDate}`);
assert(data.profiles.length === 31, `Expected 31 profiles, found ${data.profiles.length}`);
assert(new Set(data.profiles.map(item => item.id)).size === 31, "Profile IDs must be unique");
assert(data.upcoming.length === 3, "Year 4 upcoming placeholders are incomplete");

for (const profile of data.profiles) {
  assert(profile.do.length === 3, `${profile.id} needs exactly three DO rules`);
  assert(profile.dont.length === 3, `${profile.id} needs exactly three DON'T rules`);
  for (const lane of ["poke", "whiff", "place"]) {
    assert(profile.neutral[lane]?.cue, `${profile.id}/${lane} is missing cue`);
    assert(profile.neutral[lane]?.action, `${profile.id}/${lane} is missing action`);
    assert(profile.neutral[lane]?.stop, `${profile.id}/${lane} is missing stop condition`);
  }
  assert(profile.drill.setup && profile.drill.success, `${profile.id} is missing training instructions`);
}

const html = read("matchups.html");
for (const token of ["matchup-app", "MATCHUP LAB / ALL 31", "matchup-data.js?v=0.24.0", "matchup-page.js?v=0.24.0", "marisa-arena.js?v=0.24.0"]) {
  assert(html.includes(token), `matchups.html is missing ${token}`);
}

const pageJs = read("matchup-page.js");
for (const token of ["modern-marisa-matchup-progress-v1", "modern-marisa-matchup-logs-v1", "data-mistake", "data-choice", "QUICK", "LAB"]) {
  assert(pageJs.includes(token), `matchup-page.js is missing ${token}`);
}

console.log(`Matchup validation passed: ${data.profiles.length} live profiles, ${data.upcoming.length} upcoming placeholders.`);
