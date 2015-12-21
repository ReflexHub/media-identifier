"use strict";

const path = require("path");
const natural = require("natural");
const cheerio = require("cheerio");
const request = require("superagent");

class Identifier {
	constructor(options) {

		/**
		 * Options
		 */

		options = options || {};

		options.hierachy = options.hierachy || [
			"FILENAME"
		];

		options.remove_terms = require("./data/remove_from").concat(options.remove_terms || []);
		options.extension_names = require("./data/extension_names").concat(options.extension_names || []);

		options.remove_terms =
			options.remove_terms
			.concat(options.extension_names)
			.map(v => v.toLowerCase());

		this.options = options;

		/**
		 * Modules
		 */

		this.tokenizer = new natural.WordTokenizer();

	}

	identify(path_to_file) {

		let file_name = path.basename(path_to_file);

		return this.cleanFileName(file_name);

	}

	cleanFileName(name){
		// removes terms such as 720p from file names.

		name = name.toLowerCase();

		let tokens = this.tokenizer.tokenize(name);
		let final_terms = [];

		for(let token of tokens){
			if(!~this.options.remove_terms.indexOf(token)){
				final_terms.push(token);
			}
		}

		return final_terms.join(" ");
	}
}

module.exports = Identifier;