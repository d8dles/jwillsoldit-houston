import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const MONEY_OR_PERCENT = String.raw`(?:\$\s*\d[\d,]*(?:\.\d+)?|\d+(?:\.\d+)?(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(?:%|percent\b))`;

const FIXED_QUALIFICATION_CLAIMS = [
  ['calculator', /28\s*\/\s*36|supported home price|estimated home price|affordability calculator/i],
  ['credit-score', /\b(?:minimum|required|qualifying|standard)?\s*credit[- ]score(?:\s+(?:of|is|at least|above|below|requirement(?:\s+is)?))?\s*:?\s*\d{3}\+?\b|\b\d{3}\+?\s+(?:minimum\s+)?credit[- ]score\b/i],
  ['down-payment', new RegExp(String.raw`\b(?:minimum|required|standard|typical)?\s*down[- ]payment(?:\s+(?:of|is|at least|requirement(?:\s+is)?))?\s*:?\s*${MONEY_OR_PERCENT}|(?:^|\s)${MONEY_OR_PERCENT}\s+(?:minimum|required|standard|typical)?\s*down[- ]payment\b`, 'i')],
  ['closing-cost', new RegExp(String.raw`\bclosing costs?(?:\s+(?:of|is|are|at least|range from))?\s*:?\s*${MONEY_OR_PERCENT}|(?:^|\s)${MONEY_OR_PERCENT}\s+(?:in|for|of)?\s*closing costs?\b`, 'i')],
  ['earnest-money', new RegExp(String.raw`\bearnest money(?:\s+(?:of|is|at least))?\s*:?\s*${MONEY_OR_PERCENT}|(?:^|\s)${MONEY_OR_PERCENT}\s+(?:in|for|of)?\s*earnest money\b`, 'i')],
  ['rate', new RegExp(String.raw`\b(?:mortgage|interest|loan) rates?(?:\s+(?:of|is|are|at))?\s*:?\s*${MONEY_OR_PERCENT}|(?:^|\s)${MONEY_OR_PERCENT}\s+(?:mortgage|interest|loan) rate\b`, 'i')],
  ['assistance-amount', new RegExp(String.raw`\b(?:assistance|benefit|grant)(?:\s+(?:amount|of|is|provides?))?\s*:?\s*(?:up to\s+)?${MONEY_OR_PERCENT}|(?:^|\s)(?:up to\s+)?${MONEY_OR_PERCENT}\s+(?:in\s+)?(?:assistance|benefits?|grants?)\b`, 'i')],
  ['dti', /\b(?:DTI|debt[- ]to[- ]income(?:\s+ratio)?)(?:\s+(?:of|is|under|below|at most|max(?:imum)?))?\s*:?\s*\d+(?:\.\d+)?\s*(?:%|percent\b)|\b\d+\s*\/\s*\d+\b/i],
];

function fixedQualificationClaims(text) {
  return FIXED_QUALIFICATION_CLAIMS
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

test('does not ship qualification-like calculator language or inputs', () => {
  const component = readFileSync('src/components/FirstTimeBuyerTools.astro', 'utf8');
  const guide = readFileSync('src/content/guides/first-time-homebuyer.md', 'utf8');
  const combined = `${guide}\n${component}`;
  assert.doesNotMatch(combined, /28\s*\/\s*36|supported home price|estimated home price|affordability calculator/i);
  assert.deepEqual(fixedQualificationClaims(combined), []);
  assert.doesNotMatch(component, /type=["']range["']|annual household income|other monthly debts/i);
});

test('rejects fixed qualification rules across protected lending categories', () => {
  const unsafeClaims = [
    ['credit-score', 'A minimum credit score of 620 is required.'],
    ['down-payment', 'The standard down payment is 3 percent.'],
    ['closing-cost', 'Closing costs are 2–5 percent of the purchase price.'],
    ['earnest-money', 'Plan on $5,000 in earnest money.'],
    ['rate', 'The mortgage rate is 6.5 percent.'],
    ['assistance-amount', 'The program provides up to $75,000 in assistance.'],
    ['dti', 'Keep your debt-to-income ratio below 43 percent.'],
  ];

  for (const [category, claim] of unsafeClaims) {
    assert.deepEqual(fixedQualificationClaims(claim), [category], claim);
  }
});

test('allows dates and ordinary educational lending language', () => {
  const safeCopy = [
    'Source checked July 31, 2026.',
    'Review credit-score requirements with a licensed lender.',
    'Down-payment and closing-cost requirements vary by loan and buyer.',
    'Your Loan Estimate lists the proposed interest rate and costs.',
    'Ask how earnest money is handled for the offer.',
    'Use the official assistance page to check current program status.',
    "Debt-to-income questions require a lender's current review.",
  ].join('\n');

  assert.deepEqual(fixedQualificationClaims(safeCopy), []);
});

test('explains the current Texas pre-showing agreement choices and limit', () => {
  const component = readFileSync('src/components/FirstTimeBuyerTools.astro', 'utf8');
  const guide = readFileSync('src/content/guides/first-time-homebuyer.md', 'utf8');
  assert.match(component, /Texas license holder.*generally must enter a written agreement before showing residential property/i);
  assert.match(guide, /representation or qualifying showing-only non-representation/i);
  assert.match(guide, /showing-only non-representative cannot provide opinions, advice, or other brokerage services/i);
  assert.match(guide, /current Texas Real Estate Commission guidance/i);
});
