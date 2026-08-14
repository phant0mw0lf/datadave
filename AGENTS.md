# datadave.dev

Data & AI blog. Astro 7 (static output, no adapter), Tailwind 4, deployed to
Cloudflare Workers Static Assets. Content is Markdown/MDX in the repo — git
is the CMS, there's no external database or headless CMS.

## Commands

Everything runs through `make` (see `make help`). The underlying npm
scripts still exist because Cloudflare's build environment calls
`npm run build` directly, not `make` — keep both in sync if you change one.

- `make dev` — dev server on :4321
- `make post TITLE="..."` — scaffold a new post with today's date and
  `draft: true`; use this instead of hand-copying an old post's frontmatter
- `make check` — typecheck + content schema validation, then build
- `make preview` — production build via Astro (drafts hidden, unlike `dev`)
- `make serve` — production build via the real Workers runtime (`wrangler dev`)
- `make deploy` — manual deploy; normally Cloudflare deploys on push to `main`

## Content model

Schema lives in `src/content.config.ts` (Content Layer API — `glob` loader,
**not** the legacy `src/content/config.ts`). Every route that lists or
filters posts goes through `src/lib/posts.ts` (`getPosts`, `getTags`,
`getPostsByTag`) rather than calling `getCollection('blog')` directly — that
file is the one place the draft-filtering rule lives, and it must stay that
way so pages can't drift out of sync on what counts as "published."

Frontmatter fields: `title`, `description`, `pubDate`, `updatedDate?`,
`tags` (drives the `/tags/<tag>/` pages automatically), `draft`, `lang`,
`heroImage?`. See `src/content/blog/hello-world.mdx` for a filled-out
example.

Posts render at `/blog/<id>/`, where `<id>` is the filename (no `slug`
field — that's a legacy-collections concept; Content Layer entries use
`id`, derived from the file path under `src/content/blog/`).

## Site metadata

All author/site strings (name, email, GitHub, LinkedIn, description) live
in `src/consts.ts` as a single `SITE` object. Don't hardcode them elsewhere
— About page, footer, RSS feed, and JSON-LD all import from there.

## i18n

Only English is published. The `lang` field on posts and the file layout
already anticipate German being added later (see the plan/README for the
exact steps) — don't build routing or a language switcher until there's
actually a German post to serve.

## Styling

Tailwind 4, configured CSS-first in `src/styles/global.css` via `@theme` —
there is no `tailwind.config.js`, don't create one. Dark mode toggles a
`.dark` class on `<html>`; the class is set by an inline `<script>` in
`BaseHead.astro` that must run before first paint, or toggling flashes the
wrong theme on load.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
- [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
