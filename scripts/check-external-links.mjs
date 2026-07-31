export function classifyStatus(status) {
  if (status >= 200 && status < 400) return 'working';
  if (status === 403 || status === 429 || (status >= 500 && status < 600)) {
    return 'inconclusive';
  }
  return 'broken';
}

function result(url, classification, status, finalUrl, detail) {
  return { url, classification, status, finalUrl, detail };
}

function isRedirectLoopError(error) {
  const seen = new Set();
  let cause = error?.cause;

  while (cause && typeof cause === 'object' && !seen.has(cause)) {
    seen.add(cause);
    if (
      /^(ERR_TOO_MANY_REDIRECTS|ERR_FR_TOO_MANY_REDIRECTS|UND_ERR_TOO_MANY_REDIRECTS)$/.test(cause.code ?? '') ||
      /\b(?:too many redirects|redirect loop|redirect (?:count|limit) (?:exceeded|reached)|maximum redirects?)\b/i.test(cause.message ?? '')
    ) {
      return true;
    }
    cause = cause.cause;
  }

  return false;
}

export async function checkUrl(url, { fetchImpl = fetch, timeoutMs = 12_000 } = {}) {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return result(url, 'broken', null, null, 'Unsupported URL protocol');
    }
  } catch {
    return result(url, 'broken', null, null, 'Invalid URL');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'JWILLSOLDIT-LinkChecker/1.0 (+https://www.jwillsoldit.com/)' },
    });
    return result(
      url,
      classifyStatus(response.status),
      response.status,
      response.url || url,
      `HTTP ${response.status}`,
    );
  } catch (error) {
    if (isRedirectLoopError(error)) {
      return result(url, 'broken', null, null, 'Redirect loop');
    }
    const detail = controller.signal.aborted ? 'Request timed out' : `Request failed: ${error?.message ?? 'unknown error'}`;
    return result(url, 'inconclusive', null, null, detail);
  } finally {
    clearTimeout(timeout);
  }
}

function isExternalUrl(href) {
  if (normalizeInternalPath(href)) return false;
  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function hasRecentManualVerification(url, manualVerifications, now) {
  const verification = manualVerifications?.[url];
  if (!verification?.verifiedAt) return false;

  const verifiedAt = new Date(`${verification.verifiedAt}T00:00:00.000Z`);
  const ageMs = new Date(now).getTime() - verifiedAt.getTime();
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= 30 * 24 * 60 * 60 * 1000;
}

export async function checkExternalLinks(references, options = {}) {
  const grouped = new Map();

  for (const reference of references) {
    if (!isExternalUrl(reference.href)) continue;
    const referrers = grouped.get(reference.href) ?? new Set();
    referrers.add(reference.filePath);
    grouped.set(reference.href, referrers);
  }

  const urls = [...grouped.keys()].sort();
  const now = options.now ?? new Date().toISOString();
  const results = new Array(urls.length);
  let nextIndex = 0;
  const workerCount = Math.min(5, urls.length);

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < urls.length) {
      const index = nextIndex++;
      const url = urls[index];
      const checked = await checkUrl(url, options);
      if (checked.classification === 'inconclusive' && hasRecentManualVerification(url, options.manualVerifications, now)) {
        checked.classification = 'manual-working';
        checked.detail = `${checked.detail}; manually verified within 30 days`;
      }
      results[index] = {
        ...checked,
        referrers: [...grouped.get(url)].sort(),
      };
    }
  }));

  const totals = { working: 0, broken: 0, inconclusive: 0, 'manual-working': 0 };
  for (const urlResult of results) totals[urlResult.classification] += 1;

  return { generatedAt: new Date(now).toISOString(), totals, results };
}

export function parseOutputPath(args) {
  if (args.length === 0) return null;
  if (args[0] === '--output' && !args[1]) throw new Error('--output requires a path');
  if (args.length !== 2 || args[0] !== '--output') {
    throw new Error('Usage: check-external-links.mjs --output <path>');
  }
  return args[1];
}

async function findMarkdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findMarkdownFiles(entryPath));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(entryPath);
  }
  return files;
}

async function readContentReferences(root) {
  const files = await findMarkdownFiles(path.join(root, 'src/content'));
  const references = [];
  for (const filePath of files) {
    const text = await readFile(filePath, 'utf8');
    const relativePath = path.relative(root, filePath).split(path.sep).join('/');
    references.push(...extractLinkReferences(text, relativePath));
  }
  return references;
}

async function main() {
  const outputPath = parseOutputPath(process.argv.slice(2));
  if (!outputPath) throw new Error('Usage: check-external-links.mjs --output <path>');

  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const manualVerifications = JSON.parse(await readFile(path.join(scriptDirectory, 'manual-link-verifications.json'), 'utf8'));
  const report = await checkExternalLinks(await readContentReferences(process.cwd()), { manualVerifications });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`external links: ${report.totals.working} working, ${report.totals['manual-working']} manually verified, ${report.totals.inconclusive} inconclusive, ${report.totals.broken} broken`);
  for (const urlResult of report.results) {
    if (urlResult.classification === 'inconclusive') console.warn(`inconclusive: ${urlResult.url} (${urlResult.detail})`);
  }
  if (report.totals.broken > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { extractLinkReferences, normalizeInternalPath } from './link-inventory.mjs';
