const AREA_ROUTES = new Map([
  ['eado', 'eado'],
  ['the-heights', 'the-heights'],
  ['the-woodlands', 'the-woodlands'],
  ['katy', 'katy'],
  ['sugar-land', 'sugar-land'],
  ['clear-lake', 'clear-lake'],
]);

export function communitySlug(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function communityHref(name, _regionSlug, base = '') {
  const slug = communitySlug(name);
  const areaSlug = AREA_ROUTES.get(slug);
  if (areaSlug) return `${base}/areas/${areaSlug}`;
  return `${base}/communities/${slug}`;
}

export function areaRouteForCommunity(name) {
  return AREA_ROUTES.get(communitySlug(name)) ?? null;
}
