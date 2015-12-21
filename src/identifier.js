"use strict";

const path = require("path");
const natural = require("natural");
const cheerio = require("cheerio");
const request = require("superagent");

class Identifier {
	constructor(options) {

		options.hierachy = options.hierachy || [
			"FILENAME"
		];

		this.options = options;
	}

	identify(path_to_file) {

		let file_name = path.basename(path_to_file);

	}
}

module.exports = Identifier;