const PATHS = {
  area: 'areas',
  region: 'regions',
  guide: 'guides',
};

export function resolveEditorialLinks({ kind, slugs, entries }) {
  const collectionPath = PATHS[kind];
  if (!collectionPath) throw new Error(`Unknown editorial link kind: ${kind}`);

  const entriesBySlug = new Map(entries.map((entry) => [entry.data.slug, entry]));

  return slugs.map((slug) => {
    const entry = entriesBySlug.get(slug);
    if (!entry || (entry.data.status && entry.data.status !== 'published')) {
      throw new Error(`Missing published ${kind} for editorial relation: ${slug}`);
    }

    return {
      kind,
      label: entry.data.name || entry.data.title,
      href: `/houston/${collectionPath}/${entry.data.slug}`,
    };
  });
}
