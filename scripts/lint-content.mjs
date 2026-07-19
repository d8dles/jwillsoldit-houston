// Structural content gate for Phase 1 authoring contracts.
import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_PHASE1 = {
  guides: [
    'property-taxes.md',
    'muds-pids-and-utility-districts.md',
    'flood-risk-and-insurance.md',
    'hoas-and-deed-restrictions.md',
    'electricity-choice-and-utilities.md',
    'how-houston-is-organized.md',
    'traffic-and-commutes.md',
    'toll-roads-and-ez-tag.md',
    'no-zoning-explained.md',
    'heat-humidity-and-hurricane-prep.md',
  ],
  areas: [
    'the-heights.md',
    'eado.md',
    'katy.md',
    'the-woodlands.md',
    'sugar-land.md',
    'clear-lake.md',
  ],
};

const GUIDE_DISCLAIMERS = {
  'flood-risk-and-insurance.md': ['general', 'flood'],
  'traffic-and-commutes.md': ['general', 'travel-times'],
  'toll-roads-and-ez-tag.md': ['general', 'travel-times'],
};

export function wordCount(markdown) {
  const plain = markdown
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[`*_#[\]()>-]/g, ' ');
  return plain.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu)?.length ?? 0;
}

export function bodyFromMarkdown(text) {
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match?.[1].trim() ?? '';
}

export function frontmatterFromMarkdown(text) {
  return text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
}

function disclaimerIds(frontmatter) {
  const block = frontmatter.match(/^disclaimerIds:\r?\n([\s\S]*?)(?=^sources:)/m)?.[1] ?? '';
  return [...block.matchAll(/^\s+-\s+["']?([a-z-]+)["']?\s*$/gm)].map((match) => match[1]);
}

export function validatePhase1Files(files) {
  const namesByCollection = new Map();
  for (const file of files) {
    const collection = file.includes('/guides/') ? 'guides' : file.includes('/areas/') ? 'areas' : null;
    if (!collection) continue;
    const names = namesByCollection.get(collection) ?? new Set();
    names.add(basename(file));
    namesByCollection.set(collection, names);
  }

  return Object.entries(REQUIRED_PHASE1).flatMap(([collection, required]) =>
    required
      .filter((name) => !namesByCollection.get(collection)?.has(name))
      .map((name) => `src/content/${collection}/${name}: missing required Phase 1 content file`));
}

export function validateContent(text, filePath) {
  const body = bodyFromMarkdown(text);
  const frontmatter = frontmatterFromMarkdown(text);
  const count = wordCount(body);
  const errors = [];

  if (filePath.includes('/regions/') && (count < 60 || count > 120)) {
    errors.push(`${filePath}: region overview is ${count} words; expected 60–120`);
  }

  if (filePath.includes('/guides/')) {
    if (count < 700 || count > 1200) {
      errors.push(`${filePath}: guide is ${count} words; expected 700–1,200`);
    }
    if (!/^## What this means when you're choosing a place\s*$/m.test(body)) {
      errors.push(`${filePath}: missing required closing heading`);
    }
    if (body.includes('!')) {
      errors.push(`${filePath}: guide body contains an exclamation mark`);
    }

    const expectedSlug = basename(filePath, '.md');
    const actualSlug = frontmatter.match(/^slug:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1];
    if (actualSlug !== expectedSlug) {
      errors.push(`${filePath}: slug must match filename (${expectedSlug})`);
    }

    const expectedDisclaimers = GUIDE_DISCLAIMERS[basename(filePath)] ?? ['general'];
    const actualDisclaimers = disclaimerIds(frontmatter);
    if (actualDisclaimers.join(',') !== expectedDisclaimers.join(',')) {
      errors.push(`${filePath}: disclaimerIds must be ${expectedDisclaimers.join(', ')}`);
    }
  }

  if (filePath.includes('/areas/')) {
    if (count < 100 || count > 175) {
      errors.push(`${filePath}: area overview is ${count} words; expected 100–175`);
    }
    const connectionCount = frontmatter.match(/^\s{2}- destination:/gm)?.length ?? 0;
    const distanceRangeCount = frontmatter.match(/roughly\s+\d+\s*[–-]\s*\d+\s+miles/gi)?.length ?? 0;
    if (connectionCount === 0 || distanceRangeCount < connectionCount) {
      errors.push(`${filePath}: every connection needs an approximate mile range`);
    }
  }

  if (/\b\d+\s*(?:-|–|to)\s*\d+\s*minutes?\b/i.test(text)) {
    errors.push(`${filePath}: contains a specific minute range`);
  }

  if (/April\s+2026\s+HUD/i.test(text)) {
    errors.push(`${filePath}: contains the quarantined HUD claim`);
  }

  return errors;
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return extname(entry.name) === '.md' ? [path] : [];
  });
}

function run() {
  const files = markdownFiles('src/content');
  const errors = [
    ...validatePhase1Files(files),
    ...files.flatMap((file) => validateContent(readFileSync(file, 'utf8'), file)),
  ];
  if (errors.length > 0) {
    console.error(`Content contract violations:\n${errors.join('\n')}`);
    process.exit(1);
  }
  console.log(`content contracts clean (${files.length} files)`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) run();
