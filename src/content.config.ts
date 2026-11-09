import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
			// i18n-ready: only 'en' is published today, but the field already
			// exists so German posts are an addition, not a schema migration.
			lang: z.enum(['en', 'de']).default('en'),
			heroImage: image().optional(),
		}),
});

// Talks: one entry per meetup/conference talk, rendered at /talks/<id>/.
// Slides and demo material are NOT referenced here — they're picked up from
// public/talks/<id>/ by src/lib/talks.ts, so publishing a notebook is just
// dropping the file in that folder. The entry body is the talk abstract.
const talks = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/talks' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		event: z.string(),
		eventUrl: z.url().optional(),
		date: z.coerce.date(),
		location: z.string().optional(),
		// Language the talk is *given* in — slides are always English.
		lang: z.enum(['en', 'de']).default('en'),
		recording: z.url().optional(),
		repo: z.url().optional(),
		// Blog post ids (filenames under src/content/blog) the talk builds on.
		posts: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, talks };
