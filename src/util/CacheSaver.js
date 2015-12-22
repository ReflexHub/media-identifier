const fs = require("fs-extra");
const path = require("path");

const filename = "tmdb.cache.json";

exports.save = (data, loc) => {

	if(!loc)
		return;

	// not using output JSON as it does not minify
	fs.outputFile( path.join(loc, filename), JSON.stringify(data), err => {
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