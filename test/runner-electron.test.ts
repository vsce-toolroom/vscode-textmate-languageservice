import * as Mocha from 'mocha';

const files = [
	require.resolve('./suite/selectors.util.test'),
	require.resolve('./suite/tokenizer.service.test'),
	require.resolve('./suite/outline.service.test'),
	require.resolve('./suite/document.service.test'),
	require.resolve('./suite/folding.test'),
	require.resolve('./suite/definition.test'),
	require.resolve('./suite/document-symbol.test'),
	require.resolve('./suite/workspace-symbol.test')
];

export function run(): Promise<void> {
	const mocha = new Mocha({ ui: 'tdd', reporter: 'spec' });

	return new Promise((c, e) => {
		files.forEach(f => mocha.addFile(f));

		try {
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (e) {
			console.error(e);
			e(e);
		}
	});
}
