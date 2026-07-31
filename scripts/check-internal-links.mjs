import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  buildPublishedRoutes,
  extractLinkReferences,
  validateInternalLinks,
} from './link-inventory.mjs';

const COLLECTIONS = new Set(['guides', 'areas', 'regions']);

async function findMarkdownFiles(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findMarkdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }

  return files;
}

function frontmatterValue(text, key) {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!frontmatter) return undefined;
  const match = frontmatter[1].match(new RegExp(`^${key}:\\s*(?:"([^"]+)"|'([^']+)'|([^\\s#]+))\\s*$`, 'm'));
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

async function readContentInventory(root) {
  const contentRoot = path.join(root, 'src/content');
  const files = await findMarkdownFiles(contentRoot);
  const entries = [];
  const references = [];

  for (const filePath of files) {
    const text = await readFile(filePath, 'utf8');
    const relativePath = path.relative(root, filePath).split(path.sep).join('/');
    const collection = relativePath.split('/')[2];
    const slug = frontmatterValue(text, 'slug');

    if (COLLECTIONS.has(collection) && slug) {
      entries.push({ collection, slug, status: frontmatterValue(text, 'status') });
    }
    references.push(...extractLinkReferences(text, relativePath));
  }

  return { entries, references };
}

export async function scanInternalLinks(root = process.cwd()) {
  const { entries, references } = await readContentInventory(root);
  return validateInternalLinks(references, buildPublishedRoutes(entries));
}

async function main() {
  const { entries, references } = await readContentInventory(process.cwd());
  const violations = validateInternalLinks(references, buildPublishedRoutes(entries));

  if (violations.length === 0) {
    console.log(`internal links clean (${references.length} references)`);
    return;
  }

  console.error('Internal link violations:');
  for (const violation of violations) {
    console.error(`- ${violation.normalizedPath} <- ${violation.referrers.join(', ')}`);
  }
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
