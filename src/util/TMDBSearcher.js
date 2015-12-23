"use strict";

/**
 * This class exists mainly for caching without affecting
 * the TMDB module
 */

const MovieDB = require("moviedb");
const natural = require("natural");
const CacheManager = require("./CacheSaver");
const DataManager = require("./TMDBData");
const cache_name = n => `tmdb.${n}.cache.json`;

class TMDBSearcher {
	constructor(api_key, location) {
		this.tmdb = MovieDB(api_key);

		this.cache_save_location = location;

		this.data_manager = new DataManager(location);

		this.movie_cache = CacheManager.load(location, cache_name("movie"));
		this.tv_cache = CacheManager.load(location, cache_name("tv"));
		this.episode_cache = CacheManager.load(location, cache_name("episode"));
	}

	// all_able is if instead of rejecting, the promise should
	// resolve with null so Promise.all doesn't fail
	// prematurely
	sortClosest(query, results) {
		for (let result of results) {
			result.closeness = natural.JaroWinklerDistance(query, (result.name || result.title).toLowerCase());
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

			season_number = parseInt(season_number);
			episode_number = parseInt(episode_number);

			let cache_id = `${id} ${season_number} ${episode_number}`;

			if (this.episode_cache[cache_id]) {
				resolve(this.expand(this.episode_cache[cache_id]));
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
						this.episode_cache[cache_id] = res.id;
						this.data_manager.set(res.id, res);
						CacheManager.save(this.episode_cache, this.cache_save_location, cache_name("episode"));
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

	expand_array(ar){
		return ar.map(v => this.expand);
	}

	expand(id) {
		return this.data_manager.get(id);
	}

	search(query, amount, all_able, category) {
		amount = amount || 1;
		query = query.replace(/\s+/g,' ');
		return new Promise((resolve, reject) => {

			if (this.movie_cache[query]){
				resolve(amount === 1 ? this.expand(this.movie_cache[query][0]) : this.expand_array(this.movie_cache[query]));
				return;
			}else if(this.tv_cache[[query]]){
				resolve(amount === 1 ? this.expand(this.tv_cache[query][0]) : this.expand_array(this.tv_cache[query]));
				return;
			}

			this.tmdb.searchMulti({ query }, (err, res) => {
				if (err || !res.results) {
					error(err);
				} else {
					// add all the information of the found results to a cache,
					// even if they are not what we want.
					for(let item of res.results){
						this.data_manager.set(item.id, item, true);
					}
					this.data_manager.save();

					let filtered_results = res.results.filter(v => v.media_type === category);

					if (filtered_results.length === 0) {
						error();
					}else{
						filtered_results = this.sortClosest(query, filtered_results);
						resolve(amount === 1 ? filtered_results[0] : filtered_results);

						filtered_results = filtered_results.map(v => v.id);

						switch(category){
							case "movie":
								this.movie_cache[query] = filtered_results;
								CacheManager.save(this.movie_cache, this.cache_save_location, cache_name("movie"));
								break;
							case "tv":
								this.tv_cache[query] = filtered_results;
								CacheManager.save(this.tv_cache, this.cache_save_location, cache_name("tv"));
								break;
							default:
								break;
						}

					}

				}

			});

			function error(r){
				if (all_able)
					resolve(null);
				else
					reject(err);
			}

		});
	}
}

module.exports = TMDBSearcher;