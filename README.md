# Bunexa — Pakistan Open Banking Prototype

Bunexa is an interactive, read-only prototype of a consent-led open-banking
connectivity platform for Pakistan.

## Live prototype

[Open the Bunexa prototype](https://kamrancr7.github.io/bunexa-open-banking-prototype/)

The prototype uses synthetic PKR data and simulated bank journeys. It is not a
live banking service, does not connect to production bank systems, and never
requests a bank password, PIN, or OTP.

## What is included

- Product landing experience explaining the platform and its four surfaces.
- Multi-step Bunexa Connect journey:
  - recipient and purpose disclosure;
  - searchable mock-bank directory with capability status;
  - granular scopes, duration, and account selection;
  - simulated bank-controlled authorization;
  - success receipt and stable connection reference.
- Customer connection dashboard:
  - bank-source-style balances and freshness;
  - normalized synthetic transactions;
  - consent purpose, scopes, expiry, and last access;
  - access history and isolated connection revocation.
- Recipient developer portal:
  - sandbox application credentials and approved scopes;
  - normalized account, balance, and transaction endpoints;
  - request health and latency;
  - signed webhook event example and replay control;
  - mock-bank capability health.
- Explicit separation of the read-only MVP from future payment initiation and
  any possible Raast payment route.

## Important boundary

This is a front-end proof of the product journeys and normalized contract. Bank
connectors, token custody, durable consent records, production APIs, live
webhooks, participant onboarding, cryptographic controls, and regulatory
approval remain future implementation work.

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

## Validation

```bash
npm test
GITHUB_PAGES=true npm run build:pages
```

The GitHub Pages workflow builds the static export from `main` and publishes the
generated `out/` directory.
