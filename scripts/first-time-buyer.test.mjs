import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const MONEY_OR_PERCENT = String.raw`(?:\$\s*\d[\d,]*(?:\.\d+)?|\d+(?:\.\d+)?(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(?:%|percent\b))`;

// Structural loan-program facts (credit-score baselines, down-payment minimums,
// standard cost ranges, program caps) are federal/state program parameters that
// are stable for years and are exactly what a comprehensive buyer's guide should
// state. Only genuinely volatile, day-to-day figures stay banned: live mortgage
// rates, and anything that implies the site itself calculates a personal
// qualification number (that's a lender's job, not a content page's).
const VOLATILE_CLAIMS = [
  ['calculator', /28\s*\/\s*36|supported home price|estimated home price|affordability calculator/i],
  ['rate', new RegExp(String.raw`\b(?:mortgage|interest|loan) rates?(?:\s+(?:of|is|are|at))?\s*:?\s*${MONEY_OR_PERCENT}|(?:^|\s)${MONEY_OR_PERCENT}\s+(?:mortgage|interest|loan) rate\b`, 'i')],
];

function volatileClaims(text) {
  return VOLATILE_CLAIMS
    .filter(([, pattern]) => pattern.test(text))
    .map(([category]) => category);
}

test('publishes the first-time buyer guide through the guide route', () => {
  const guide = readFileSync('src/content/guides/first-time-homebuyer.md', 'utf8');
  const route = readFileSync('src/pages/guides/[slug].astro', 'utf8');
  assert.match(guide, /^slug: ["']?first-time-homebuyer["']?$/m);
  assert.match(guide, /^status: ["']?published["']?$/m);
  assert.match(route, /FirstTimeBuyerTools/);
  assert.match(route, /entry\.data\.slug === ['"]first-time-homebuyer['"]/);
});

test('does not ship a live rate quote or a personal-qualification calculator', () => {
  const component = readFileSync('src/components/FirstTimeBuyerTools.astro', 'utf8');
  const guide = readFileSync('src/content/guides/first-time-homebuyer.md', 'utf8');
  const combined = `${guide}\n${component}`;
  assert.doesNotMatch(combined, /28\s*\/\s*36|supported home price|estimated home price|affordability calculator/i);
  assert.deepEqual(volatileClaims(combined), []);
  assert.doesNotMatch(component, /type=["']range["']|annual household income|other monthly debts/i);
});

test('rejects live rate quotes and calculator language, allows everything else', () => {
  const unsafeClaims = [
    ['rate', 'The mortgage rate is 6.5 percent.'],
    ['calculator', 'Use our affordability calculator to find your supported home price.'],
  ];
  for (const [category, claim] of unsafeClaims) {
    assert.deepEqual(volatileClaims(claim), [category], claim);
  }

  const stableStructuralFacts = [
    'A minimum credit score of 620 is required for a conventional loan.',
    'FHA allows 3.5 percent down with a 580+ credit score.',
    'Closing costs are typically 2-5 percent of the purchase price.',
    'Plan on 1-2 percent of the price in earnest money.',
    'The program provides up to $75,000 in forgivable assistance.',
    'Keep your debt-to-income ratio below roughly 43 percent.',
  ];
  assert.deepEqual(volatileClaims(stableStructuralFacts.join('\n')), []);
});

test('allows dates and ordinary educational lending language', () => {
  const safeCopy = [
    'Source checked July 31, 2026.',
    'Reviewed 7/31/2026.',
    'Review credit-score requirements with a licensed lender.',
    'Down-payment and closing-cost requirements vary by loan and buyer.',
    'Your Loan Estimate lists the proposed interest rate and costs.',
    'Ask how earnest money is handled for the offer.',
    'Use the official assistance page to check current program status.',
    "Debt-to-income questions require a lender's current review.",
  ].join('\n');

  assert.deepEqual(volatileClaims(safeCopy), []);
});

test('explains the current Texas pre-showing agreement choices and limit', () => {
  const component = readFileSync('src/components/FirstTimeBuyerTools.astro', 'utf8');
  const guide = readFileSync('src/content/guides/first-time-homebuyer.md', 'utf8');
  assert.match(component, /Texas license holder.*generally must enter a written agreement before showing residential property/i);
  assert.match(guide, /representation or qualifying showing-only non-representation/i);
  assert.match(guide, /showing-only non-representative cannot provide opinions, advice, or other brokerage services/i);
  assert.match(guide, /current Texas Real Estate Commission guidance/i);
});
