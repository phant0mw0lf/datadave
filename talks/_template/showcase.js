/**
 * Builds the template showcase: every layout once, with sample content.
 *   node showcase.js   → datadave-dark.potx, datadave-light.potx (+ build/*.pptx for rendering previews)
 */
const fs = require('fs');
const path = require('path');
const { createDeck } = require('./brand');

async function build(variant) {
	const d = createDeck(variant, { title: 'datadave talk template' });
	const { p } = d;

	d.section('Opening (fixed)');
	d.titleSlide({
		event: 'Data Engineering Meetup · Nov 2026',
		title: 'Metadata-Driven Pipeline Orchestration',
		subtitle: 'From one YAML file to a running lakehouse',
		notes: 'FIXED OPENING 1/2 — layout "DD · Title". Change only kicker (event · date), title and subtitle.',
	});
	d.aboutSlide({ notes: 'FIXED OPENING 2/2 — layout "DD · About". Content lives in the layout; edit the master (or brand.js) to change it everywhere.' });

	d.section('Content layouts');
	d.agendaSlide({
		items: [
			['The problem', 'why hand-built pipelines stop scaling'],
			['The model', 'packages, layers and a YAML schema'],
			['The executor', 'parallelism and failure handling'],
			['Live demo', 'one config, one run'],
		],
		notes: 'Agenda — "DD · Title only" + helper agendaSlide(). Vertical pipeline with one node per item (max ~6).',
	});
	d.sectionSlide({ num: 2, total: 4, title: 'The model', subtitle: 'Describe the pipeline, don’t write it', notes: 'Section divider — "DD · Section". The pipeline at the bottom shows progress through the talk.' });
	d.contentSlide({
		kicker: '// 02 · the model',
		title: 'Configuration over code',
		items: [
			['One schema', 'for every source, layer and target'],
			['Generated DAGs', 'dependencies come from metadata, not from hand-wired tasks'],
			['Reviewable changes', 'a new table is a pull request, not a notebook'],
		],
		notes: 'Content — "DD · Content". Bold lead + muted rest per bullet; keep it to 3–5 bullets.',
	});
	d.cardsSlide({
		kicker: '// 02 · the model',
		title: 'Three layers, one contract',
		cards: [
			{ head: 'Raw', text: 'Land data as delivered. No business logic, full history.' },
			{ head: 'Structured', text: 'Typed, deduplicated, conformed — still close to the source.' },
			{ head: 'Curated', text: 'Modelled for consumers: reporting, ML features, agents.' },
		],
		notes: 'Cards — "DD · Title only" + cardsSlide(). 2–4 cards; node colours follow the logo (green → purple → blue).',
	});
	d.codeSlide({
		kicker: '// 02 · the model',
		title: 'A pipeline is just a file',
		filename: 'pipelines/sales.yaml',
		lines: [
			[['package', 'entity'], [': ', 'text'], ['sales', 'string']],
			[['layers', 'entity'], [':', 'text']],
			[['  - ', 'text'], ['name', 'entity'], [': ', 'text'], ['raw', 'string']],
			[['    source', 'entity'], [': ', 'text'], ['jdbc://erp/orders', 'string']],
			[['    schedule', 'entity'], [': ', 'text'], ['"0 */2 * * *"', 'string'], ['   # every 2h', 'comment']],
			[['  - ', 'text'], ['name', 'entity'], [': ', 'text'], ['curated', 'string']],
			[['    depends_on', 'entity'], [': ', 'text'], ['[raw]', 'constant']],
			[['    retries', 'entity'], [': ', 'text'], ['3', 'constant']],
		],
		notes: 'Code — "DD · Code". Tokens: keyword, string, entity, constant, comment (Shiki GitHub colours). ~12 lines max at 16pt.',
	});
	d.twoColSlide({
		kicker: '// 03 · the executor',
		title: 'Before and after',
		leftHead: 'hand-wired',
		left: ['One notebook per table', 'Retries copy-pasted', 'Lineage lives in people’s heads'],
		rightHead: 'metadata-driven',
		right: ['One engine, many configs', 'Retries and timeouts declared once', 'Lineage generated from the DAG'],
		notes: 'Two columns — "DD · Two columns". Mono heads: left muted, right accent.',
	});
	d.statSlide({
		kicker: '// 03 · the executor',
		title: 'What changed',
		stats: [
			{ value: '1', label: 'engine instead of one notebook per table' },
			{ value: '0', label: 'hand-written dependency lists' },
			{ value: 'n', label: 'tables onboarded by pull request' },
		],
		notes: 'Stats — "DD · Title only" + statSlide(). 1–3 numbers. Sample values only — replace with real ones.',
	});
	d.imageSlide({
		kicker: '// 03 · the executor',
		title: 'Failures, made visible',
		items: [['Red node', 'failed task'], ['Grey nodes', 'skipped downstream'], ['Everything else', 'keeps running']],
		image: path.join(__dirname, 'assets', 'sample-graph.png'),
		imageW: 1200, imageH: 627,
		notes: 'Text + image — "DD · Text + image". Screenshots/diagrams go in the right panel (helper fits them).',
	});
	d.statementSlide({
		kicker: '// takeaway',
		text: [
			{ text: 'If you can describe it, ' },
			{ text: 'you can generate it.', options: { color: p.accent } },
		],
		source: 'the one-line version of this talk',
		notes: 'Statement — "DD · Statement". One sentence, highlight the key phrase in accent.',
	});
	d.demoSlide({ text: 'pipetree run pipelines/sales.yaml', notes: 'Demo — "DD · Demo". Put the command or scenario in the line below.' });

	d.section('Closing (fixed)');
	d.closingSlide({ qrUrl: 'https://datadave.dev', notes: 'FIXED CLOSING — "DD · Closing". QR + caption per talk (e.g. link to the slides or the blog post).' });

	fs.mkdirSync('build', { recursive: true });
	await d.save(`build/datadave-${variant}.pptx`);
	await d.save(path.join(__dirname, `datadave-${variant}.potx`));
}

(async () => {
	for (const v of ['dark', 'light']) await build(v);
	console.log('built');
})();
