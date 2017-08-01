const readline = require('readline');
const Promise = require('bluebird');
const path = require('path');
const fs = require('fs');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const ConfigCli = {
	askQuestions: function(questions) {
		return Promise.reduce(Object.keys(questions), (answers, key) => {
			return this.askQuestion(answers, key, questions[key]);
		}, {});
	},

	runConfig: function(questions, outputFile, options) {
		return this.askQuestions(questions).then((answers) => {
			return new Promise((resolve) => {
				rl.write(`About to write to ${outputFile}:\n`);
				rl.write('\n' + JSON.stringify(answers, null, 2) + '\n\n');
				rl.question('Is this ok? (yes) ', (answer) => {
					rl.close();

					if(/(y|yes|)/i.test(answer)) {
						resolve({ status: 'ok', result: answers });
					} else {
						resolve({ status: 'aborted' });
					}
				});
			});
		});
	},

	askQuestion: function(answers, key, question) {
		return new Promise((resolve) => {
			let questionText = question.text + ' ';

			if(question.default) {
				questionText += '(' + question.default + ') ';
			}

			rl.question(questionText, resolve);
		}).then((answer) => {
			answer = answer.trim();

			if(!answer && question.default) {
				answers[key] = question.default;
			} else {
				answers[key] = answer;
			}

			return answers;

		});
	}
}

if(require.main === module) {
	const schemaFile = process.env.CONFIG_CLI_SCHEMA || '';
	const outputFile = process.env.CONFIG_CLI_OUTPUT || '';
	const schema = require(schemaFile[0] === '/' ? schemaFile : './' + schemaFile);
	ConfigCli.runConfig(schema, outputFile).then((data) => {
		if(data.status === 'ok') {
			fs.writeFileSync(outputFile, JSON.stringify(data.result, null, 4));
		}
	});
}

module.exports = ConfigCli;
