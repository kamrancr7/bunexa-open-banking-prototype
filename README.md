# Bunexa — Complete Pakistan Open Banking Platform Prototype

Bunexa is an interactive, multi-role prototype of a consent-led open-banking
connectivity platform for Pakistan. It demonstrates the customer experience and
the platform control plane that makes the experience possible.

## Live prototype

[Open the Bunexa prototype](https://kamrancr7.github.io/bunexa-open-banking-prototype/)

The prototype uses synthetic PKR data and simulated bank journeys. It is not a
live banking service, does not connect to production bank systems, and never
requests a bank password, PIN, or OTP.

## What is included

- Bunexa Operations Console:
  - participant directory and recipient onboarding;
  - consent and connection registry;
  - bank-connector health, releases and mapping operations;
  - webhook delivery, incidents, cases and data-quality queues;
  - least-privilege activity and evidence views.
- Interactive end-to-end product trace:
  - recipient Link-session creation;
  - customer consent and bank-controlled authentication;
  - authoritative consent and policy evaluation;
  - isolated bank-connector retrieval;
  - canonical normalization and source lineage;
  - recipient API response, webhook delivery and operational evidence.
- Recipient portal:
  - organization and application identity;
  - redirects, certificates, scopes and sandbox credentials;
  - API request explorer, logs, webhooks and conformance gates.
- Bank integration portal:
  - approved bank profile, endpoints and certificates;
  - connector release, mappings and rollback;
  - capability-level health and conformance evidence;
  - controlled maker-checker change requests.
- Multi-step Bunexa Connect journey:
  - recipient and purpose disclosure;
  - mock-bank directory with capability status;
  - granular scopes, duration and account selection;
  - simulated bank-controlled authorization;
  - success receipt and stable connection reference.
- Customer connection dashboard:
  - bank-source-style balances and freshness;
  - normalized synthetic transactions;
  - consent purpose, scopes, expiry and last access;
  - access history and isolated connection revocation.
- Explicit separation of the read-only MVP from future payment initiation and
  any possible Raast payment route.

## Important boundary

This is a front-end simulation of the complete product model. Its state,
participants, connectors, consent records, API responses, webhooks, incidents
and audit evidence are synthetic. Production connectors, token custody,
durable records, cryptographic enforcement, live banking APIs and regulatory
approval remain implementation work.

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

The GitHub Pages workflow builds the static export from `main` and publishes
the generated `out/` directory.
