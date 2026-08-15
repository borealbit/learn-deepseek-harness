import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { formatPlanSummary, validateProviderPlan } from "../src/validate-provider-plan.mjs";

const fixtureUrl = new URL("../fixtures/provider-plans.json", import.meta.url);
const plans = JSON.parse(await readFile(fileURLToPath(fixtureUrl), "utf8"));

const results = plans.map(validateProviderPlan);
console.log(`Validated ${results.length} sanitized provider plans.`);
for (const result of results) console.log(formatPlanSummary(result));
