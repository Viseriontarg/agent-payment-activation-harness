import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { activateWithoutGuardrails } from "../src/baseline-activation.js";
import { activateWithGuardrails } from "../src/hardened-activation.js";
import { runScenario } from "../src/run-scenario.js";
import { scenarios } from "../src/scenarios.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function evaluate(
  label: string,
  activator: typeof activateWithGuardrails,
) {
  const runs = [];
  for (const scenario of scenarios) {
    runs.push(await runScenario(scenario, activator));
  }

  return {
    label,
    scenarioCount: runs.length,
    correctlyClassified: runs.filter((run) => run.matched).length,
    unnecessarySettlementAttempts: runs
      .filter((run) => run.expectedOutcome !== "ACTIVATED")
      .reduce((sum, run) => sum + run.metrics.settlementAttempts, 0),
    unhandledErrors: runs.filter(
      (run) => run.actualOutcome === "UNHANDLED_ERROR",
    ).length,
    runs,
  };
}

const baseline = await evaluate("baseline-without-guardrails", activateWithoutGuardrails);
const after = await evaluate("hardened-activation", activateWithGuardrails);

await mkdir(resolve(root, "artifacts"), { recursive: true });
await writeFile(
  resolve(root, "artifacts", "baseline.json"),
  `${JSON.stringify(baseline, null, 2)}\n`,
);
await writeFile(
  resolve(root, "artifacts", "after.json"),
  `${JSON.stringify(after, null, 2)}\n`,
);

console.table([
  {
    path: baseline.label,
    classified: `${baseline.correctlyClassified}/${baseline.scenarioCount}`,
    unhandled: baseline.unhandledErrors,
    unnecessarySettlements: baseline.unnecessarySettlementAttempts,
  },
  {
    path: after.label,
    classified: `${after.correctlyClassified}/${after.scenarioCount}`,
    unhandled: after.unhandledErrors,
    unnecessarySettlements: after.unnecessarySettlementAttempts,
  },
]);

if (after.correctlyClassified !== scenarios.length) {
  process.exitCode = 1;
}
