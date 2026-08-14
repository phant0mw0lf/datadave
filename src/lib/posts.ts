import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * All published posts, newest first.
 *
 * Drafts (`draft: true`) are excluded in production builds but visible in
 * `astro dev` so you can preview a post before it goes live. This is the
 * single place that decides "is a post visible" — every route imports this
 * instead of calling `getCollection('blog')` directly, so the draft rule
 * can't drift between pages.
 */
export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getCollection('blog', ({ data }) =>
		import.meta.env.PROD ? !data.draft : true,
	);

	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Unique tags across all published posts, alphabetically sorted. */
export async function getTags(): Promise<string[]> {
	const posts = await getPosts();
	const tags = new Set(posts.flatMap((post) => post.data.tags));
	return [...tags].sort((a, b) => a.localeCompare(b));
}

export async function getPostsByTag(tag: string): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getPosts();
	return posts.filter((post) => post.data.tags.includes(tag));
}

/** Rough reading time estimate, English prose average of 200 wpm. */
export function readingTime(body: string): string {
	const words = body.trim().split(/\s+/).length;
	const minutes = Math.max(1, Math.round(words / 200));
	return `${minutes} min read`;
}
