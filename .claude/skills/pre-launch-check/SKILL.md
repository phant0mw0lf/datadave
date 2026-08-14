---
name: pre-launch-check
description: Use when the user asks whether datadave.dev is ready to launch/go live, wants a pre-launch or pre-deploy review, or before recommending the site is ready for its custom domain — checks the README's "Before you launch" checklist for leftover placeholders.
---

# Pre-Launch Check

## Overview

datadave.dev ships with several fields intentionally stubbed as `TODO` (see
README "Before you launch"). The site builds and deploys fine with them in
place, so nothing forces you to notice before the real domain goes live with
placeholder content. This skill runs that checklist.

## When to Use

- User asks "is the site ready to launch/deploy for real?"
- User mentions setting up the custom domain or going live
- Right before `make deploy` if the conversation implies this is the real launch, not a routine update

## Checklist

Run each check and report pass/fail; don't stop at the first failure.

1. **`src/consts.ts`** — grep for `TODO`. Every hit (author email, GitHub URL,
   LinkedIn URL, site description, company) needs a real value or an explicit
   "leave blank" decision from the user.
2. **`src/pages/about.astro`** — grep for `TODO`; confirm it has real bio
   content, not placeholder text.
3. **`src/content/blog/hello-world.mdx`** — check its `draft` frontmatter
   field. If still `draft: true`, ask the user whether to publish it as-is,
   rewrite it, or delete it — don't silently flip the flag.
4. **`public/og-default.png`** — confirm the file exists (`ls public/`). If
   missing, the site has no social-share image.
5. **`CF_ANALYTICS_TOKEN` in `src/consts.ts`** — note whether it's set; empty
   is a valid choice (skips analytics), just confirm it's intentional.
6. **Custom domain** — this one isn't checkable from the repo. Remind the
   user it's a manual step in the Cloudflare dashboard (Workers & Pages →
   custom domain).

## Quick Reference

```bash
grep -rn "TODO" src/consts.ts src/pages/about.astro
grep -n "draft" src/content/blog/hello-world.mdx
ls public/og-default.png 2>/dev/null || echo "MISSING"
```

## Output

Report as a short pass/fail list, one line per item above. Don't fix
anything automatically — these are content/identity decisions only the user
can make (e.g. whether to disclose an employer). Offer to make the edit once
they give you the value.
