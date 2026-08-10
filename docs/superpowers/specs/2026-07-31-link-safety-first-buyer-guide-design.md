# Houston Link Safety and First-Time Buyer Guide Design

Date: 2026-07-31
Status: Approved direction, awaiting written-spec review
Repository: `d8dles/jwillsoldit-houston`

## Objective

Add a publishing safeguard that blocks broken internal links, checks external links without misclassifying government bot protection as a broken page, and supports a rewritten first-time-buyer guide containing only maintainable claims and working official resources.

## Approaches considered

### 1. Split enforcement and reporting — selected

- Internal links are deterministic and block the build when invalid.
- External links are checked on a scheduled workflow and produce a durable report.
- A confirmed `404` or `410` is broken.
- Timeouts, `403`, `429`, and bot challenges are inconclusive and require a normal-browser verification.
- An official government link that works normally may remain with a recorded manual verification date.

This is strict where the repository controls the outcome and evidence-based where third-party servers behave inconsistently.

### 2. Block builds for every external failure

Rejected because official government sites may throttle automation or return bot challenges while remaining usable to customers. This would create false release failures.

### 3. Report all failures without blocking

Rejected because broken internal routes are fully under project control and should never publish.

## Scope

### Included

- Markdown links in Houston content.
- Structured URLs in `sources`, school districts, nearby items, and other content frontmatter.
- Internal Houston routes and known parent-brand destinations.
- Scheduled external-link checks with status classification.
- A rewritten first-time-buyer guide on current `main`.
- The buyer roadmap and glossary presentation, if they remain useful without a qualification calculator.

### Excluded

- Automatic scraping of assistance amounts, rates, income limits, eligibility rules, or application status.
- An affordability, qualification, DTI, or supported-purchase-price calculator.
- Automatic editing or deletion of published content.
- Placeholder links, aggregator links when an official source exists, and unverified Houston-specific program claims.
- A CMS, database, browser service, or new public methodology page.

## Architecture

### Internal link gate

A local Node script extracts internal links from content and structured frontmatter, resolves them against the current published content inventory and static routes, and returns a nonzero exit code for missing destinations. It runs in `npm test` and the production build.

The checker must understand the `/houston` base path, trailing-slash differences, and fragment identifiers. A fragment does not make an otherwise valid route invalid. Draft content cannot satisfy a public link.

### External link checker

A separate Node script inventories external HTTP and HTTPS URLs and checks them with bounded concurrency, a clear user agent, redirects enabled, and finite timeouts. It writes a machine-readable JSON report and a concise console summary.

Status classes:

- `working`: successful response or valid redirect destination.
- `broken`: confirmed `404`, `410`, invalid URL, or redirect loop.
- `inconclusive`: timeout, DNS/transient network failure, `403`, `429`, `5xx`, or bot challenge.
- `manual-working`: an inconclusive official source that was verified in a normal browser, with a verification date and note in a small repository allowlist.

The scheduled workflow fails only for confirmed broken links. Inconclusive links remain visible in the report and require review. The workflow never rewrites content.

### Scheduled workflow

GitHub Actions runs the external checker weekly and on manual dispatch. It uploads the JSON report as an artifact and fails on confirmed broken destinations. Pull-request builds continue to rely on the deterministic internal gate; they do not depend on every external server being available.

## First-time-buyer guide

The guide is a chronological education page, not a lending tool.

### Keep

- Preparing questions before speaking with a lender.
- Understanding cash categories without universal percentage promises.
- The distinction among representation, pre-approval, offer, inspection, appraisal, title/closing, and post-closing responsibilities.
- Texas's current representation boundary before touring property.
- Wire-fraud precautions using known, independently verified contact information.
- A concise glossary and visible source/review panel.

### Remove or avoid

- Fixed DTI, credit-score, down-payment, closing-cost, or earnest-money rules presented as broadly applicable.
- Statements that a program is currently open unless the status comes from a dependable official source and is verified for display.
- Assistance amounts written as evergreen facts.
- Subjective claims such as how much of Houston qualifies for a loan program.
- The 28/36 affordability calculator and hard-coded tax or insurance allowances.

### Program links

Use an official government or official program-administrator page when it works in a normal browser. Before publication:

1. Check the destination automatically.
2. Open government destinations normally when automation returns an inconclusive status.
3. Record the access date already required by the content schema.
4. Do not repeat changing program data unless a reliable official feed can update it automatically.
5. Remove or replace a confirmed broken link.

## Data flow

1. An editor adds or changes content.
2. Tests validate schemas, language, voice, content contracts, and internal links.
3. The build stops on an invalid internal route.
4. The scheduled external check inventories current published URLs.
5. Working, broken, and inconclusive results are recorded separately.
6. Confirmed broken links are fixed or removed; government bot blocks receive browser verification.
7. No checker edits customer-facing content automatically.

## Error handling

- Network errors are not silently converted into success.
- A `403` or `429` is not treated as proof that a page is broken.
- Redirects are followed within a finite limit and the final destination is recorded.
- Duplicate URLs are checked once and mapped back to every source file that uses them.
- Reports identify the URL, status class, HTTP result or error, and all referring files.
- Manual exceptions expire after a defined review interval so they cannot become permanent unverified bypasses.

## Testing

Implementation follows red-green-refactor.

### Internal checker tests

- Resolves valid published guide, area, and region routes.
- Rejects a missing route.
- Rejects a link satisfied only by draft content.
- Normalizes `/houston`, trailing slashes, and fragments.
- Reports every referring file for a repeated broken URL.

### External checker tests

- Classifies `200` and valid redirects as working.
- Classifies `404` and `410` as broken.
- Classifies `403`, `429`, timeout, and `5xx` as inconclusive.
- Honors a nonexpired manual verification only for an exact URL.
- Rejects expired manual verification records.
- Deduplicates checks while preserving all referrers.

### Content verification

- Existing language, voice, schema, and content tests remain green.
- The first-time-buyer guide passes the 700–1,200-word contract.
- All guide sources are inventoried by the external checker.
- The production build renders the guide route with no calculator markup.

## Acceptance criteria

- A broken internal content link causes local tests and the production build to fail.
- The weekly external check distinguishes confirmed broken links from inconclusive government responses.
- A government URL is retained only when automatic or normal-browser verification shows it works.
- The checker never edits content automatically.
- The first-time-buyer guide contains no qualification-like calculator or volatile evergreen program amounts.
- The full Houston build passes and the new route is verified in generated HTML before merge.
