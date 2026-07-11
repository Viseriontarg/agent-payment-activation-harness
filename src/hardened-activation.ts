import { ActivationError } from "./errors.js";
import type {
  ActivationConfig,
  ActivationDependencies,
  ActivationMetrics,
  ActivationResult,
  PaymentRequirements,
} from "./types.js";

function validateRequirements(
  value: PaymentRequirements | undefined,
): PaymentRequirements {
  if (
    !value ||
    value.scheme !== "exact" ||
    value.amountAtomic <= 0n ||
    !value.asset ||
    !value.payTo
  ) {
    throw new ActivationError(
      "INVALID_PAYMENT_REQUIREMENTS",
      "The resource returned incomplete or unsupported payment requirements.",
    );
  }

  return value;
}

export async function activateWithGuardrails(
  config: ActivationConfig,
  dependencies: ActivationDependencies,
): Promise<ActivationResult> {
  const metrics: ActivationMetrics = {
    resourceRequests: 0,
    settlementAttempts: 0,
  };

  if (!config.walletAddress) {
    throw new ActivationError(
      "MISSING_WALLET",
      "Set a wallet address before starting the activation path.",
    );
  }

  metrics.resourceRequests += 1;
  const initial = await dependencies.resource.request();

  if (initial.status !== 402) {
    throw new ActivationError(
      "INVALID_PAYMENT_REQUIREMENTS",
      `Expected HTTP 402 from the protected resource, received ${initial.status}.`,
    );
  }

  const requirements = validateRequirements(initial.paymentRequirements);

  if (config.network !== requirements.network) {
    throw new ActivationError(
      "WRONG_NETWORK",
      `Configured ${config.network}; resource requires ${requirements.network}.`,
    );
  }

  const balance = await dependencies.wallet.balanceAtomic(
    requirements.asset,
    requirements.network,
  );

  if (balance < requirements.amountAtomic) {
    throw new ActivationError(
      "INSUFFICIENT_FUNDS",
      `Wallet balance ${balance} is below required amount ${requirements.amountAtomic}.`,
    );
  }

  const payment = await dependencies.wallet.createPayment(requirements);
  metrics.settlementAttempts += 1;
  const settlement = await dependencies.facilitator.settle(payment);

  if (!settlement.settled || !settlement.receipt) {
    throw new ActivationError(
      "SETTLEMENT_REJECTED",
      "The facilitator did not return a successful settlement receipt.",
    );
  }

  metrics.resourceRequests += 1;
  const paid = await dependencies.resource.request(payment);

  if (paid.status !== 200) {
    throw new ActivationError(
      "PAID_REQUEST_FAILED",
      `The paid retry returned HTTP ${paid.status}.`,
    );
  }

  return {
    receipt: settlement.receipt,
    toolResult: paid.body,
    metrics,
  };
}
