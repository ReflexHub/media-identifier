"use strict";

const path = require("path");
const natural = require("natural");
//const cheerio = require("cheerio");
//const request = require("superagent");
const MovieIdentifier = require("./movie_identifier");
const TVIdentifier = require("./tv_identifier");
const TMDBSearcher = require("./util/TMDBSearcher");

class Identifier {
	constructor(options) {

		/**
		 * Options
		 */

		options = options || {};

		options.api_keys = options.api_keys || {
			"tmdb" : null
		};

		options.cache_location = options.cache_location || null;
		options.remove_terms = require("./data/remove_from").all.concat(options.remove_terms || []);
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
		this.tmdb_searcher = new TMDBSearcher(options.api_keys.tmdb, options.cache_location);
		this.movie_identifier = new MovieIdentifier(this);
		this.tv_identifier = new TVIdentifier(this);

	}

	identifyMovie(path_to_file) {

		return this.movie_identifier.identify(path_to_file);

	}

	identifyTV(path_to_file) {

		return this.tv_identifier.identify(path_to_file);

	}
}

module.exports = Identifier;