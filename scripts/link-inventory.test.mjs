import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPublishedRoutes,
  extractLinkReferences,
  normalizeInternalPath,
  validateInternalLinks,
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

test('treats apex JWILLSOLDIT Houston URLs as local routes', () => {
  assert.equal(normalizeInternalPath('https://jwillsoldit.com/houston/guides/property-taxes/'), '/houston/guides/property-taxes');
});

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
