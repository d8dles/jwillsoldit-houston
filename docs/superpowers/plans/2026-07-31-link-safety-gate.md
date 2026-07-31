# Houston Link Safety Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent broken internal Houston links from publishing and produce a scheduled, evidence-based report for external links without misclassifying government bot protection as a broken page.

**Architecture:** A deterministic local checker inventories content links and resolves same-site Houston routes against published content, failing tests and builds for missing destinations. A separate network checker deduplicates external URLs, classifies responses as working, broken, inconclusive, or manually verified, writes JSON, and runs weekly in GitHub Actions without editing content.

**Tech Stack:** Node.js 22+, ESM, `node:test`, built-in `fetch`, Astro content files, GitHub Actions.

## Global Constraints

- Internal broken links block tests and production builds.
- External `404`, `410`, invalid URL, and redirect loops are confirmed broken.
- External timeouts, DNS/transient failures, `403`, `429`, `5xx`, and bot challenges are inconclusive.
- An inconclusive official government URL may remain only after normal-browser verification with an exact URL and dated record.
- Manual verification expires after 30 days.
- The checker never edits customer-facing content.
- No new runtime dependency, CMS, database, or browser service.
- Follow red-green-refactor for every production function.

---

## File structure

- Create `scripts/link-inventory.mjs`: content discovery, URL extraction, route normalization, and internal-link validation.
- Create `scripts/link-inventory.test.mjs`: deterministic inventory and internal-route tests.
- Create `scripts/check-internal-links.mjs`: CLI that exits nonzero for broken internal links.
- Create `scripts/check-external-links.mjs`: response classification, bounded URL checking, manual-verification handling, JSON output, and CLI exit behavior.
- Create `scripts/check-external-links.test.mjs`: network-classification tests using injected `fetch` functions.
- Create `scripts/manual-link-verifications.json`: exact-URL, dated manual evidence records; initially `{}`.
- Create `.github/workflows/external-links.yml`: weekly and manual scheduled report.
- Modify `package.json`: expose internal and external commands and add the internal gate to `build`.
- Modify `README.md`: describe the commands and external-status meanings.

### Task 1: Content link inventory and internal route validation

**Files:**
- Create: `scripts/link-inventory.test.mjs`
- Create: `scripts/link-inventory.mjs`

**Interfaces:**
- Produces: `extractLinkReferences(text: string, filePath: string): LinkReference[]`
- Produces: `normalizeInternalPath(href: string): string | null`
- Produces: `buildPublishedRoutes(entries: ContentEntry[]): Set<string>`
- Produces: `validateInternalLinks(references: LinkReference[], routes: Set<string>): LinkViolation[]`
- `LinkReference`: `{ href: string, filePath: string, field: 'markdown' | 'frontmatter' }`
- `ContentEntry`: `{ collection: 'guides' | 'areas' | 'regions', slug: string, status?: 'draft' | 'published' }`
- `LinkViolation`: `{ href: string, normalizedPath: string, referrers: string[] }`

- [ ] **Step 1: Write failing extraction and normalization tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractLinkReferences,
  normalizeInternalPath,
} from './link-inventory.mjs';

test('extracts markdown and structured frontmatter links', () => {
  const text = `---\nsource:\n  url: "https://houstontx.gov/housing/hap.html"\nnearby:\n  officialUrl: "https://www.houstontx.gov/parks"\n---\nRead [property taxes](/houston/guides/property-taxes#exemptions).`;
  assert.deepEqual(extractLinkReferences(text, 'src/content/guides/test.md'), [
    { href: 'https://houstontx.gov/housing/hap.html', filePath: 'src/content/guides/test.md', field: 'frontmatter' },
    { href: 'https://www.houstontx.gov/parks', filePath: 'src/content/guides/test.md', field: 'frontmatter' },
    { href: '/houston/guides/property-taxes#exemptions', filePath: 'src/content/guides/test.md', field: 'markdown' },
  ]);
});

test('normalizes Houston paths, trailing slashes, and fragments', () => {
  assert.equal(normalizeInternalPath('/houston/guides/property-taxes/#exemptions'), '/houston/guides/property-taxes');
  assert.equal(normalizeInternalPath('https://www.jwillsoldit.com/houston/areas/katy/'), '/houston/areas/katy');
  assert.equal(normalizeInternalPath('https://houstontx.gov/housing/hap.html'), null);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test scripts/link-inventory.test.mjs`  
Expected: FAIL because `scripts/link-inventory.mjs` does not exist.

- [ ] **Step 3: Implement only extraction and normalization**

Implement frontmatter keys `url`, `officialUrl`, and `href`; Markdown `[label](href)` links; same-site absolute URLs; `/houston` base normalization; fragment removal; query preservation only for external URLs. Treat only `/houston` routes as locally resolvable. Keep absolute `www.jwillsoldit.com` destinations outside `/houston` in the external inventory so the Houston repository does not pretend to own Hub routes.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `node --test scripts/link-inventory.test.mjs`  
Expected: 2 tests pass.

- [ ] **Step 5: Write failing published-route tests**

```js
test('accepts published routes and rejects missing or draft destinations', () => {
  const routes = buildPublishedRoutes([
    { collection: 'guides', slug: 'property-taxes', status: 'published' },
    { collection: 'guides', slug: 'draft-guide', status: 'draft' },
    { collection: 'areas', slug: 'katy', status: 'published' },
  ]);
  const violations = validateInternalLinks([
    { href: '/houston/guides/property-taxes', filePath: 'a.md', field: 'markdown' },
    { href: '/houston/guides/draft-guide', filePath: 'b.md', field: 'markdown' },
    { href: '/houston/areas/missing', filePath: 'c.md', field: 'markdown' },
    { href: '/houston/areas/missing#facts', filePath: 'd.md', field: 'markdown' },
  ], routes);
  assert.deepEqual(violations, [
    { href: '/houston/areas/missing', normalizedPath: '/houston/areas/missing', referrers: ['c.md', 'd.md'] },
    { href: '/houston/guides/draft-guide', normalizedPath: '/houston/guides/draft-guide', referrers: ['b.md'] },
  ]);
});
```

- [ ] **Step 6: Run and verify RED**

Run: `node --test scripts/link-inventory.test.mjs`  
Expected: FAIL because route inventory and grouped violations are not implemented.

- [ ] **Step 7: Implement route inventory and grouped violations**

Always include `/houston` and `/houston/guides`. Add only published guide and area routes. Region entries have no `status`, so include every valid region route. Sort violations by normalized path and sort each referrer list.

- [ ] **Step 8: Run and verify GREEN**

Run: `node --test scripts/link-inventory.test.mjs`  
Expected: all inventory tests pass.

- [ ] **Step 9: Commit Task 1**

```bash
git add scripts/link-inventory.mjs scripts/link-inventory.test.mjs
git commit -m "Add Houston content link inventory"
```

### Task 2: Internal-link CLI and build gate

**Files:**
- Create: `scripts/check-internal-links.mjs`
- Modify: `package.json`
- Test: `scripts/link-inventory.test.mjs`

**Interfaces:**
- Consumes the four exports from Task 1.
- Produces CLI output `internal links clean (<N> references)` or `Internal link violations:\n...`.

- [ ] **Step 1: Add a failing fixture-level test**

Add a temporary-directory test that writes one published guide and a second file linking to a missing guide, calls `scanInternalLinks(root)`, and expects one grouped violation. Export `scanInternalLinks(root = process.cwd())` from `check-internal-links.mjs`.

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/link-inventory.test.mjs`  
Expected: FAIL because `check-internal-links.mjs` does not exist.

- [ ] **Step 3: Implement the minimal CLI**

Recursively read `src/content/**/*.md`, parse collection, slug, and `status`, inventory links, validate internal destinations, print grouped evidence, and set exit code 1 only when violations exist.

- [ ] **Step 4: Run focused and full tests**

Run: `node --test scripts/link-inventory.test.mjs && npm test`  
Expected: all tests pass.

- [ ] **Step 5: Add scripts and build integration**

Set:

```json
{
  "scripts": {
    "check:internal-links": "node scripts/check-internal-links.mjs",
    "check:external-links": "node scripts/check-external-links.mjs",
    "build": "node scripts/lint-language.mjs && node scripts/lint-voice.mjs && node scripts/lint-content.mjs && node scripts/check-internal-links.mjs && node node_modules/astro/bin/astro.mjs check && node node_modules/astro/bin/astro.mjs build"
  }
}
```

Create the external command now only after Task 3 creates its target file; until then add only `check:internal-links` and the build insertion.

- [ ] **Step 6: Run the actual internal gate and build**

Run: `npm run check:internal-links && npm run build`  
Expected: internal links clean; build succeeds.

- [ ] **Step 7: Commit Task 2**

```bash
git add scripts/check-internal-links.mjs scripts/link-inventory.test.mjs package.json
git commit -m "Block builds on broken internal links"
```

### Task 3: External response classification and deduplicated checks

**Files:**
- Create: `scripts/check-external-links.test.mjs`
- Create: `scripts/check-external-links.mjs`
- Create: `scripts/manual-link-verifications.json`
- Modify: `package.json`

**Interfaces:**
- Produces: `classifyStatus(status: number): 'working' | 'broken' | 'inconclusive'`
- Produces: `checkUrl(url: string, options: { fetchImpl?: typeof fetch, timeoutMs?: number }): Promise<UrlResult>`
- Produces: `checkExternalLinks(references: LinkReference[], options): Promise<LinkReport>`
- `UrlResult`: `{ url: string, classification: 'working' | 'broken' | 'inconclusive' | 'manual-working', status: number | null, finalUrl: string | null, detail: string }`
- `LinkReport`: `{ generatedAt: string, totals: Record<string, number>, results: Array<UrlResult & { referrers: string[] }> }`

- [ ] **Step 1: Write failing classification tests**

```js
test('classifies HTTP evidence without treating bot blocks as broken', () => {
  assert.equal(classifyStatus(200), 'working');
  assert.equal(classifyStatus(301), 'working');
  assert.equal(classifyStatus(404), 'broken');
  assert.equal(classifyStatus(410), 'broken');
  assert.equal(classifyStatus(403), 'inconclusive');
  assert.equal(classifyStatus(429), 'inconclusive');
  assert.equal(classifyStatus(503), 'inconclusive');
  assert.equal(classifyStatus(401), 'broken');
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/check-external-links.test.mjs`  
Expected: FAIL because the implementation module does not exist.

- [ ] **Step 3: Implement `classifyStatus` only**

Use `200–399 => working`, `404/410` and remaining `400–499` except `403/429 => broken`, `403/429/500–599 => inconclusive`.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test scripts/check-external-links.test.mjs`  
Expected: classification test passes.

- [ ] **Step 5: Write failing fetch, timeout, and deduplication tests**

Use injected real functions, not a mocking library:

```js
const calls = [];
const fetchImpl = async (url) => {
  calls.push(url);
  if (url.endsWith('/ok')) return new Response('', { status: 200 });
  if (url.endsWith('/gone')) return new Response('', { status: 410 });
  throw new TypeError('network failed');
};
```

Assert duplicate URLs are fetched once, every referrer is retained, and thrown network failures are inconclusive.

- [ ] **Step 6: Run and verify RED**

Run: `node --test scripts/check-external-links.test.mjs`  
Expected: FAIL because `checkUrl` and `checkExternalLinks` are missing.

- [ ] **Step 7: Implement minimal URL checks**

Use `redirect: 'follow'`, an `AbortController`, default timeout `12_000`, and user agent `JWILLSOLDIT-LinkChecker/1.0 (+https://www.jwillsoldit.com/)`. Limit concurrency to 5 with a simple worker queue. Invalid URLs and redirect loops are broken; thrown network errors and aborts are inconclusive.

- [ ] **Step 8: Add failing manual-verification tests**

Use a fixed `now` and assert an exact URL verified 29 days ago becomes `manual-working` only after an inconclusive automated result; a record 31 days old remains inconclusive; a verification never overrides a confirmed `404`.

- [ ] **Step 9: Implement manual verification and CLI output**

Use JSON shape:

```json
{
  "https://example.gov/page": {
    "verifiedAt": "2026-07-31",
    "note": "Opened in a normal browser after automated 403"
  }
}
```

Add `--output <path>` parsing, write JSON before setting exit code, exit 1 only when `broken > 0`, and print inconclusive URLs as warnings.

- [ ] **Step 10: Run focused and full tests**

Run: `node --test scripts/check-external-links.test.mjs && npm test`  
Expected: all tests pass.

- [ ] **Step 11: Add package command and commit Task 3**

```bash
git add scripts/check-external-links.mjs scripts/check-external-links.test.mjs scripts/manual-link-verifications.json package.json
git commit -m "Add evidence-based external link checks"
```

### Task 4: Scheduled external-link report

**Files:**
- Create: `.github/workflows/external-links.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: `npm run check:external-links -- --output artifacts/external-links.json`
- Produces: workflow artifact `external-link-report`.

- [ ] **Step 1: Write the workflow**

```yaml
name: External link check

on:
  schedule:
    - cron: '17 12 * * 1'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  links:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: mkdir -p artifacts
      - run: npm run check:external-links -- --output artifacts/external-links.json
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: external-link-report
          path: artifacts/external-links.json
          if-no-files-found: error
```

- [ ] **Step 2: Document status policy**

Add commands, the four status meanings, 30-day manual evidence expiry, and the rule that the checker never edits content.

- [ ] **Step 3: Validate YAML and actual external check**

Run: `npm run check:external-links -- --output /tmp/houston-external-links.json`  
Expected: JSON is written; confirmed broken links cause exit 1; inconclusive results are printed separately.

Run: `node -e "JSON.parse(require('fs').readFileSync('/tmp/houston-external-links.json','utf8')); console.log('report valid')"`  
Expected: `report valid`.

- [ ] **Step 4: Review every confirmed broken result**

For each confirmed `404` or `410`, open the URL normally. If still broken, replace it with a verified official destination or remove it. Never add a manual exception for confirmed broken status.

- [ ] **Step 5: Record only verified government bot blocks**

For each official government `403`, `429`, timeout, or bot challenge, open the exact URL in a normal browser. Add a manual record only when the page loads and the content matches the link label.

- [ ] **Step 6: Re-run the report and full build**

Run: `npm test && npm run build && npm run check:external-links -- --output /tmp/houston-external-links.json`  
Expected: tests/build pass and the report contains zero confirmed broken links.

- [ ] **Step 7: Commit Task 4**

```bash
git add .github/workflows/external-links.yml README.md scripts/manual-link-verifications.json src/content
git commit -m "Schedule Houston external link review"
```
