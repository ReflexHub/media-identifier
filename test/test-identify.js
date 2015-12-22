"use strict";
/* global process */
const Identifier = require("../identifier");

var file_names, api_keys;
try {
	file_names = require("./file_names");
	api_keys = require("./api_keys");
} catch (e) {
	console.log("You are missing files needed to test!\n" + e.stack);
	process.exit(1);
}

const media_identifier = new Identifier({api_keys, cache_location : __dirname + "/cache/"});

console.log();
console.log("Testing identification:");

for(let file_name of file_names){
	media_identifier.identifyMovie(file_name).then(r => {
		console.log(file_name + ":", r.title);
	});
}