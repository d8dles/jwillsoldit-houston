import assert from 'node:assert/strict';
import test from 'node:test';
import { communityHref, communitySlug } from '../src/data/community-links.mjs';

test('keeps detailed area pages as the canonical destination', () => {
  assert.equal(communityHref('EaDo', 'central-houston', '/houston'), '/houston/areas/eado');
  assert.equal(communityHref('The Woodlands', 'north-houston-woodlands', '/houston'), '/houston/areas/the-woodlands');
});

test('routes unmodeled communities to an internal Houston page', () => {
  assert.equal(communitySlug('Downtown'), 'downtown');
  assert.equal(communitySlug('Uptown/Galleria'), 'uptown-galleria');
  assert.equal(communityHref('Montrose', 'central-houston', '/houston'), '/houston/communities/montrose');
});
