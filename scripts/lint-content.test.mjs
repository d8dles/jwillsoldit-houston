import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_PHASE1,
  bodyFromMarkdown,
  frontmatterFromMarkdown,
  validateContent,
  validatePhase1Files,
  wordCount,
} from './lint-content.mjs';

test('requires the published first-time buyer guide', () => {
  assert.ok(REQUIRED_PHASE1.guides.includes('first-time-homebuyer.md'));
});

test('extracts frontmatter-free Markdown body', () => {
  assert.equal(bodyFromMarkdown('---\ntitle: Test\n---\n\nHello world.'), 'Hello world.');
});

test('extracts frontmatter', () => {
  assert.equal(frontmatterFromMarkdown('---\ntitle: Test\n---\n\nHello.'), 'title: Test');
});

test('counts words while ignoring Markdown punctuation', () => {
  assert.equal(wordCount('## A heading\n\nA short, direct sentence.'), 6);
});

test('flags short guides', () => {
  const errors = validateContent('---\ntitle: Test\n---\n\nShort body.', 'src/content/guides/test.md');
  assert.ok(errors.some((error) => error.includes('expected 700–1,200')));
});

test('allows researched long-form area guides', () => {
  const body = Array.from({ length: 900 }, () => 'word').join(' ');
  const text = `---\nname: Test\n---\n\n${body}`;
  const errors = validateContent(text, 'src/content/areas/test.md');
  assert.ok(!errors.some((error) => error.includes('area guide')));
});

test('flags area guides above the editorial ceiling', () => {
  const body = Array.from({ length: 1201 }, () => 'word').join(' ');
  const text = `---\nname: Test\n---\n\n${body}`;
  const errors = validateContent(text, 'src/content/areas/test.md');
  assert.ok(errors.some((error) => error.includes('expected 100–1,200')));
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
