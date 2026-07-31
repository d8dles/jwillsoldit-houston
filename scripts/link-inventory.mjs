const FRONTMATTER_LINK_KEY = /^(\s*)(url|officialUrl|href):\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*(?:#.*)?$/gm;
const MARKDOWN_LINK = /\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g;

export function extractLinkReferences(text, filePath) {
  const references = [];
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  const bodyStart = frontmatter ? frontmatter[0].length : 0;

  if (frontmatter) {
    for (const match of frontmatter[1].matchAll(FRONTMATTER_LINK_KEY)) {
      references.push({
        href: match[3] ?? match[4] ?? match[5],
        filePath,
        field: 'frontmatter',
      });
    }
  }

  for (const match of text.slice(bodyStart).matchAll(MARKDOWN_LINK)) {
    references.push({ href: match[1], filePath, field: 'markdown' });
  }

  return references;
}

export function normalizeInternalPath(href) {
  let path;

  if (href.startsWith('/')) {
    path = href;
  } else {
    try {
      const url = new URL(href);
      if (url.hostname !== 'www.jwillsoldit.com') return null;
      path = url.pathname;
    } catch {
      return null;
    }
  }

  const pathname = path.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  return pathname === '/houston' || pathname.startsWith('/houston/') ? pathname : null;
}

export function buildPublishedRoutes(entries) {
  const routes = new Set(['/houston', '/houston/guides']);

  for (const entry of entries) {
    if (!entry.slug) continue;

    if (entry.collection === 'regions') {
      routes.add(`/houston/regions/${entry.slug}`);
    } else if (
      (entry.collection === 'guides' || entry.collection === 'areas') &&
      entry.status === 'published'
    ) {
      routes.add(`/houston/${entry.collection}/${entry.slug}`);
    }
  }

  return routes;
}

export function validateInternalLinks(references, routes) {
  const grouped = new Map();

  for (const reference of references) {
    const normalizedPath = normalizeInternalPath(reference.href);
    if (!normalizedPath || routes.has(normalizedPath)) continue;

    const violation = grouped.get(normalizedPath) ?? {
      href: reference.href,
      normalizedPath,
      referrers: new Set(),
    };
    violation.referrers.add(reference.filePath);
    grouped.set(normalizedPath, violation);
  }

  return [...grouped.values()]
    .map(({ href, normalizedPath, referrers }) => ({
      href,
      normalizedPath,
      referrers: [...referrers].sort(),
    }))
    .sort((a, b) => a.normalizedPath.localeCompare(b.normalizedPath));
}
