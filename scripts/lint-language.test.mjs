import { test } from 'node:test';
import assert from 'node:assert';
import { findViolations } from './lint-language.mjs';

test('flags banned phrases case-insensitively', () => {
  const v = findViolations('This is a Family-Friendly area with good schools.', 'x.md');
  assert.strictEqual(v.length, 2);
});

test('passes clean neutral copy', () => {
  const v = findViolations(
    'The Heights is an established area northwest of Downtown known for early twentieth-century homes.',
    'x.md'
  );
  assert.strictEqual(v.length, 0);
});

test('allows banned words inside the lint config itself', () => {
  assert.strictEqual(findViolations('anything', 'scripts/lint-language.mjs').length, 0);
});
