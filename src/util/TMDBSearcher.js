"use strict";

/**
 * This class exists mainly for caching without affecting
 * the TMDB module
 */

const MovieDB = require("moviedb");

class TMDBSearcher {
	constructor(api_key) {
		this.tmdb = MovieDB(api_key);
		this.cache = {};
	}

	// all_able is if instead of rejecting, the promise should
	// resolve with null so Promise.all doesn't fail
	// prematurely
	search(query, amount, all_able) {
		amount = amount || 1;
		return new Promise((resolve, reject) => {

			if (this.cache[query]) {
				resolve(amount === 1 ? this.cache[query][0] : this.cache[query]);
				return;
			}

			this.tmdb.searchMulti({ query }, (err, res) => {
				if (err) {
					if (all_able)
						resolve(null);
					else
						reject(err);
				} else {
					// success
					let results = [];
					for (let result of res.results) {
						if (results.length === amount) {
							break;
						}
						if (result.media_type === "movie") {
							results.push(result);
						}
					}
					this.cache[query] = results;

					if (results.length === 0) {
						if (all_able)
							resolve(null);
						else
							reject(err);
					}

					resolve(amount === 1 ? results[0] : results);
				}
			});

		});
	}
}

module.exports = TMDBSearcher;