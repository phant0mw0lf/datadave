# datadave.dev

Blog about data & AI, built with [Astro](https://astro.build) and deployed
to [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/).

## Commands

Run `make help` for the full list. The essentials:

```sh
make install         # install dependencies
make dev              # dev server at localhost:4321
make post TITLE="My New Post"   # scaffold a new post
make check             # typecheck + build
make preview            # preview the production build locally
make deploy              # deploy to Cloudflare manually
```

## Writing a post

```sh
make post TITLE="My New Post"
```

This creates `src/content/blog/my-new-post.mdx` with today's date and
`draft: true` pre-filled. Fill in `description` and `tags`, write the post,
then flip `draft` to `false` (or remove the line) when it's ready to go
live. See `src/content/blog/hello-world.mdx` for a filled-out example of
every frontmatter field.

Drafts are visible in `make dev` but excluded from `make build` / `make
preview` and from the RSS feed — see `src/lib/posts.ts`.

## Project structure

```
src/
  content/blog/       posts (.md / .mdx)
  content.config.ts   post frontmatter schema
  lib/posts.ts         post querying (draft filtering, sorting, tags)
  consts.ts             site + author metadata (single source of truth)
  components/            Header, Footer, PostCard, ThemeToggle, ...
  layouts/                BaseLayout, PostLayout
  pages/                   routes (/, /blog, /blog/[id], /tags/[tag], /about, /rss.xml)
```

## Deployment

Connected to Cloudflare via **Workers & Pages → Create → Import a
repository**: every push to `main` deploys automatically, and pull
requests get preview URLs. Build command `npm run build`, output directory
`dist`. `wrangler.jsonc` configures it as a pure static-assets deployment
(no Worker script).

`make deploy` (`wrangler deploy`) is available as a manual fallback.

## Before you launch

A few things are stubbed with `TODO` and need real values before this goes
live — search for `TODO` or check these directly:

- `src/consts.ts` — author name, email, GitHub, LinkedIn, site description,
  and whether/how to mention your employer
- `src/pages/about.astro` — actual bio
- `src/content/blog/hello-world.mdx` — currently `draft: true`; replace or
  publish it
- `public/og-default.png` — placeholder not yet created; add a real 1200×630
  social share image
- `src/consts.ts` → `CF_ANALYTICS_TOKEN` — get one from the Cloudflare
  dashboard (Analytics & Logs → Web Analytics → Add a site) if you want
  traffic stats; leave empty to skip
- Register `datadave.dev` as a custom domain on the deployed Worker
  (Cloudflare sets DNS automatically if the domain is in the same account)

## i18n

Only English is published for now. Posts already carry a `lang` field and
the content structure is laid out so German can be added later without a
restructure — see `AGENTS.md` for the exact steps when that day comes.
