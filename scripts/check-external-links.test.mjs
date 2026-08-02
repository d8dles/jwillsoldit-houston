import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
  checkExternalLinks,
  checkUrl,
  classifyStatus,
  parseOutputPath,
  readExternalContentReferences,
} from './check-external-links.mjs';

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

test('checks URL responses and classifies network failures as inconclusive', async () => {
  const fetchImpl = async (url) => {
    if (url.endsWith('/ok')) return new Response('', { status: 200 });
    if (url.endsWith('/gone')) return new Response('', { status: 410 });
    throw new TypeError('network failed');
  };

  assert.deepEqual(await checkUrl('https://example.gov/ok', { fetchImpl }), {
    url: 'https://example.gov/ok',
    classification: 'working',
    status: 200,
    finalUrl: 'https://example.gov/ok',
    detail: 'HTTP 200',
  });
  assert.equal((await checkUrl('https://example.gov/gone', { fetchImpl })).classification, 'broken');
  assert.equal((await checkUrl('https://example.gov/unreachable', { fetchImpl })).classification, 'inconclusive');
});

test('distinguishes unrelated redirect errors from a redirect-loop cause chain', async () => {
  const unrelatedRedirect = await checkUrl('https://example.gov/unreachable', {
    fetchImpl: async () => { throw new TypeError('network redirect failed'); },
  });
  const redirectLoop = await checkUrl('https://example.gov/loop', {
    fetchImpl: async () => {
      throw new TypeError('fetch failed', { cause: new Error('redirect count exceeded') });
    },
  });

  assert.equal(unrelatedRedirect.classification, 'inconclusive');
  assert.equal(redirectLoop.classification, 'broken');
  assert.equal(redirectLoop.detail, 'Redirect loop');
});

test('marks an aborted URL check as inconclusive', async () => {
  const fetchImpl = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')));
  });

  const result = await checkUrl('https://example.gov/slow', { fetchImpl, timeoutMs: 1 });
  assert.equal(result.classification, 'inconclusive');
  assert.equal(result.status, null);
});

test('checks duplicate external URLs once and retains every referrer', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.endsWith('/ok')) return new Response('', { status: 200 });
    if (url.endsWith('/gone')) return new Response('', { status: 410 });
    throw new TypeError('network failed');
  };
  const report = await checkExternalLinks([
    { href: 'https://example.gov/ok', filePath: 'a.md', field: 'markdown' },
    { href: 'https://example.gov/ok', filePath: 'b.md', field: 'frontmatter' },
    { href: 'https://example.gov/gone', filePath: 'c.md', field: 'markdown' },
    { href: 'https://example.gov/unreachable', filePath: 'd.md', field: 'markdown' },
    { href: '/houston/guides/property-taxes', filePath: 'e.md', field: 'markdown' },
  ], { fetchImpl });

  assert.deepEqual(calls.sort(), [
    'https://example.gov/gone',
    'https://example.gov/ok',
    'https://example.gov/unreachable',
  ]);
  assert.deepEqual(report.totals, { working: 1, broken: 1, inconclusive: 1, 'manual-working': 0 });
  assert.deepEqual(report.results.map(({ url, classification, referrers }) => ({ url, classification, referrers })), [
    { url: 'https://example.gov/gone', classification: 'broken', referrers: ['c.md'] },
    { url: 'https://example.gov/ok', classification: 'working', referrers: ['a.md', 'b.md'] },
    { url: 'https://example.gov/unreachable', classification: 'inconclusive', referrers: ['d.md'] },
  ]);
});

test('reports malformed HTTP-like destinations as broken', async () => {
  const report = await checkExternalLinks([
    { href: 'https://%', filePath: 'broken.md', field: 'frontmatter' },
  ], {
    fetchImpl: async () => { throw new Error('invalid URL should not be fetched'); },
  });

  assert.deepEqual(report.totals, { working: 0, broken: 1, inconclusive: 0, 'manual-working': 0 });
  assert.deepEqual(report.results.map(({ url, classification, detail, referrers }) => ({ url, classification, detail, referrers })), [
    { url: 'https://%', classification: 'broken', detail: 'Invalid URL', referrers: ['broken.md'] },
  ]);
});

test('uses a recent manual verification only for inconclusive automated results', async () => {
  const fetchImpl = async (url) => new Response('', { status: url.endsWith('/missing') ? 404 : 403 });
  const report = await checkExternalLinks([
    { href: 'https://example.gov/recent', filePath: 'recent.md', field: 'markdown' },
    { href: 'https://example.gov/stale', filePath: 'stale.md', field: 'markdown' },
    { href: 'https://example.gov/missing', filePath: 'missing.md', field: 'markdown' },
  ], {
    fetchImpl,
    now: '2026-07-31T00:00:00.000Z',
    manualVerifications: {
      'https://example.gov/recent': { verifiedAt: '2026-07-02', note: 'Opened in a normal browser after automated 403', officialGovernment: true },
      'https://example.gov/stale': { verifiedAt: '2026-06-30', note: 'Older browser check', officialGovernment: true },
      'https://example.gov/missing': { verifiedAt: '2026-07-02', note: 'Cannot override a confirmed 404', officialGovernment: true },
    },
  });

  assert.deepEqual(report.results.map(({ url, classification }) => ({ url, classification })), [
    { url: 'https://example.gov/missing', classification: 'broken' },
    { url: 'https://example.gov/recent', classification: 'manual-working' },
    { url: 'https://example.gov/stale', classification: 'inconclusive' },
  ]);
  assert.deepEqual(report.totals, { working: 0, broken: 1, inconclusive: 1, 'manual-working': 1 });
});

test('requires valid government manual evidence before overriding an inconclusive result', async () => {
  const fetchImpl = async () => new Response('', { status: 403 });
  const report = await checkExternalLinks([
    { href: 'https://example.gov/valid', filePath: 'valid.md', field: 'markdown' },
    { href: 'https://example.gov/date-only', filePath: 'date-only.md', field: 'markdown' },
    { href: 'https://example.gov/not-government', filePath: 'not-government.md', field: 'markdown' },
    { href: 'https://example.gov/blank-note', filePath: 'blank-note.md', field: 'markdown' },
  ], {
    fetchImpl,
    now: '2026-07-31T00:00:00.000Z',
    manualVerifications: {
      'https://example.gov/valid': { verifiedAt: '2026-07-02', note: 'Opened in a normal browser', officialGovernment: true },
      'https://example.gov/date-only': { verifiedAt: '2026-02-30', note: 'Impossible date', officialGovernment: true },
      'https://example.gov/not-government': { verifiedAt: '2026-07-02', note: 'No designation' },
      'https://example.gov/blank-note': { verifiedAt: '2026-07-02', note: '  ', officialGovernment: true },
    },
  });

  assert.deepEqual(report.results.map(({ url, classification }) => ({ url, classification })), [
    { url: 'https://example.gov/blank-note', classification: 'inconclusive' },
    { url: 'https://example.gov/date-only', classification: 'inconclusive' },
    { url: 'https://example.gov/not-government', classification: 'inconclusive' },
    { url: 'https://example.gov/valid', classification: 'manual-working' },
  ]);
});

test('reads external links only from published guides and areas plus all regions', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'external-link-inventory-'));
  try {
    await Promise.all([
      mkdir(path.join(root, 'src/content/guides'), { recursive: true }),
      mkdir(path.join(root, 'src/content/areas'), { recursive: true }),
      mkdir(path.join(root, 'src/content/regions'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(path.join(root, 'src/content/guides/published.md'), '---\nstatus: published\nsource:\n  url: "https://example.gov/published-guide"\n---\n'),
      writeFile(path.join(root, 'src/content/guides/draft.md'), '---\nstatus: draft\nsource:\n  url: "https://example.gov/draft-guide"\n---\n'),
      writeFile(path.join(root, 'src/content/areas/published.md'), '---\nstatus: published\nsource:\n  url: "https://example.gov/published-area"\n---\n'),
      writeFile(path.join(root, 'src/content/areas/draft.md'), '---\nstatus: draft\nsource:\n  url: "https://example.gov/draft-area"\n---\n'),
      writeFile(path.join(root, 'src/content/regions/region.md'), '---\nsource:\n  url: "https://example.gov/region"\n---\n'),
    ]);

    const references = await readExternalContentReferences(root);
    assert.deepEqual(references.map(({ href, filePath }) => ({ href, filePath })), [
      { href: 'https://example.gov/published-area', filePath: 'src/content/areas/published.md' },
      { href: 'https://example.gov/published-guide', filePath: 'src/content/guides/published.md' },
      { href: 'https://example.gov/region', filePath: 'src/content/regions/region.md' },
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('parses an external-link report output path', () => {
  assert.equal(parseOutputPath(['--output', 'artifacts/external-links.json']), 'artifacts/external-links.json');
  assert.throws(() => parseOutputPath(['--output']), /requires a path/);
});
