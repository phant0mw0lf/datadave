// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
	site: 'https://datadave.dev',
	// Prefetch every internal link on hover/tap — pages are tiny static HTML,
	// so this makes navigation feel instant for the cost of a few kB.
	prefetch: { prefetchAll: true },
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
		rehypePlugins: [
			// Astro normally injects heading ids AFTER custom rehype plugins run,
			// so autolink-headings would see none — adding rehypeHeadingIds
			// explicitly first is the documented fix. Applies to .md and .mdx
			// alike (the mdx integration extends this markdown config).
			rehypeHeadingIds,
			[
				rehypeAutolinkHeadings,
				{
					behavior: 'append',
					properties: { class: 'heading-anchor', ariaLabel: 'Link to this section' },
					content: { type: 'text', value: '#' },
				},
			],
		],
		shikiConfig: {
			themes: {
				light: 'github-light',
				// 'github-dark' is Shiki's legacy "Dimmed" theme (#24292e bg) — use
				// 'github-dark-default' so code blocks match the #0d1117 bg the
				// rest of the site's dark mode uses (src/styles/global.css).
				dark: 'github-dark-default',
			},
			wrap: true,
		},
	},
});
