// Public-copy gate for research scaffolding and stock AI phrasing.
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const BANNED = [
  { label: 'research-frame scaffolding', pattern: /\buses?\b[^.\n]{0,100}\bas (?:its|the) frame\b/i },
  { label: 'profile-construction language', pattern: /\bthis\s+(?:[a-z-]+\s+)?profile\s+(?:uses|covers)\b/i },
  { label: 'internal guide taxonomy', pattern: /\bthis guide grouping\b/i },
  { label: 'editorial taxonomy', pattern: /\beditorial guide groupings?\b/i },
  { label: 'repeated template heading', pattern: /\bwhat this means when you(?:'|’)re choosing a place\b/i },
  { label: 'page-construction language', pattern: /\bthis page uses\b[^.\n]{0,120}\bas its boundary\b/i },
  { label: 'stock AI verb', pattern: /\bdelve(?:s|d)? into\b/i },
  { label: 'stock AI metaphor', pattern: /\bnavigat(?:e|es|ing) the [^.\n]{0,50} landscape\b/i },
  { label: 'stock AI phrase', pattern: /\boffers? a blend of\b/i },
  { label: 'stock AI phrase', pattern: /\bserves? as a testament\b/i },
];

export function findVoiceViolations(text, filePath) {
  return BANNED.flatMap(({ label, pattern }) => {
    const match = text.match(pattern);
    if (!match || match.index === undefined) return [];
    const line = text.slice(0, match.index).split('\n').length;
    return [`${filePath}:${line} → ${label}: “${match[0]}”`];
  });
}

if (process.argv[1].endsWith('lint-voice.mjs')) {
  const files = globSync('src/{content,pages,components,layouts}/**/*.{md,mdx,astro,ts}');
  const all = files.flatMap((file) => findVoiceViolations(readFileSync(file, 'utf8'), file));
  if (all.length) {
    console.error('Voice violations:\n' + all.join('\n'));
    process.exit(1);
  }
  console.log(`voice lint clean (${files.length} files)`);
}
