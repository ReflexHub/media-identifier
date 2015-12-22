"use strict";

/**
 * This class exists mainly for caching without affecting
 * the TMDB module
 */

const MovieDB = require("moviedb");
const natural = require("natural");
const CacheManager = require("./CacheSaver");

class TMDBSearcher {
	constructor(api_key, cache_save_location, filename) {
		this.tmdb = MovieDB(api_key);
		this.cache_save_location = cache_save_location;
		this.cache_filename = filename;
		this.cache = CacheManager.load(cache_save_location, filename);
	}

	// all_able is if instead of rejecting, the promise should
	// resolve with null so Promise.all doesn't fail
	// prematurely
	sortClosest(query, results) {
		for (let result of results) {
			result.closeness = natural.JaroWinklerDistance(query, result.name.toLowerCase());
		}
		results = results.sort((a, b) => b.closeness - a.closeness);
		return results;
	}

	searchTV(query, amount, all_able) {
		return this.search(query, amount, all_able, "tv");
	}

	searchMovie(query, amount, all_able) {
		return this.search(query, amount, all_able, "movie");
	}

	tvEpisodeInfo(id, season_number, episode_number, all_able) {
		return new Promise((resolve, reject) => {

			let cache_id = `${id} ${season_number} ${episode_number}`;

			if (this.cache[cache_id]) {
				resolve(this.cache[cache_id]);
				return;
			}

			this.tmdb.tvEpisodeInfo({ id, season_number, episode_number }, (err, res) => {
				if (err) {
					if (all_able)
						resolve(null);
					else
						reject(err);
				} else {
					// success
					if (res.id) {
						resolve(res);
						this.cache[cache_id] = res;
						CacheManager.save(this.cache, this.cache_save_location, this.cache_filename);
					} else {
						if (all_able)
							resolve(null);
						else
							reject(err);
					}
				}
			});

		})
	}

	search(query, amount, all_able, cat) {
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
						if (result.media_type === cat) {
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
					CacheManager.save(this.cache, this.cache_save_location, this.cache_filename);
				}
			});

		});
	}
}

module.exports = TMDBSearcher;