"use strict";

const path = require("path");
const matcher = require("./util/matcher");

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

		let chunks = name.split(" "),
			final_chunks = [];

		for(let id in chunks){
			let chunk = chunks[id];
			if(id == 0 && matcher.is_random_number(chunk)){
				// 01 The Movie blah blah
				continue;
			}

			final_chunks.push(chunk);

			if(matcher.is_year(chunk)){
				break;
			}

		}
		return final_chunks.join(" ");
	}

}

module.exports = MovieIdentifier;