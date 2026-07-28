"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Workspace = "platform" | "recipient" | "bank" | "customer";
type PlatformSection =
  | "overview"
  | "flow"
  | "participants"
  | "connections"
  | "connectors"
  | "operations"
  | "audit";
type LinkStep = 0 | 1 | 2 | 3 | 4;
type ConnectionStatus = "Active" | "Pending" | "Revoked";

type Bank = {
  id: string;
  name: string;
  initials: string;
  status: "Operational" | "Degraded" | "Maintenance";
  capabilities: string[];
  availability: string;
  connector: string;
  mapping: string;
};

const banks: Bank[] = [
  {
    id: "hbl",
    name: "HBL Sandbox",
    initials: "HB",
    status: "Operational",
    capabilities: ["Accounts", "Balances", "Transactions", "Revocation"],
    availability: "99.98%",
    connector: "hbl-sbx@0.4.2",
    mapping: "pk-account@1.2",
  },
  {
    id: "meezan",
    name: "Meezan Sandbox",
    initials: "MB",
    status: "Operational",
    capabilities: ["Accounts", "Balances", "Transactions"],
    availability: "99.95%",
    connector: "meezan-sbx@0.3.7",
    mapping: "pk-account@1.2",
  },
  {
    id: "alfalah",
    name: "Bank Alfalah Sandbox",
    initials: "BA",
    status: "Degraded",
    capabilities: ["Accounts", "Balances"],
    availability: "98.72%",
    connector: "alfalah-sbx@0.3.1",
    mapping: "pk-account@1.1",
  },
  {
    id: "ubl",
    name: "UBL Sandbox",
    initials: "UB",
    status: "Maintenance",
    capabilities: ["Accounts", "Balances", "Transactions"],
    availability: "97.40%",
    connector: "ubl-sbx@0.2.9",
    mapping: "pk-account@1.2",
  },
];

const flowStages = [
  {
    short: "Link session",
    title: "Recipient creates a bound Link session",
    owner: "Recipient API",
    detail:
      "Karobar Capital requests balances and 90 days of transactions for SME cash-flow verification.",
    output: "link_ses_pk_8K2M",
    latency: "46 ms",
  },
  {
    short: "Consent",
    title: "Customer reviews purpose and data",
    owner: "Bunexa Connect",
    detail:
      "The customer sees recipient identity, purpose, scopes, accounts, duration and the revocation route.",
    output: "Affirmative action",
    latency: "Customer controlled",
  },
  {
    short: "Bank auth",
    title: "Bank authenticates and confirms authority",
    owner: "HBL Sandbox",
    detail:
      "Authentication remains in the bank-controlled channel. Bunexa receives only an authorization result.",
    output: "auth_code_••••91",
    latency: "1.2 s",
  },
  {
    short: "Policy",
    title: "Consent and policy become authoritative",
    owner: "Consent Engine",
    detail:
      "Effective permission is the intersection of recipient approval, customer choice and the bank grant.",
    output: "con_pk_73A91 · Active",
    latency: "32 ms",
  },
  {
    short: "Connector",
    title: "Isolated connector fetches bank-source data",
    owner: "Bank Connector",
    detail:
      "The HBL adapter checks capability health, applies bounded timeouts and retrieves the approved window.",
    output: "accounts + balances + txns",
    latency: "184 ms",
  },
  {
    short: "Normalize",
    title: "Data is validated, mapped and reconciled",
    owner: "Canonical Data",
    detail:
      "Bank codes are normalized while source timestamps, lineage and mapping version remain traceable.",
    output: "42 canonical records",
    latency: "28 ms",
  },
  {
    short: "API response",
    title: "Recipient receives a scoped canonical response",
    owner: "API Gateway",
    detail:
      "Object- and field-level policy removes unapproved data and attaches freshness and source metadata.",
    output: "200 OK · 9.8 KB",
    latency: "71 ms",
  },
  {
    short: "Event",
    title: "Signed connection event is delivered",
    owner: "Webhook Service",
    detail:
      "The recipient receives an idempotent, signed event with retry and replay controls.",
    output: "evt_pk_01J8 · Delivered",
    latency: "89 ms",
  },
  {
    short: "Evidence",
    title: "The full outcome is available to operations",
    owner: "Operations Console",
    detail:
      "One correlation reference links the recipient request, consent, bank call, mapping and delivery evidence.",
    output: "corr_pk_20260728_1042",
    latency: "End to end: 1.65 s",
  },
];

const transactions = [
  {
    merchant: "Raast incoming transfer",
    meta: "28 Jul · Bank source · Business income",
    amount: "+ PKR 245,000",
    kind: "credit",
  },
  {
    merchant: "Karachi Electric",
    meta: "27 Jul · Utilities · Confidence 99%",
    amount: "− PKR 38,420",
    kind: "debit",
  },
  {
    merchant: "Daraz Seller Settlement",
    meta: "26 Jul · Marketplace income · Confidence 96%",
    amount: "+ PKR 183,750",
    kind: "credit",
  },
  {
    merchant: "National Logistics",
    meta: "25 Jul · Operations · Confidence 94%",
    amount: "− PKR 26,800",
    kind: "debit",
  },
];

const navItems: {
  id: PlatformSection;
  label: string;
  glyph: string;
  count?: string;
}[] = [
  { id: "overview", label: "Control centre", glyph: "⌂" },
  { id: "flow", label: "Live product flow", glyph: "⇄", count: "1" },
  { id: "participants", label: "Participants", glyph: "◫", count: "7" },
  { id: "connections", label: "Connections", glyph: "⌁", count: "3" },
  { id: "connectors", label: "Bank connectors", glyph: "◇", count: "4" },
  { id: "operations", label: "Operations", glyph: "◎", count: "3" },
  { id: "audit", label: "Audit & evidence", glyph: "▤" },
];

const endpoints = [
  {
    method: "POST",
    path: "/v1/link-sessions",
    detail: "Create a single-use customer authorization session",
    status: "201",
    latency: "46 ms",
  },
  {
    method: "GET",
    path: "/v1/connections/{id}/accounts",
    detail: "Read approved canonical account records",
    status: "200",
    latency: "118 ms",
  },
  {
    method: "GET",
    path: "/v1/accounts/{id}/transactions",
    detail: "Retrieve normalized transactions with freshness",
    status: "200",
    latency: "342 ms",
  },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function WorkspaceButton({
  active,
  label,
  detail,
  onClick,
}: {
  active: boolean;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`workspace-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <small>{detail}</small>
    </button>
  );
}

export default function Home() {
  const [workspace, setWorkspace] = useState<Workspace>("platform");
  const [platformSection, setPlatformSection] =
    useState<PlatformSection>("overview");
  const [flowStage, setFlowStage] = useState(0);
  const [flowRunning, setFlowRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Active");
  const [lastSync, setLastSync] = useState("Today, 10:42 AM");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkStep, setLinkStep] = useState<LinkStep>(0);
  const [selectedBankId, setSelectedBankId] = useState("hbl");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState(["current"]);
  const [copied, setCopied] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [webhookReplayed, setWebhookReplayed] = useState(false);
  const [recipientSuspended, setRecipientSuspended] = useState(false);
  const [fasalApproved, setFasalApproved] = useState(false);
  const [ublMaintenance, setUblMaintenance] = useState(true);
  const [incidentOpen, setIncidentOpen] = useState(true);
  const [changeSubmitted, setChangeSubmitted] = useState(false);
  const [toast, setToast] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.id === selectedBankId) ?? banks[0],
    [selectedBankId],
  );

  useEffect(() => {
    if (!flowRunning) return;
    if (flowStage >= flowStages.length - 1) {
      setFlowRunning(false);
      setConnectionStatus("Active");
      setLastSync("Just now");
      setWebhookReplayed(false);
      showToast("End-to-end flow completed and evidence recorded");
      return;
    }

    const timer = window.setTimeout(() => {
      setFlowStage((current) =>
        Math.min(current + 1, flowStages.length - 1),
      );
    }, 720);
    return () => window.clearTimeout(timer);
  }, [flowRunning, flowStage]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLinkOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = linkOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [linkOpen]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function switchWorkspace(next: Workspace) {
    setWorkspace(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openLink() {
    setLinkStep(0);
    setSelectedBankId("hbl");
    setConsentConfirmed(false);
    setSelectedAccounts(["current"]);
    setLinkOpen(true);
  }

  function runCompleteFlow() {
    setWorkspace("platform");
    setPlatformSection("flow");
    setFlowStage(0);
    setConnectionStatus("Pending");
    setFlowRunning(true);
  }

  function resetFlow() {
    setFlowRunning(false);
    setFlowStage(0);
    setConnectionStatus("Pending");
    showToast("Flow returned to its initial state");
  }

  function toggleAccount(account: string) {
    setSelectedAccounts((current) =>
      current.includes(account)
        ? current.filter((item) => item !== account)
        : [...current, account],
    );
  }

  function approveCustomerConnection() {
    setConnectionStatus("Active");
    setLastSync("Just now");
    setFlowStage(8);
    setLinkStep(4);
  }

  function copyCredential() {
    void navigator.clipboard?.writeText("sandbox_app_bnx_pk_72fd");
    setCopied(true);
    showToast("Sandbox application ID copied");
    window.setTimeout(() => setCopied(false), 1800);
  }

  function sendRequest() {
    setRequestSent(false);
    window.setTimeout(() => {
      setRequestSent(true);
      setLastSync("Just now");
      showToast("Canonical sandbox response received");
    }, 550);
  }

  function replayWebhook() {
    setWebhookReplayed(false);
    window.setTimeout(() => {
      setWebhookReplayed(true);
      showToast("Webhook replay delivered with the same event ID");
    }, 520);
  }

  function refreshConnection() {
    if (refreshing || connectionStatus !== "Active") return;
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setLastSync("Just now");
      showToast("Connection refreshed through the HBL sandbox connector");
    }, 780);
  }

  const pageTitle =
    workspace === "platform"
      ? navItems.find((item) => item.id === platformSection)?.label
      : workspace === "recipient"
        ? "Recipient portal"
        : workspace === "bank"
          ? "Bank integration portal"
          : "Customer connections";

  return (
    <main className="product-root">
      <header className="topbar">
        <button
          className="wordmark"
          onClick={() => {
            setWorkspace("platform");
            setPlatformSection("overview");
          }}
          aria-label="Go to Bunexa control centre"
        >
          <BrandMark />
          <span>Bunexa</span>
        </button>

        <div className="workspace-switcher" aria-label="Prototype workspace">
          <WorkspaceButton
            active={workspace === "platform"}
            label="Platform"
            detail="Bunexa operator"
            onClick={() => switchWorkspace("platform")}
          />
          <WorkspaceButton
            active={workspace === "recipient"}
            label="Recipient"
            detail="Karobar Capital"
            onClick={() => switchWorkspace("recipient")}
          />
          <WorkspaceButton
            active={workspace === "bank"}
            label="Bank"
            detail="HBL Sandbox"
            onClick={() => switchWorkspace("bank")}
          />
          <WorkspaceButton
            active={workspace === "customer"}
            label="Customer"
            detail="Business owner"
            onClick={() => switchWorkspace("customer")}
          />
        </div>

        <div className="topbar-actions">
          <span className="environment-pill">
            <span className="live-dot" />
            Pakistan sandbox
          </span>
          <button className="avatar-button" aria-label="Open user menu">
            KA
          </button>
        </div>
      </header>

      {workspace === "platform" ? (
        <div className="platform-shell">
          <aside className="platform-sidebar">
            <div className="sidebar-heading">
              <p>Platform control plane</p>
              <span>Prototype environment</span>
            </div>
            <nav aria-label="Platform console">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={platformSection === item.id ? "active" : ""}
                  onClick={() => setPlatformSection(item.id)}
                  data-testid={`nav-${item.id}`}
                >
                  <span className="nav-glyph" aria-hidden="true">
                    {item.glyph}
                  </span>
                  <span>{item.label}</span>
                  {item.count ? <small>{item.count}</small> : null}
                </button>
              ))}
            </nav>
            <div className="sidebar-boundary">
              <span>Account information only</span>
              <p>
                Payment initiation and Raast remain separately gated and
                disabled.
              </p>
            </div>
            <div className="sidebar-user">
              <span className="user-monogram">AO</span>
              <div>
                <strong>Ayesha Omar</strong>
                <small>Platform operator · JIT</small>
              </div>
            </div>
          </aside>

          <section className="platform-main">
            <div className="page-bar">
              <div>
                <p>Bunexa / Platform</p>
                <h1>{pageTitle}</h1>
              </div>
              <div className="page-actions">
                <span className="as-of">As of 28 Jul 2026 · 10:42 PKT</span>
                <button className="button button-primary" onClick={runCompleteFlow}>
                  Run complete product flow <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            {platformSection === "overview" && (
              <PlatformOverview
                flowStage={flowStage}
                flowRunning={flowRunning}
                runCompleteFlow={runCompleteFlow}
                openSection={setPlatformSection}
                recipientSuspended={recipientSuspended}
                ublMaintenance={ublMaintenance}
                incidentOpen={incidentOpen}
              />
            )}

            {platformSection === "flow" && (
              <FlowConsole
                flowStage={flowStage}
                flowRunning={flowRunning}
                runCompleteFlow={runCompleteFlow}
                resetFlow={resetFlow}
                openLink={openLink}
              />
            )}

            {platformSection === "participants" && (
              <ParticipantsConsole
                recipientSuspended={recipientSuspended}
                setRecipientSuspended={(value) => {
                  setRecipientSuspended(value);
                  if (value) setConnectionStatus("Pending");
                  showToast(
                    value
                      ? "Karobar Capital sandbox access suspended"
                      : "Karobar Capital sandbox access reinstated",
                  );
                }}
                fasalApproved={fasalApproved}
                approveFasal={() => {
                  setFasalApproved(true);
                  showToast("Fasal Finance approved for the sandbox");
                }}
              />
            )}

            {platformSection === "connections" && (
              <ConnectionsConsole
                connectionStatus={connectionStatus}
                lastSync={lastSync}
                setConnectionStatus={(status) => {
                  setConnectionStatus(status);
                  showToast(
                    status === "Revoked"
                      ? "Connection revoked and downstream event recorded"
                      : "Connection restored for the prototype",
                  );
                }}
                openCustomer={() => switchWorkspace("customer")}
              />
            )}

            {platformSection === "connectors" && (
              <ConnectorsConsole
                ublMaintenance={ublMaintenance}
                restoreUbl={() => {
                  setUblMaintenance(false);
                  showToast("UBL sandbox connector returned to service");
                }}
              />
            )}

            {platformSection === "operations" && (
              <OperationsConsole
                incidentOpen={incidentOpen}
                resolveIncident={() => {
                  setIncidentOpen(false);
                  showToast("Incident contained and moved to review");
                }}
                replayWebhook={replayWebhook}
                webhookReplayed={webhookReplayed}
              />
            )}

            {platformSection === "audit" && (
              <AuditConsole
                exportEvidence={() =>
                  showToast(
                    "Time-limited evidence bundle prepared for the prototype",
                  )
                }
              />
            )}
          </section>
        </div>
      ) : null}

      {workspace === "recipient" ? (
        <RecipientPortal
          openLink={openLink}
          copied={copied}
          copyCredential={copyCredential}
          requestSent={requestSent}
          sendRequest={sendRequest}
          replayWebhook={replayWebhook}
          webhookReplayed={webhookReplayed}
          connectionStatus={connectionStatus}
          recipientSuspended={recipientSuspended}
        />
      ) : null}

      {workspace === "bank" ? (
        <BankPortal
          ublMaintenance={ublMaintenance}
          changeSubmitted={changeSubmitted}
          submitChange={() => {
            setChangeSubmitted(true);
            showToast("Change request submitted for maker-checker approval");
          }}
          showToast={showToast}
        />
      ) : null}

      {workspace === "customer" ? (
        <CustomerPortal
          openLink={openLink}
          connectionStatus={connectionStatus}
          setConnectionStatus={(status) => {
            setConnectionStatus(status);
            showToast(
              status === "Revoked"
                ? "Access stopped for Karobar Capital"
                : "Connection reactivated in the prototype",
            );
          }}
          lastSync={lastSync}
          refreshing={refreshing}
          refreshConnection={refreshConnection}
        />
      ) : null}

      <div className="prototype-banner">
        <span>Synthetic data only</span>
        <p>
          Interactive product prototype · No live bank, credential, payment or
          regulatory connection
        </p>
      </div>

      {toast ? (
        <div className="toast" role="status">
          <span aria-hidden="true">✓</span>
          {toast}
        </div>
      ) : null}

      {linkOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            className="link-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-title"
          >
            <div className="link-topbar">
              <span className="mini-wordmark">
                <BrandMark /> Bunexa Connect
              </span>
              <span>Secure sandbox session</span>
              <button
                className="icon-button"
                aria-label="Close Bunexa Connect"
                onClick={() => setLinkOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="link-progress" aria-label="Connection progress">
              {[0, 1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={step <= linkStep ? "active" : ""}
                />
              ))}
            </div>

            {linkStep === 0 ? (
              <div className="link-screen">
                <span className="recipient-logo">KC</span>
                <p className="overline">Karobar Capital is requesting access</p>
                <h2 id="link-title">Verify your business cash flow</h2>
                <p className="link-lede">
                  Connect a business bank account so Karobar Capital can assess
                  affordability using bank-source information.
                </p>
                <div className="purpose-card">
                  <div>
                    <span>Purpose</span>
                    <strong>SME cash-flow verification</strong>
                  </div>
                  <div>
                    <span>Access duration</span>
                    <strong>90 days</strong>
                  </div>
                  <div>
                    <span>Data requested</span>
                    <strong>Accounts, balances and transactions</strong>
                  </div>
                </div>
                <button
                  className="button button-primary button-full"
                  onClick={() => setLinkStep(1)}
                >
                  Choose a bank <span aria-hidden="true">→</span>
                </button>
                <p className="credential-warning">
                  Bunexa will never ask for your bank password, PIN or OTP.
                </p>
              </div>
            ) : null}

            {linkStep === 1 ? (
              <div className="link-screen">
                <p className="overline">Participating institutions</p>
                <h2 id="link-title">Select your business bank</h2>
                <p className="link-lede">
                  Availability is shown by capability, not just by institution.
                </p>
                <div className="bank-picker">
                  {banks.map((bank) => {
                    const unavailable =
                      bank.id === "ubl" && ublMaintenance;
                    return (
                      <button
                        key={bank.id}
                        disabled={unavailable}
                        className={
                          selectedBankId === bank.id ? "selected" : ""
                        }
                        onClick={() => setSelectedBankId(bank.id)}
                      >
                        <span className={`bank-logo bank-${bank.id}`}>
                          {bank.initials}
                        </span>
                        <span>
                          <strong>{bank.name}</strong>
                          <small>
                            {unavailable
                              ? "Maintenance · unavailable"
                              : bank.capabilities.join(" · ")}
                          </small>
                        </span>
                        <StatusPill
                          tone={unavailable ? "warning" : "success"}
                        >
                          {unavailable ? "Maintenance" : "Available"}
                        </StatusPill>
                      </button>
                    );
                  })}
                </div>
                <div className="link-actions">
                  <button className="text-button" onClick={() => setLinkStep(0)}>
                    Back
                  </button>
                  <button
                    className="button button-primary"
                    onClick={() => setLinkStep(2)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : null}

            {linkStep === 2 ? (
              <div className="link-screen">
                <p className="overline">Your permission</p>
                <h2 id="link-title">Choose accounts and review access</h2>
                <p className="link-lede">
                  {selectedBank.name} will make the final account-eligibility
                  decision.
                </p>
                <div className="account-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes("current")}
                      onChange={() => toggleAccount("current")}
                    />
                    <span>
                      <strong>Business Current ···· 4821</strong>
                      <small>PKR · Primary operating account</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes("savings")}
                      onChange={() => toggleAccount("savings")}
                    />
                    <span>
                      <strong>Business Savings ···· 1190</strong>
                      <small>PKR · Reserve account</small>
                    </span>
                  </label>
                </div>
                <div className="scope-list">
                  <div>
                    <span>✓</span>
                    <p>
                      <strong>Account details</strong>
                      <small>Name, type, currency and masked number</small>
                    </p>
                  </div>
                  <div>
                    <span>✓</span>
                    <p>
                      <strong>Balances</strong>
                      <small>Available and current balances</small>
                    </p>
                  </div>
                  <div>
                    <span>✓</span>
                    <p>
                      <strong>Transaction history</strong>
                      <small>90 days of posted transactions</small>
                    </p>
                  </div>
                </div>
                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(event) =>
                      setConsentConfirmed(event.target.checked)
                    }
                  />
                  <span>
                    I understand the purpose, duration and how to revoke this
                    access.
                  </span>
                </label>
                <div className="link-actions">
                  <button className="text-button" onClick={() => setLinkStep(1)}>
                    Back
                  </button>
                  <button
                    className="button button-primary"
                    disabled={
                      !consentConfirmed || selectedAccounts.length === 0
                    }
                    onClick={() => setLinkStep(3)}
                  >
                    Continue to {selectedBank.name}
                  </button>
                </div>
              </div>
            ) : null}

            {linkStep === 3 ? (
              <div className="link-screen bank-handoff">
                <span className={`bank-logo bank-${selectedBank.id} large`}>
                  {selectedBank.initials}
                </span>
                <p className="overline">Bank-controlled authorization</p>
                <h2 id="link-title">You are now with {selectedBank.name}</h2>
                <p className="link-lede">
                  In production, authentication and account authority happen
                  entirely in the bank&apos;s channel. Bunexa receives only the
                  approved result.
                </p>
                <div className="handoff-diagram">
                  <span>Customer</span>
                  <i>→</i>
                  <span>{selectedBank.name}</span>
                  <i>→</i>
                  <span>Bunexa result</span>
                </div>
                <button
                  className="button button-dark button-full"
                  onClick={approveCustomerConnection}
                >
                  Simulate bank approval
                </button>
                <button className="text-button" onClick={() => setLinkStep(2)}>
                  Return to permissions
                </button>
              </div>
            ) : null}

            {linkStep === 4 ? (
              <div className="link-screen success-screen">
                <span className="success-mark">✓</span>
                <p className="overline">Connection active</p>
                <h2 id="link-title">Your account is connected</h2>
                <p className="link-lede">
                  Karobar Capital can now access only the approved information
                  for the stated purpose.
                </p>
                <div className="receipt">
                  <div>
                    <span>Bank</span>
                    <strong>{selectedBank.name}</strong>
                  </div>
                  <div>
                    <span>Accounts</span>
                    <strong>{selectedAccounts.length} selected</strong>
                  </div>
                  <div>
                    <span>Expires</span>
                    <strong>26 Oct 2026</strong>
                  </div>
                  <div>
                    <span>Connection reference</span>
                    <strong>BNX-KC-73A91</strong>
                  </div>
                </div>
                <button
                  className="button button-primary button-full"
                  onClick={() => {
                    setLinkOpen(false);
                    switchWorkspace("customer");
                  }}
                >
                  View and manage connection
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  );
}

function PlatformOverview({
  flowStage,
  flowRunning,
  runCompleteFlow,
  openSection,
  recipientSuspended,
  ublMaintenance,
  incidentOpen,
}: {
  flowStage: number;
  flowRunning: boolean;
  runCompleteFlow: () => void;
  openSection: (section: PlatformSection) => void;
  recipientSuspended: boolean;
  ublMaintenance: boolean;
  incidentOpen: boolean;
}) {
  return (
    <div className="console-content">
      <section className="control-hero">
        <div className="control-hero-copy">
          <div className="eyebrow">
            <span className="live-dot" />
            Account connectivity · Pakistan sandbox
          </div>
          <h2>The operating system for consent-led bank connectivity.</h2>
          <p>
            Onboard participants, govern permission, operate isolated bank
            connectors and deliver one normalized API—with every result
            traceable end to end.
          </p>
          <div className="hero-actions">
            <button className="button button-lime" onClick={runCompleteFlow}>
              {flowRunning ? "Flow is running…" : "Run a data request"}{" "}
              <span aria-hidden="true">→</span>
            </button>
            <button
              className="button button-ghost-dark"
              onClick={() => openSection("participants")}
            >
              Review participants
            </button>
          </div>
          <div className="control-hero-meta">
            <span>One correlation ID</span>
            <span>Bank authentication retained</span>
            <span>Payments disabled</span>
          </div>
        </div>
        <div className="network-visual">
          <div className="network-visual-top">
            <span>Live product route</span>
            <StatusPill tone={flowRunning ? "info" : "success"}>
              {flowRunning ? "Processing" : "Healthy"}
            </StatusPill>
          </div>
          <div className="network-route">
            {[
              ["KC", "Recipient"],
              ["BN", "Bunexa"],
              ["HB", "Bank"],
              ["API", "Canonical"],
            ].map(([mark, label], index) => (
              <div className="network-node-wrap" key={label}>
                <div
                  className={`network-node ${flowStage >= index * 2 ? "active" : ""}`}
                >
                  {mark}
                </div>
                <small>{label}</small>
                {index < 3 ? <i>→</i> : null}
              </div>
            ))}
          </div>
          <div className="trace-mini">
            <span>corr_pk_20260728_1042</span>
            <strong>
              {flowRunning
                ? flowStages[flowStage].short
                : "Ready for a sandbox request"}
            </strong>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <article>
          <span>Participating banks</span>
          <strong>4</strong>
          <small className="positive">3 serving account data</small>
        </article>
        <article>
          <span>Approved recipients</span>
          <strong>{recipientSuspended ? "2" : "3"}</strong>
          <small>2 additional reviews</small>
        </article>
        <article>
          <span>Active consents</span>
          <strong>1,284</strong>
          <small className="positive">+8.4% this month</small>
        </article>
        <article>
          <span>API success rate</span>
          <strong>99.94%</strong>
          <small>p95 latency 318 ms</small>
        </article>
      </section>

      <section className="overview-grid">
        <article className="panel span-7">
          <div className="panel-heading">
            <div>
              <p className="overline">Dependency-aware status</p>
              <h3>Bank capability health</h3>
            </div>
            <button className="text-button" onClick={() => openSection("connectors")}>
              Open connector fleet →
            </button>
          </div>
          <div className="health-list">
            {banks.map((bank) => {
              const status =
                bank.id === "ubl" && !ublMaintenance
                  ? "Operational"
                  : bank.status;
              return (
                <div key={bank.id} className="health-row">
                  <span className={`bank-logo bank-${bank.id}`}>
                    {bank.initials}
                  </span>
                  <div>
                    <strong>{bank.name}</strong>
                    <small>{bank.capabilities.join(" · ")}</small>
                  </div>
                  <span className="availability">{bank.availability}</span>
                  <StatusPill
                    tone={
                      status === "Operational"
                        ? "success"
                        : status === "Degraded"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {status}
                  </StatusPill>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel span-5">
          <div className="panel-heading">
            <div>
              <p className="overline">Operator attention</p>
              <h3>Queues and controls</h3>
            </div>
            <span className="count-badge">3</span>
          </div>
          <div className="attention-list">
            <button onClick={() => openSection("operations")}>
              <span className="attention-icon warning">!</span>
              <div>
                <strong>
                  {incidentOpen
                    ? "Bank Alfalah transaction degradation"
                    : "Incident review ready"}
                </strong>
                <small>INC-2048 · connector capability</small>
              </div>
              <i>→</i>
            </button>
            <button onClick={() => openSection("participants")}>
              <span className="attention-icon info">2</span>
              <div>
                <strong>Recipient reviews awaiting decision</strong>
                <small>Due diligence and sandbox approval</small>
              </div>
              <i>→</i>
            </button>
            <button onClick={() => openSection("operations")}>
              <span className="attention-icon purple">7</span>
              <div>
                <strong>Webhook attempts in retry window</strong>
                <small>Recipient-owned endpoints only</small>
              </div>
              <i>→</i>
            </button>
          </div>
        </article>
      </section>

      <section className="module-section">
        <div className="section-heading-row">
          <div>
            <p className="overline">Complete platform coverage</p>
            <h3>Four connected product layers</h3>
          </div>
          <p>
            The customer journey is one surface. Bunexa&apos;s core product is
            the governed control and data plane beneath it.
          </p>
        </div>
        <div className="module-grid">
          <article className="module-card blue">
            <span>01</span>
            <h4>Experience & developer products</h4>
            <p>
              Link, customer dashboard, recipient portal, bank portal, SDKs and
              API documentation.
            </p>
          </article>
          <article className="module-card green">
            <span>02</span>
            <h4>Trust, consent & policy</h4>
            <p>
              Participant identity, application approval, consent evidence,
              token custody and authorization policy.
            </p>
          </article>
          <article className="module-card amber">
            <span>03</span>
            <h4>Connectivity & canonical data</h4>
            <p>
              Isolated connectors, synchronization, mapping, lineage, data
              quality, APIs and webhooks.
            </p>
          </article>
          <article className="module-card purple">
            <span>04</span>
            <h4>Assurance & operations</h4>
            <p>
              Conformance, health, incidents, complaints, audit evidence,
              resilience and controlled release.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

function FlowConsole({
  flowStage,
  flowRunning,
  runCompleteFlow,
  resetFlow,
  openLink,
}: {
  flowStage: number;
  flowRunning: boolean;
  runCompleteFlow: () => void;
  resetFlow: () => void;
  openLink: () => void;
}) {
  const current = flowStages[flowStage];
  return (
    <div className="console-content">
      <section className="flow-intro">
        <div>
          <div className="eyebrow">
            <span className={flowRunning ? "pulse-dot" : "live-dot"} />
            Interactive thin vertical slice
          </div>
          <h2>Follow one request through the complete Bunexa product.</h2>
          <p>
            This trace joins the recipient, customer, bank, consent, connector,
            canonical data, API, webhook and operations experiences.
          </p>
        </div>
        <div className="flow-buttons">
          <button className="button button-primary" onClick={runCompleteFlow}>
            {flowRunning ? "Running…" : "Run end-to-end flow"}
          </button>
          <button className="button button-secondary" onClick={openLink}>
            Open customer step
          </button>
          <button className="text-button" onClick={resetFlow}>
            Reset
          </button>
        </div>
      </section>

      <section className="trace-layout">
        <article className="trace-timeline panel">
          <div className="panel-heading">
            <div>
              <p className="overline">Correlation trace</p>
              <h3>corr_pk_20260728_1042</h3>
            </div>
            <StatusPill tone={flowRunning ? "info" : flowStage === 8 ? "success" : "neutral"}>
              {flowRunning ? "Processing" : flowStage === 8 ? "Complete" : "Ready"}
            </StatusPill>
          </div>
          <div className="stage-list">
            {flowStages.map((stage, index) => {
              const state =
                index < flowStage
                  ? "complete"
                  : index === flowStage
                    ? flowRunning || flowStage === 8
                      ? "current"
                      : "ready"
                    : "queued";
              return (
                <button
                  key={stage.short}
                  className={`stage-row ${state}`}
                  onClick={() => {
                    if (!flowRunning) {
                      // Inspecting a stage is intentionally allowed only when paused.
                    }
                  }}
                >
                  <span className="stage-marker">
                    {index < flowStage || (index === 8 && flowStage === 8)
                      ? "✓"
                      : index + 1}
                  </span>
                  <div>
                    <span>{stage.short}</span>
                    <strong>{stage.title}</strong>
                    <small>{stage.owner}</small>
                  </div>
                  <i>{index <= flowStage ? stage.latency : "Queued"}</i>
                </button>
              );
            })}
          </div>
        </article>

        <div className="trace-detail-stack">
          <article className="trace-focus panel">
            <div className="focus-number">{String(flowStage + 1).padStart(2, "0")}</div>
            <p className="overline">{current.owner}</p>
            <h3>{current.title}</h3>
            <p>{current.detail}</p>
            <div className="focus-output">
              <span>Stage output</span>
              <code>{current.output}</code>
            </div>
            <div className="policy-tags">
              <span>Purpose bound</span>
              <span>Scope checked</span>
              <span>Source traced</span>
            </div>
          </article>

          <article className="panel request-context">
            <div className="panel-heading">
              <div>
                <p className="overline">Request context</p>
                <h3>Cash-flow verification</h3>
              </div>
              <span className="recipient-logo small">KC</span>
            </div>
            <dl>
              <div>
                <dt>Recipient</dt>
                <dd>Karobar Capital</dd>
              </div>
              <div>
                <dt>Application</dt>
                <dd>CashFlow Verify · Sandbox</dd>
              </div>
              <div>
                <dt>Institution</dt>
                <dd>HBL Sandbox</dd>
              </div>
              <div>
                <dt>Effective scopes</dt>
                <dd>accounts · balances · transactions</dd>
              </div>
              <div>
                <dt>Consent</dt>
                <dd>con_pk_73A91 · 90 days</dd>
              </div>
              <div>
                <dt>Data window</dt>
                <dd>90 days · incremental refresh</dd>
              </div>
            </dl>
          </article>

          <article className="panel canonical-preview">
            <div className="panel-heading">
              <div>
                <p className="overline">Canonical outcome</p>
                <h3>Recipient-safe response</h3>
              </div>
              <span className="method-badge">200</span>
            </div>
            <pre>{`{
  "connection_id": "conn_pk_73A91",
  "institution_id": "ins_pk_hbl_sbx",
  "account_id": "acc_pk_••4821",
  "balance": { "available": 1842650, "currency": "PKR" },
  "freshness": "fresh",
  "source_retrieved_at": "2026-07-28T05:42:08Z",
  "mapping_version": "pk-account@1.2"
}`}</pre>
          </article>
        </div>
      </section>
    </div>
  );
}

function ParticipantsConsole({
  recipientSuspended,
  setRecipientSuspended,
  fasalApproved,
  approveFasal,
}: {
  recipientSuspended: boolean;
  setRecipientSuspended: (value: boolean) => void;
  fasalApproved: boolean;
  approveFasal: () => void;
}) {
  return (
    <div className="console-content">
      <section className="section-intro-row">
        <div>
          <p className="eyebrow">Participant trust service</p>
          <h2>Onboard and govern banks and data recipients.</h2>
          <p>
            Legal entity, use case, environment, scope, certificate and
            conformance decisions remain separated and auditable.
          </p>
        </div>
        <button className="button button-primary">Start recipient review</button>
      </section>

      <section className="metric-grid compact">
        <article>
          <span>Recipients</span>
          <strong>5</strong>
          <small>3 active · 2 in review</small>
        </article>
        <article>
          <span>Banks</span>
          <strong>4</strong>
          <small>4 sandbox profiles</small>
        </article>
        <article>
          <span>Applications</span>
          <strong>8</strong>
          <small>6 sandbox · 2 pilot</small>
        </article>
        <article>
          <span>Certificates</span>
          <strong>12</strong>
          <small className="warning-text">2 expire within 45 days</small>
        </article>
      </section>

      <section className="participants-grid">
        <article className="panel span-8">
          <div className="panel-heading">
            <div>
              <p className="overline">Recipient directory</p>
              <h3>Approved and pending organizations</h3>
            </div>
            <input
              className="table-search"
              aria-label="Search participants"
              placeholder="Search participants"
            />
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Use case</th>
                  <th>Environment</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="table-identity">
                      <b>KC</b>
                      <span>
                        <strong>Karobar Capital</strong>
                        <small>rec_pk_karobar</small>
                      </span>
                    </span>
                  </td>
                  <td>SME cash-flow verification</td>
                  <td>Sandbox</td>
                  <td>Medium</td>
                  <td>
                    <StatusPill
                      tone={recipientSuspended ? "warning" : "success"}
                    >
                      {recipientSuspended ? "Suspended" : "Active"}
                    </StatusPill>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="table-identity">
                      <b>LP</b>
                      <span>
                        <strong>Ledgerly Pakistan</strong>
                        <small>rec_pk_ledgerly</small>
                      </span>
                    </span>
                  </td>
                  <td>Accounting synchronization</td>
                  <td>Pilot</td>
                  <td>Low</td>
                  <td>
                    <StatusPill tone="info">Pilot</StatusPill>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="table-identity">
                      <b>FF</b>
                      <span>
                        <strong>Fasal Finance</strong>
                        <small>rec_pk_fasal</small>
                      </span>
                    </span>
                  </td>
                  <td>Farm working-capital assessment</td>
                  <td>None</td>
                  <td>High</td>
                  <td>
                    <StatusPill tone={fasalApproved ? "success" : "warning"}>
                      {fasalApproved ? "Sandbox approved" : "In review"}
                    </StatusPill>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel span-4 participant-detail">
          <div className="participant-title">
            <span className="recipient-logo">KC</span>
            <div>
              <p className="overline">Selected recipient</p>
              <h3>Karobar Capital</h3>
            </div>
          </div>
          <div className="checklist">
            {[
              ["Legal entity verified", "Complete"],
              ["Controllers and ownership", "Complete"],
              ["Use case and scopes", "Complete"],
              ["Security conformance", "24 / 24"],
              ["Webhook verification", "Passed"],
            ].map(([label, result]) => (
              <div key={label}>
                <span>✓</span>
                <p>
                  <strong>{label}</strong>
                  <small>{result}</small>
                </p>
              </div>
            ))}
          </div>
          <div className="detail-actions">
            <button
              className={`button ${recipientSuspended ? "button-primary" : "button-danger-outline"}`}
              onClick={() => setRecipientSuspended(!recipientSuspended)}
            >
              {recipientSuspended ? "Reinstate sandbox access" : "Suspend recipient"}
            </button>
            <button className="button button-secondary">View evidence</button>
          </div>
          {!fasalApproved ? (
            <div className="approval-callout">
              <span>Pending decision</span>
              <strong>Fasal Finance sandbox review</strong>
              <button onClick={approveFasal}>Approve sandbox access →</button>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}

function ConnectionsConsole({
  connectionStatus,
  lastSync,
  setConnectionStatus,
  openCustomer,
}: {
  connectionStatus: ConnectionStatus;
  lastSync: string;
  setConnectionStatus: (status: ConnectionStatus) => void;
  openCustomer: () => void;
}) {
  return (
    <div className="console-content">
      <section className="section-intro-row">
        <div>
          <p className="eyebrow">Consent and connection registry</p>
          <h2>Trace permission from purpose to every data access.</h2>
          <p>
            Searchable, pseudonymous records connect recipient, customer, bank,
            scopes, evidence, requests and downstream events.
          </p>
        </div>
        <button className="button button-secondary" onClick={openCustomer}>
          Open customer view
        </button>
      </section>

      <section className="connection-layout">
        <article className="panel connection-table-panel">
          <div className="panel-heading">
            <div>
              <p className="overline">Connection registry</p>
              <h3>Recent relationships</h3>
            </div>
            <div className="filter-chips">
              <button className="active">All</button>
              <button>Active</button>
              <button>Attention</button>
            </div>
          </div>
          <div className="data-table-wrap">
            <table className="data-table connections-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Recipient / bank</th>
                  <th>Purpose</th>
                  <th>Last access</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="selected-row">
                  <td>
                    <strong>BNX-KC-73A91</strong>
                    <small>con_•••3A91</small>
                  </td>
                  <td>
                    <strong>Karobar Capital</strong>
                    <small>HBL Sandbox</small>
                  </td>
                  <td>Cash-flow verification</td>
                  <td>{lastSync}</td>
                  <td>
                    <StatusPill
                      tone={
                        connectionStatus === "Active"
                          ? "success"
                          : connectionStatus === "Pending"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {connectionStatus}
                    </StatusPill>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>BNX-LP-62D18</strong>
                    <small>con_•••2D18</small>
                  </td>
                  <td>
                    <strong>Ledgerly Pakistan</strong>
                    <small>Meezan Sandbox</small>
                  </td>
                  <td>Accounting sync</td>
                  <td>Yesterday, 6:18 PM</td>
                  <td>
                    <StatusPill tone="success">Active</StatusPill>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>BNX-KC-18F02</strong>
                    <small>con_•••8F02</small>
                  </td>
                  <td>
                    <strong>Karobar Capital</strong>
                    <small>Bank Alfalah Sandbox</small>
                  </td>
                  <td>Cash-flow verification</td>
                  <td>26 Jul, 2:07 PM</td>
                  <td>
                    <StatusPill tone="neutral">Expired</StatusPill>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel connection-detail">
          <div className="panel-heading">
            <div>
              <p className="overline">Selected connection</p>
              <h3>BNX-KC-73A91</h3>
            </div>
            <StatusPill
              tone={connectionStatus === "Active" ? "success" : "danger"}
            >
              {connectionStatus}
            </StatusPill>
          </div>
          <div className="consent-map">
            <div>
              <span>Recipient approval</span>
              <strong>accounts · balances · transactions</strong>
            </div>
            <i>∩</i>
            <div>
              <span>Customer selection</span>
              <strong>1 account · 90 days</strong>
            </div>
            <i>∩</i>
            <div>
              <span>Bank grant</span>
              <strong>all requested scopes</strong>
            </div>
          </div>
          <dl className="detail-definition">
            <div>
              <dt>Effective permission</dt>
              <dd>Accounts, balances, transactions</dd>
            </div>
            <div>
              <dt>Purpose</dt>
              <dd>SME cash-flow verification</dd>
            </div>
            <div>
              <dt>Expires</dt>
              <dd>26 Oct 2026 · 90 days</dd>
            </div>
            <div>
              <dt>Bank reference</dt>
              <dd>hbl_auth_••••91</dd>
            </div>
            <div>
              <dt>Evidence version</dt>
              <dd>consent-copy-pk-en@1.3</dd>
            </div>
          </dl>
          <div className="detail-actions">
            <button className="button button-secondary">Open access trace</button>
            <button
              className={
                connectionStatus === "Revoked"
                  ? "button button-primary"
                  : "button button-danger-outline"
              }
              onClick={() =>
                setConnectionStatus(
                  connectionStatus === "Revoked" ? "Active" : "Revoked",
                )
              }
            >
              {connectionStatus === "Revoked"
                ? "Restore prototype connection"
                : "Revoke connection"}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}

function ConnectorsConsole({
  ublMaintenance,
  restoreUbl,
}: {
  ublMaintenance: boolean;
  restoreUbl: () => void;
}) {
  return (
    <div className="console-content">
      <section className="section-intro-row">
        <div>
          <p className="eyebrow">Bank connector framework</p>
          <h2>One canonical contract, isolated per-bank execution.</h2>
          <p>
            Each connector owns bank protocol, credentials, mappings, timeouts,
            error translation and capability health without changing the
            recipient API.
          </p>
        </div>
        <button className="button button-primary">Register bank profile</button>
      </section>

      <section className="connector-grid">
        {banks.map((bank) => {
          const status =
            bank.id === "ubl" && !ublMaintenance ? "Operational" : bank.status;
          return (
            <article className="connector-card" key={bank.id}>
              <div className="connector-card-top">
                <span className={`bank-logo bank-${bank.id} large`}>
                  {bank.initials}
                </span>
                <StatusPill
                  tone={
                    status === "Operational"
                      ? "success"
                      : status === "Degraded"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {status}
                </StatusPill>
              </div>
              <h3>{bank.name}</h3>
              <p>{bank.connector}</p>
              <div className="capability-dots">
                {["Auth", "Token", "Accounts", "Balances", "Txns", "Revoke"].map(
                  (capability, index) => (
                    <span
                      key={capability}
                      className={
                        status === "Maintenance" ||
                        (bank.id === "alfalah" && index === 4)
                          ? "off"
                          : ""
                      }
                    >
                      <i />
                      {capability}
                    </span>
                  ),
                )}
              </div>
              <dl>
                <div>
                  <dt>Mapping</dt>
                  <dd>{bank.mapping}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{bank.availability}</dd>
                </div>
              </dl>
              {bank.id === "ubl" && ublMaintenance ? (
                <button className="text-button" onClick={restoreUbl}>
                  End simulated maintenance →
                </button>
              ) : (
                <button className="text-button">Inspect connector →</button>
              )}
            </article>
          );
        })}
      </section>

      <section className="overview-grid">
        <article className="panel span-7">
          <div className="panel-heading">
            <div>
              <p className="overline">Selected · HBL Sandbox</p>
              <h3>Connector release pipeline</h3>
            </div>
            <StatusPill tone="success">Ready</StatusPill>
          </div>
          <div className="release-pipeline">
            {[
              ["Contract", "24 / 24"],
              ["Protocol", "18 / 18"],
              ["Mapping", "42 / 42"],
              ["Outage", "12 / 12"],
              ["Performance", "Passed"],
            ].map(([label, value], index) => (
              <div key={label}>
                <span className="pipeline-check">✓</span>
                <strong>{label}</strong>
                <small>{value}</small>
                {index < 4 ? <i /> : null}
              </div>
            ))}
          </div>
          <div className="release-footer">
            <span>
              Candidate <strong>hbl-sbx@0.4.3</strong>
            </span>
            <span>
              Mapping <strong>pk-account@1.3</strong>
            </span>
            <button className="button button-secondary">Review promotion</button>
          </div>
        </article>

        <article className="panel span-5">
          <div className="panel-heading">
            <div>
              <p className="overline">Data quality</p>
              <h3>Mapping outcomes</h3>
            </div>
            <span className="score-ring">99.7</span>
          </div>
          <div className="quality-bars">
            <div>
              <span>Schema-valid records</span>
              <strong>100%</strong>
              <i style={{ width: "100%" }} />
            </div>
            <div>
              <span>Mapped bank codes</span>
              <strong>99.7%</strong>
              <i style={{ width: "99.7%" }} />
            </div>
            <div>
              <span>Reconciled balances</span>
              <strong>99.9%</strong>
              <i style={{ width: "99.9%" }} />
            </div>
          </div>
          <div className="quality-note">
            <span>3</span>
            <p>
              <strong>Unknown transaction codes quarantined</strong>
              <small>No recipient response was contaminated.</small>
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}

function OperationsConsole({
  incidentOpen,
  resolveIncident,
  replayWebhook,
  webhookReplayed,
}: {
  incidentOpen: boolean;
  resolveIncident: () => void;
  replayWebhook: () => void;
  webhookReplayed: boolean;
}) {
  return (
    <div className="console-content">
      <section className="section-intro-row">
        <div>
          <p className="eyebrow">Operations, incidents and cases</p>
          <h2>Operate dependencies without browsing customer data.</h2>
          <p>
            Health, event delivery, incidents, complaints and controlled
            actions are correlated through pseudonymous references.
          </p>
        </div>
        <button className="button button-primary">Declare incident</button>
      </section>

      <section className="ops-grid">
        <article className="panel incident-card">
          <div className="incident-header">
            <span className={incidentOpen ? "severity" : "severity resolved"}>
              {incidentOpen ? "SEV-3" : "RESOLVED"}
            </span>
            <small>INC-2048 · opened 09:47 PKT</small>
          </div>
          <h3>
            {incidentOpen
              ? "Bank Alfalah transaction capability degraded"
              : "Bank Alfalah capability restored"}
          </h3>
          <p>
            Account and balance capabilities remain operational. The
            transaction circuit is open after elevated timeout rates.
          </p>
          <div className="incident-impact">
            <div>
              <span>Affected</span>
              <strong>1 bank · 2 recipients</strong>
            </div>
            <div>
              <span>Requests protected</span>
              <strong>184 failed safely</strong>
            </div>
            <div>
              <span>Customer journeys</span>
              <strong>Capability message shown</strong>
            </div>
          </div>
          <div className="incident-actions">
            <button className="button button-secondary">Open timeline</button>
            {incidentOpen ? (
              <button className="button button-primary" onClick={resolveIncident}>
                Mark contained
              </button>
            ) : (
              <StatusPill tone="success">Post-incident review</StatusPill>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="overline">Event delivery</p>
              <h3>Webhook attempts</h3>
            </div>
            <span className="count-badge">7 retrying</span>
          </div>
          <div className="event-list">
            <div>
              <span className="event-state success">✓</span>
              <p>
                <strong>connection.ready</strong>
                <small>Karobar Capital · attempt 1</small>
              </p>
              <StatusPill tone="success">Delivered</StatusPill>
            </div>
            <div>
              <span className="event-state warning">↻</span>
              <p>
                <strong>data.refresh.completed</strong>
                <small>Ledgerly · attempt 3 of 8</small>
              </p>
              <StatusPill tone="warning">Retrying</StatusPill>
            </div>
            <div>
              <span className="event-state neutral">…</span>
              <p>
                <strong>consent.expiring</strong>
                <small>Karobar Capital · queued</small>
              </p>
              <StatusPill>Queued</StatusPill>
            </div>
          </div>
          <button className="button button-secondary button-full" onClick={replayWebhook}>
            {webhookReplayed ? "Replay delivered" : "Replay selected event"}
          </button>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="overline">Data quality queue</p>
              <h3>Quarantined mappings</h3>
            </div>
            <span className="count-badge amber">3</span>
          </div>
          <div className="mapping-list">
            <div>
              <code>HBL · TXN_CODE_84</code>
              <span>2 records</span>
              <button>Review</button>
            </div>
            <div>
              <code>BAFL · ACCT_SUB_19</code>
              <span>1 record</span>
              <button>Review</button>
            </div>
          </div>
          <p className="panel-note">
            Unknown codes are isolated. Bank provenance is retained for
            controlled mapping and reissue.
          </p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="overline">Support cases</p>
              <h3>Correlated investigations</h3>
            </div>
            <button className="text-button">View all</button>
          </div>
          <div className="case-list">
            <div>
              <span>CASE-884</span>
              <p>
                <strong>Customer questions last access</strong>
                <small>Owner: Recipient · SLA 3h 18m</small>
              </p>
            </div>
            <div>
              <span>CASE-879</span>
              <p>
                <strong>Balance freshness discrepancy</strong>
                <small>Owner: Bank · SLA 1d 4h</small>
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function AuditConsole({ exportEvidence }: { exportEvidence: () => void }) {
  return (
    <div className="console-content">
      <section className="section-intro-row">
        <div>
          <p className="eyebrow">Immutable evidence and role safety</p>
          <h2>Every sensitive decision has an actor, reason and boundary.</h2>
          <p>
            Platform operators see the minimum information needed to operate a
            case. Elevation, approval and export remain separately controlled.
          </p>
        </div>
        <button className="button button-primary" onClick={exportEvidence}>
          Prepare scoped evidence
        </button>
      </section>

      <section className="audit-layout">
        <article className="panel audit-log">
          <div className="panel-heading">
            <div>
              <p className="overline">Tamper-evident activity</p>
              <h3>Recent administrative events</h3>
            </div>
            <span className="hash-label">Chain verified</span>
          </div>
          {[
            {
              time: "10:42:09",
              title: "Connection authorization recorded",
              actor: "system:consent-engine",
              object: "con_•••3A91",
              hash: "c4a8…91ef",
            },
            {
              time: "10:38:17",
              title: "Connector maintenance approved",
              actor: "ayesha.omar + bilal.khan",
              object: "ins_pk_ubl_sbx",
              hash: "8bd1…223a",
            },
            {
              time: "09:53:44",
              title: "Support access elevated",
              actor: "sara.iqbal",
              object: "CASE-884 · 30 minutes",
              hash: "71ff…02ca",
            },
            {
              time: "09:47:12",
              title: "Transaction circuit opened",
              actor: "system:connector-runtime",
              object: "alfalah-sbx · transactions",
              hash: "dd09…817e",
            },
          ].map((event) => (
            <div className="audit-event" key={event.hash}>
              <time>{event.time}</time>
              <span className="audit-line" />
              <div>
                <strong>{event.title}</strong>
                <small>
                  {event.actor} · {event.object}
                </small>
              </div>
              <code>{event.hash}</code>
            </div>
          ))}
        </article>

        <div className="audit-side">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="overline">Current session</p>
                <h3>Least-privilege scope</h3>
              </div>
              <StatusPill tone="info">JIT active</StatusPill>
            </div>
            <dl className="detail-definition">
              <div>
                <dt>Role</dt>
                <dd>Platform operator</dd>
              </div>
              <div>
                <dt>Reason</dt>
                <dd>INC-2048 containment</dd>
              </div>
              <div>
                <dt>Permitted</dt>
                <dd>Health, queues, controlled connector actions</dd>
              </div>
              <div>
                <dt>Not permitted</dt>
                <dd>Raw tokens, unbounded customer browsing</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>11:12 PKT · 18 minutes</dd>
              </div>
            </dl>
          </article>
          <article className="panel evidence-card">
            <p className="overline">Evidence bundle preview</p>
            <h3>CASE-884</h3>
            <ul>
              <li>Consent snapshot and bank reference</li>
              <li>Recipient request and policy outcome</li>
              <li>Connector call and mapping version</li>
              <li>Webhook delivery evidence</li>
            </ul>
            <div>
              <span>Encrypted · expires in 24h</span>
              <button onClick={exportEvidence}>Generate bundle →</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function RecipientPortal({
  openLink,
  copied,
  copyCredential,
  requestSent,
  sendRequest,
  replayWebhook,
  webhookReplayed,
  connectionStatus,
  recipientSuspended,
}: {
  openLink: () => void;
  copied: boolean;
  copyCredential: () => void;
  requestSent: boolean;
  sendRequest: () => void;
  replayWebhook: () => void;
  webhookReplayed: boolean;
  connectionStatus: ConnectionStatus;
  recipientSuspended: boolean;
}) {
  return (
    <div className="role-portal recipient-portal">
      <aside className="role-sidebar">
        <div className="role-org">
          <span className="recipient-logo">KC</span>
          <div>
            <strong>Karobar Capital</strong>
            <small>Recipient organization</small>
          </div>
        </div>
        <nav aria-label="Recipient portal">
          <button className="active">
            <span>⌂</span> Overview
          </button>
          <button>
            <span>◫</span> Applications
          </button>
          <button>
            <span>⌁</span> Connections
          </button>
          <button>
            <span>⇄</span> API & logs
          </button>
          <button>
            <span>↗</span> Webhooks
          </button>
          <button>
            <span>✓</span> Conformance
          </button>
          <button>
            <span>◎</span> Incidents & support
          </button>
        </nav>
        <div className="role-sidebar-footer">
          <span>Sandbox environment</span>
          <p>No production customer payloads</p>
        </div>
      </aside>

      <section className="role-main">
        <div className="role-pagebar">
          <div>
            <p>Bunexa / Karobar Capital</p>
            <h1>Recipient portal</h1>
          </div>
          <div>
            <StatusPill tone={recipientSuspended ? "warning" : "success"}>
              {recipientSuspended ? "Suspended" : "Sandbox approved"}
            </StatusPill>
            <button
              className="button button-primary"
              onClick={openLink}
              disabled={recipientSuspended}
            >
              Create Link session
            </button>
          </div>
        </div>

        <div className="role-content">
          <section className="recipient-hero">
            <div>
              <div className="eyebrow">
                <span className="live-dot" />
                CashFlow Verify · Sandbox
              </div>
              <h2>Integrate once. Reach every certified bank.</h2>
              <p>
                Configure the application, launch consent, request normalized
                data and operate webhooks without building bank-specific
                implementations.
              </p>
            </div>
            <div className="onboarding-progress">
              <div>
                <span>Production readiness</span>
                <strong>82%</strong>
              </div>
              <i>
                <b style={{ width: "82%" }} />
              </i>
              <p>4 of 5 release gates complete</p>
            </div>
          </section>

          <section className="metric-grid compact">
            <article>
              <span>Active connections</span>
              <strong>{connectionStatus === "Active" ? "384" : "383"}</strong>
              <small>12 added this week</small>
            </article>
            <article>
              <span>API calls · 30 days</span>
              <strong>48.2k</strong>
              <small>61% of sandbox quota</small>
            </article>
            <article>
              <span>Success rate</span>
              <strong>99.96%</strong>
              <small>p95 286 ms</small>
            </article>
            <article>
              <span>Webhook delivery</span>
              <strong>99.8%</strong>
              <small>7 events retrying</small>
            </article>
          </section>

          <section className="recipient-grid">
            <article className="panel app-config">
              <div className="panel-heading">
                <div>
                  <p className="overline">Application identity</p>
                  <h3>CashFlow Verify</h3>
                </div>
                <StatusPill tone="success">Active</StatusPill>
              </div>
              <dl className="detail-definition">
                <div>
                  <dt>Application ID</dt>
                  <dd>
                    <code>sandbox_app_bnx_pk_72fd</code>
                    <button onClick={copyCredential}>
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </dd>
                </div>
                <div>
                  <dt>Redirect URI</dt>
                  <dd>https://sandbox.karobar.pk/bunexa/callback</dd>
                </div>
                <div>
                  <dt>JWKS</dt>
                  <dd>https://sandbox.karobar.pk/.well-known/jwks.json</dd>
                </div>
                <div>
                  <dt>Approved scopes</dt>
                  <dd>accounts.basic · balances.read · transactions.read</dd>
                </div>
              </dl>
              <div className="app-actions">
                <button className="button button-secondary">Edit configuration</button>
                <button className="text-button">Manage certificates →</button>
              </div>
            </article>

            <article className="panel conformance-panel">
              <div className="panel-heading">
                <div>
                  <p className="overline">Release gates</p>
                  <h3>Conformance</h3>
                </div>
                <span className="score-ring">24/24</span>
              </div>
              <div className="checklist compact">
                {[
                  ["API contract suite", "Passed"],
                  ["Sender constraint", "Passed"],
                  ["Consent copy", "Passed"],
                  ["Webhook signature", "Passed"],
                  ["Operational contacts", "Review due"],
                ].map(([label, value], index) => (
                  <div key={label}>
                    <span className={index === 4 ? "pending" : ""}>
                      {index === 4 ? "!" : "✓"}
                    </span>
                    <p>
                      <strong>{label}</strong>
                      <small>{value}</small>
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel api-console">
              <div className="panel-heading">
                <div>
                  <p className="overline">Normalized recipient API</p>
                  <h3>Request explorer</h3>
                </div>
                <StatusPill tone="info">Sandbox</StatusPill>
              </div>
              <div className="endpoint-list">
                {endpoints.map((endpoint, index) => (
                  <button
                    key={endpoint.path}
                    className={index === 2 ? "selected" : ""}
                  >
                    <span className="method">{endpoint.method}</span>
                    <code>{endpoint.path}</code>
                    <small>{endpoint.detail}</small>
                    <b>{endpoint.status}</b>
                  </button>
                ))}
              </div>
              <div className="request-runner">
                <div className="request-line">
                  <span>GET</span>
                  <code>/v1/accounts/acc_pk_4821/transactions?days=90</code>
                  <button onClick={sendRequest}>
                    {requestSent ? "Run again" : "Send request"}
                  </button>
                </div>
                <pre>{requestSent ? `HTTP/1.1 200 OK
x-bunexa-request-id: req_pk_8092
x-data-freshness: fresh

{
  "data": [{
    "transaction_id": "txn_pk_7c01",
    "description": "Daraz Seller Settlement",
    "amount": 183750,
    "currency": "PKR",
    "direction": "credit"
  }],
  "mapping_version": "pk-account@1.2"
}` : `// Run the request to inspect a canonical sandbox response.
// No production customer data is available in this environment.`}</pre>
              </div>
            </article>

            <article className="panel webhook-panel">
              <div className="panel-heading">
                <div>
                  <p className="overline">Event delivery</p>
                  <h3>Recent webhook</h3>
                </div>
                <StatusPill tone={webhookReplayed ? "success" : "warning"}>
                  {webhookReplayed ? "Delivered" : "Retrying"}
                </StatusPill>
              </div>
              <div className="webhook-meta">
                <code>evt_pk_01J8</code>
                <span>data.refresh.completed</span>
                <small>Attempt {webhookReplayed ? "4 · 200 OK" : "3 · 503"}</small>
              </div>
              <pre>{`{
  "id": "evt_pk_01J8",
  "type": "data.refresh.completed",
  "connection_id": "conn_pk_73A91",
  "occurred_at": "2026-07-28T05:42:09Z"
}`}</pre>
              <button className="button button-secondary button-full" onClick={replayWebhook}>
                {webhookReplayed ? "Replay delivered" : "Replay event"}
              </button>
            </article>
          </section>
        </div>
      </section>
    </div>
  );
}

function BankPortal({
  ublMaintenance,
  changeSubmitted,
  submitChange,
  showToast,
}: {
  ublMaintenance: boolean;
  changeSubmitted: boolean;
  submitChange: () => void;
  showToast: (message: string) => void;
}) {
  return (
    <div className="role-portal bank-portal">
      <aside className="role-sidebar bank-role-sidebar">
        <div className="role-org">
          <span className="bank-logo bank-hbl large">HB</span>
          <div>
            <strong>HBL Sandbox</strong>
            <small>Participating bank</small>
          </div>
        </div>
        <nav aria-label="Bank integration portal">
          <button className="active">
            <span>⌂</span> Overview
          </button>
          <button>
            <span>◇</span> Connector
          </button>
          <button>
            <span>⇄</span> Endpoints
          </button>
          <button>
            <span>▦</span> Mappings
          </button>
          <button>
            <span>✓</span> Conformance
          </button>
          <button>
            <span>◎</span> Service health
          </button>
          <button>
            <span>▤</span> Change requests
          </button>
        </nav>
        <div className="role-sidebar-footer">
          <span>Bank-isolated view</span>
          <p>HBL profile and evidence only</p>
        </div>
      </aside>

      <section className="role-main">
        <div className="role-pagebar">
          <div>
            <p>Bunexa / Participating banks / HBL Sandbox</p>
            <h1>Bank integration portal</h1>
          </div>
          <div>
            <StatusPill tone="success">Connector operational</StatusPill>
            <button className="button button-primary" onClick={submitChange}>
              Submit change request
            </button>
          </div>
        </div>

        <div className="role-content">
          <section className="bank-hero">
            <div>
              <span className="bank-logo bank-hbl hero-logo">HB</span>
              <div>
                <p className="eyebrow">ins_pk_hbl_sbx</p>
                <h2>HBL Sandbox integration</h2>
                <p>
                  Approved profile, connector release, mappings, certificates,
                  conformance and capability-level health.
                </p>
              </div>
            </div>
            <div className="bank-hero-stats">
              <div>
                <span>Availability</span>
                <strong>99.98%</strong>
              </div>
              <div>
                <span>p95 bank latency</span>
                <strong>184 ms</strong>
              </div>
              <div>
                <span>Data quality</span>
                <strong>99.7%</strong>
              </div>
            </div>
          </section>

          {changeSubmitted ? (
            <div className="change-banner">
              <span>Maker-checker required</span>
              <p>
                Change CHG-491 is awaiting an independent Platform connector
                approver. Nothing is effective yet.
              </p>
              <StatusPill tone="warning">Pending approval</StatusPill>
            </div>
          ) : null}

          <section className="bank-grid">
            <article className="panel bank-profile">
              <div className="panel-heading">
                <div>
                  <p className="overline">Approved profile</p>
                  <h3>Protocol and identity</h3>
                </div>
                <button className="text-button">Propose edit</button>
              </div>
              <dl className="detail-definition">
                <div>
                  <dt>Protocol profile</dt>
                  <dd>OAuth 2.1 · Authorization Code · PAR</dd>
                </div>
                <div>
                  <dt>Client authentication</dt>
                  <dd>mTLS + private_key_jwt</dd>
                </div>
                <div>
                  <dt>Signing</dt>
                  <dd>PS256 · bank JWKS verified</dd>
                </div>
                <div>
                  <dt>Connector pattern</dt>
                  <dd>Direct bank APIs</dd>
                </div>
                <div>
                  <dt>Support contact</dt>
                  <dd>api-operations@hbl-sandbox.example</dd>
                </div>
              </dl>
            </article>

            <article className="panel certificate-card">
              <div className="panel-heading">
                <div>
                  <p className="overline">Certificates</p>
                  <h3>Trust material</h3>
                </div>
                <StatusPill tone="success">Valid</StatusPill>
              </div>
              <div className="certificate-visual">
                <span>mTLS</span>
                <div>
                  <strong>CN=hbl-sandbox-api</strong>
                  <small>SHA-256 · 8F:21:7A:…:91</small>
                </div>
              </div>
              <dl className="detail-definition compact">
                <div>
                  <dt>Expires</dt>
                  <dd>18 Dec 2026 · 143 days</dd>
                </div>
                <div>
                  <dt>Rotation window</dt>
                  <dd>Opens 19 Oct 2026</dd>
                </div>
              </dl>
              <button className="button button-secondary button-full">
                View certificate chain
              </button>
            </article>

            <article className="panel connector-release">
              <div className="panel-heading">
                <div>
                  <p className="overline">Current release</p>
                  <h3>hbl-sbx@0.4.2</h3>
                </div>
                <StatusPill tone="success">100% traffic</StatusPill>
              </div>
              <div className="release-info">
                <div>
                  <span>Mapping</span>
                  <strong>pk-account@1.2</strong>
                </div>
                <div>
                  <span>Promoted</span>
                  <strong>21 Jul · 18:30 PKT</strong>
                </div>
                <div>
                  <span>Rollback target</span>
                  <strong>hbl-sbx@0.4.1</strong>
                </div>
              </div>
              <div className="traffic-bar">
                <span>Stable release</span>
                <i>
                  <b style={{ width: "100%" }} />
                </i>
                <strong>100%</strong>
              </div>
              <div className="release-actions">
                <button className="button button-secondary">View release evidence</button>
                <button
                  className="text-button"
                  onClick={() => showToast("Rollback drill passed in 38 seconds")}
                >
                  Run rollback drill
                </button>
              </div>
            </article>

            <article className="panel capability-health">
              <div className="panel-heading">
                <div>
                  <p className="overline">Capability-level health</p>
                  <h3>Service endpoints</h3>
                </div>
                <StatusPill tone="success">All operational</StatusPill>
              </div>
              {[
                ["Authorization", "/oauth2/authorize", "99.99%", "122 ms"],
                ["Token", "/oauth2/token", "100%", "94 ms"],
                ["Accounts", "/open-banking/accounts", "99.98%", "176 ms"],
                ["Balances", "/open-banking/balances", "99.98%", "181 ms"],
                ["Transactions", "/open-banking/transactions", "99.97%", "214 ms"],
                ["Revocation", "/oauth2/revoke", "100%", "108 ms"],
              ].map(([label, path, uptime, latency]) => (
                <div className="capability-row" key={label}>
                  <span className="status-dot success" />
                  <strong>{label}</strong>
                  <code>{path}</code>
                  <span>{uptime}</span>
                  <small>{latency}</small>
                </div>
              ))}
            </article>

            <article className="panel bank-conformance">
              <div className="panel-heading">
                <div>
                  <p className="overline">Certification evidence</p>
                  <h3>Conformance result</h3>
                </div>
                <span className="score-ring">96/96</span>
              </div>
              <div className="conformance-bars">
                {[
                  ["Protocol", 18],
                  ["Negative", 16],
                  ["Mapping", 42],
                  ["Outage", 12],
                  ["Performance", 8],
                ].map(([label, tests]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <i>
                      <b style={{ width: "100%" }} />
                    </i>
                    <strong>{tests}/{tests}</strong>
                  </div>
                ))}
              </div>
              <p className="panel-note">
                Next recertification due 15 October 2026. No open mandatory
                findings.
              </p>
            </article>
          </section>

          <p className="cross-bank-note">
            This role cannot view another bank&apos;s configuration, recipient
            customer data or Bunexa token material. UBL maintenance state:{" "}
            <strong>{ublMaintenance ? "active" : "ended"}</strong>.
          </p>
        </div>
      </section>
    </div>
  );
}

function CustomerPortal({
  openLink,
  connectionStatus,
  setConnectionStatus,
  lastSync,
  refreshing,
  refreshConnection,
}: {
  openLink: () => void;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  lastSync: string;
  refreshing: boolean;
  refreshConnection: () => void;
}) {
  return (
    <div className="customer-portal">
      <header className="customer-header">
        <div>
          <p>Bunexa Customer</p>
          <h1>My connections</h1>
        </div>
        <div>
          <span className="customer-avatar">AK</span>
          <button className="button button-dark" onClick={openLink}>
            Connect another bank
          </button>
        </div>
      </header>

      <div className="customer-content">
        <section className="customer-intro">
          <div>
            <p className="eyebrow">Your permission centre</p>
            <h2>Know who can access what—and stop it at any time.</h2>
          </div>
          <div className="privacy-promise">
            <span>✓</span>
            <p>
              <strong>Your bank remains the source of truth.</strong>
              Bunexa never sees or stores your bank password, PIN or OTP.
            </p>
          </div>
        </section>

        <section className="customer-layout">
          <article className="customer-balance-card">
            <div className="customer-card-top">
              <span className="bank-logo bank-hbl large">HB</span>
              <div>
                <small>Business Current ···· 4821</small>
                <strong>PKR 1,842,650</strong>
              </div>
              <StatusPill
                tone={connectionStatus === "Active" ? "success" : "danger"}
              >
                {connectionStatus}
              </StatusPill>
            </div>
            <div className="balance-chart" aria-label="Synthetic balance trend">
              {[48, 58, 52, 67, 62, 78, 84, 76, 91, 88, 96, 100].map(
                (height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ),
              )}
            </div>
            <div className="balance-footer">
              <span>
                Available balance <strong>PKR 1,793,200</strong>
              </span>
              <span>
                Last refreshed <strong>{lastSync}</strong>
              </span>
              <button
                onClick={refreshConnection}
                disabled={connectionStatus !== "Active" || refreshing}
              >
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </article>

          <article className="consent-card">
            <div className="consent-card-title">
              <span className="recipient-logo">KC</span>
              <div>
                <p className="overline">Data recipient</p>
                <h3>Karobar Capital</h3>
              </div>
              <StatusPill
                tone={connectionStatus === "Active" ? "success" : "danger"}
              >
                {connectionStatus}
              </StatusPill>
            </div>
            <dl className="detail-definition">
              <div>
                <dt>Purpose</dt>
                <dd>SME cash-flow verification</dd>
              </div>
              <div>
                <dt>Can access</dt>
                <dd>Account details, balances, 90-day transactions</dd>
              </div>
              <div>
                <dt>Frequency</dt>
                <dd>On request · up to 4 times per day</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>26 October 2026</dd>
              </div>
              <div>
                <dt>Last access</dt>
                <dd>{lastSync} · transactions.read</dd>
              </div>
            </dl>
            <button
              className={
                connectionStatus === "Revoked"
                  ? "button button-primary button-full"
                  : "button button-danger-outline button-full"
              }
              onClick={() =>
                setConnectionStatus(
                  connectionStatus === "Revoked" ? "Active" : "Revoked",
                )
              }
            >
              {connectionStatus === "Revoked"
                ? "Reactivate prototype connection"
                : "Revoke this connection"}
            </button>
          </article>

          <article className="transactions-card panel">
            <div className="panel-heading">
              <div>
                <p className="overline">Normalized account activity</p>
                <h3>Recent transactions</h3>
              </div>
              <span>Bank source · synthetic</span>
            </div>
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div key={transaction.merchant}>
                  <span className={`transaction-icon ${transaction.kind}`}>
                    {transaction.kind === "credit" ? "↓" : "↑"}
                  </span>
                  <p>
                    <strong>{transaction.merchant}</strong>
                    <small>{transaction.meta}</small>
                  </p>
                  <b className={transaction.kind}>{transaction.amount}</b>
                </div>
              ))}
            </div>
          </article>

          <article className="access-card panel">
            <div className="panel-heading">
              <div>
                <p className="overline">Access transparency</p>
                <h3>Recent data access</h3>
              </div>
              <button className="text-button">Ask a question</button>
            </div>
            <div className="access-list">
              <div>
                <time>Today · 10:42</time>
                <p>
                  <strong>Transactions accessed</strong>
                  <small>Karobar Capital · cash-flow verification</small>
                </p>
                <span>Allowed</span>
              </div>
              <div>
                <time>Today · 10:42</time>
                <p>
                  <strong>Balance accessed</strong>
                  <small>Karobar Capital · current account</small>
                </p>
                <span>Allowed</span>
              </div>
              <div>
                <time>27 Jul · 16:08</time>
                <p>
                  <strong>Accounts refreshed</strong>
                  <small>Scheduled connection refresh</small>
                </p>
                <span>Allowed</span>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
