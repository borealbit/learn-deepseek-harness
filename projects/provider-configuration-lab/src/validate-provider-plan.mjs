import { createHash } from "node:crypto";

const ROOT_FIELDS = ["schemaVersion", "name", "provider", "model", "workspace", "session", "network"];
const PROVIDER_FIELDS = ["kind", "endpoint", "credential"];
const CREDENTIAL_FIELDS = ["mode", "reference"];
const MODEL_FIELDS = ["id", "requiredCapabilities"];
const WORKSPACE_FIELDS = ["rootLabel", "allowSensitiveData"];
const SESSION_FIELDS = ["persistence", "resumePolicy", "forkPolicy"];
const NETWORK_FIELDS = ["allowedHosts", "loopbackOnly"];
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "[::1]", "localhost"]);
const SECRET_SHAPE = /(?:github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{16,})/;

export class ProviderPlanError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProviderPlanError";
  }
}

function fail(message) {
  throw new ProviderPlanError(message);
}

function plainObject(value, location) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${location} must be a plain object`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(`${location} must be a plain object`);
  }
  return value;
}

function exactFields(value, allowed, location) {
  plainObject(value, location);
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) fail(`${location} contains unsupported fields`);
  const missing = allowed.filter((key) => !(key in value));
  if (location.endsWith(".credential") && value.mode === "none") {
    const requiredMissing = missing.filter((key) => key !== "reference");
    if (requiredMissing.length > 0) fail(`${location} is missing required fields`);
    return;
  }
  if (missing.length > 0) fail(`${location} is missing required fields`);
}

function oneOf(value, allowed, location) {
  if (!allowed.includes(value)) fail(`${location} has an unsupported value`);
  return value;
}

function boundedString(value, pattern, location) {
  if (typeof value !== "string" || !pattern.test(value)) fail(`${location} is malformed`);
  if (SECRET_SHAPE.test(value)) fail(`${location} contains a secret-shaped value`);
  return value;
}

function uniqueEnumList(value, allowed, location) {
  if (!Array.isArray(value) || value.length === 0 || value.length > allowed.length) {
    fail(`${location} must be a non-empty bounded array`);
  }
  if (value.some((item) => !allowed.includes(item))) fail(`${location} contains an unsupported value`);
  if (new Set(value).size !== value.length) fail(`${location} contains duplicates`);
  return [...value].sort();
}

function normalizeHost(value, location) {
  const host = boundedString(value, /^(?:localhost|127(?:\.\d{1,3}){3}|\[?::1\]?|[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?)$/i, location).toLowerCase();
  if (host.includes("..")) fail(`${location} is malformed`);
  return host;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function digest(value) {
  const canonical = `${JSON.stringify(stableValue(value))}\n`;
  return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
}

export function validateProviderPlan(input) {
  exactFields(input, ROOT_FIELDS, "plan");
  if (input.schemaVersion !== 1) fail("plan.schemaVersion must be 1");

  const name = boundedString(input.name, /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/, "plan.name");

  exactFields(input.provider, PROVIDER_FIELDS, "plan.provider");
  const kind = oneOf(input.provider.kind, ["catalog", "openai-compatible", "local"], "plan.provider.kind");
  const endpointText = boundedString(input.provider.endpoint, /^.{1,500}$/, "plan.provider.endpoint");
  let endpoint;
  try {
    endpoint = new URL(endpointText);
  } catch {
    fail("plan.provider.endpoint must be an absolute URL");
  }
  if (endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    fail("plan.provider.endpoint must not contain userinfo, a query, or a fragment");
  }

  exactFields(input.provider.credential, CREDENTIAL_FIELDS, "plan.provider.credential");
  const credentialMode = oneOf(
    input.provider.credential.mode,
    ["environment-reference", "none"],
    "plan.provider.credential.mode",
  );
  let credential;
  if (credentialMode === "environment-reference") {
    const reference = boundedString(
      input.provider.credential.reference,
      /^[A-Z][A-Z0-9_]{2,63}$/,
      "plan.provider.credential.reference",
    );
    credential = { mode: credentialMode, reference };
  } else {
    if ("reference" in input.provider.credential) {
      fail("plan.provider.credential.reference is not allowed when mode is none");
    }
    credential = { mode: credentialMode };
  }

  exactFields(input.model, MODEL_FIELDS, "plan.model");
  const model = {
    id: boundedString(input.model.id, /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,119}$/, "plan.model.id"),
    requiredCapabilities: uniqueEnumList(
      input.model.requiredCapabilities,
      ["text", "tools", "vision"],
      "plan.model.requiredCapabilities",
    ),
  };

  exactFields(input.workspace, WORKSPACE_FIELDS, "plan.workspace");
  const rootLabel = boundedString(
    input.workspace.rootLabel,
    /^[a-z0-9][a-z0-9._/-]{0,119}$/,
    "plan.workspace.rootLabel",
  );
  if (
    rootLabel.startsWith("/") ||
    rootLabel.includes("\\") ||
    rootLabel.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    fail("plan.workspace.rootLabel must be a normalized relative label");
  }
  if (input.workspace.allowSensitiveData !== false) {
    fail("plan.workspace.allowSensitiveData must remain false in this lab");
  }

  exactFields(input.session, SESSION_FIELDS, "plan.session");
  const session = {
    persistence: oneOf(input.session.persistence, ["ephemeral", "local"], "plan.session.persistence"),
    resumePolicy: oneOf(input.session.resumePolicy, ["new-session", "same-workspace"], "plan.session.resumePolicy"),
    forkPolicy: oneOf(input.session.forkPolicy, ["same-provider", "explicit-provider"], "plan.session.forkPolicy"),
  };

  exactFields(input.network, NETWORK_FIELDS, "plan.network");
  if (!Array.isArray(input.network.allowedHosts) || input.network.allowedHosts.length < 1 || input.network.allowedHosts.length > 8) {
    fail("plan.network.allowedHosts must contain between one and eight hosts");
  }
  const allowedHosts = input.network.allowedHosts.map((host, index) =>
    normalizeHost(host, `plan.network.allowedHosts[${index}]`),
  );
  if (new Set(allowedHosts).size !== allowedHosts.length) fail("plan.network.allowedHosts contains duplicates");
  allowedHosts.sort();
  if (typeof input.network.loopbackOnly !== "boolean") fail("plan.network.loopbackOnly must be boolean");

  const endpointHost = endpoint.hostname.toLowerCase();
  if (!allowedHosts.includes(endpointHost)) fail("plan.provider.endpoint host is not explicitly allowed");

  if (kind === "local") {
    if (!LOOPBACK_HOSTS.has(endpointHost)) fail("a local provider must use a loopback endpoint");
    if (!input.network.loopbackOnly) fail("a local provider must be loopback-only");
    if (credentialMode !== "none") fail("a local provider must not require a credential in this lab");
    if (!["http:", "https:"].includes(endpoint.protocol)) fail("a local provider must use HTTP or HTTPS");
    if (allowedHosts.some((host) => !LOOPBACK_HOSTS.has(host))) fail("a loopback-only plan cannot allow remote hosts");
  } else {
    if (endpoint.protocol !== "https:") fail("a remote provider must use HTTPS");
    if (input.network.loopbackOnly) fail("a remote provider cannot be marked loopback-only");
    if (credentialMode !== "environment-reference") {
      fail("a remote provider must refer to a credential by environment-variable name");
    }
  }

  const plan = {
    schemaVersion: 1,
    name,
    provider: {
      kind,
      endpoint: endpoint.toString(),
      credential,
    },
    model,
    workspace: {
      rootLabel,
      allowSensitiveData: false,
    },
    session,
    network: {
      allowedHosts,
      loopbackOnly: input.network.loopbackOnly,
    },
  };

  return { plan, digest: digest(plan) };
}

export function formatPlanSummary(result) {
  const { plan } = result;
  const credential = plan.provider.credential.mode === "none"
    ? "none"
    : `environment-reference:${plan.provider.credential.reference}`;
  return [
    `PASS ${plan.name}`,
    `provider=${plan.provider.kind}`,
    `model=${plan.model.id}`,
    `credential=${credential}`,
    result.digest,
  ].join(" | ");
}
