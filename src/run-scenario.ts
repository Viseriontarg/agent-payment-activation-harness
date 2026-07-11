import { ActivationError } from "./errors.js";
import { createFixture } from "./fixture.js";
import type {
  ActivationConfig,
  ActivationDependencies,
  ActivationResult,
  ScenarioDefinition,
  ScenarioRun,
} from "./types.js";

export type Activator = (
  config: ActivationConfig,
  dependencies: ActivationDependencies,
) => Promise<ActivationResult>;

export async function runScenario(
  scenario: ScenarioDefinition,
  activator: Activator,
): Promise<ScenarioRun> {
  const fixture = createFixture(scenario);
  let actualOutcome: ScenarioRun["actualOutcome"] = "UNHANDLED_ERROR";

  try {
    await activator(scenario.config, fixture.dependencies);
    actualOutcome = "ACTIVATED";
  } catch (error) {
    actualOutcome =
      error instanceof ActivationError ? error.code : "UNHANDLED_ERROR";
  }

  return {
    id: scenario.id,
    expectedOutcome: scenario.expectedOutcome,
    actualOutcome,
    matched: actualOutcome === scenario.expectedOutcome,
    metrics: fixture.observedMetrics(),
  };
}
