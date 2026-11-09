/**
 * datadave slide system — layouts, theme and helpers for every talk deck.
 *
 * Mirrors the blog's design system (src/styles/global.css): GitHub Primer
 * light/dark palette, IBM Plex Sans/Mono for UI and body, Fraunces reserved
 * for the one signature moment (the title slide's h1). The logo's
 * "pipeline" — a line with three nodes — is the visual motif throughout.
 *
 *   const { createDeck } = require('./brand');
 *   const d = createDeck('dark');            // or 'light'
 *   d.titleSlide({ ... }); d.aboutSlide(); ... d.closingSlide();
 *   await d.save('my-talk.pptx');            // or .potx
 *
 * Fixed frame for every talk: titleSlide → aboutSlide → … → closingSlide.
 */
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
// jszip ships with pptxgenjs
const JSZip = require(require.resolve('jszip', { paths: [path.dirname(require.resolve('pptxgenjs'))] }));

const ASSETS = path.join(__dirname, 'assets');

const PALETTES = {
	dark: {
		bg: '0D1117', surface: '161B22', fg: 'E6EDF3', muted: '848D97', border: '30363D',
		accent: '2F81F7', purple: 'A371F7', green: '3FB950', orange: 'FB8F44', red: 'F85149', pink: 'DB61A2',
		// Shiki github-dark token colors, for code slides
		code: { keyword: 'FF7B72', string: 'A5D6FF', entity: 'D2A8FF', constant: '79C0FF', comment: '8B949E', text: 'E6EDF3' },
	},
	light: {
		bg: 'FFFFFF', surface: 'F6F8FA', fg: '1F2328', muted: '656D76', border: 'D0D7DE',
		accent: '0969DA', purple: '8250DF', green: '1A7F37', orange: 'BC4C00', red: 'CF222E', pink: 'BF3989',
		code: { keyword: 'CF222E', string: '0A3069', entity: '8250DF', constant: '0550AE', comment: '6E7781', text: '1F2328' },
	},
};

const FONT = { sans: 'IBM Plex Sans', mono: 'IBM Plex Mono', display: 'Fraunces' };

const AUTHOR = {
	name: 'David Fengler',
	role: 'Azure Cloud Architect',
	company: 'glueckkanja AG',
	bio: 'I build data foundations — lakehouses, pipelines, governance — and turn them into AI that holds up in production, not just in demos.',
	links: [
		['blog', 'datadave.dev'],
		['github', 'github.com/phant0mw0lf'],
		['linkedin', 'linkedin.com/in/davidfengler'],
		['oss', 'pipetree.dev'],
	],
	site: 'https://datadave.dev',
};

// Canvas: LAYOUT_WIDE, 13.333" × 7.5"
const W = 13.333, H = 7.5, MX = 0.8, CW = W - 2 * MX;
const TOP = { kickerY: 0.55, titleY: 0.85, contentY: 2.05, contentB: 6.55 };

function themeFor(p, variant) {
	// dk1/lt1 are deliberately text/background (not "dark"/"light"), so the
	// same scheme slots work in both variants: text1 is always the ink colour.
	return {
		name: `datadave ${variant}`,
		headFontFace: FONT.sans, bodyFontFace: FONT.sans,
		colors: {
			dk1: p.fg, lt1: p.bg, dk2: p.muted, lt2: p.surface,
			accent1: p.accent, accent2: p.purple, accent3: p.green, accent4: p.orange, accent5: p.red, accent6: p.pink,
			hlink: p.accent, folHlink: p.purple,
		},
	};
}

/** Writes the colour scheme + fonts into ppt/theme/theme1.xml (pptxgenjs can't). */
async function writeTheme(buf, theme) {
	const zip = await JSZip.loadAsync(buf);
	const files = Object.keys(zip.files).filter((f) => /^ppt\/theme\/theme\d+\.xml$/.test(f));
	const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
	for (const f of files) {
		let x = await zip.file(f).async('string');
		const c = theme.colors;
		const slot = (k) => `<a:${k}><a:srgbClr val="${c[k]}"/></a:${k}>`;
		const scheme = `<a:clrScheme name="${esc(theme.name)}">${['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'].map(slot).join('')}</a:clrScheme>`;
		x = x.replace(/<a:clrScheme[\s\S]*?<\/a:clrScheme>/, scheme);
		x = x.replace(/(<a:majorFont>\s*<a:latin typeface=")[^"]*"/, `$1${esc(theme.headFontFace)}"`);
		x = x.replace(/(<a:minorFont>\s*<a:latin typeface=")[^"]*"/, `$1${esc(theme.bodyFontFace)}"`);
		x = x.replace(/(<a:theme [^>]*name=")[^"]*"/, `$1${esc(theme.name)}"`);
		zip.file(f, x);
	}
	return zip;
}

function createDeck(variant = 'dark', meta = {}) {
	const p = PALETTES[variant];
	if (!p) throw new Error(`unknown variant ${variant}`);
	const pres = new pptxgen();
	pres.layout = 'LAYOUT_WIDE';
	pres.author = AUTHOR.name;
	pres.company = 'datadave.dev';
	pres.title = meta.title || 'datadave talk';
	pres.theme = { headFontFace: FONT.sans, bodyFontFace: FONT.sans };
	const C = pres.SchemeColor;
	const S = pres.ShapeType;
	const logo = path.join(ASSETS, `logo-${variant}.png`);
	const avatar = path.join(ASSETS, 'avatar-circle.png');

	// ---------- layout building blocks ----------
	const footer = () => [
		{ image: { x: MX, y: 6.93, w: 0.5, h: 0.25, path: logo } },
		{ text: { text: 'datadave.dev', options: { x: MX + 0.6, y: 6.9, w: 3, h: 0.3, margin: 0, fontFace: FONT.mono, fontSize: 11, color: p.muted, valign: 'middle' } } },
	];
	const slideNum = { x: W - MX - 1, y: 6.9, w: 1, h: 0.3, margin: 0, fontFace: FONT.mono, fontSize: 11, color: p.muted, align: 'right', valign: 'middle' };
	const kickerPh = (y = TOP.kickerY, x = MX, w = CW) => ({
		placeholder: { options: { name: 'kicker', type: 'body', x, y, w, h: 0.35, margin: 0, fontFace: FONT.mono, fontSize: 13, color: p.accent, valign: 'middle' }, text: '// section' },
	});
	const titlePh = (opts = {}) => ({
		placeholder: { options: { name: 'title', type: 'title', x: MX, y: TOP.titleY, w: CW, h: 0.95, margin: 0, fontFace: FONT.sans, fontSize: 36, bold: true, color: p.fg, align: 'left', valign: 'top', ...opts }, text: 'Slide title' },
	});
	const bodyPh = (name, x, y, w, h, opts = {}) => ({
		placeholder: { options: { name, type: 'body', x, y, w, h, margin: 0, fontFace: FONT.sans, fontSize: 20, color: p.fg, valign: 'top', paraSpaceAfter: 10, ...opts }, text: 'Text' },
	});
	const shape = (shapeType, o) => ({ text: { text: '', options: { shape: shapeType, ...o } } });
	/** the logo's pipeline: line + green/purple/blue(ring) nodes */
	const pipeline = (x, y, len, scale = 1) => {
		const r = (d) => d * scale;
		return [
			{ line: { x, y, w: len, h: 0, line: { color: p.fg, width: 3 * scale } } },
			shape(S.ellipse, { x: x + len * 0.17 - r(0.09), y: y - r(0.09), w: r(0.18), h: r(0.18), fill: { color: p.green }, line: { color: p.green, width: 0 } }),
			shape(S.ellipse, { x: x + len * 0.56 - r(0.14), y: y - r(0.14), w: r(0.28), h: r(0.28), fill: { color: p.purple }, line: { color: p.purple, width: 0 } }),
			shape(S.ellipse, { x: x + len - r(0.29), y: y - r(0.29), w: r(0.58), h: r(0.58), fill: { color: p.bg, transparency: 100 }, line: { color: p.accent, width: 2 * scale, transparency: 55 } }),
			shape(S.ellipse, { x: x + len - r(0.19), y: y - r(0.19), w: r(0.38), h: r(0.38), fill: { color: p.accent }, line: { color: p.accent, width: 0 } }),
		];
	};

	// ---------- layouts ----------
	const L = {
		title: 'DD · Title',
		about: 'DD · About',
		section: 'DD · Section',
		content: 'DD · Content',
		titleOnly: 'DD · Title only',
		twoCol: 'DD · Two columns',
		statement: 'DD · Statement',
		code: 'DD · Code',
		image: 'DD · Text + image',
		demo: 'DD · Demo',
		closing: 'DD · Closing',
		blank: 'DD · Blank',
	};

	pres.defineSlideMaster({
		title: L.title,
		background: { color: p.bg },
		objects: [
			kickerPh(1.0),
			{ placeholder: { options: { name: 'title', type: 'title', x: MX, y: 1.55, w: 10.2, h: 2.6, margin: 0, fontFace: FONT.display, fontSize: 54, color: p.fg, align: 'left', valign: 'bottom', lineSpacingMultiple: 0.95 }, text: 'Talk title' } },
			{ placeholder: { options: { name: 'subtitle', type: 'body', x: MX, y: 4.35, w: 9.6, h: 1.0, margin: 0, fontFace: FONT.sans, fontSize: 22, color: p.muted, valign: 'top' }, text: 'Subtitle' } },
			{ image: { x: MX, y: 5.92, w: 0.62, h: 0.62, path: avatar } },
			{ text: { text: AUTHOR.name, options: { x: MX + 0.8, y: 5.9, w: 6, h: 0.33, margin: 0, bold: true, color: p.fg, fontFace: FONT.sans, fontSize: 16, valign: 'middle' } } },
			{ text: { text: `${AUTHOR.role} · ${AUTHOR.company}`, options: { x: MX + 0.8, y: 6.24, w: 6, h: 0.3, margin: 0, color: p.muted, fontFace: FONT.mono, fontSize: 12, valign: 'middle' } } },
			...pipeline(9.3, 6.23, 3.1, 1.15),
		],
	});

	pres.defineSlideMaster({
		title: L.about,
		background: { color: p.bg },
		objects: [
			shape(S.ellipse, { x: 1.05, y: 1.45, w: 4.1, h: 4.1, fill: { color: p.bg, transparency: 100 }, line: { color: p.accent, width: 2.5, transparency: 55 } }),
			{ image: { x: 1.4, y: 1.8, w: 3.4, h: 3.4, path: avatar } },
			{ text: { text: '// whoami', options: { x: 6.0, y: 1.3, w: 6, h: 0.35, margin: 0, fontFace: FONT.mono, fontSize: 13, color: p.accent, valign: 'middle' } } },
			{ text: { text: AUTHOR.name, options: { x: 6.0, y: 1.75, w: 6.5, h: 0.8, margin: 0, fontFace: FONT.sans, fontSize: 40, bold: true, color: p.fg, valign: 'top' } } },
			{ text: { text: `${AUTHOR.role} @ ${AUTHOR.company}`, options: { x: 6.0, y: 2.55, w: 6.5, h: 0.45, margin: 0, fontFace: FONT.sans, fontSize: 20, color: p.muted, valign: 'top' } } },
			{ text: { text: AUTHOR.bio, options: { x: 6.0, y: 3.2, w: 6.3, h: 1.1, margin: 0, fontFace: FONT.sans, fontSize: 18, color: p.fg, valign: 'top', lineSpacingMultiple: 1.15 } } },
			...AUTHOR.links.flatMap(([k, v], i) => [
				shape(S.ellipse, { x: 6.0, y: 4.62 + i * 0.42, w: 0.12, h: 0.12, fill: { color: [p.green, p.purple, p.accent, p.orange][i] }, line: { width: 0, color: p.bg } }),
				{ text: { text: k, options: { x: 6.3, y: 4.5 + i * 0.42, w: 1.1, h: 0.36, margin: 0, fontFace: FONT.mono, fontSize: 14, color: p.muted, valign: 'middle' } } },
				{ text: { text: v, options: { x: 7.45, y: 4.5 + i * 0.42, w: 5, h: 0.36, margin: 0, fontFace: FONT.mono, fontSize: 14, color: p.fg, valign: 'middle' } } },
			]),
			...footer(),
		],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.section,
		background: { color: p.bg },
		objects: [
			kickerPh(2.05),
			titlePh({ y: 2.5, h: 1.6, fontSize: 54, valign: 'top' }),
			bodyPh('subtitle', MX, 4.15, 9.5, 0.9, { fontSize: 22, color: p.muted }),
			...footer(),
		],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.content,
		background: { color: p.bg },
		objects: [kickerPh(), titlePh(), bodyPh('body', MX, TOP.contentY, 9.6, TOP.contentB - TOP.contentY), ...footer()],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.titleOnly,
		background: { color: p.bg },
		objects: [kickerPh(), titlePh(), ...footer()],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.twoCol,
		background: { color: p.bg },
		objects: [
			kickerPh(), titlePh(),
			bodyPh('left', MX, TOP.contentY, 5.6, TOP.contentB - TOP.contentY, { fontSize: 18 }),
			bodyPh('right', MX + 6.13, TOP.contentY, 5.6, TOP.contentB - TOP.contentY, { fontSize: 18 }),
			...footer(),
		],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.statement,
		background: { color: p.bg },
		objects: [
			kickerPh(1.8),
			titlePh({ y: 2.3, h: 2.9, fontSize: 44, valign: 'top', lineSpacingMultiple: 1.05 }),
			bodyPh('source', MX, 5.35, 9, 0.5, { fontSize: 16, color: p.muted, fontFace: FONT.mono }),
			...footer(),
		],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.code,
		background: { color: p.bg },
		objects: [
			kickerPh(), titlePh(),
			shape(S.roundRect, { x: MX, y: TOP.contentY, w: CW, h: TOP.contentB - TOP.contentY, rectRadius: 0.12, fill: { color: p.surface }, line: { color: p.border, width: 1 } }),
			{ line: { x: MX, y: TOP.contentY + 0.5, w: CW, h: 0, line: { color: p.border, width: 1 } } },
			{ placeholder: { options: { name: 'filename', type: 'body', x: MX + 0.3, y: TOP.contentY + 0.07, w: 8, h: 0.36, margin: 0, fontFace: FONT.mono, fontSize: 12, color: p.muted, valign: 'middle' }, text: 'file.py' } },
			{ placeholder: { options: { name: 'code', type: 'body', x: MX + 0.3, y: TOP.contentY + 0.7, w: CW - 0.6, h: TOP.contentB - TOP.contentY - 0.9, margin: 0, fontFace: FONT.mono, fontSize: 16, color: p.code.text, valign: 'top', lineSpacingMultiple: 1.1 }, text: '# code' } },
			...footer(),
		],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.image,
		background: { color: p.bg },
		objects: [
			kickerPh(), titlePh({ w: 5.6, h: 1.5 }),
			bodyPh('body', MX, 2.6, 5.4, 3.95, { fontSize: 18 }),
			shape(S.roundRect, { x: 6.93, y: 0.85, w: 5.6, h: 5.7, rectRadius: 0.12, fill: { color: p.surface }, line: { color: p.border, width: 1 } }),
			...footer(),
		],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.demo,
		background: { color: p.bg },
		objects: [
			{ text: { text: '$', options: { x: MX, y: 2.2, w: 0.8, h: 1.5, margin: 0, fontFace: FONT.mono, fontSize: 72, color: p.green, valign: 'middle' } } },
			{ text: { text: 'live demo', options: { x: MX + 1.2, y: 2.2, w: 6.2, h: 1.5, margin: 0, fontFace: FONT.mono, fontSize: 72, color: p.fg, valign: 'middle' } } },
			{ text: { text: '_', options: { x: MX + 6.6, y: 2.2, w: 0.8, h: 1.5, margin: 0, fontFace: FONT.mono, fontSize: 72, color: p.accent, valign: 'middle' } } },
			bodyPh('body', MX, 3.95, 10, 1.4, { fontSize: 22, color: p.muted }),
			...footer(),
		],
		slideNumber: slideNum,
	});

	pres.defineSlideMaster({
		title: L.closing,
		background: { color: p.bg },
		objects: [
			{ text: { text: '// thanks', options: { x: MX, y: 1.0, w: 6, h: 0.35, margin: 0, fontFace: FONT.mono, fontSize: 13, color: p.accent, valign: 'middle' } } },
			{ text: { text: 'Thank you.', options: { x: MX, y: 1.45, w: 7.5, h: 1.3, margin: 0, fontFace: FONT.display, fontSize: 60, color: p.fg, valign: 'top' } } },
			{ text: { text: 'Questions, war stories, pushback — all welcome.', options: { x: MX, y: 2.75, w: 7.3, h: 0.5, margin: 0, fontFace: FONT.sans, fontSize: 22, color: p.muted, valign: 'top' } } },
			...AUTHOR.links.flatMap(([k, v], i) => [
				shape(S.ellipse, { x: MX, y: 4.12 + i * 0.44, w: 0.12, h: 0.12, fill: { color: [p.green, p.purple, p.accent, p.orange][i] }, line: { width: 0, color: p.bg } }),
				{ text: { text: k, options: { x: MX + 0.3, y: 4.0 + i * 0.44, w: 1.1, h: 0.36, margin: 0, fontFace: FONT.mono, fontSize: 15, color: p.muted, valign: 'middle' } } },
				{ text: { text: v, options: { x: MX + 1.5, y: 4.0 + i * 0.44, w: 5, h: 0.36, margin: 0, fontFace: FONT.mono, fontSize: 15, color: p.fg, valign: 'middle' } } },
			]),
			shape(S.roundRect, { x: 8.93, y: 1.4, w: 3.6, h: 4.3, rectRadius: 0.15, fill: { color: 'FFFFFF' }, line: { color: p.border, width: 1 } }),
			{ placeholder: { options: { name: 'qrcaption', type: 'body', x: 8.93, y: 4.95, w: 3.6, h: 0.5, margin: 0, fontFace: FONT.mono, fontSize: 13, color: '1F2328', align: 'center', valign: 'middle' }, text: 'datadave.dev' } },
			...pipeline(MX, 6.45, 2.4, 0.75),
		],
	});

	pres.defineSlideMaster({
		title: L.blank,
		background: { color: p.bg },
		objects: [...footer()],
		slideNumber: slideNum,
	});

	// ---------- slide helpers ----------
	let section = null;
	const add = (layout) => pres.addSlide(section ? { masterName: layout, sectionTitle: section } : { masterName: layout });
	const ph = (s, name, text, opts = {}) => s.addText(text, { placeholder: name, ...opts });
	const notes = (s, n) => n && s.addNotes(n);

	/** bullet list as runs for a body placeholder; items can be strings or [bold, rest] */
	const bullets = (items, o = {}) =>
		items.map((it, i) => {
			const last = i === items.length - 1;
			if (Array.isArray(it)) {
				return [
					{ text: it[0], options: { bold: true, paraSpaceAfter: 16, ...o } },
					{ text: ` ${it[1]}`, options: { color: p.muted, breakLine: !last } },
				];
			}
			return [{ text: it, options: { bullet: { code: '25CF' }, breakLine: !last, ...o } }];
		}).flat();

	const api = {
		pres, C, S, p, FONT, L, W, H, MX, CW, TOP, AUTHOR,
		section(title) { section = title; pres.addSection({ title }); },

		// ── fixed opening ──
		titleSlide({ title, subtitle = '', event = '', notes: n } = {}) {
			const s = add(L.title);
			ph(s, 'kicker', event ? `// ${event}` : ' ');
			ph(s, 'title', title);
			ph(s, 'subtitle', subtitle || ' ');
			notes(s, n);
			return s;
		},
		aboutSlide({ notes: n } = {}) { const s = add(L.about); notes(s, n); return s; },

		// ── fixed closing ──
		closingSlide({ qrUrl = AUTHOR.site, qrCaption, notes: n } = {}) {
			const s = add(L.closing);
			const img = api.qr(qrUrl);
			s.addImage({ path: img, x: 9.33, y: 1.75, w: 2.8, h: 2.8, altText: `QR code: ${qrUrl}`, objectName: 'qr' });
			ph(s, 'qrcaption', qrCaption || qrUrl.replace(/^https?:\/\//, ''));
			notes(s, n);
			return s;
		},

		// ── content ──
		sectionSlide({ num, total, kicker, title, subtitle = '', notes: n }) {
			const s = add(L.section);
			ph(s, 'kicker', kicker || `// ${String(num).padStart(2, '0')}`);
			ph(s, 'title', title);
			ph(s, 'subtitle', subtitle || ' ');
			if (total) api.progress(s, num, total);
			notes(s, n);
			return s;
		},
		/** pipeline progress: done nodes muted, current node accent + ring, upcoming hollow */
		progress(s, num, total) {
			const x0 = MX, y = 5.75, step = Math.min(1.1, 9 / Math.max(total - 1, 1));
			s.addShape(S.line, { x: x0, y, w: step * (total - 1), h: 0, line: { color: p.border, width: 2 }, objectName: 'progress-line' });
			if (num > 1) s.addShape(S.line, { x: x0, y, w: step * (num - 1), h: 0, line: { color: p.muted, width: 2 }, objectName: 'progress-done' });
			for (let i = 1; i <= total; i++) {
				const cx = x0 + step * (i - 1);
				if (i === num) {
					s.addShape(S.ellipse, { x: cx - 0.24, y: y - 0.24, w: 0.48, h: 0.48, fill: { color: p.bg, transparency: 100 }, line: { color: p.accent, width: 2, transparency: 55 }, objectName: `progress-ring-${i}` });
					s.addShape(S.ellipse, { x: cx - 0.15, y: y - 0.15, w: 0.3, h: 0.3, fill: { color: p.accent }, line: { color: p.accent, width: 0 }, objectName: `progress-node-${i}` });
				} else {
					const done = i < num;
					s.addShape(S.ellipse, { x: cx - 0.09, y: y - 0.09, w: 0.18, h: 0.18, fill: { color: done ? p.muted : p.bg }, line: { color: done ? p.muted : p.border, width: 2 }, objectName: `progress-node-${i}` });
				}
			}
		},
		agendaSlide({ kicker = '// agenda', title = 'What we’ll cover', items, notes: n }) {
			const s = add(L.titleOnly);
			ph(s, 'kicker', kicker);
			ph(s, 'title', title);
			const y0 = TOP.contentY + 0.15, gap = Math.min(1.05, 4.4 / items.length);
			const nodeX = MX + 0.12;
			s.addShape(S.line, { x: nodeX, y: y0 + 0.2, w: 0, h: gap * (items.length - 1), line: { color: p.border, width: 2 }, objectName: 'agenda-line' });
			const cols = [p.green, p.purple, p.accent, p.orange, p.pink, p.red];
			items.forEach(([head, desc], i) => {
				const y = y0 + i * gap;
				s.addShape(S.ellipse, { x: nodeX - 0.11, y: y + 0.09, w: 0.22, h: 0.22, fill: { color: cols[i % cols.length] }, line: { color: p.bg, width: 3 }, objectName: `agenda-node-${i + 1}` });
				s.addText(String(i + 1).padStart(2, '0'), { x: MX + 0.55, y, w: 0.7, h: 0.4, margin: 0, fontFace: FONT.mono, fontSize: 16, color: C.text2, valign: 'middle', isTextBox: true });
				s.addText([
					{ text: head, options: { bold: true, color: C.text1, fontSize: 22 } },
					...(desc ? [{ text: `  ${desc}`, options: { color: C.text2, fontSize: 18 } }] : []),
				], { x: MX + 1.25, y, w: CW - 1.3, h: 0.4, margin: 0, valign: 'middle', isTextBox: true });
			});
			notes(s, n);
			return s;
		},
		contentSlide({ kicker, title, items, notes: n }) {
			const s = add(L.content);
			ph(s, 'kicker', kicker || ' ');
			ph(s, 'title', title);
			ph(s, 'body', bullets(items));
			notes(s, n);
			return s;
		},
		twoColSlide({ kicker, title, left, right, leftHead, rightHead, notes: n }) {
			const s = add(L.twoCol);
			ph(s, 'kicker', kicker || ' ');
			ph(s, 'title', title);
			const col = (head, items, color) => [
				...(head ? [{ text: head, options: { fontFace: FONT.mono, fontSize: 14, color, breakLine: true, paraSpaceAfter: 14 } }] : []),
				...bullets(items),
			];
			ph(s, 'left', col(leftHead, left, p.muted));
			ph(s, 'right', col(rightHead, right, p.accent));
			notes(s, n);
			return s;
		},
		/** text can be a string or runs; use { text, options: { color: p.accent } } to highlight */
		statementSlide({ kicker, text, source, notes: n }) {
			const s = add(L.statement);
			ph(s, 'kicker', kicker || ' ');
			ph(s, 'title', text);
			ph(s, 'source', source || ' ');
			notes(s, n);
			return s;
		},
		/** lines: array of lines; each line a string or array of [text, tokenType] pairs */
		codeSlide({ kicker, title, filename, lines, fontSize, notes: n }) {
			const s = add(L.code);
			ph(s, 'kicker', kicker || ' ');
			ph(s, 'title', title);
			ph(s, 'filename', filename || ' ');
			const runs = [];
			lines.forEach((ln, i) => {
				const parts = typeof ln === 'string' ? [[ln, 'text']] : ln;
				const lastLine = i === lines.length - 1;
				if (!parts.length) parts.push([' ', 'text']);
				parts.forEach(([t, k], j) => runs.push({ text: t, options: { color: p.code[k] || p.code.text, breakLine: j === parts.length - 1 && !lastLine } }));
			});
			ph(s, 'code', runs, fontSize ? { fontSize } : {});
			notes(s, n);
			return s;
		},
		imageSlide({ kicker, title, items, image, imageW, imageH, notes: n }) {
			const s = add(L.image);
			ph(s, 'kicker', kicker || ' ');
			ph(s, 'title', title);
			ph(s, 'body', bullets(items));
			if (image) {
				// fit into the 5.6 × 5.7 panel with 0.3" padding
				const bw = 5.0, bh = 5.1;
				const r = Math.min(bw / imageW, bh / imageH);
				const w = imageW * r, h = imageH * r;
				s.addImage({ path: image, x: 6.93 + (5.6 - w) / 2, y: 0.85 + (5.7 - h) / 2, w, h, objectName: 'image' });
			}
			notes(s, n);
			return s;
		},
		/** cards: [{ head, text, color? }] in a row (2–4) */
		cardsSlide({ kicker, title, intro, cards, notes: n }) {
			const s = add(L.titleOnly);
			ph(s, 'kicker', kicker || ' ');
			ph(s, 'title', title);
			let y = TOP.contentY;
			if (intro) {
				s.addText(intro, { x: MX, y, w: CW, h: 0.5, margin: 0, fontSize: 20, color: C.text2, valign: 'top', isTextBox: true });
				y += 0.85;
			}
			const gap = 0.3, w = (CW - gap * (cards.length - 1)) / cards.length, h = TOP.contentB - y;
			const cols = [p.green, p.purple, p.accent, p.orange];
			cards.forEach((c, i) => {
				const x = MX + i * (w + gap);
				s.addShape(S.roundRect, { x, y, w, h, rectRadius: 0.1, fill: { color: p.surface }, line: { color: p.border, width: 1 }, objectName: `card-${i + 1}` });
				s.addShape(S.ellipse, { x: x + 0.35, y: y + 0.42, w: 0.22, h: 0.22, fill: { color: c.color || cols[i % 4] }, line: { width: 0, color: p.surface }, objectName: `card-node-${i + 1}` });
				s.addText(String(i + 1).padStart(2, '0'), { x: x + 0.7, y: y + 0.35, w: 1, h: 0.36, margin: 0, fontFace: FONT.mono, fontSize: 13, color: C.text2, valign: 'middle', isTextBox: true });
				s.addText(c.head, { x: x + 0.35, y: y + 0.95, w: w - 0.7, h: 0.9, margin: 0, fontSize: 22, bold: true, color: C.text1, valign: 'top', isTextBox: true });
				s.addText(c.text, { x: x + 0.35, y: y + 1.85, w: w - 0.7, h: h - 2.1, margin: 0, fontSize: 17, color: C.text2, valign: 'top', lineSpacingMultiple: 1.15, isTextBox: true });
			});
			notes(s, n);
			return s;
		},
		/** stats: [{ value, label, color? }] (1–3) */
		statSlide({ kicker, title, stats, notes: n }) {
			const s = add(L.titleOnly);
			ph(s, 'kicker', kicker || ' ');
			ph(s, 'title', title);
			const w = CW / stats.length, cols = [p.accent, p.green, p.purple];
			stats.forEach((st, i) => {
				const x = MX + i * w;
				s.addText(st.value, { x, y: 2.6, w: w - 0.4, h: 1.6, margin: 0, fontSize: 96, bold: true, color: st.color || cols[i % 3], valign: 'bottom', isTextBox: true });
				s.addText(st.label, { x, y: 4.35, w: w - 0.5, h: 1.2, margin: 0, fontSize: 20, color: C.text2, valign: 'top', isTextBox: true });
			});
			notes(s, n);
			return s;
		},
		/** wide picture (graph, screenshot) across the content area, optional caption below */
		figureSlide({ kicker, title, image, imageW, imageH, caption, notes: n }) {
			const s = add(L.titleOnly);
			ph(s, 'kicker', kicker || ' ');
			ph(s, 'title', title);
			const top = TOP.contentY, bottom = caption ? TOP.contentB - 0.6 : TOP.contentB;
			const r = Math.min(CW / imageW, (bottom - top) / imageH);
			const w = imageW * r, h = imageH * r;
			s.addImage({ path: image, x: MX + (CW - w) / 2, y: top + (bottom - top - h) / 2, w, h, objectName: 'figure' });
			if (caption) s.addText(caption, { x: MX, y: TOP.contentB - 0.45, w: CW, h: 0.4, margin: 0, fontFace: FONT.mono, fontSize: 13, color: C.text2, align: 'center', valign: 'middle', isTextBox: true });
			notes(s, n);
			return s;
		},
		demoSlide({ text, notes: n }) {
			const s = add(L.demo);
			ph(s, 'body', text || ' ');
			notes(s, n);
			return s;
		},
		blankSlide() { return add(L.blank); },

		/** QR PNG for a URL (cached in ./build/qr) — dark modules on transparent, sits on the white card */
		qr(url) {
			const { execFileSync } = require('child_process');
			const dir = path.join(process.cwd(), 'build', 'qr');
			fs.mkdirSync(dir, { recursive: true });
			const out = path.join(dir, url.replace(/[^a-z0-9]+/gi, '_') + '.png');
			if (!fs.existsSync(out)) execFileSync('python3', [path.join(__dirname, 'qr.py'), url, out, '0D1117']);
			return out;
		},

		async save(file) {
			const buf = await pres.write({ outputType: 'nodebuffer' });
			const zip = await writeTheme(buf, themeFor(p, variant));
			if (file.endsWith('.potx')) {
				const ct = '[Content_Types].xml';
				let x = await zip.file(ct).async('string');
				x = x.replace('presentationml.presentation.main+xml', 'presentationml.template.main+xml');
				zip.file(ct, x);
			}
			// copy files only — folder entries break some cloud/co-editing services
			const out = new JSZip();
			for (const [k, f] of Object.entries(zip.files)) if (!f.dir) out.file(k, await f.async('nodebuffer'), { createFolders: false });
			fs.writeFileSync(file, await out.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
			return file;
		},
	};
	return api;
}

module.exports = { createDeck, PALETTES, FONT, AUTHOR };
