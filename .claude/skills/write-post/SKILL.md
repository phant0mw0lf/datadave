---
name: write-post
description: Use when the user wants to start a new blog post on datadave.dev — scaffolds the post via `make post` and walks through the frontmatter fields (description length, tags, draft flag) before they start writing.
disable-model-invocation: true
---

# Write Post

## Overview

Wraps `make post TITLE="..."` (see `Makefile`) with the frontmatter judgment
calls that command doesn't make for you: description length, tag reuse, and
the draft→publish flip. Content and schema rules live in CLAUDE.md and
`src/content.config.ts` — this skill is the workflow, not a new source of
truth.

## Steps

1. **Ask for a title** if not given, then run:
   ```bash
   make post TITLE="<title>"
   ```
   This creates `src/content/blog/<slug>.mdx` with `pubDate` set to today
   and `draft: true`.

2. **Fill `description`.** This becomes the `<meta name="description">` and
   the OG/social preview text — keep it to one sentence, roughly 50-160
   characters. Don't leave it empty (the schema allows it, but an empty
   description ships a blank meta tag).

3. **Fill `tags`.** Check existing tags first so posts don't fragment into
   near-duplicate tags (e.g. `llm` vs `llms`):
   ```bash
   grep -rhoE '^tags:.*' src/content/blog/*.mdx
   ```
   Reuse an existing tag when the topic overlaps; only add a new one when it
   doesn't.

4. **Write the post.** Draft stays visible in `make dev` (`astro dev
   --background`) so the user can preview while writing.

5. **Before publishing**, remind the user to flip `draft: true` to `false`
   (or delete the line) — `make preview` / `make build` / RSS all exclude
   drafts, so a forgotten `draft: true` is a silent no-op, not an error.

## Common Mistakes

- Writing the post before deciding tags, then having to grep-and-reconcile
  tags across posts afterward — check existing tags in step 3, not after.
- Forgetting step 5: the post looks fine in `make dev` and simply never
  appears in the deployed build.
