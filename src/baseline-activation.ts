import type {
  ActivationConfig,
  ActivationDependencies,
  ActivationMetrics,
  ActivationResult,
} from "./types.js";

/**
 * Intentionally naive reference path used only to produce the before/after
 * benchmark. It models a common quickstart failure pattern: assume every
 * prerequisite is correct, then let wallet/facilitator errors surface late.
 */
export async function activateWithoutGuardrails(
  config: ActivationConfig,
  dependencies: ActivationDependencies,
): Promise<ActivationResult> {
  const metrics: ActivationMetrics = {
    resourceRequests: 1,
    settlementAttempts: 0,
  };

  const initial = await dependencies.resource.request();
  const requirements = initial.paymentRequirements!;

  const payment = await dependencies.wallet.createPayment(requirements);
  metrics.settlementAttempts += 1;
  const settlement = await dependencies.facilitator.settle(payment);

  metrics.resourceRequests += 1;
  const paid = await dependencies.resource.request(payment);

  return {
    receipt: settlement.receipt!,
    toolResult: paid.body,
    metrics,
  };
}
