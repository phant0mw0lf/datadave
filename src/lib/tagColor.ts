// Six-color categorical palette, defined per light/dark mode as --tag-0..5 in
// global.css. The same tag name always hashes to the same slot, so tag color
// stays consistent across the post list, post header, and homepage archive
// axis without maintaining a hand-picked color per tag.
const PALETTE_SIZE = 6;

export function tagColorVar(tag: string): string {
	let hash = 0;
	for (let i = 0; i < tag.length; i++) {
		hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
	}
	return `var(--tag-${hash % PALETTE_SIZE})`;
}
