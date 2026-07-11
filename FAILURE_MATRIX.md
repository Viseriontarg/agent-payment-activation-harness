# Failure Matrix

This project uses deterministic fixtures. It does not contain a real wallet, private key, RPC call, token transfer, or claim about a third-party product.

| Scenario | Baseline symptom | Hardened behavior | Acceptance condition |
|---|---|---|---|
| Happy path | Protected resource is called, payment settles, tool result returns | Same successful result with explicit receipt and metrics | `ACTIVATED`, two resource requests, one settlement |
| Missing wallet | Unhandled runtime exception during payment creation | Typed `MISSING_WALLET` failure before resource or settlement | No settlement attempt |
| Wrong network | Wallet fails late while creating payment | Typed `WRONG_NETWORK` after parsing HTTP 402 requirements | No settlement attempt |
| Insufficient funds | Wallet fails late with a provider-specific error | Typed `INSUFFICIENT_FUNDS` after explicit balance preflight | No settlement attempt |

The production sprint replaces fixture adapters with the client's documented SDK, sandbox/testnet wallet adapter, facilitator, and resource call. Acceptance criteria remain black-box and version-pinned.
