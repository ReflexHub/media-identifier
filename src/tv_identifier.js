"use strict";

const path = require("path");
const matcher = require("./util/matcher");
const TMDBSearcher = require("./util/TMDBSearcher");

class TVIdentifier {

	constructor(identifier) {
		this.identifier = identifier;
		this.tmdb_series_searcher = new TMDBSearcher(this.identifier.options.api_keys.tmdb, this.identifier.options.cache_location, "tmdb.tv.cache.json");
		this.tmdb_episode_searcher = new TMDBSearcher(this.identifier.options.api_keys.tmdb, this.identifier.options.cache_location, "tmdb.episodes.cache.json");
	}

	// set all_able as true if you want to use Promise.all
	identify(path_to_file, all_able) {

		return new Promise((resolve, reject) => {

			function failed(e) {
				if (all_able) {
					resolve(null);
				} else {
					reject(null);
				}
				return;
			}

			let file_name = path.basename(path_to_file);

			// the rough query name
			let query =
				this.cleanQuery(
					this.cleanFileName(
						this.findFocus(
							file_name
							)));

			let info = matcher.is_season_or_episode("." + query.split(" ").reverse().join(".") + ".");

			let season, episode;

			if(info && info.length >= 4){
				season = info[2];
				episode = info[3];
				query = info[4].split(".").reverse().join(" ") + " " + info[1].split(".").reverse().join(" ");
				query = query.trim();
			}

			this.tmdb_series_searcher.searchTV(query)
				.then(series => {

					if (series) {
						if (!season || !episode) {
							failed();
							return;
						}
						this.tmdb_episode_searcher.tvEpisodeInfo(series.id, season, episode)
							.then(episode => {
								// success
								if (episode) {
									resolve({ series, episode });
								} else {
									failed();
								}
								// success
							})
							.catch(failed);
					} else {
						failed();
					}

				})
				.catch(failed);

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

			if (matcher.is_season_or_episode(chunk)) {

				if (!chunks.slice(id + 1).find(v => matcher.is_season_or_episode(v))) {
					break;
				}

			} else if (matcher.is_remove_term(chunk)) {
				break;
			}

		}
		return final_chunks.join(" ");
	}

}

module.exports = TVIdentifier;