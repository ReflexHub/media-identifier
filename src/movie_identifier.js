"use strict";

const path = require("path");

class MovieIdentifier {

	constructor(identifier) {
		this.identifier = identifier;
	}

	identify(path_to_file){

		let file_name = path.basename(path_to_file);
		return this.findFocus(this.cleanFileName(file_name));

	}

	cleanFileName(name) {
		// removes terms such as 720p from file names.
		// e.g. `The.Movie.Name.720p` becomes `the movie name`
		name = name.toLowerCase();

		let tokens = this.identifier.tokenizer.tokenize(name);
		let final_terms = [];

		for (let token of tokens) {
			if (!~this.identifier.options.remove_terms.indexOf(token)) {
				final_terms.push(token);
			}
		}

		return final_terms.join(" ");
	}

	findFocus(name) {
		/*	2nd stage of cleaning a file name, focusses on what it expects to be the correct term
			e.g. `the movie name 2016 hd` becomes `the movie name` with a year of `2016`

			see https://github.com/ReflexHub/media-identifier/wiki/Media-Naming-Conventions
			for naming conventions.

			todo
		*/
		return name;
	}

}

module.exports = MovieIdentifier;