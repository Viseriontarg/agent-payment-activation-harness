export type NetworkId = `eip155:${number}`;

export type ActivationErrorCode =
  | "MISSING_WALLET"
  | "WRONG_NETWORK"
  | "INSUFFICIENT_FUNDS"
  | "INVALID_PAYMENT_REQUIREMENTS"
  | "SETTLEMENT_REJECTED"
  | "PAID_REQUEST_FAILED";

export interface ActivationConfig {
  walletAddress?: string;
  network: NetworkId;
}

export interface PaymentRequirements {
  scheme: "exact";
  network: NetworkId;
  amountAtomic: bigint;
  asset: string;
  payTo: string;
}

export interface ResourceResponse {
  status: number;
  paymentRequirements?: PaymentRequirements;
  body?: unknown;
}

export interface PaymentPayload {
  walletAddress: string;
  network: NetworkId;
  amountAtomic: bigint;
  asset: string;
  payTo: string;
  proof: string;
}

export interface WalletPort {
  balanceAtomic(asset: string, network: NetworkId): Promise<bigint>;
  createPayment(requirements: PaymentRequirements): Promise<PaymentPayload>;
}

export interface ResourcePort {
  request(payment?: PaymentPayload): Promise<ResourceResponse>;
}

export interface FacilitatorPort {
  settle(payment: PaymentPayload): Promise<{ settled: boolean; receipt?: string }>;
}

export interface ActivationDependencies {
  wallet: WalletPort;
  resource: ResourcePort;
  facilitator: FacilitatorPort;
}

export interface ActivationMetrics {
  resourceRequests: number;
  settlementAttempts: number;
}

export interface ActivationResult {
  receipt: string;
  toolResult: unknown;
  metrics: ActivationMetrics;
}

export interface ScenarioDefinition {
  id: string;
  expectedOutcome: "ACTIVATED" | ActivationErrorCode;
  config: ActivationConfig;
  walletBalanceAtomic: bigint;
  requiredNetwork: NetworkId;
  requiredAmountAtomic: bigint;
}

export interface ScenarioRun {
  id: string;
  expectedOutcome: ScenarioDefinition["expectedOutcome"];
  actualOutcome: "ACTIVATED" | ActivationErrorCode | "UNHANDLED_ERROR";
  matched: boolean;
  metrics: ActivationMetrics;
}
