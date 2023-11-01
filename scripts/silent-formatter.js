module.exports = function(results) {
	return results.map(r => r.filePath).filter((e,i,a) => i === a.indexOf(e)).join('\n\n') + '\n';
};
