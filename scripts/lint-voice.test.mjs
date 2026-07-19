import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findVoiceViolations } from './lint-voice.mjs';

test('flags visible research scaffolding', () => {
  const text = 'This Clear Lake profile uses Super Neighborhood 81 as its frame.';
  assert.ok(findVoiceViolations(text, 'src/content/areas/clear-lake.md').length > 0);
});

test('flags the repeated generated closing heading', () => {
  const text = "## What this means when you're choosing a place";
  assert.ok(findVoiceViolations(text, 'src/content/guides/example.md').length > 0);
});

test('passes direct human copy', () => {
  const text = 'Clear Lake sits in southeast Houston near Johnson Space Center.';
  assert.deepEqual(findVoiceViolations(text, 'src/content/areas/clear-lake.md'), []);
});
