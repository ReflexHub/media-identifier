"use strict";

/**
 * This class exists mainly for caching without affecting
 * the TMDB module
 */

const MovieDB = require("moviedb");
const natural = require("natural");
const CacheManager = require("./CacheSaver");

class TMDBSearcher {
	constructor(api_key, cache_save_location) {
		this.tmdb = MovieDB(api_key);
		this.cache_save_location = cache_save_location;
		this.cache = CacheManager.load(cache_save_location);
	}

	// all_able is if instead of rejecting, the promise should
	// resolve with null so Promise.all doesn't fail
	// prematurely
	sortClosest(query, results){
		for(let result of results){
			result.closeness = natural.JaroWinklerDistance(query, result.title.toLowerCase());
		}
		results = results.sort((a, b) => b.closeness - a.closeness);
		return results;
	}

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
						if (result.media_type === "movie") {
							results.push(result);
						}
					}

					if (results.length === 0) {
						if (all_able)
							resolve(null);
						else
							reject(err);
					}

					results = this.sortClosest(query, results);

					this.cache[query] = results;
					resolve(amount === 1 ? results[0] : results);
					CacheManager.save(this.cache, this.cache_save_location);
				}
			});

		});
	}
}

module.exports = TMDBSearcher;