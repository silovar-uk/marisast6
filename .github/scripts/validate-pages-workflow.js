const fs = require("fs");

const workflowPath = ".github/workflows/pages.yml";
const workflow = fs.readFileSync(workflowPath, "utf8");
const resetMarker = ".github/PAGES_RESET_ONCE";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  workflow.includes("format('pages-pr-{0}', github.event.pull_request.number) || 'pages-production'"),
  "Pages workflow must separate pull-request validation from production deployment concurrency"
);
assert(
  workflow.includes("cancel-in-progress: ${{ github.event_name == 'pull_request' }}"),
  "Only stale pull-request runs may be cancelled"
);
assert(
  !/^\s*cancel-in-progress:\s*true\s*$/m.test(workflow),
  "Production Pages deployments must never use unconditional cancel-in-progress"
);

for (const action of [
  "actions/checkout@v7",
  "actions/configure-pages@v6",
  "actions/upload-pages-artifact@v5",
  "actions/deploy-pages@v5"
]) {
  assert(workflow.includes(`uses: ${action}`), `Pages workflow is missing current Node 24 action: ${action}`);
}

assert(workflow.includes("timeout-minutes: 20"), "Deploy job needs enough time for the Pages queue");
assert(workflow.includes("timeout: 600000"), "deploy-pages must use its supported ten-minute maximum timeout");
assert(workflow.includes("if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'"), "Pull requests must validate without deploying");

if (fs.existsSync(resetMarker)) {
  assert(workflow.includes("Reset stuck Pages site once"), "Reset marker exists but the one-time recovery step is missing");
  assert(workflow.includes("--request DELETE"), "One-time recovery must delete the stuck Pages site configuration");
  assert(workflow.includes("enablement: ${{ hashFiles('.github/PAGES_RESET_ONCE') != '' }}"), "configure-pages must recreate the workflow site after reset");
  assert(workflow.includes("sleep 20"), "Recovery must allow the old Pages queue time to clear");
}

console.log(`Pages workflow validation passed: production deploys queue safely${fs.existsSync(resetMarker) ? " with one-time recovery enabled" : ""}.`);
