'use strict';

const path = require('path');
const { Octokit } = require('octokit');
const fs = require('fs');

const octokit = new Octokit();

async function main() {
	let i18nJson = {};

	const tree = await octokit.request('GET /repos/microsoft/vscode-loc/contents/i18n');

	for (const { name } of tree.data) {
		const filepath = path.join('/microsoft/vscode-loc', `main/i18n/${name}`, '/translations/main.i18n.json');
		const url = new URL(filepath, `https://raw.githubusercontent.com/`);

		const raw = await fetch(url.toString());
		const data = await raw.json();

		const locale = name.replace('vscode-language-pack-', '');
		const alias = data['contents']['vs/editor/common/languages/modesRegistry']['plainText.alias'];

		if (locale.includes('-')) {
			const base = locale.split('-')[0];
			i18nJson[base] = {};
			i18nJson[base]['plainText.alias'] = alias;
		}

		i18nJson[locale] = {};
		i18nJson[locale]['plainText.alias'] = alias;
	}

	i18nJson = JSON.stringify(i18nJson, null, 2);
	fs.writeFileSync(path.resolve(__dirname, '..', 'src', 'i18n.json'), i18nJson);
}

main();
