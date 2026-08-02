const FRONTMATTER_LINK_KEY = /^(\s*)(url|officialUrl|href):\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*(?:#.*)?$/gm;
const JWILLSOLDIT_HOSTS = new Set(['jwillsoldit.com', 'www.jwillsoldit.com']);
const JWILLSOLDIT_ORIGIN = 'https://www.jwillsoldit.com';

function unescapeMarkdown(value) {
  return value.replace(/\\([^\n])/g, '$1');
}

function isEscaped(text, index) {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}

function readBracketed(text, start) {
  if (text[start] !== '[') return null;
  let depth = 1;
  let value = '';

  for (let index = start + 1; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\\' && index + 1 < text.length) {
      value += character + text[index + 1];
      index += 1;
    } else if (character === '[') {
      depth += 1;
      value += character;
    } else if (character === ']') {
      depth -= 1;
      if (depth === 0) return { value, end: index + 1 };
      value += character;
    } else {
      value += character;
    }
  }

  return null;
}

function skipWhitespace(text, start) {
  let index = start;
  while (index < text.length && /\s/.test(text[index])) index += 1;
  return index;
}

function readAngleDestination(text, start) {
  if (text[start] !== '<') return null;
  let value = '';

  for (let index = start + 1; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\n') return null;
    if (character === '\\' && index + 1 < text.length) {
      value += character + text[index + 1];
      index += 1;
    } else if (character === '>') {
      return { value: unescapeMarkdown(value), end: index + 1 };
    } else {
      value += character;
    }
  }

  return null;
}

function readTitle(text, start) {
  const opener = text[start];
  const closer = opener === '(' ? ')' : opener;
  if (!['"', "'", '('].includes(opener)) return null;

  for (let index = start + 1; index < text.length; index += 1) {
    if (text[index] === '\n') return null;
    if (text[index] === '\\' && index + 1 < text.length) {
      index += 1;
    } else if (text[index] === closer) {
      return index + 1;
    }
  }

  return null;
}

function finishInlineDestination(text, href, start) {
  let index = skipWhitespace(text, start);
  if (text[index] === ')') return { href, end: index + 1 };

  const titleEnd = readTitle(text, index);
  if (!titleEnd) return null;
  index = skipWhitespace(text, titleEnd);
  return text[index] === ')' ? { href, end: index + 1 } : null;
}

function readInlineDestination(text, start) {
  if (text[start] !== '(') return null;
  let index = skipWhitespace(text, start + 1);

  if (text[index] === '<') {
    const angle = readAngleDestination(text, index);
    return angle && finishInlineDestination(text, angle.value, angle.end);
  }

  let depth = 0;
  let value = '';
  for (; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\\' && index + 1 < text.length) {
      value += character + text[index + 1];
      index += 1;
    } else if (character === '(') {
      depth += 1;
      value += character;
    } else if (character === ')') {
      if (depth === 0) return { href: unescapeMarkdown(value), end: index + 1 };
      depth -= 1;
      value += character;
    } else if (/\s/.test(character) && depth === 0) {
      return finishInlineDestination(text, unescapeMarkdown(value), index);
    } else {
      value += character;
    }
  }

  return null;
}

function normalizeReferenceLabel(label) {
  return unescapeMarkdown(label).trim().replace(/\s+/g, ' ').toLowerCase();
}

function readDefinitionDestination(line, start) {
  if (line[start] === '<') return readAngleDestination(line, start);

  let depth = 0;
  let value = '';
  let index = start;
  for (; index < line.length; index += 1) {
    const character = line[index];
    if (character === '\\' && index + 1 < line.length) {
      value += character + line[index + 1];
      index += 1;
    } else if (/\s/.test(character) && depth === 0) {
      break;
    } else if (character === '(') {
      depth += 1;
      value += character;
    } else if (character === ')') {
      if (depth === 0) return null;
      depth -= 1;
      value += character;
    } else {
      value += character;
    }
  }

  return value && depth === 0 ? { value: unescapeMarkdown(value), end: index } : null;
}

function parseReferenceDefinitions(text) {
  const definitions = new Map();
  const definitionEnds = new Map();
  let offset = 0;

  for (const line of text.split('\n')) {
    const indentation = line.match(/^ {0,3}/)[0].length;
    const label = readBracketed(line, indentation);
    if (label && line[label.end] === ':') {
      const destinationStart = skipWhitespace(line, label.end + 1);
      const destination = readDefinitionDestination(line, destinationStart);
      if (destination) {
        let remainder = skipWhitespace(line, destination.end);
        const titleEnd = remainder < line.length ? readTitle(line, remainder) : remainder;
        if (titleEnd !== null) {
          remainder = skipWhitespace(line, titleEnd);
          if (remainder === line.length) {
            const normalizedLabel = normalizeReferenceLabel(label.value);
            if (normalizedLabel && !definitions.has(normalizedLabel)) {
              definitions.set(normalizedLabel, destination.value);
            }
            definitionEnds.set(offset + indentation, offset + line.length);
          }
        }
      }
    }
    offset += line.length + 1;
  }

  return { definitions, definitionEnds };
}

function extractMarkdownDestinations(text) {
  const { definitions, definitionEnds } = parseReferenceDefinitions(text);
  const destinations = [];

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== '[' || isEscaped(text, index)) continue;
    if (definitionEnds.has(index)) {
      index = definitionEnds.get(index);
      continue;
    }

    const label = readBracketed(text, index);
    if (!label) continue;

    if (text[label.end] === '(') {
      const inline = readInlineDestination(text, label.end);
      if (inline) {
        destinations.push(inline.href);
        index = inline.end - 1;
      }
      continue;
    }

    let referenceLabel = label.value;
    let end = label.end;
    if (text[label.end] === '[') {
      const reference = readBracketed(text, label.end);
      if (!reference) continue;
      referenceLabel = reference.value || label.value;
      end = reference.end;
    }

    const href = definitions.get(normalizeReferenceLabel(referenceLabel));
    if (href !== undefined) {
      destinations.push(href);
      index = end - 1;
    }
  }

  return destinations;
}

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

  for (const href of extractMarkdownDestinations(text.slice(bodyStart))) {
    references.push({ href, filePath, field: 'markdown' });
  }

  return references;
}

function publicRouteForContentFile(filePath) {
  const match = filePath?.replaceAll('\\', '/').match(/(?:^|\/)src\/content\/(guides|areas|regions)\/([^/]+)\.md$/);
  return match ? `/houston/${match[1]}/${match[2]}` : null;
}

export function normalizeInternalPath(href, filePath) {
  const referringRoute = publicRouteForContentFile(filePath);
  const base = href.startsWith('/') && !href.startsWith('//')
    ? JWILLSOLDIT_ORIGIN
    : referringRoute && `${JWILLSOLDIT_ORIGIN}${referringRoute}`;

  let url;
  try {
    url = new URL(href, base || undefined);
  } catch {
    return null;
  }
  if (!JWILLSOLDIT_HOSTS.has(url.hostname)) return null;

  const pathname = url.pathname.replace(/\/+$/, '') || '/';
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
    const normalizedPath = normalizeInternalPath(reference.href, reference.filePath);
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
