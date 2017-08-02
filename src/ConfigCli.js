const Interface = require('readline').Interface;
const Promise = require('bluebird');

class ConfigCli extends Interface {

	constructor(options) {
		super({
			input: options.input || process.stdin,
			output: options.input || process.stdout
		});

		this.schema = options.schema;
		this.keys = Object.keys(this.schema);
		this.previewText = options.previewText;
		this.posviewText = options.posviewText || 'Is this ok? (yes) ';
		this.posviewRegex = options.previewRegex || /(y|yes|)/i;
	}

	askQuestions() {
		return Promise.reduce(this.keys, (result, key) => {
			return this.askQuestion(key).then((value) => {
				result[key] = value;
				return result;
			});
		}, {});
	}

	askQuestion(key) {
		const schema = this.schema[key] || {};
		const type = schema.type;
		const def = schema.default;
		let text = schema.text || key + ':';

		if(def) {
			text += ' (' + def + ')';
		}

		return this.questionAsync(text + ' ').then((value) => {
			return this.castToType(value || def || '', type);
		});
	}

	castToType(value, type) {
		switch(type) {
			case Number:
			case 'number':
				return parseFloat(value, 10);

			case Boolean:
			case 'boolean':
				return /(y|yes|true)/i.test(value);

			case String:
			case 'string':
			default:
				return value;
		}
	}

	questionAsync(text) {
		return new Promise((resolve) => {
			this.question(text, resolve);
		});
	}

	printResult(result) {
		this.write(JSON.stringify(result, null, 2) + '\n');
	}

	run() {
		return this.askQuestions().then((result) => {
			this.write(this.previewText + '\n');
			this.write('\n');
			this.printResult(result);
			this.write('\n');
			return this.questionAsync(this.posviewText).then((answer) => {
				this.close();
				if(this.posviewRegex.test(answer)) {
					return { status: 'ok', result };
				} else {
					return { status: 'aborted' };
				}
			});
		});
	}
}

module.exports = ConfigCli;
