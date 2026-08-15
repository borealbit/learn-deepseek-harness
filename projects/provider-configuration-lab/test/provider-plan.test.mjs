import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  ProviderPlanError,
  formatPlanSummary,
  validateProviderPlan,
} from "../src/validate-provider-plan.mjs";

const fixtures = JSON.parse(
  await readFile(fileURLToPath(new URL("../fixtures/provider-plans.json", import.meta.url)), "utf8"),
);

function copyFixture(index = 0) {
  return structuredClone(fixtures[index]);
}

function rejectsPlan(plan, pattern) {
  assert.throws(() => validateProviderPlan(plan), (error) => {
    assert.ok(error instanceof ProviderPlanError);
    assert.match(error.message, pattern);
    return true;
  });
}

test("validates and deterministically hashes all three sanitized strategies", () => {
  const results = fixtures.map(validateProviderPlan);
  assert.equal(results.length, 3);
  assert.deepEqual(results.map(({ plan }) => plan.provider.kind), ["catalog", "openai-compatible", "local"]);
  for (const [index, result] of results.entries()) {
    assert.match(result.digest, /^sha256:[0-9a-f]{64}$/);
    assert.equal(result.digest, validateProviderPlan(fixtures[index]).digest);
    assert.match(formatPlanSummary(result), /^PASS /);
  }
});

test("rejects secret-shaped credential material and literal credential fields", () => {
  const secretReference = copyFixture();
  secretReference.provider.credential.reference = "sk-1234567890abcdefghijklmnop";
  rejectsPlan(secretReference, /secret-shaped|malformed/);

  const literalField = copyFixture();
  literalField.provider.credential.value = "redacted-but-still-a-literal";
  rejectsPlan(literalField, /unsupported fields/);
});

test("requires HTTPS and clean endpoint metadata for remote providers", () => {
  const cleartext = copyFixture(1);
  cleartext.provider.endpoint = "http://gateway.example.test/v1";
  rejectsPlan(cleartext, /must use HTTPS/);

  const metadata = copyFixture(1);
  metadata.provider.endpoint = "https://user:pass@gateway.example.test/v1?debug=true#trace";
  rejectsPlan(metadata, /must not contain userinfo/);
});

test("enforces explicit host allowlists and loopback-only local providers", () => {
  const mismatched = copyFixture(1);
  mismatched.network.allowedHosts = ["different.example.test"];
  rejectsPlan(mismatched, /not explicitly allowed/);

  const remoteLocal = copyFixture(2);
  remoteLocal.provider.endpoint = "http://models.example.test:11434/v1";
  remoteLocal.network.allowedHosts = ["models.example.test"];
  rejectsPlan(remoteLocal, /loopback endpoint/);
});

test("rejects unsafe workspace labels and sensitive-data opt-in", () => {
  const traversal = copyFixture();
  traversal.workspace.rootLabel = "synthetic/../private";
  rejectsPlan(traversal, /normalized relative label/);

  const sensitive = copyFixture();
  sensitive.workspace.allowSensitiveData = true;
  rejectsPlan(sensitive, /must remain false/);
});

test("rejects schema smuggling and malformed capabilities without mutating input", () => {
  const unknown = copyFixture();
  unknown.debug = true;
  rejectsPlan(unknown, /unsupported fields/);

  const duplicate = copyFixture();
  duplicate.model.requiredCapabilities = ["text", "text"];
  rejectsPlan(duplicate, /duplicates/);

  const original = copyFixture(1);
  const snapshot = structuredClone(original);
  validateProviderPlan(original);
  assert.deepEqual(original, snapshot);
});
