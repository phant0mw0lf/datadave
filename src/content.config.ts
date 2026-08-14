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

export const collections = { blog };
