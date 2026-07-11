# Agent-Payment Activation Harness

A clean-room, deterministic proof asset for one narrow service:

> Make an agent-payment SDK's documented quickstart work from a clean install to one verified sandbox/testnet payment, then add regression coverage so it stays working.

This repository does **not** integrate or criticize a real vendor. It demonstrates the delivery method: a black-box activation contract, typed preflight failures, no settlement on invalid setup, CI, and measurable before/after output.

## One-command verification

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm run verify
```

The command:

1. Compiles the TypeScript project.
2. Runs one happy path and three critical setup failures.
3. Verifies that invalid setups never attempt settlement.
4. Writes deterministic benchmark evidence to `artifacts/baseline.json` and `artifacts/after.json`.

Expected summary:

```text
baseline-without-guardrails  1/4 classified  3 unhandled
hardened-activation          4/4 classified  0 unhandled
```

## What a paid 48-hour sprint changes

The fixture ports are replaced with one client's:

- documented SDK and pinned runtime;
- sandbox/testnet wallet adapter;
- HTTP 402 or equivalent payment requirements;
- facilitator/settlement adapter;
- first paid MCP/tool/API call.

The written definition of done remains:

> From a fresh checkout, after adding only documented temporary credentials, one command runs the agreed happy path and three failure-path tests under the agreed runtime.

## Safety boundaries

- No mainnet funds.
- No production access.
- No real wallet or key in source control.
- No load testing, auth bypassing, or vulnerability probing.
- This is an integration reliability harness, not a security audit.

## Layout

- `src/baseline-activation.ts` — deliberately naive comparison path.
- `src/hardened-activation.ts` — guarded activation path.
- `src/fixture.ts` — deterministic resource, wallet, and facilitator adapters.
- `tests/activation.test.ts` — objective acceptance tests.
- `scripts/benchmark.ts` — reproducible before/after evidence.
- `FAILURE_MATRIX.md` — failure contract.
- `DEMO_SCRIPT.md` — short handoff recording script.

## License

MIT
