import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const MONEY_OR_PERCENT = String.raw`(?:\$\s*\d[\d,]*(?:\.\d+)?|\d+(?:\.\d+)?(?:\s*[–-]\s*\d+(?:\.\d+)?)?\s*(?:%|percent\b))`;

const VOLATILE_CLAIMS = [
  ['calculator', /28\s*\/\s*36|supported home price|estimated home price|affordability calculator/i],
  ['rate', new RegExp(String.raw`\b(?:mortgage|interest|loan) rates?(?:\s+(?:of|is|are|at))?\s*:?\s*${MONEY_OR_PERCENT}|(?:^|\s)${MONEY_OR_PERCENT}\s+(?:mortgage|interest|loan) rate\b`, 'i')],
  ['fixed financing figure', /\b(?:DTI|debt-to-income|credit score|down payment|earnest money|inspection|appraisal)[^\n.]{0,100}(?:\$\s*\d|\d+(?:\.\d+)?\s*(?:%|percent))/i],
  ['unverified program promise', /offers?\s+(?:forgivable|no-interest)\s+help|more of (?:the )?Houston area qualifies|(?:the|this|our) program is (?:open|available)/i],
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

test('rejects fixed financing figures, program promises, live rates, and calculator language', () => {
  const unsafeClaims = [
    ['rate', 'The mortgage rate is 6.5 percent.'],
    ['calculator', 'Use our affordability calculator to find your supported home price.'],
    ['fixed financing figure', 'Keep your debt-to-income ratio below 43 percent.'],
    ['fixed financing figure', 'Earnest money is usually 1-2 percent of the price.'],
    ['unverified program promise', 'The program offers forgivable help toward closing costs.'],
  ];
  for (const [category, claim] of unsafeClaims) {
    assert.deepEqual(volatileClaims(claim), [category], claim);
  }

  const durableEducationalFacts = [
    'Ask a lender to explain how it evaluates debt-to-income ratio.',
    'Credit and down-payment requirements vary by loan, lender, borrower, and property.',
    'The contract states the earnest-money amount and deadlines.',
    'Check the official program page for current status and written terms.',
  ];
  assert.deepEqual(volatileClaims(durableEducationalFacts.join('\n')), []);
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
