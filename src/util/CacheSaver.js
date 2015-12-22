const fs = require("fs-extra");
const path = require("path");

exports.save = (data, loc, filename) => {

	if(!loc)
		return;

	// not using output JSON as it does not minify
	fs.outputFile( path.join(loc, filename), JSON.stringify(data), err => {
		// nothing
	} )

};

exports.load = (loc, filename) => {

	if(!loc)
		return {};

	try{
		return fs.readJsonSync(path.join(loc, filename));
	}catch(e){
		return {};
	}

}