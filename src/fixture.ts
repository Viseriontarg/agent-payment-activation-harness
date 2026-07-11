import type {
  ActivationDependencies,
  ActivationMetrics,
  NetworkId,
  PaymentPayload,
  PaymentRequirements,
  ScenarioDefinition,
} from "./types.js";

export interface Fixture {
  dependencies: ActivationDependencies;
  observedMetrics(): ActivationMetrics;
}

const ASSET = "fixture-usdc";
const PAY_TO = "0x0000000000000000000000000000000000000042";

export function createFixture(scenario: ScenarioDefinition): Fixture {
  const observed: ActivationMetrics = {
    resourceRequests: 0,
    settlementAttempts: 0,
  };

  const requirements: PaymentRequirements = {
    scheme: "exact",
    network: scenario.requiredNetwork,
    amountAtomic: scenario.requiredAmountAtomic,
    asset: ASSET,
    payTo: PAY_TO,
  };

  let receipt: string | undefined;

  return {
    dependencies: {
      wallet: {
        async balanceAtomic(_asset: string, _network: NetworkId) {
          return scenario.walletBalanceAtomic;
        },
        async createPayment(value: PaymentRequirements) {
          if (!scenario.config.walletAddress) {
            throw new Error("wallet address missing");
          }

          if (scenario.config.network !== value.network) {
            throw new Error("wallet rejected wrong network");
          }

          if (scenario.walletBalanceAtomic < value.amountAtomic) {
            throw new Error("wallet rejected insufficient balance");
          }

          return {
            walletAddress: scenario.config.walletAddress,
            network: value.network,
            amountAtomic: value.amountAtomic,
            asset: value.asset,
            payTo: value.payTo,
            proof: `fixture-proof:${scenario.id}`,
          } satisfies PaymentPayload;
        },
      },
      resource: {
        async request(payment?: PaymentPayload) {
          observed.resourceRequests += 1;

          if (!payment || payment.proof !== `fixture-proof:${scenario.id}`) {
            return {
              status: 402,
              paymentRequirements: requirements,
            };
          }

          if (!receipt) {
            return { status: 402, paymentRequirements: requirements };
          }

          return {
            status: 200,
            body: { result: "fixture-weather:72", scenario: scenario.id },
          };
        },
      },
      facilitator: {
        async settle(payment: PaymentPayload) {
          observed.settlementAttempts += 1;

          if (
            payment.network !== requirements.network ||
            payment.amountAtomic !== requirements.amountAtomic
          ) {
            return { settled: false };
          }

          receipt = `fixture-receipt:${scenario.id}`;
          return { settled: true, receipt };
        },
      },
    },
    observedMetrics() {
      return { ...observed };
    },
  };
}
