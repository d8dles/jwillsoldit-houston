import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const sources = z.array(z.object({
  label: z.string(),
  url: z.url().optional(),
  accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})).min(1);

const nearbyItem = z.object({
  name: z.string(),
  officialUrl: z.url(),
});

const regions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/regions' }),
  schema: z.object({
    name: z.string(), slug: z.string(), counties: z.array(z.string()).min(1),
    housingMix: z.array(z.string()).min(1), corridors: z.array(z.string()).min(1),
    anchors: z.array(z.string()).min(1),
    exampleCommunities: z.array(z.object({
      name: z.string(),
      href: z.string().min(1),
    })).min(1),
    mapId: z.string(), sources,
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

const areas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
  schema: z.object({
    name: z.string(), slug: z.string(), regionSlug: z.string(),
    relatedGuides: z.array(z.string()).default([]),
    counties: z.array(z.string()).min(1), jurisdiction: z.string(),
    areaType: z.enum(['neighborhood', 'district', 'city', 'master-planned-community']),
    housingTypes: z.array(z.string()).min(1), typicalEra: z.string(), lotCharacter: z.string(),
    hoaPrevalence: z.enum(['rare', 'some', 'common', 'nearly-universal']),
    connections: z.array(z.object({ destination: z.string(), note: z.string() })).min(1),
    schoolDistricts: z.array(z.object({ name: z.string(), officialUrl: z.url() })).min(1),
    thingsNearby: z.array(z.object({ category: z.string(), items: z.array(nearbyItem).min(1) })),
    thingsToUnderstand: z.array(z.string()).min(3),
    localNotes: z.string().optional(),
    sources, updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['draft', 'published']),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(), slug: z.string(), description: z.string().max(160),
    relatedRegions: z.array(z.string()).default([]),
    relatedAreas: z.array(z.string()).default([]),
    disclaimerIds: z.array(z.enum(['general', 'schools', 'flood', 'travel-times', 'development', 'market'])),
    sources, updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['draft', 'published']),
  }),
});

export const collections = { regions, areas, guides };
