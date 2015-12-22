const fs = require("fs-extra");
const path = require("path");

const filename = "tmdb.cache.json";

exports.save = (data, loc) => {

	if(!loc)
		return;

	fs.outputJson( path.join(loc, filename), data, err => {
		// nothing
	} )

};

exports.load = loc => {

	if(!loc)
		return {};

	try{
		return fs.readJsonSync(path.join(loc, filename));
	}catch(e){
		return {};
	}

}