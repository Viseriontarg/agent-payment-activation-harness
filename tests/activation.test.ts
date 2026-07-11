import assert from "node:assert/strict";
import test from "node:test";
import { activateWithoutGuardrails } from "../src/baseline-activation.js";
import { activateWithGuardrails } from "../src/hardened-activation.js";
import { runScenario } from "../src/run-scenario.js";
import { scenarios } from "../src/scenarios.js";

for (const scenario of scenarios) {
  test(`hardened path classifies ${scenario.id}`, async () => {
    const run = await runScenario(scenario, activateWithGuardrails);
    assert.equal(run.actualOutcome, scenario.expectedOutcome);
    assert.equal(run.matched, true);

    if (scenario.expectedOutcome !== "ACTIVATED") {
      assert.equal(
        run.metrics.settlementAttempts,
        0,
        "a preflight failure must not attempt settlement",
      );
    }
  });
}

test("baseline demonstrates the late-failure problem", async () => {
  const runs = [];
  for (const scenario of scenarios) {
    runs.push(await runScenario(scenario, activateWithoutGuardrails));
  }

  assert.equal(runs.filter((run) => run.matched).length, 1);
  assert.equal(
    runs.filter((run) => run.actualOutcome === "UNHANDLED_ERROR").length,
    3,
  );
});
