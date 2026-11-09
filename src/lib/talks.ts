import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Talk = CollectionEntry<'talks'>;

/**
 * All published talks, newest first. Same draft rule as getPosts(): drafts
 * show in `astro dev`, never in a production build. Every talks route goes
 * through here.
 */
export async function getTalks(): Promise<Talk[]> {
	const talks = await getCollection('talks', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
	return talks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Upcoming = talk date is today or later, judged at build time. Cloudflare
 * rebuilds on every push, so a talk moves to "past" with the next deploy
 * after it happened — fine for a list that changes a few times a year.
 */
export function isUpcoming(talk: Talk, now = new Date()): boolean {
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return talk.data.date >= today;
}

export interface TalkFile {
	/** Path relative to the talk folder, e.g. `demo/run_demo.py`. */
	name: string;
	/** Site-absolute URL, e.g. `/talks/<id>/demo/run_demo.py`. */
	href: string;
	bytes: number;
}

/**
 * Material published for a talk: everything under public/talks/<id>/.
 * `slides.pdf` is pulled out as the primary download; the rest is listed as
 * demo material (scripts, notebooks, configs). Dotfiles are skipped.
 */
export function getTalkFiles(id: string): { slides?: TalkFile; files: TalkFile[] } {
	const root = path.join(process.cwd(), 'public', 'talks', id);
	if (!fs.existsSync(root)) return { files: [] };

	const files: TalkFile[] = [];
	const walk = (dir: string) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			if (entry.name.startsWith('.')) continue;
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) walk(full);
			else {
				const name = path.relative(root, full).split(path.sep).join('/');
				files.push({ name, href: `/talks/${id}/${name}`, bytes: fs.statSync(full).size });
			}
		}
	};
	walk(root);
	files.sort((a, b) => a.name.localeCompare(b.name));

	const slides = files.find((f) => f.name === 'slides.pdf');
	return { slides, files: files.filter((f) => f !== slides) };
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
