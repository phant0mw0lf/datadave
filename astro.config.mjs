// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://datadave.dev',
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
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
