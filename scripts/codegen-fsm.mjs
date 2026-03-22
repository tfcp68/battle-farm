#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { parseStateDiagram, createStateDiagram } from '@yantrix/mermaid-parser';
import { generateAutomataFromStateDiagram } from '@yantrix/codegen';

const DIAGRAMS_DIR = resolve('src/fsm/diagrams');
const OUTPUT_DIR = resolve('src/fsm/generated');

const files = readdirSync(DIAGRAMS_DIR).filter((f) => f.endsWith('.mermaid'));

if (files.length === 0) {
	console.error('No .mermaid files found in', DIAGRAMS_DIR);
	process.exit(1);
}

console.log(`Found ${files.length} diagram(s). Generating TypeScript controllers...\n`);

let failed = 0;

for (const file of files) {
	const name = basename(file, '.mermaid');
	const className = name
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
	const inputPath = join(DIAGRAMS_DIR, file);
	const outputPath = join(OUTPUT_DIR, `${name}.ts`);

	try {
		console.log(`  [codegen] ${file} → ${name}.ts (class: ${className}Automata)`);
		const diagramText = readFileSync(inputPath, 'utf-8');
		const parsed = await parseStateDiagram(diagramText);
		const matrix = await createStateDiagram(parsed);
		const code = await generateAutomataFromStateDiagram(matrix, {
			className: `${className}Automata`,
			outLang: 'typescript',
			functionFilePath: resolve('src/fsm/functions.ts'),
		});
		writeFileSync(outputPath, code, 'utf-8');
		console.log(`  [ok] ${outputPath}`);
	} catch (err) {
		console.error(`  [FAIL] ${file}: ${err.message}`);
		failed++;
	}
}

console.log(`\nDone. ${files.length - failed}/${files.length} succeeded.`);
if (failed > 0) process.exit(1);
