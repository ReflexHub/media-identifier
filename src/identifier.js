"use strict";

const path = require("path");
const natural = require("natural");
const cheerio = require("cheerio");
const request = require("superagent");
const MovieIdentifier = require("./movie_identifier");

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

		/**
		 * sub-identifiers
		 */

		this.movie_identifier = new MovieIdentifier(this);

	}

	identifyMovie(path_to_file) {

		return this.movie_identifier.identify(path_to_file);

	}

}

module.exports = Identifier;