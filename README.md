# Houston, Handled.

Static Houston relocation guide for JWILLSOLDIT. Astro renders the site under `/houston`; content lives in validated Markdown collections in this repository.

## Local development

This repository requires Node 22.12 or newer.

```sh
npm install
npm run dev
```

Open `http://localhost:4321/houston`. Production verification uses:

```sh
npm test
npm run build
npm run preview
```

The npm scripts invoke Astro through its Node entry point because the parent folder name contains a colon. A bare `astro` binary cannot be resolved correctly from that path on macOS.

## Content editing

Content is organized into three collections:

- `src/content/regions/` — nine schematic guide regions.
- `src/content/guides/` — long-form explainers.
- `src/content/areas/` — sourced structural area profiles.

Guide and area frontmatter must include `sources`, `updatedAt`, and `status`. A file marked `status: "draft"` is excluded from static routes and the sitemap. Region sources are also required. Schemas live in `src/content.config.ts`.

Before changing a content file:

1. Verify each factual claim against a current primary source.
2. Record the source URL and access date in that file.
3. Avoid prices, drive-time promises, rankings, demographic descriptions, and school or safety conclusions.
4. Run `npm run build`. The build performs the fair-housing language gate, Astro checks, schema validation, and static rendering.

Adding an area means adding one schema-complete Markdown file plus a presentation-only pin in `src/data/area-pins.ts`. The pin is schematic, not a geographic coordinate.

## Architecture boundaries

- This is a standalone repository. Do not move it into `jwillsoldit-hub`.
- No CMS, database, Mapbox, market feed, or client framework is required for Phase 1.
- Maps are schematic SVG components and must retain their accuracy caption.
- The Smart Move handoff is `https://move.jwillsoldit.com/?intent=houston-relocation`.
- The hub should remain unchanged except for the reviewed proxy rewrite and the root sitemap declaration required at launch.

## Vercel deployment

Deploy this repository as its own static Astro project. No environment variables are required. `vercel.json` maps the public `/houston` prefix to Astro's root-level static output, including nested routes and assets.

After a standalone preview passes, the hub project can proxy:

```json
{
  "rewrites": [
    { "source": "/houston", "destination": "https://HOUSTON-STABLE-ALIAS.vercel.app/houston" },
    { "source": "/houston/:path*", "destination": "https://HOUSTON-STABLE-ALIAS.vercel.app/houston/:path*" }
  ]
}
```

Use a stable project alias, not an ephemeral deployment URL. Merge the rewrite into any existing hub routing configuration; never replace unrelated routes.

The authoritative `robots.txt` must live at the hub's domain root. At launch, add:

```text
Sitemap: https://www.jwillsoldit.com/houston/sitemap-index.xml
```

Basic Vercel Web Analytics works once enabled for the project. The custom interaction events instrumented in this repo require a Vercel Pro or Enterprise plan; pageviews still work without that upgrade.

## Launch gates

Do not add the production hub rewrite until all gates pass:

- Joey reads every region, guide, and area page.
- The broker and/or real-estate counsel reviews the compliance posture.
- All content sources and operating venues are rechecked.
- Mobile Lighthouse, keyboard navigation, reduced motion, metadata, sitemap, Smart Move, IABS, CPN, and proxy-path tests pass on the final preview.
- The existing dirty hub worktree is resolved or the rewrite is prepared in a separate clean worktree.

Production deployment is intentionally separate from content completion.
