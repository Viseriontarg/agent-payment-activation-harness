# 90-Second Demo Script

1. Show a clean checkout and Node version.
2. Run `npm ci`.
3. Run `npm run verify`.
4. Point out the before/after table:
   - baseline correctly classifies only the happy path;
   - hardened path classifies all four scenarios;
   - failed setup scenarios create no settlement attempt.
5. Open `FAILURE_MATRIX.md` and show the objective acceptance criteria.
6. Explain that a client sprint swaps fixture adapters for its public SDK and sandbox while keeping the same black-box contract.

Do not call this a security audit. Do not show or use a real seed, private key, production credential, or mainnet balance.
