/**
 * Power Platform & Fabric User Group Cologne · 8 Dec 2026
 * "Stop Copy-Pasting Your Pipelines: Metadata-Driven Orchestration in Practice"
 *
 *   node deck.js            → metadata-orchestration.pptx (dark)
 *   node deck.js light      → metadata-orchestration-light.pptx
 *
 * Slides in English, talk in German — speaker notes are German.
 */
const path = require('path');
const { createDeck } = require(path.join(__dirname, '..', '_template', 'brand.js'));

const ID = 'metadata-driven-pipeline-orchestration';
const TALK_URL = `https://datadave.dev/talks/${ID}/`;
const img = (f) => path.join(__dirname, 'img', f);

(async () => {
	const variant = process.argv[2] === 'light' ? 'light' : 'dark';
	const d = createDeck(variant, { title: 'Stop Copy-Pasting Your Pipelines' });
	const { p } = d;
	const TOTAL = 5;

	// ───────────────────────── opening ─────────────────────────
	d.section('Opening');
	d.titleSlide({
		event: 'Power Platform & Fabric User Group Cologne · 8 Dec 2026',
		title: 'Stop Copy-Pasting Your Pipelines',
		subtitle: 'Metadata-driven orchestration in practice',
		notes: 'Begrüßung, Dank an die Orga. Kurz: Folien auf Englisch, Vortrag auf Deutsch. Fragen gerne zwischendurch.',
	});
	d.aboutSlide({ notes: 'Kurz halten (1 min): Azure Cloud Architect bei glueckkanja, ~7 Jahre DWH/BI, heute Lakehouses mit Fabric und Databricks. Blog datadave.dev — die Serie "Pipeline Engineering" ist die Langfassung dieses Vortrags.' });
	d.agendaSlide({
		items: [
			['The problem', 'ten systems, ten copies'],
			['The model', 'YAML schema and lakehouse layout'],
			['The executor', 'parallel runs, retries, failures, logging'],
			['Design decisions', 'what worked, what didn’t'],
			['Live demo', 'a new source in Fabric, end to end'],
		],
		notes: 'Ca. 45 min Vortrag, dann Demo, dann Q&A.',
	});

	// ───────────────────────── 01 problem ─────────────────────────
	d.section('01 The problem');
	d.sectionSlide({ num: 1, total: TOTAL, title: 'Ten systems, ten copies', subtitle: 'How a data platform grows when copying is the fastest way forward' });
	d.cardsSlide({
		kicker: '// 01 · the problem',
		title: 'It started with one good notebook',
		cards: [
			{ head: 'ERP first', text: 'Dynamics 365 via Export to Data Lake. Parameterised from day one — new instances never touched the file.' },
			{ head: 'Then the rest', text: 'CRM via Synapse Link, SharePoint and Entra via Graph, on-prem SQL Server over JDBC. Copy, swap the reader, adjust.' },
			{ head: 'Ten files', text: 'Each one generic within its system. Each one its own step in the job. The problem sat between the files.' },
		],
		notes: 'Ehrlich erzählen: das war kein "ein Notebook pro Tabelle"-Chaos. Jede Datei war in sich generisch — das Problem lag zwischen den Dateien.',
	});
	d.statSlide({
		kicker: '// 01 · the problem',
		title: 'Then came the cross-cutting change',
		stats: [
			{ value: '10', label: 'source systems, each with its own copied file' },
			{ value: '1', label: 'change: lineage columns everywhere, then multithreading', color: p.orange },
			{ value: '10×', label: 'the same edit, ten times, drifting a little each time', color: p.red },
		],
		notes: 'Der Auslöser: Lineage-Spalten überall, danach Multithreading. Beides heißt: zehn Dateien anfassen. Spätestens da war klar, dass Kopieren nicht skaliert.',
	});
	d.statementSlide({
		kicker: '// 01 · the insight',
		text: [{ text: 'What differed between the systems wasn’t logic. ' }, { text: 'It was description.', options: { color: p.accent } }],
		source: 'which system · which object · which key · how to merge',
		notes: 'Kernaussage des Vortrags. Das, was sich unterschied, waren Daten über die Pipeline — und die hatte ich zehnmal als Code geschrieben.',
	});

	// ───────────────────────── 02 model ─────────────────────────
	d.section('02 The model');
	d.sectionSlide({ num: 2, total: TOTAL, title: 'Describe it, don’t write it', subtitle: 'One YAML file, one small package that interprets it' });
	d.cardsSlide({
		kicker: '// 02 · the model',
		title: 'Four things, kept apart',
		cards: [
			{ head: 'What', text: 'The metadata: tables, systems, keys, merge strategy.' },
			{ head: 'In what order', text: 'A dependency graph the package derives itself.' },
			{ head: 'How', text: 'An engine-agnostic executor. Spark is an adapter.' },
			{ head: 'Where', text: 'Versioned files in the repo, promoted through CI/CD.' },
		],
		notes: 'Hand-geschriebene Pipelines vermischen diese vier Dinge immer. Das Paket hält sie getrennt. Config over code, convention over configuration.',
	});
	d.codeSlide({
		kicker: '// 02 · the model',
		title: 'One table, one block',
		filename: 'pipeline.yaml',
		lines: [
			[['systems', 'entity'], [':', 'text'], ['                     # declared once, referenced by name', 'comment']],
			[['  crm_dataverse', 'entity'], [':', 'text']],
			[['    type', 'entity'], [': ', 'text'], ['csv', 'string'], ['                 # csv · json · parquet · sqlserver · kusto · custom …', 'comment']],
			[['    path', 'entity'], [': ', 'text'], ['data/customer.csv', 'string']],
			[],
			[['bronze', 'entity'], [':', 'text']],
			[['  tables', 'entity'], [':', 'text']],
			[['    customer', 'entity'], [':', 'text']],
			[['      source', 'entity'], [': { ', 'text'], ['system', 'entity'], [': ', 'text'], ['crm_dataverse', 'string'], [', ', 'text'], ['object', 'entity'], [': ', 'text'], ['account', 'string'], [' }', 'text']],
			[['      business_key', 'entity'], [': ', 'text'], ['[accountid]', 'constant']],
			[['      strategy', 'entity'], [': ', 'text'], ['scd2', 'string'], ['              # scd2 · scd1 · replace · append', 'comment']],
		],
		fontSize: 14,
		notes: 'Systeme einmal deklariert, Tabellen referenzieren sie per Name. Pfade, Hosts, Secrets sind Referenzen — dieselbe Datei läuft in Dev, Test und Prod. Quelltypen sind Adapter; eigene Quellen per register_reader.',
	});
	d.twoColSlide({
		kicker: '// 02 · the model',
		title: 'Merge is the strategy, full stop',
		leftHead: 'strategy',
		left: ['scd2 — full history', 'scd1 — latest state', 'replace — rebuild every run', 'append — add rows'],
		rightHead: 'merge knobs',
		right: [
			'sequence_by — which change wins',
			'delete_when — what marks a delete',
			'delete_mode — soft · hard · ignore',
			'ignore_columns — not a real change',
		],
		notes: 'Jeder Knopf existiert, weil ohne ihn eine bestimmte Art falscher Daten entsteht. hard + scd2 lehnt der Loader ab — Historie halten und gleichzeitig wegwerfen ist ein Widerspruch.',
	});
	d.codeSlide({
		kicker: '// 02 · the model',
		title: 'Dependencies come from the code',
		filename: 'notebooks/gold/fact_sales.py',
		lines: [
			[['# one output table per file, inputs read at the top', 'comment']],
			[['orders   ', 'text'], ['= ', 'keyword'], ['spark', 'text'], ['.', 'text'], ['table', 'entity'], ['(', 'text'], ['"silver.orders"', 'string'], [')', 'text']],
			[['customer ', 'text'], ['= ', 'keyword'], ['spark', 'text'], ['.', 'text'], ['table', 'entity'], ['(', 'text'], ['"gold.dim_customer"', 'string'], [')', 'text']],
			[['# everything after — joins, logic — is yours', 'comment']],
			[],
			[['# pipeline.yaml', 'comment']],
			[['fact_sales', 'entity'], [':', 'text']],
			[['  logic', 'entity'], [': ', 'text'], ['notebooks/gold/fact_sales.py', 'string']],
			[['  depends_on', 'entity'], [': ', 'text'], ['auto', 'constant'], ['        # parsed from the reads above', 'comment']],
		],
		fontSize: 14,
		notes: 'depends_on: auto — SQL: FROM/JOIN, PySpark: spark.table/spark.sql mit Literalen. Bewusst einfacher Parser; dynamische Namen deklariert man explizit.',
	});
	d.figureSlide({
		kicker: '// 02 · the model',
		title: 'The package draws the tree',
		image: img('graph-before.png'), imageW: 3504, imageH: 873,
		caption: 'topological order · cycle check · run a table plus everything downstream',
		notes: 'Für viele das erste Mal, dass sie ihre Pipeline wirklich sehen statt einer von Hand verdrahteten Reihenfolge zu vertrauen.',
	});
	d.cardsSlide({
		kicker: '// 02 · the lakehouse',
		title: 'One lakehouse, a schema per layer',
		cards: [
			{ head: 'bronze · silver · gold', text: 'Schemas in one Fabric lakehouse, not one lakehouse per layer. Layers organise — they don’t gate execution.' },
			{ head: 'Files/', text: 'pipeline.yaml, the logic notebooks and landed source files. Versioned in the repo, deployed together.' },
			{ head: '_meta', text: 'pipeline_run_log: one row per table and run. Audit columns on every row, keyed to the same run.' },
		],
		notes: 'Bewusst ein Lakehouse mit Schemas pro Layer. Die Layer sind Namensräume in der YAML, keine Ausführungsgrenze.',
	});
	d.twoColSlide({
		kicker: '// 02 · the lakehouse',
		title: 'Audit columns you never write again',
		leftHead: 'every table',
		left: ['_inserted_at · _updated_at', '_is_deleted', '_execution_id', '_source_system'],
		rightHead: 'scd2 tables, additionally',
		right: ['_valid_from · _valid_to', '_is_current', 'timestamps: UTC bigint, YYMMddHHmmssSSS', 'readable in a debug query, lines up with the run'],
		notes: 'Die Frage nach dem Timestamp-Format kommt immer: bigint YYMMddHHmmssSSS, UTC. Lesbar ohne Konvertierung, gleiches Format wie _execution_id. Trade-off: zweistelliges Jahr.',
	});

	// ───────────────────────── 03 executor ─────────────────────────
	d.section('03 The executor');
	d.sectionSlide({ num: 3, total: TOTAL, title: 'Run the tree, not the layers', subtitle: 'Parallel, with retries, and failures that stop only what depends on them' });
	d.codeSlide({
		kicker: '// 03 · the executor',
		title: 'One counter per table',
		filename: 'pipetree/executor/runner.py (trimmed)',
		lines: [
			[['pending', 'text'], [' = ', 'keyword'], ['{t: ', 'text'], ['len', 'entity'], ['(parents[t]) ', 'text'], ['for', 'keyword'], [' t ', 'text'], ['in', 'keyword'], [' run_set}', 'text']],
			[['submit', 'entity'], ['(t ', 'text'], ['for', 'keyword'], [' t, n ', 'text'], ['in', 'keyword'], [' pending.items() ', 'text'], ['if', 'keyword'], [' n ', 'text'], ['==', 'keyword'], [' ', 'text'], ['0', 'constant'], [')', 'text']],
			[],
			[['while', 'keyword'], [' futures:', 'text']],
			[['    done', 'text'], [' = ', 'keyword'], ['wait', 'entity'], ['(futures, return_when', 'text'], ['=', 'keyword'], ['FIRST_COMPLETED', 'constant'], [')', 'text']],
			[['    for', 'keyword'], [' table ', 'text'], ['in', 'keyword'], [' done:', 'text']],
			[['        for', 'keyword'], [' child ', 'text'], ['in', 'keyword'], [' children[table]:', 'text']],
			[['            pending[child] ', 'text'], ['-=', 'keyword'], [' ', 'text'], ['1', 'constant']],
			[['            if', 'keyword'], [' pending[child] ', 'text'], ['==', 'keyword'], [' ', 'text'], ['0', 'constant'], [': ', 'text'], ['submit', 'entity'], ['(child)', 'text']],
		],
		fontSize: 16,
		notes: 'Tabellen ohne Eltern zuerst. Fertig → Zähler der Kinder runter → bei 0 sofort starten. Kein Layer wartet auf den langsamsten. Keine Locks: nur der eine Scheduler-Thread fasst die Buchhaltung an. Threads reichen, weil die Arbeit in Spark passiert. --max-workers, Default 4.',
	});
	d.twoColSlide({
		kicker: '// 03 · the executor',
		title: 'Retry what can be retried',
		leftHead: 'transient → retry',
		left: ['Throttling, timeouts, dropped connections', 'Spark/Delta errors translated by the adapter (0.1.1)', 'Up to 3 attempts, full-jitter backoff'],
		rightHead: 'permanent → fail now',
		right: ['Malformed export, missing column', 'Waiting never fixes these', 'append retries only if the run’s rows can be deleted first'],
		notes: 'Klassifizierung nach Exception-Typ, nie nach Fehlermeldung — die Übersetzung ist Aufgabe des Adapters. Seit 0.1.1 übersetzt der Spark-Adapter transiente Engine-Fehler. append ist nicht idempotent: Retry nur, wenn per _execution_id gelöscht werden kann.',
	});
	d.figureSlide({
		kicker: '// 03 · the executor',
		title: 'A failure stops exactly its subtree',
		image: img('graph-failed-run.png'), imageW: 1430, imageH: 187,
		caption: 'failed ≠ upstream_failed — one error to read, not seven',
		notes: 'bronze.customer scheitert, alles darunter wird upstream_failed und startet nie. employee und orders laufen durch. fact_sales hat einen gesunden und einen kaputten Elternteil — läuft trotzdem nicht. Eine Tabelle läuft nur, wenn alle Eltern erfolgreich waren.',
	});
	d.codeSlide({
		kicker: '// 03 · the executor',
		title: 'The digest, and an honest exit code',
		filename: 'run output',
		lines: [
			[['bronze.orders: attempt 1 failed (Throttled: 429), retrying in 0.47s', 'comment']],
			[['bronze.orders: retried→succeeded (attempts=3)', 'comment']],
			[],
			[['Run 261015095124804: ', 'text'], ['FAILED (exit code 1)', 'keyword']],
			[['  failed           ', 'keyword'], ['bronze.customer', 'text']],
			[['  succeeded        ', 'string'], ['bronze.employee', 'text']],
			[['  retried→succeeded', 'string'], [' bronze.orders', 'text']],
			[['  upstream_failed  ', 'entity'], ['silver.customer_enriched', 'text']],
			[['  upstream_failed  ', 'entity'], ['gold.dim_customer', 'text']],
			[['  upstream_failed  ', 'entity'], ['gold.fact_sales', 'text']],
			[['  succeeded        ', 'string'], ['silver.orders', 'text']],
		],
		fontSize: 14,
		notes: 'Der Executor wirft nicht, er liefert einen RunDigest. Rot, wenn irgendwas fehlschlug — aber erst nachdem alles gelaufen ist, was laufen konnte.',
	});
	d.cardsSlide({
		kicker: '// 03 · logging',
		title: 'Every run leaves a trail',
		cards: [
			{ head: 'Run log', text: '_meta.pipeline_run_log: status, attempts, duration, error per table. Written once per run, idempotent on _execution_id.' },
			{ head: 'Live graph', text: 'LiveGraphView redraws the tree in the notebook while tables run. HtmlFileObserver does it anywhere else.' },
			{ head: 'Alerts', text: 'A failed run can send one email via Azure Communication Services — token credential, no connection string.' },
		],
		notes: 'Run-Log einmal am Ende mit replaceWhere auf die Execution-ID — ein erneuter Lauf derselben Execution dupliziert nichts. Live-Graph zeige ich gleich in der Demo.',
	});

	// ───────────────────────── 04 decisions ─────────────────────────
	d.section('04 Design decisions');
	d.sectionSlide({ num: 4, total: TOTAL, title: 'What worked, what didn’t', subtitle: 'And what I’d change today' });
	d.cardsSlide({
		kicker: '// 04 · design decisions',
		title: 'Looking back',
		cards: [
			{ head: 'Worked', color: p.green, text: 'depends_on: auto. Tree over layers. failed vs upstream_failed. No locks in the scheduler.' },
			{ head: 'Hurt', color: p.orange, text: 'The simple parser misses dynamic table names. Engine errors needed translating before retries worked. append is hard to retry.' },
			{ head: 'Today I’d …', color: p.accent, text: 'TODO David: what you’d change today' },
		],
		notes: 'TODO David: Spalte 3 mit deinen eigenen Punkten füllen (laut Meetup-Beschreibung: "was ich heute anders machen würde"). Die ersten beiden Spalten stammen aus Teil 1 und 2 der Blog-Serie — bitte gegenlesen.',
	});

	// ───────────────────────── 05 demo ─────────────────────────
	d.section('05 Live demo');
	d.sectionSlide({ num: 5, total: TOTAL, title: 'A new source, live', subtitle: 'products.parquet → bronze → gold.fact_sales → Power BI' });
	d.demoSlide({
		text: 'Fabric · pipetree environment · Direct Lake report',
		notes: 'Ablauf: (1) Lakehouse + Report zeigen, Ausgangslage. (2) products.parquet liegt in Files/data. (3) YAML: system + bronze.products. (4) fact_sales.py: Join auf products. (5) Run mit LiveGraphView — neuer Knoten, neue Kante. (6) Power BI: Umsatz nach Kategorie. Backup: Video.',
	});
	d.codeSlide({
		kicker: '// 05 · recap',
		title: 'Everything the new source took',
		filename: 'pipeline.yaml  (+ one join in fact_sales.py)',
		lines: [
			[['systems', 'entity'], [':', 'text']],
			[['  shop_products', 'entity'], [':', 'text']],
			[['    type', 'entity'], [': ', 'text'], ['parquet', 'string']],
			[['    path', 'entity'], [': ', 'text'], ['data/products.parquet', 'string']],
			[],
			[['bronze', 'entity'], [':', 'text']],
			[['  tables', 'entity'], [':', 'text']],
			[['    products', 'entity'], [':', 'text']],
			[['      source', 'entity'], [': { ', 'text'], ['system', 'entity'], [': ', 'text'], ['shop_products', 'string'], [', ', 'text'], ['object', 'entity'], [': ', 'text'], ['products', 'string'], [' }', 'text']],
			[['      business_key', 'entity'], [': ', 'text'], ['[product_id]', 'constant']],
			[['      strategy', 'entity'], [': ', 'text'], ['scd1', 'string']],
		],
		fontSize: 14,
		notes: 'Nach der Demo als Zusammenfassung: Das war alles. Kein neues Notebook, keine Kopie.',
	});
	d.figureSlide({
		kicker: '// 05 · recap',
		title: 'One new node, one new edge',
		image: img('graph-after.png'), imageW: 3504, imageH: 1128,
		notes: 'Die Abhängigkeit products → fact_sales hat niemand deklariert — sie kommt aus dem spark.table-Aufruf.',
	});
	d.statementSlide({
		kicker: '// takeaway',
		text: [{ text: 'A new source is a ' }, { text: 'config change', options: { color: p.accent } }, { text: ', not a copy.' }],
		source: 'describe it once · let the package run it',
	});
	d.cardsSlide({
		kicker: '// try it',
		title: 'Take it home',
		cards: [
			{ head: 'Install it', text: 'pip install pipetree-meta — docs and quick start at pipetree.dev. In Fabric: add it to an environment.' },
			{ head: 'The long version', text: 'The “Pipeline Engineering” series on datadave.dev — schema, executor, Fabric, Databricks.' },
			{ head: 'Slides & demo', text: 'PDF, pipeline.yaml, sample data and the notebook on the talk page.' },
		],
		notes: 'QR-Code auf der nächsten Folie führt zur Talk-Seite mit allem Material.',
	});

	// ───────────────────────── closing ─────────────────────────
	d.section('Closing');
	d.closingSlide({ qrUrl: TALK_URL, qrCaption: 'datadave.dev/talks', notes: 'Q&A. Diese Folie stehen lassen, damit Leute den QR-Code scannen können.' });

	const out = path.join(__dirname, variant === 'light' ? 'metadata-orchestration-light.pptx' : 'metadata-orchestration.pptx');
	await d.save(out);
	console.log('wrote', out);
})();
