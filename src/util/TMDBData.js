"use strict";

const CacheManager = require("./CacheSaver");

class TMBDDataManager{
	constructor(location){
		this.location = location;
		this.data = CacheManager.load(location, "tmdb.data.cache.json");
	}

	set(id, data, no_save){
		this.data[id] = data;
		if(!no_save)
			this.save();
	}

	save(){
		CacheManager.save(this.data, this.location, "tmdb.data.cache.json");
	}

	get(id){
		return this.data[id];
	}
}

module.exports = TMBDDataManager;