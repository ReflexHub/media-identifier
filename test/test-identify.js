"use strict";
/* global process */
const Identifier = require("../identifier");
const media_identifier = new Identifier();
var file_names;
try {
	file_names = require("./file_names");
} catch (e) {
	console.log("You are missing a file needed to test!\n" + e.stack);
	process.exit(1);
}

console.log();
console.log("Testing identification:");

for(let file_name of file_names){
	console.log("\n-----\n");
	console.log(file_name + ":");
	console.log(media_identifier.identify(file_name));
}
console.log("\n-----\n");