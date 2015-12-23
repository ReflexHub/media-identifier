"use strict";

const path = require("path");
const matcher = require("./util/matcher");

class MovieIdentifier {

	constructor(identifier) {
		this.identifier = identifier;
		this.tmdb_searcher = this.identifier.tmdb_searcher;
	}

	// set all_able as true if you want to use Promise.all
	identify(path_to_file, all_able) {

		return new Promise((resolve, reject) => {

			let file_name = path.basename(path_to_file);

			// the rough query name
			let query =
				this.cleanQuery(
					this.cleanFileName(
						this.findFocus(
							file_name
							)));

			this.tmdb_searcher.searchMovie(query)
				.then(r => {
					resolve(r);
				})
				.catch(e => {
					if (all_able) {
						resolve(null);
					} else {
						reject(e);
					}
				});

		});

	}

	cleanQuery(query_name) {
		// a TMDB-relevant query (including year tags where apt)
		let has_year;
		for (let term of query_name.split(" ").reverse()) {
			if (matcher.is_year(term)) {
				has_year = term;
				break;
			}
		}

		let query = query_name;

		if (has_year) {
			query = query.replace(new RegExp(has_year, "g"), "");
			query = query += " y:" + has_year;
		}

		return query;
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
		/*	1st stage of cleaning a file name, focusses on what it expects to be the correct term
			e.g. `the movie name 2016 hd` becomes `the movie name` with a year of `2016`

			see https://github.com/ReflexHub/media-identifier/wiki/Media-Naming-Conventions
			for naming conventions.

			todo
		*/

		let chunks = this.identifier.tokenizer.tokenize(name),
			final_chunks = [];

		for (let id in chunks) {
			let chunk = chunks[id];
			if (id == 0 && matcher.is_random_number(chunk)) {
				// 01 The Movie blah blah
				continue;
			}

			final_chunks.push(chunk);

			if (matcher.is_year(chunk)) {

				if(!chunks.slice(id+1).find(v => matcher.is_year(v))){
					break;
				}

			}else if(matcher.is_remove_term(chunk)){
				break;
			}

		}
		return final_chunks.join(" ");
	}

}

module.exports = MovieIdentifier;