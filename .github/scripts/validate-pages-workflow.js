const fs = require("fs");

const workflowPath = ".github/workflows/pages.yml";
const workflow = fs.readFileSync(workflowPath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(/^name:\s*Validate static site\s*$/m.test(workflow), "Workflow must clearly describe validation-only responsibility");
assert(workflow.includes("actions/checkout@v7"), "Validation workflow must use the Node 24-compatible checkout action");
assert(workflow.includes("permissions:\n  contents: read"), "Validation workflow should use read-only repository permissions");
assert(workflow.includes("Validate branch-based Pages readiness"), "Branch-based Pages readiness check is missing");
assert(fs.existsSync(".nojekyll"), "Root .nojekyll marker is required for direct branch publishing");

for (const forbidden of [
  "actions/configure-pages@",
  "actions/upload-pages-artifact@",
  "actions/deploy-pages@",
  "pages: write",
  "id-token: write",
  "Reset stuck Pages site once",
  "--request DELETE"
]) {
  assert(!workflow.includes(forbidden), `Validation-only workflow still contains deployment behavior: ${forbidden}`);
}

assert(!fs.existsSync(".github/PAGES_RESET_ONCE"), "Unsupported automatic Pages reset marker must not remain");
assert(workflow.includes("cancel-in-progress: ${{ github.event_name == 'pull_request' }}"), "Only stale pull-request validation may be cancelled");
assert(!/^\s*cancel-in-progress:\s*true\s*$/m.test(workflow), "Validation concurrency must not use an unconditional cancellation rule");

console.log("Pages readiness validation passed: main root is ready for branch publishing and Actions only validates.");
