const ConfigCli = require('./src/ConfigCli');
const path = require('path');
const fs = require('fs');

const schemaFile = process.env.CONFIG_CLI_SCHEMA || '';
const outputFile = process.env.CONFIG_CLI_OUTPUT || '';
const schema = require(schemaFile[0] === '/' ? schemaFile : './' + schemaFile);

const configCli = new ConfigCli({
	previewText: `About to write to ${outputFile}:`,
	schema
});

configCli.run().then((data) => {
	if(data.status === 'ok') {
		fs.writeFileSync(outputFile, JSON.stringify(data.result, null, 4));
	}
});
