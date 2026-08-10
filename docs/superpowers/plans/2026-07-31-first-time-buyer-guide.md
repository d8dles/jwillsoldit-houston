# Houston First-Time Buyer Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a source-cited Houston first-time-buyer education guide with a practical roadmap and glossary, without qualification-like calculations or volatile evergreen program claims.

**Architecture:** A new Markdown guide supplies durable educational copy and verified official sources through the existing content collection. A small Astro component renders native expandable roadmap and glossary sections; the existing guide route includes it only for the new slug. The link-safety gate from the preceding plan validates destinations before publication.

**Tech Stack:** Astro 7, Markdown content collections, Node.js 22 `node:test`, existing JWILLSOLDIT design tokens and components.

## Global Constraints

- Implement only after the Houston Link Safety Gate plan is complete and green.
- Use official government or official program-administrator links that pass automatic or normal-browser verification.
- Do not include fixed qualification, DTI, credit-score, down-payment, closing-cost, earnest-money, rate, or assistance-amount rules as generally applicable facts.
- Do not claim that an assistance program is open; direct customers to its official status page.
- No affordability, qualification, supported-price, or underwriting calculator.
- No new animation vocabulary; native details/summary behavior is sufficient.
- Preserve the existing paper, forest, red, typography, source panel, disclaimers, compliance footer, and reduced-motion behavior.
- Guide body must remain between 700 and 1,200 words and contain no exclamation marks.

---

## File structure

- Create `src/content/guides/first-time-homebuyer.md`: durable educational copy, sources, review date, and published status.
- Create `src/components/FirstTimeBuyerTools.astro`: expandable roadmap and glossary only.
- Modify `src/pages/guides/[slug].astro`: render the component only for `first-time-homebuyer`.
- Create `scripts/first-time-buyer.test.mjs`: route, content, and prohibited-calculator contract.
- Modify `scripts/lint-content.mjs`: add the guide to the required published inventory.
- Modify `PRODUCT.md`: update current inventory from 10 guides/27 routes to 11 guides/28 routes.
- Modify `README.md`: update inventory and verification instructions.

### Task 1: Define the buyer-guide publishing contract

**Files:**
- Create: `scripts/first-time-buyer.test.mjs`

**Interfaces:**
- Tests the expected source files and route hook by reading repository files directly.
- Produces no runtime interface.

- [ ] **Step 1: Write the failing contract tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('publishes the first-time buyer guide through the guide route', () => {
  const guide = readFileSync('src/content/guides/first-time-homebuyer.md', 'utf8');
  const route = readFileSync('src/pages/guides/[slug].astro', 'utf8');
  assert.match(guide, /^slug: ["']?first-time-homebuyer["']?$/m);
  assert.match(guide, /^status: ["']?published["']?$/m);
  assert.match(route, /FirstTimeBuyerTools/);
  assert.match(route, /entry\.data\.slug === ['"]first-time-homebuyer['"]/);
});

test('does not ship qualification-like calculator language or inputs', () => {
  const component = readFileSync('src/components/FirstTimeBuyerTools.astro', 'utf8');
  const guide = readFileSync('src/content/guides/first-time-homebuyer.md', 'utf8');
  const combined = `${guide}\n${component}`;
  assert.doesNotMatch(combined, /28\s*\/\s*36|supported home price|estimated home price|affordability calculator/i);
  assert.doesNotMatch(component, /type=["']range["']|annual household income|other monthly debts/i);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/first-time-buyer.test.mjs`
Expected: FAIL because the guide and safe component do not exist.

- [ ] **Step 3: Commit the red contract test**

```bash
git add scripts/first-time-buyer.test.mjs
git commit -m "Test first-time buyer guide boundaries"
```

### Task 2: Verify the source set before authoring

**Files:**
- Modify only if evidence requires it: `scripts/manual-link-verifications.json`
- Produce temporary report: `/tmp/first-time-buyer-links.json` (do not commit)

**Candidate official URLs:**

- `https://www.consumerfinance.gov/owning-a-home/`
- `https://www.consumerfinance.gov/ask-cfpb/what-is-a-loan-estimate-en-1995/`
- `https://www.consumerfinance.gov/ask-cfpb/what-is-a-closing-disclosure-en-1983/`
- `https://www.trec.texas.gov/article/what-changes-2026-about-buyertenant-representation-texas`
- `https://www.hud.gov/housing-counseling`
- `https://houstontx.gov/housing/hap.html`
- `https://www.tdi.texas.gov/title/index.html`

- [ ] **Step 1: Check every candidate automatically**

Run the external checker against a temporary Markdown fixture containing the five URLs, or expose a CLI `--url-file` input if Task 3 of the link-gate plan already supports it. Record final URL, status, and classification.

- [ ] **Step 2: Verify inconclusive government results normally**

Open the exact URL in a normal browser. Keep it only if it loads and supports the planned label. Add a dated manual verification only for an inconclusive automated result that works normally.

- [ ] **Step 3: Resolve source decisions**

- Keep working official URLs.
- Replace redirected URLs with the verified final official destination.
- Remove confirmed broken URLs.
- Do not substitute an aggregator.
- The City HAP label must be `City of Houston — Homebuyer Assistance Program status`; guide copy must say customers should check current status and must not state an amount or availability.

- [ ] **Step 4: Re-run source checks**

Expected: zero confirmed broken sources; remaining inconclusive government sources have nonexpired manual evidence.

### Task 3: Author the durable guide and safe roadmap component

**Files:**
- Create: `src/content/guides/first-time-homebuyer.md`
- Create: `src/components/FirstTimeBuyerTools.astro`
- Modify: `src/pages/guides/[slug].astro`

**Interfaces:**
- `FirstTimeBuyerTools.astro` accepts no props.
- The guide uses `disclaimerIds: ["general"]`, empty related arrays unless existing published routes are editorially necessary, verified sources, `updatedAt: "2026-07-31"`, and `status: "published"`.

- [ ] **Step 1: Create the minimal route hook and no-calculator component**

Import `FirstTimeBuyerTools` in `[slug].astro` and render:

```astro
{entry.data.slug === 'first-time-homebuyer' && <FirstTimeBuyerTools />}
```

Create the component with two sections only: an eight-step native `<details>` roadmap and a glossary. Do not add client-side JavaScript.

- [ ] **Step 2: Write the guide in this exact durable sequence**

1. Start with personal readiness and questions, not a price estimate.
2. Explain that financing terms and eligibility require a licensed lender's current review.
3. Explain Texas representation or qualifying non-representation before touring, using current TREC guidance.
4. Explain property search as address-level verification: taxes, insurance, flood information, restrictions, condition, and recurring costs vary.
5. Distinguish offer terms, inspection, appraisal, title work, and lender review without universal percentages.
6. Explain Loan Estimate and closing-document review through CFPB education without quoting changing rate or fee figures.
7. Describe assistance pages as status-check destinations, not promised benefits.
8. Explain wire-fraud precautions: use independently known contact information and distrust changed instructions.

Keep the body between 800 and 1,050 words to leave editing room inside the 700–1,200 contract.

- [ ] **Step 3: Run the buyer contract and content gates**

Run: `node --test scripts/first-time-buyer.test.mjs && node scripts/lint-content.mjs && node scripts/lint-language.mjs && node scripts/lint-voice.mjs`
Expected: all pass. If the guide is outside the word range, edit copy without adding numeric lending rules.

- [ ] **Step 4: Run the internal and external link gates**

Run: `npm run check:internal-links && npm run check:external-links -- --output /tmp/first-time-buyer-links.json`
Expected: no confirmed broken links.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/content/guides/first-time-homebuyer.md src/components/FirstTimeBuyerTools.astro 'src/pages/guides/[slug].astro' scripts/manual-link-verifications.json
git commit -m "Add safe first-time buyer guide"
```

### Task 4: Make the new guide part of the maintained inventory

**Files:**
- Modify: `scripts/lint-content.mjs`
- Modify: `scripts/lint-content.test.mjs`
- Modify: `PRODUCT.md`
- Modify: `README.md`

**Interfaces:**
- Adds `first-time-homebuyer.md` to `REQUIRED_PHASE1.guides`.
- Updates product truth to 11 guides and 28 routes.

- [ ] **Step 1: Write a failing required-inventory assertion**

Add:

```js
test('requires the published first-time buyer guide', () => {
  assert.ok(REQUIRED_PHASE1.guides.includes('first-time-homebuyer.md'));
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/lint-content.test.mjs`
Expected: FAIL because the guide is not yet in `REQUIRED_PHASE1`.

- [ ] **Step 3: Add the guide to the inventory and update docs**

Update both `PRODUCT.md` and `README.md` from 10 guides/27 routes to 11 guides/28 routes. Do not describe unmerged or draft content as published elsewhere.

- [ ] **Step 4: Run and verify GREEN**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit Task 4**

```bash
git add scripts/lint-content.mjs scripts/lint-content.test.mjs PRODUCT.md README.md
git commit -m "Maintain first-time buyer guide inventory"
```

### Task 5: Full build and rendered-route verification

**Files:**
- No planned source changes; fix only evidence-backed failures in files introduced by Tasks 1–4.

- [ ] **Step 1: Run the complete verification chain**

Run:

```bash
npm test
npm run check:internal-links
npm run build
npm run check:external-links -- --output /tmp/houston-external-links.json
```

Expected: tests and build exit 0; external report has zero confirmed broken links.

- [ ] **Step 2: Verify generated HTML**

Run:

```bash
test -f dist/guides/first-time-homebuyer/index.html
rg -n "First-time|first-time|Terms worth knowing|What happens next" dist/guides/first-time-homebuyer/index.html
! rg -n "28/36|supported home price|affordability calculator|type=\"range\"" dist/guides/first-time-homebuyer/index.html
```

Expected: route exists, roadmap/glossary content is rendered, and calculator markers are absent.

- [ ] **Step 3: Review the rendered page at mobile and desktop widths**

Verify native details controls, keyboard focus, source panel, compliance footer, and no overflow. This is a visual acceptance check, not a redesign pass.

- [ ] **Step 4: Commit any evidence-backed verification correction**

If no correction is needed, do not create an empty commit. If needed:

```bash
git add <only-the-corrected-files>
git commit -m "Fix buyer guide verification issue"
```
