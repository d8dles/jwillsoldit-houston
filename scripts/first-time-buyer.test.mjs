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
