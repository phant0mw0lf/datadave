// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import mermaid from 'astro-mermaid';
import tailwindcss from '@tailwindcss/vite';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { MERMAID_BASE, MERMAID_LIGHT } from './src/lib/mermaidTheme.ts';

// https://astro.build/config
export default defineConfig({
	site: 'https://datadave.dev',
	// Prefetch every internal link on hover/tap — pages are tiny static HTML,
	// so this makes navigation feel instant for the cost of a few kB.
	prefetch: { prefetchAll: true },
	integrations: [
		// Turns ```mermaid fences into client-rendered SVG. `autoTheme` is
		// deliberately OFF: with it on, the integration ignores `theme: 'base'`
		// and forces Mermaid's stock 'default'/'dark' themes, which don't match
		// this site's GitHub Primer palette. Instead we bake in the light
		// `themeVariables` here and let src/components/MermaidTheme.astro swap
		// to the dark set (and re-render on toggle) client-side — the
		// integration bakes only ONE themeVariables object at build time, so a
		// two-theme custom palette has to be driven from the client.
		mermaid({
			autoTheme: false,
			theme: 'base',
			// The integration console.logs on every diagram render otherwise.
			enableLog: false,
			mermaidConfig: { ...MERMAID_BASE, themeVariables: MERMAID_LIGHT },
		}),
		mdx(),
		sitemap(),
	],
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
