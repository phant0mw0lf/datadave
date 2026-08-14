import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { getPosts } from '../lib/posts';

export async function GET(context: APIContext) {
	const posts = await getPosts();
	return rss({
		title: SITE.title,
		description: SITE.description,
		site: context.site!,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
		})),
		customData: [
			'<language>en-us</language>',
			`<lastBuildDate>${(posts[0]?.data.pubDate ?? new Date()).toUTCString()}</lastBuildDate>`,
		].join(''),
	});
}
