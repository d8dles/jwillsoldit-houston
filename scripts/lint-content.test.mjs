import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bodyFromMarkdown,
  frontmatterFromMarkdown,
  validateContent,
  validatePhase1Files,
  wordCount,
} from './lint-content.mjs';

test('extracts frontmatter-free Markdown body', () => {
  assert.equal(bodyFromMarkdown('---\ntitle: Test\n---\n\nHello world.'), 'Hello world.');
});

test('extracts frontmatter', () => {
  assert.equal(frontmatterFromMarkdown('---\ntitle: Test\n---\n\nHello.'), 'title: Test');
});

test('counts words while ignoring Markdown punctuation', () => {
  assert.equal(wordCount('## A heading\n\nA short, direct sentence.'), 6);
});

test('flags short guides and a missing closing heading', () => {
  const errors = validateContent('---\ntitle: Test\n---\n\nShort body.', 'src/content/guides/test.md');
  assert.ok(errors.some((error) => error.includes('expected 700–1,200')));
  assert.ok(errors.some((error) => error.includes('missing required closing heading')));
});

test('flags specific minute promises', () => {
  const errors = validateContent('---\nname: Test\n---\n\nThe trip takes 10–20 minutes.', 'src/content/areas/test.md');
  assert.ok(errors.some((error) => error.includes('minute range')));
});

test('flags missing Phase 1 files', () => {
  const errors = validatePhase1Files(['src/content/guides/property-taxes.md']);
  assert.ok(errors.some((error) => error.includes('flood-risk-and-insurance.md')));
  assert.ok(errors.some((error) => error.includes('the-heights.md')));
});
