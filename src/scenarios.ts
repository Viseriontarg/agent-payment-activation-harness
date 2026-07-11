import type { ScenarioDefinition } from "./types.js";

const BASE_SEPOLIA = "eip155:84532" as const;

export const scenarios: readonly ScenarioDefinition[] = [
  {
    id: "happy-path",
    expectedOutcome: "ACTIVATED",
    config: {
      walletAddress: "0x0000000000000000000000000000000000000001",
      network: BASE_SEPOLIA,
    },
    walletBalanceAtomic: 10_000n,
    requiredNetwork: BASE_SEPOLIA,
    requiredAmountAtomic: 1_000n,
  },
  {
    id: "missing-wallet",
    expectedOutcome: "MISSING_WALLET",
    config: { network: BASE_SEPOLIA },
    walletBalanceAtomic: 10_000n,
    requiredNetwork: BASE_SEPOLIA,
    requiredAmountAtomic: 1_000n,
  },
  {
    id: "wrong-network",
    expectedOutcome: "WRONG_NETWORK",
    config: {
      walletAddress: "0x0000000000000000000000000000000000000001",
      network: "eip155:1",
    },
    walletBalanceAtomic: 10_000n,
    requiredNetwork: BASE_SEPOLIA,
    requiredAmountAtomic: 1_000n,
  },
  {
    id: "insufficient-funds",
    expectedOutcome: "INSUFFICIENT_FUNDS",
    config: {
      walletAddress: "0x0000000000000000000000000000000000000001",
      network: BASE_SEPOLIA,
    },
    walletBalanceAtomic: 999n,
    requiredNetwork: BASE_SEPOLIA,
    requiredAmountAtomic: 1_000n,
  },
] as const;
