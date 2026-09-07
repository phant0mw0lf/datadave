/**
 * Mermaid diagram palette, mirrored from the GitHub Primer tokens in
 * `src/styles/global.css` (`@theme` for light, `.dark` for dark). This is a
 * duplicate-by-necessity: Mermaid's `base` theme runs its own color math
 * (khroma) over these to derive node/edge/label shades, so the values MUST be
 * literal hex — a `var(--color-*)` reference here breaks that math and renders
 * an all-black or all-transparent diagram.
 *
 * The integration can only bake ONE `themeVariables` object into its
 * build-time page script, so it hardcodes the light set below; the dark set is
 * swapped in client-side by `src/components/MermaidTheme.astro` on load and on
 * every theme toggle. See that file and `astro.config.mjs` for why
 * `autoTheme` is off.
 */

/** Shared, theme-independent config — merged into both light and dark init. */
export const MERMAID_BASE = {
	// Same stack as --font-sans in global.css.
	fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
	flowchart: { curve: 'basis' },
} as const;

/** `--color-bg` / `--color-surface` / `--color-fg` / `--color-border` / `--color-fg-muted`. */
export const MERMAID_LIGHT = {
	darkMode: false,
	background: '#ffffff',
	primaryColor: '#f6f8fa',
	primaryTextColor: '#1f2328',
	textColor: '#1f2328',
	primaryBorderColor: '#d0d7de',
	lineColor: '#656d76',
} as const;

/** The `.dark` overrides of the same five tokens. */
export const MERMAID_DARK = {
	darkMode: true,
	background: '#0d1117',
	primaryColor: '#161b22',
	primaryTextColor: '#e6edf3',
	textColor: '#e6edf3',
	primaryBorderColor: '#30363d',
	lineColor: '#848d97',
} as const;
