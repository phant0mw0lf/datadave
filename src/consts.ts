/**
 * Single source of truth for site + author metadata. Imported by the About
 * page, footer, RSS feed, JSON-LD, and OG tags — change it here, not in the
 * five places that used to read it.
 */
export const SITE = {
	title: 'datadave',
	tagline: "AI that's built on a real data foundation",
	description:
		"I'm an Azure Cloud Architect building data foundations — lakehouses, pipelines, governance — and turning them into AI: LLMs, agents, and automation that hold up in production, not just in demos.",
	url: 'https://datadave.dev',
	author: 'David Fengler',
	email: 'datadave@davidfengler.de',
	github: 'https://github.com/phant0mw0lf',
	linkedin: 'https://www.linkedin.com/in/davidfengler/',
	company: 'glueckkanja AG',
} as const;

/**
 * Cloudflare Web Analytics site token, from the CF dashboard under
 * Analytics & Logs -> Web Analytics -> Add a site. This token is public by
 * design (it's embedded in client-side HTML) and is safe to commit.
 *
 * Leave empty to skip loading the analytics script entirely.
 */
export const CF_ANALYTICS_TOKEN = '';
