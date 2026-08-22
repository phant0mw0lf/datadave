import { OGImageRoute } from 'astro-og-canvas';
import { getPosts } from '../../lib/posts';

/**
 * Generated OpenGraph card for every post, served at /og/<post-id>.png.
 * PostLayout points og:image here whenever a post has no heroImage of its
 * own (posts with a hero keep using it — a real image beats a text card).
 *
 * Colors are the site's dark palette from global.css (bg #0d1117, fg
 * #e6edf3, fg-muted #848d97, accent #2f81f7) so shared links look like the
 * site. Fonts come from the @fontsource devDependencies as WOFF —
 * CanvasKit can't read the WOFF2 subsets in public/fonts/, and a pinned
 * package beats fetching font URLs at build time (deterministic, no
 * network dependency).
 */
const posts = await getPosts();

export const { getStaticPaths, GET } = await OGImageRoute({
	pages: Object.fromEntries(posts.map((post) => [post.id, post.data])),
	getImageOptions: (_path, page) => ({
		title: page.title,
		description: page.description,
		bgGradient: [[13, 17, 23]],
		border: { color: [47, 129, 247], width: 12, side: 'inline-start' },
		padding: 72,
		font: {
			title: {
				families: ['Fraunces'],
				weight: 'SemiBold',
				size: 64,
				color: [230, 237, 243],
				lineHeight: 1.2,
			},
			description: {
				families: ['IBM Plex Sans'],
				size: 30,
				color: [132, 141, 151],
				lineHeight: 1.5,
			},
		},
		fonts: [
			'./node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff',
			'./node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff',
		],
	}),
});
