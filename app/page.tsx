"use client";

import { useEffect, useMemo, useState } from "react";

type View = "home" | "developer" | "customer";
type LinkStep = 0 | 1 | 2 | 3 | 4;

type Bank = {
  id: string;
  name: string;
  initials: string;
  tone: string;
  status: "Available" | "Maintenance";
  capabilities: string;
};

const banks: Bank[] = [
  {
    id: "hbl",
    name: "HBL Sandbox",
    initials: "HB",
    tone: "teal",
    status: "Available",
    capabilities: "Accounts · Balances · Transactions",
  },
  {
    id: "meezan",
    name: "Meezan Sandbox",
    initials: "MB",
    tone: "blue",
    status: "Available",
    capabilities: "Accounts · Balances · Transactions",
  },
  {
    id: "alfalah",
    name: "Bank Alfalah Sandbox",
    initials: "BA",
    tone: "red",
    status: "Available",
    capabilities: "Accounts · Balances",
  },
  {
    id: "ubl",
    name: "UBL Sandbox",
    initials: "UB",
    tone: "green",
    status: "Maintenance",
    capabilities: "Temporarily unavailable",
  },
];

const transactions = [
  {
    merchant: "Raast incoming transfer",
    meta: "28 Jul · Instant transfer",
    amount: "+ PKR 245,000",
    kind: "credit",
  },
  {
    merchant: "Karachi Electric",
    meta: "27 Jul · Utilities",
    amount: "− PKR 38,420",
    kind: "debit",
  },
  {
    merchant: "Daraz Seller Settlement",
    meta: "26 Jul · Business income",
    amount: "+ PKR 183,750",
    kind: "credit",
  },
  {
    merchant: "National Logistics",
    meta: "25 Jul · Operations",
    amount: "− PKR 26,800",
    kind: "debit",
  },
];

const endpoints = [
  {
    method: "GET",
    path: "/v1/institutions",
    detail: "List supported banks and capability health",
    latency: "84 ms",
  },
  {
    method: "POST",
    path: "/v1/link-sessions",
    detail: "Create a short-lived consent journey",
    latency: "126 ms",
  },
  {
    method: "GET",
    path: "/v1/accounts/{id}/balances",
    detail: "Read typed balances with freshness",
    latency: "218 ms",
  },
  {
    method: "GET",
    path: "/v1/accounts/{id}/transactions",
    detail: "Retrieve normalized transaction history",
    latency: "342 ms",
  },
];

function ArrowIcon() {
  return (
    <span aria-hidden="true" className="arrow-icon">
      →
    </span>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkStep, setLinkStep] = useState<LinkStep>(0);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(banks[0]);
  const [bankSearch, setBankSearch] = useState("");
  const [businessAccount, setBusinessAccount] = useState(true);
  const [savingsAccount, setSavingsAccount] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "Active" | "Revoked"
  >("Active");
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState("Today, 10:42 AM");

  const filteredBanks = useMemo(
    () =>
      banks.filter((bank) =>
        bank.name.toLowerCase().includes(bankSearch.trim().toLowerCase()),
      ),
    [bankSearch],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLinkOpen(false);
        setRevokeOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = linkOpen || revokeOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [linkOpen, revokeOpen]);

  function openLink() {
    setLinkStep(0);
    setBankSearch("");
    setSelectedBank(banks[0]);
    setBusinessAccount(true);
    setSavingsAccount(false);
    setConsentConfirmed(false);
    setLinkOpen(true);
  }

  function changeView(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyKey() {
    void navigator.clipboard?.writeText("sandbox_sk_bnx_pk_demo_72fd");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function triggerRefresh() {
    if (refreshing || connectionStatus === "Revoked") return;
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setLastSync("Just now");
    }, 1100);
  }

  return (
    <main>
      <header className="site-header">
        <button className="wordmark" onClick={() => changeView("home")}>
          <BrandMark />
          <span>Bunexa</span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button
            className={view === "home" ? "active" : ""}
            onClick={() => changeView("home")}
          >
            Product
          </button>
          <button
            className={view === "developer" ? "active" : ""}
            onClick={() => changeView("developer")}
          >
            Developers
          </button>
          <button
            className={view === "customer" ? "active" : ""}
            onClick={() => changeView("customer")}
          >
            My connections
          </button>
        </nav>
        <div className="header-actions">
          <span className="sandbox-pill">Prototype</span>
          <button className="button button-dark button-small" onClick={openLink}>
            Connect a bank
          </button>
        </div>
      </header>

      {view === "home" && (
        <div className="home-view">
          <section className="hero section-shell">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="live-dot" />
                Built for Pakistan · Sandbox prototype
              </div>
              <h1>
                One connection to
                <br />
                <span>Pakistan&apos;s financial data.</span>
              </h1>
              <p className="hero-lede">
                Bunexa gives approved applications one consistent, consent-led
                API for account information—while banks keep authentication and
                customers stay in control.
              </p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={openLink}>
                  Try the account-link demo <ArrowIcon />
                </button>
                <button
                  className="text-link"
                  onClick={() => changeView("developer")}
                >
                  Explore the developer portal <ArrowIcon />
                </button>
              </div>
              <p className="prototype-note">
                Uses synthetic PKR data and mock-bank journeys only. No live
                bank connection or customer credential is involved.
              </p>
            </div>

            <div className="hero-product" aria-label="Bunexa product preview">
              <div className="ambient-orb orb-one" />
              <div className="ambient-orb orb-two" />
              <div className="network-card">
                <div className="network-card-top">
                  <span className="mini-brand">
                    <BrandMark /> Bunexa Connect
                  </span>
                  <span className="secure-label">Secure session</span>
                </div>
                <div className="network-copy">
                  <p className="overline">Karobar Capital</p>
                  <h2>Connect your business account</h2>
                  <p>
                    Verify cash flow using bank-source balances and transaction
                    history.
                  </p>
                </div>
                <div className="mini-bank-grid">
                  {banks.slice(0, 3).map((bank) => (
                    <button key={bank.id} onClick={openLink}>
                      <span className={`bank-logo ${bank.tone}`}>
                        {bank.initials}
                      </span>
                      <span>{bank.name.replace(" Sandbox", "")}</span>
                      <span aria-hidden="true">›</span>
                    </button>
                  ))}
                </div>
                <div className="connection-path" aria-hidden="true">
                  <span>Application</span>
                  <i />
                  <strong>Bunexa</strong>
                  <i />
                  <span>Your bank</span>
                </div>
              </div>
              <div className="floating-card balance-float">
                <span>Available balance</span>
                <strong>PKR 1.28m</strong>
                <small>Fresh · 10:42 AM</small>
              </div>
              <div className="floating-card consent-float">
                <span className="check-badge">✓</span>
                <div>
                  <strong>Consent recorded</strong>
                  <small>90 days · 3 scopes</small>
                </div>
              </div>
            </div>
          </section>

          <section className="proof-strip">
            <div>
              <strong>01</strong>
              <span>Clear purpose and data scope</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Bank-controlled authentication</span>
            </div>
            <div>
              <strong>03</strong>
              <span>One normalized recipient API</span>
            </div>
            <div>
              <strong>04</strong>
              <span>Immediate access revocation</span>
            </div>
          </section>

          <section className="ecosystem-section section-shell">
            <div className="section-heading">
              <p className="eyebrow">One governed network</p>
              <h2>Built for every side of the connection.</h2>
              <p>
                Four product surfaces share the same consent, data and
                operational truth.
              </p>
            </div>
            <div className="audience-grid">
              <article className="audience-card customer-card">
                <div className="card-number">01</div>
                <div className="card-symbol">C</div>
                <h3>Bunexa Connect</h3>
                <p>
                  A clear, mobile-first journey for bank discovery, disclosure,
                  authorization, status and revocation.
                </p>
                <button onClick={openLink}>
                  Open customer flow <ArrowIcon />
                </button>
              </article>
              <article className="audience-card api-card">
                <div className="card-number">02</div>
                <div className="card-symbol">{`{ }`}</div>
                <h3>Bunexa Data API</h3>
                <p>
                  Accounts, balances, transaction changes and events through
                  one versioned contract.
                </p>
                <button onClick={() => changeView("developer")}>
                  View the sandbox <ArrowIcon />
                </button>
              </article>
              <article className="audience-card bank-card">
                <div className="card-number">03</div>
                <div className="card-symbol">B</div>
                <h3>Bunexa Bank Network</h3>
                <p>
                  Isolated connectors, mappings, certification and
                  capability-level health for participating institutions.
                </p>
                <span className="card-label">Direct API profile</span>
              </article>
              <article className="audience-card ops-card">
                <div className="card-number">04</div>
                <div className="card-symbol">✓</div>
                <h3>Control plane</h3>
                <p>
                  Recipient trust, consent evidence, signed events, audit,
                  incidents and safe participant operations.
                </p>
                <span className="card-label">Tamper-evident</span>
              </article>
            </div>
          </section>

          <section className="api-story">
            <div className="section-shell api-story-grid">
              <div className="api-story-copy">
                <p className="eyebrow light">Consistent by design</p>
                <h2>Different banks. One clean contract.</h2>
                <p>
                  Bank-specific protocols and field mappings stay inside the
                  connector layer. Your application receives stable objects,
                  honest freshness and source lineage.
                </p>
                <ul className="feature-list">
                  <li>
                    <span>✓</span> Stable account and transaction identifiers
                  </li>
                  <li>
                    <span>✓</span> Current, cached and stale data clearly marked
                  </li>
                  <li>
                    <span>✓</span> Signed, idempotent webhook events
                  </li>
                  <li>
                    <span>✓</span> PKR-first synthetic fixtures for testing
                  </li>
                </ul>
                <button
                  className="button button-light"
                  onClick={() => changeView("developer")}
                >
                  Open developer console <ArrowIcon />
                </button>
              </div>
              <div className="code-window">
                <div className="code-titlebar">
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>GET /v1/accounts/acc_bnx_1042/balances</span>
                  <span>200 OK</span>
                </div>
                <pre>
                  <code>{`{
  "account_id": "acc_bnx_1042",
  "institution": "hbl_sandbox",
  "balances": [
    {
      "type": "available",
      "amount": "1284500.65",
      "currency": "PKR",
      "freshness": "near_live",
      "as_of": "2026-07-28T10:42:00+05:00"
    }
  ],
  "source": {
    "connector_version": "hbl-sbx@0.4.2",
    "mapping_version": "pk-account@1.2"
  }
}`}</code>
                </pre>
              </div>
            </div>
          </section>

          <section className="trust-section section-shell">
            <div className="trust-card">
              <div>
                <p className="eyebrow">A deliberate boundary</p>
                <h2>Account data first. Payments later.</h2>
              </div>
              <p>
                The prototype is read-only. Payment initiation and any Raast
                route remain separately permissioned, risk-assessed and disabled
                until the required bank and regulatory approvals exist.
              </p>
              <span className="future-tag">Future release gate</span>
            </div>
            <div className="cta-panel">
              <div>
                <p className="eyebrow">See the thin vertical slice</p>
                <h2>From consent to normalized data—in under two minutes.</h2>
              </div>
              <button className="button button-primary" onClick={openLink}>
                Launch interactive demo <ArrowIcon />
              </button>
            </div>
          </section>
        </div>
      )}

      {view === "developer" && (
        <section className="portal-view">
          <div className="portal-sidebar">
            <button className="portal-logo" onClick={() => changeView("home")}>
              <BrandMark />
              <span>Bunexa</span>
            </button>
            <p>Developer platform</p>
            <nav aria-label="Developer portal">
              <button className="selected">
                <span>⌂</span> Overview
              </button>
              <button>
                <span>↗</span> API requests
              </button>
              <button>
                <span>◎</span> Webhooks
              </button>
              <button>
                <span>◇</span> Mock banks
              </button>
              <button>
                <span>✓</span> Conformance
              </button>
            </nav>
            <div className="sidebar-note">
              <span>Sandbox mode</span>
              <p>All records are synthetic and safe to explore.</p>
            </div>
          </div>
          <div className="portal-main">
            <div className="portal-topbar">
              <div>
                <p>Karobar Capital</p>
                <span>SME cash-flow application</span>
              </div>
              <div className="portal-top-actions">
                <span className="status-ok">
                  <i /> All systems operational
                </span>
                <button onClick={() => changeView("home")}>Exit portal</button>
                <span className="avatar">KA</span>
              </div>
            </div>
            <div className="portal-content">
              <div className="portal-welcome">
                <div>
                  <p className="eyebrow">Sandbox overview</p>
                  <h1>Good morning, Kamran.</h1>
                  <p>
                    Your synthetic account-data integration is healthy and ready
                    to test.
                  </p>
                </div>
                <button className="button button-primary" onClick={openLink}>
                  Create link session <span>＋</span>
                </button>
              </div>

              <div className="metric-grid">
                <article>
                  <span>API success</span>
                  <strong>99.8%</strong>
                  <small>↗ 0.4% this week</small>
                </article>
                <article>
                  <span>Active connections</span>
                  <strong>24</strong>
                  <small>100% synthetic</small>
                </article>
                <article>
                  <span>Webhook delivery</span>
                  <strong>100%</strong>
                  <small>Median 1.2 sec</small>
                </article>
                <article>
                  <span>Mock banks online</span>
                  <strong>3 / 4</strong>
                  <small>UBL maintenance scenario</small>
                </article>
              </div>

              <div className="portal-columns">
                <article className="portal-panel request-panel">
                  <div className="panel-heading">
                    <div>
                      <span>API requests</span>
                      <h2>Recent activity</h2>
                    </div>
                    <span className="time-filter">Last 24 hours</span>
                  </div>
                  <div className="endpoint-list">
                    {endpoints.map((endpoint) => (
                      <div className="endpoint-row" key={endpoint.path}>
                        <span className={`method ${endpoint.method.toLowerCase()}`}>
                          {endpoint.method}
                        </span>
                        <div>
                          <strong>{endpoint.path}</strong>
                          <small>{endpoint.detail}</small>
                        </div>
                        <span className="response-code">200</span>
                        <span className="latency">{endpoint.latency}</span>
                      </div>
                    ))}
                  </div>
                  <button className="panel-link">
                    View all API requests <ArrowIcon />
                  </button>
                </article>

                <article className="portal-panel credential-panel">
                  <div className="panel-heading">
                    <div>
                      <span>Application</span>
                      <h2>Sandbox credentials</h2>
                    </div>
                    <span className="environment-badge">SANDBOX</span>
                  </div>
                  <label>Client ID</label>
                  <div className="credential-field">
                    <code>app_bnx_karobar_01</code>
                    <button onClick={copyKey}>{copied ? "Copied" : "Copy"}</button>
                  </div>
                  <label>Test secret</label>
                  <div className="credential-field">
                    <code>sandbox_sk_bnx_••••••••</code>
                    <button onClick={copyKey}>{copied ? "Copied" : "Copy"}</button>
                  </div>
                  <div className="scope-box">
                    <span>Approved scopes</span>
                    <div>
                      <i>accounts.basic</i>
                      <i>balances.read</i>
                      <i>transactions.read</i>
                    </div>
                  </div>
                </article>
              </div>

              <div className="portal-columns bottom">
                <article className="portal-panel webhook-panel">
                  <div className="panel-heading">
                    <div>
                      <span>Latest event</span>
                      <h2>data.refresh.completed</h2>
                    </div>
                    <span className="delivered-badge">Delivered</span>
                  </div>
                  <pre>
                    <code>{`{
  "event_id": "evt_bnx_7280",
  "type": "data.refresh.completed",
  "connection_id": "con_bnx_841",
  "freshness": "near_live",
  "counts": { "added": 3, "modified": 1 }
}`}</code>
                  </pre>
                  <div className="signature-row">
                    <span>Signed · Attempt 1 · 200 OK</span>
                    <button>Replay event</button>
                  </div>
                </article>
                <article className="portal-panel health-panel">
                  <div className="panel-heading">
                    <div>
                      <span>Institution directory</span>
                      <h2>Mock-bank health</h2>
                    </div>
                    <button>View status</button>
                  </div>
                  {banks.map((bank) => (
                    <div className="health-row" key={bank.id}>
                      <span className={`bank-logo ${bank.tone}`}>
                        {bank.initials}
                      </span>
                      <div>
                        <strong>{bank.name}</strong>
                        <small>{bank.capabilities}</small>
                      </div>
                      <span
                        className={
                          bank.status === "Available"
                            ? "health-available"
                            : "health-maintenance"
                        }
                      >
                        {bank.status}
                      </span>
                    </div>
                  ))}
                </article>
              </div>
            </div>
          </div>
        </section>
      )}

      {view === "customer" && (
        <section className="customer-view section-shell">
          <div className="customer-hero">
            <div>
              <p className="eyebrow">My connections</p>
              <h1>Your financial data, under your control.</h1>
              <p>
                See who can access your information, when it was last used and
                stop access at any time.
              </p>
            </div>
            <button className="button button-primary" onClick={openLink}>
              Connect another bank <span>＋</span>
            </button>
          </div>

          <div className="customer-grid">
            <article className="account-summary">
              <div className="account-topline">
                <div>
                  <span className="bank-logo teal">HB</span>
                  <div>
                    <strong>Business Current</strong>
                    <small>HBL Sandbox · •••• 4821</small>
                  </div>
                </div>
                <span
                  className={
                    connectionStatus === "Active"
                      ? "connection-active"
                      : "connection-revoked"
                  }
                >
                  <i /> {connectionStatus}
                </span>
              </div>
              <div className="balance-block">
                <span>Available balance</span>
                <strong>PKR 1,284,500.65</strong>
                <small>Current balance · PKR 1,326,920.65</small>
              </div>
              <div className="cash-chart" aria-label="Six month balance trend">
                {[48, 62, 54, 78, 69, 88, 76, 94, 84, 100, 92, 108].map(
                  (height, index) => (
                    <i
                      key={index}
                      style={{ height: `${Math.min(height, 100)}%` }}
                    />
                  ),
                )}
              </div>
              <div className="chart-labels">
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
              <div className="sync-row">
                <span>
                  <i /> Last synced {lastSync}
                </span>
                <button
                  onClick={triggerRefresh}
                  disabled={connectionStatus === "Revoked" || refreshing}
                >
                  {refreshing ? "Refreshing…" : "Refresh data"}
                </button>
              </div>
            </article>

            <article className="consent-card">
              <div className="consent-heading">
                <div className="recipient-logo">KC</div>
                <div>
                  <span>Data shared with</span>
                  <h2>Karobar Capital</h2>
                </div>
              </div>
              <div className="consent-purpose">
                <span>Purpose</span>
                <strong>SME cash-flow verification</strong>
                <p>
                  Used to assess a business financing application with
                  bank-source information.
                </p>
              </div>
              <div className="permission-list">
                <div>
                  <span>✓</span>
                  <p>
                    <strong>Account details</strong>
                    <small>Type, currency and masked reference</small>
                  </p>
                </div>
                <div>
                  <span>✓</span>
                  <p>
                    <strong>Balances</strong>
                    <small>Current and available balances</small>
                  </p>
                </div>
                <div>
                  <span>✓</span>
                  <p>
                    <strong>Transactions</strong>
                    <small>Up to 12 months of history</small>
                  </p>
                </div>
              </div>
              <div className="consent-meta">
                <span>
                  <small>Access expires</small>
                  <strong>25 Oct 2026</strong>
                </span>
                <span>
                  <small>Last accessed</small>
                  <strong>Today, 10:42 AM</strong>
                </span>
              </div>
              <button
                className="revoke-button"
                disabled={connectionStatus === "Revoked"}
                onClick={() => setRevokeOpen(true)}
              >
                {connectionStatus === "Revoked"
                  ? "Access has been stopped"
                  : "Stop access"}
              </button>
            </article>
          </div>

          <div className="customer-bottom-grid">
            <article className="transactions-card">
              <div className="panel-heading">
                <div>
                  <span>Latest activity</span>
                  <h2>Recent transactions</h2>
                </div>
                <button>View all</button>
              </div>
              {transactions.map((item) => (
                <div className="transaction-row" key={item.merchant}>
                  <span className={`transaction-icon ${item.kind}`}>
                    {item.kind === "credit" ? "↓" : "↑"}
                  </span>
                  <div>
                    <strong>{item.merchant}</strong>
                    <small>{item.meta}</small>
                  </div>
                  <strong className={item.kind}>{item.amount}</strong>
                </div>
              ))}
            </article>
            <article className="activity-card">
              <div className="panel-heading">
                <div>
                  <span>Access history</span>
                  <h2>Who used your data</h2>
                </div>
                <button>Get help</button>
              </div>
              <div className="timeline">
                <div>
                  <i />
                  <span>
                    <strong>Balance and transactions read</strong>
                    <small>Karobar Capital · Today, 10:42 AM</small>
                  </span>
                </div>
                <div>
                  <i />
                  <span>
                    <strong>Data refresh completed</strong>
                    <small>Bunexa · Today, 10:41 AM</small>
                  </span>
                </div>
                <div>
                  <i />
                  <span>
                    <strong>Consent approved</strong>
                    <small>HBL Sandbox · 27 Jul, 4:18 PM</small>
                  </span>
                </div>
              </div>
              <p className="evidence-note">
                Every access is linked to your active consent and recorded with
                a correlation reference.
              </p>
            </article>
          </div>
        </section>
      )}

      {view !== "developer" && (
        <footer className="site-footer">
          <div className="footer-brand">
            <span className="wordmark">
              <BrandMark /> <span>Bunexa</span>
            </span>
            <p>
              A proposed open-banking connectivity platform for Pakistan.
            </p>
          </div>
          <div className="footer-status">
            <span>Interactive prototype · Synthetic data only</span>
            <span>Not a live banking service or regulatory approval</span>
          </div>
        </footer>
      )}

      {linkOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="link-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-title"
          >
            <div className="modal-topbar">
              <span className="mini-brand">
                <BrandMark /> Bunexa Connect
              </span>
              <span className="secure-label">Secure sandbox</span>
              <button
                className="modal-close"
                aria-label="Close bank connection"
                onClick={() => setLinkOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="step-track" aria-label={`Step ${linkStep + 1} of 5`}>
              {[0, 1, 2, 3, 4].map((step) => (
                <i
                  key={step}
                  className={step <= linkStep ? "complete" : ""}
                />
              ))}
            </div>

            {linkStep === 0 && (
              <div className="modal-content intro-step">
                <div className="recipient-logo large">KC</div>
                <p className="overline">Karobar Capital</p>
                <h2 id="link-title">Connect a business bank account</h2>
                <p className="modal-lede">
                  Karobar Capital uses Bunexa to verify your cash flow with
                  bank-source information.
                </p>
                <div className="purpose-box">
                  <span>Why your data is needed</span>
                  <strong>SME financing assessment</strong>
                  <p>
                    Your account details, balances and up to 12 months of
                    transactions will be shared for 90 days.
                  </p>
                </div>
                <div className="credential-boundary">
                  <span aria-hidden="true">⌁</span>
                  <p>
                    <strong>Your login stays with your bank.</strong>
                    Bunexa and Karobar Capital never receive your bank password,
                    PIN or OTP.
                  </p>
                </div>
                <button
                  className="button button-primary modal-primary"
                  onClick={() => setLinkStep(1)}
                >
                  Continue <ArrowIcon />
                </button>
                <button
                  className="cancel-link"
                  onClick={() => setLinkOpen(false)}
                >
                  Not now
                </button>
              </div>
            )}

            {linkStep === 1 && (
              <div className="modal-content">
                <button className="back-link" onClick={() => setLinkStep(0)}>
                  ← Back
                </button>
                <p className="overline">Choose your institution</p>
                <h2 id="link-title">Select your bank</h2>
                <p className="modal-lede left">
                  Availability is shown by capability. These are simulated
                  institutions for the prototype.
                </p>
                <label className="bank-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    value={bankSearch}
                    onChange={(event) => setBankSearch(event.target.value)}
                    placeholder="Search mock banks"
                    aria-label="Search mock banks"
                    autoFocus
                  />
                </label>
                <div className="bank-list">
                  {filteredBanks.map((bank) => (
                    <button
                      key={bank.id}
                      disabled={bank.status === "Maintenance"}
                      className={
                        selectedBank?.id === bank.id ? "selected-bank" : ""
                      }
                      onClick={() => {
                        setSelectedBank(bank);
                        setLinkStep(2);
                      }}
                    >
                      <span className={`bank-logo ${bank.tone}`}>
                        {bank.initials}
                      </span>
                      <span>
                        <strong>{bank.name}</strong>
                        <small>{bank.capabilities}</small>
                      </span>
                      <span
                        className={
                          bank.status === "Available"
                            ? "bank-available"
                            : "bank-maintenance"
                        }
                      >
                        {bank.status}
                      </span>
                      <span aria-hidden="true">›</span>
                    </button>
                  ))}
                  {filteredBanks.length === 0 && (
                    <p className="empty-state">
                      No matching mock bank is configured.
                    </p>
                  )}
                </div>
                <p className="affiliation-note">
                  Bank names are used only to illustrate a sandbox directory. No
                  live connectivity or affiliation is implied.
                </p>
              </div>
            )}

            {linkStep === 2 && selectedBank && (
              <div className="modal-content">
                <button className="back-link" onClick={() => setLinkStep(1)}>
                  ← Back
                </button>
                <div className="selected-bank-heading">
                  <span className={`bank-logo ${selectedBank.tone}`}>
                    {selectedBank.initials}
                  </span>
                  <span>
                    <small>Connecting to</small>
                    <strong>{selectedBank.name}</strong>
                  </span>
                </div>
                <h2 id="link-title">Review what you&apos;ll share</h2>
                <p className="modal-lede left">
                  Your approval is limited to this recipient, purpose, data and
                  duration.
                </p>
                <div className="share-scope-list">
                  <div>
                    <span>01</span>
                    <p>
                      <strong>Account details</strong>
                      <small>
                        Type, currency, status and masked account reference
                      </small>
                    </p>
                    <i>Required</i>
                  </div>
                  <div>
                    <span>02</span>
                    <p>
                      <strong>Balances</strong>
                      <small>Current and available balances with timestamps</small>
                    </p>
                    <i>Required</i>
                  </div>
                  <div>
                    <span>03</span>
                    <p>
                      <strong>Transaction history</strong>
                      <small>Booked and pending items for up to 12 months</small>
                    </p>
                    <i>Required</i>
                  </div>
                </div>
                <fieldset className="account-choice">
                  <legend>Accounts to include</legend>
                  <label>
                    <input
                      type="checkbox"
                      checked={businessAccount}
                      onChange={(event) =>
                        setBusinessAccount(event.target.checked)
                      }
                    />
                    <span className="fake-check">✓</span>
                    <span>
                      <strong>Business Current · •••• 4821</strong>
                      <small>PKR · Primary business account</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={savingsAccount}
                      onChange={(event) =>
                        setSavingsAccount(event.target.checked)
                      }
                    />
                    <span className="fake-check">✓</span>
                    <span>
                      <strong>Business Savings · •••• 9017</strong>
                      <small>PKR · Reserve account</small>
                    </span>
                  </label>
                </fieldset>
                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(event) =>
                      setConsentConfirmed(event.target.checked)
                    }
                  />
                  <span className="fake-check">✓</span>
                  <span>
                    I understand that access lasts 90 days and can be stopped at
                    any time from My connections.
                  </span>
                </label>
                <button
                  className="button button-primary modal-primary"
                  disabled={
                    !consentConfirmed ||
                    (!businessAccount && !savingsAccount)
                  }
                  onClick={() => setLinkStep(3)}
                >
                  Continue to {selectedBank.name.replace(" Sandbox", "")}{" "}
                  <ArrowIcon />
                </button>
              </div>
            )}

            {linkStep === 3 && selectedBank && (
              <div className="modal-content bank-handoff-step">
                <button className="back-link" onClick={() => setLinkStep(2)}>
                  ← Back
                </button>
                <span className={`bank-logo ${selectedBank.tone} large-logo`}>
                  {selectedBank.initials}
                </span>
                <p className="overline">Bank-controlled authorization</p>
                <h2 id="link-title">You&apos;re leaving Bunexa briefly</h2>
                <p className="modal-lede">
                  In a live connection, {selectedBank.name.replace(" Sandbox", "")}{" "}
                  would authenticate you in its own secure app or website and
                  confirm the selected accounts.
                </p>
                <div className="handoff-visual" aria-hidden="true">
                  <span>Karobar Capital</span>
                  <i>→</i>
                  <strong>Bunexa</strong>
                  <i>→</i>
                  <span>{selectedBank.initials}</span>
                </div>
                <div className="credential-boundary">
                  <span aria-hidden="true">⌁</span>
                  <p>
                    <strong>No banking credentials are requested here.</strong>
                    This prototype simulates the bank&apos;s approval response.
                  </p>
                </div>
                <button
                  className="button button-primary modal-primary"
                  onClick={() => {
                    setConnectionStatus("Active");
                    setLinkStep(4);
                  }}
                >
                  Simulate bank approval <ArrowIcon />
                </button>
                <button
                  className="cancel-link"
                  onClick={() => setLinkOpen(false)}
                >
                  Cancel connection
                </button>
              </div>
            )}

            {linkStep === 4 && selectedBank && (
              <div className="modal-content success-step">
                <div className="success-orbit" aria-hidden="true">
                  <span>✓</span>
                </div>
                <p className="overline">Connection active</p>
                <h2 id="link-title">Your account is connected.</h2>
                <p className="modal-lede">
                  Karobar Capital can now read only the information you approved
                  from {selectedBank.name.replace(" Sandbox", "")}.
                </p>
                <div className="success-details">
                  <div>
                    <span>Accounts</span>
                    <strong>
                      {businessAccount && savingsAccount ? "2 shared" : "1 shared"}
                    </strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>90 days</strong>
                  </div>
                  <div>
                    <span>Scopes</span>
                    <strong>3 approved</strong>
                  </div>
                </div>
                <div className="connection-reference">
                  <span>Connection reference</span>
                  <code>BNX-DEMO-84Q1</code>
                </div>
                <button
                  className="button button-primary modal-primary"
                  onClick={() => {
                    setLinkOpen(false);
                    changeView("customer");
                  }}
                >
                  View my connection <ArrowIcon />
                </button>
                <button
                  className="cancel-link"
                  onClick={() => setLinkOpen(false)}
                >
                  Return to product
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {revokeOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="revoke-title"
          >
            <span className="warning-icon">!</span>
            <p className="overline">Revoke one connection</p>
            <h2 id="revoke-title">Stop Karobar Capital&apos;s access?</h2>
            <p>
              Bunexa will immediately block new reads and scheduled refreshes for
              this HBL Sandbox connection. Other connections are not affected.
            </p>
            <div className="revoke-summary">
              <span>Access that will stop</span>
              <strong>Account details · Balances · Transactions</strong>
            </div>
            <button
              className="button button-danger"
              onClick={() => {
                setConnectionStatus("Revoked");
                setRevokeOpen(false);
              }}
            >
              Yes, stop access
            </button>
            <button
              className="cancel-link"
              onClick={() => setRevokeOpen(false)}
            >
              Keep connection active
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
