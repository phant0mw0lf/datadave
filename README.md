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
public/
  _headers              Cloudflare edge headers: long-cache for hashed assets/fonts, security headers
  fonts/                self-hosted IBM Plex Sans/Mono + Fraunces, subsetted per unicode-range
  og-default.png         fallback social-share image (posts with a heroImage get their own)
src/
  content/blog/       posts (.md / .mdx)
  content.config.ts   post frontmatter schema
  lib/
    posts.ts            post querying (draft filtering, sorting, tags, reading time)
    tagColor.ts          deterministic tag → color hash, backs the --tag-0..5 palette
  consts.ts             site + author metadata (single source of truth)
  styles/
    global.css            Tailwind 4 config (CSS-first), GitHub light/dark palette, tag/focus/code-block styles
    fonts.css              generated @font-face rules for the self-hosted fonts above
  components/
    Header, Footer, Logo, ThemeToggle, PostCard, TagPill, FormattedDate, BaseHead, ArchiveAxis
  layouts/                BaseLayout, PostLayout
  pages/                   routes (/, /blog, /blog/[id], /tags, /tags/[tag], /about, /404, /rss.xml)
```

`ArchiveAxis` is the homepage's "archive by month" strip; `TagPill` is the
shared colored tag chip (post list, post header, tag page — see the comment
in `global.css` on why it deliberately looks different in light vs. dark
mode). See `AGENTS.md` for the tag-palette/`@theme` gotcha before touching
either.

## Deployment

Connected via Cloudflare's native **Workers Builds** (dashboard → Connect
to Git), not the Pages-style "Import a repository" flow and not a GitHub
Actions workflow — there's no CI config committed to this repo. Cloudflare
listens to GitHub webhooks directly: push to `main` runs `npx wrangler
deploy` (production), pull requests run `npx wrangler versions upload`
(preview URL, no promotion). The build command runs `astro check` before
`npm run build`, so type/schema errors fail the deploy instead of shipping
silently. All three are configured in the Cloudflare dashboard, not in a
file here.

`datadave.dev` is registered as a custom domain on the Worker, with
`www.datadave.dev` redirecting to the apex via a Cloudflare Redirect Rule
(dashboard-only, not in this repo). Cloudflare's managed Content Signals /
AI Crawl Control is set to allow AI-answer grounding (search, citations)
while blocking AI training — also a dashboard setting.

`make deploy` (`wrangler deploy`) is available as a manual fallback.

## i18n

Only English is published for now. Posts already carry a `lang` field and
the content structure is laid out so German can be added later without a
restructure — see `AGENTS.md` for the exact steps when that day comes.
