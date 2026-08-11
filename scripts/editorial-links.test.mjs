import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveEditorialLinks } from '../src/data/editorial-links.mjs';

test('resolves curated published relation slugs into internal page links', () => {
  const links = resolveEditorialLinks({
    kind: 'area',
    slugs: ['katy'],
    entries: [
      { data: { slug: 'katy', name: 'Katy', status: 'published' } },
    ],
  });

  assert.deepEqual(links, [
    { kind: 'area', label: 'Katy', href: '/houston/areas/katy' },
  ]);
});

test('resolves a guide relation into an internal read-next link', () => {
  const links = resolveEditorialLinks({
    kind: 'guide',
    slugs: ['property-taxes'],
    entries: [
      { data: { slug: 'property-taxes', title: 'Houston property taxes', status: 'published' } },
    ],
  });

  assert.deepEqual(links, [
    { kind: 'guide', label: 'Houston property taxes', href: '/houston/guides/property-taxes' },
  ]);
});

test('fails the build contract when a relation points at a missing or draft page', () => {
  assert.throws(
    () => resolveEditorialLinks({
      kind: 'region',
      slugs: ['missing-region'],
      entries: [],
    }),
    /missing published region/i,
  );
});
