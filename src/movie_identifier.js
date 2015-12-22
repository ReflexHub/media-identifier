"use strict";

const path = require("path");
const matcher = require("./util/matcher");
const MovieDB = require("moviedb");

class MovieIdentifier {

	constructor(identifier) {
		this.identifier = identifier;
		this.mdb = MovieDB(this.identifier.options.api_keys.tmdb);
	}

	identify(path_to_file){

		let file_name = path.basename(path_to_file);

		// the rough query name
		let query_name = this.cleanFileName(this.findFocus(file_name));

		// a TMDB-relevant query (including year tags where apt)
		let has_year;
		for(let term of query_name.split(" ")){
			if(matcher.is_year(term)){
				has_year = term;
				break;
			}
		}

		let query = query_name;

		if(has_year){
			query = query.replace(new RegExp(has_year, "g"), "");
			query = query += " y:" + has_year;
		}

		// not search movie because fsr that does not work :\
		this.mdb.searchMulti({
			query
		}, (err, res) => {
			if(!err){
				console.log(res.results[0].title);
			}
		});
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

		for(let id in chunks){
			let chunk = chunks[id];
			if(id == 0 && matcher.is_random_number(chunk)){
				// 01 The Movie blah blah
				continue;
			}

			final_chunks.push(chunk);

			if(matcher.is_year(chunk) || matcher.is_remove_term(chunk)){
				break;
			}

		}
		return final_chunks.join(" ");
	}

}

module.exports = MovieIdentifier;