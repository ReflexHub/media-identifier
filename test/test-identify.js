"use strict";
/* global process */
const Identifier = require("../identifier");

var movie_names, tv_names, song_names, api_keys;
try {
	movie_names = require("./file_names").movies;
	tv_names = require("./file_names").tv;
	song_names = require("./file_names").songs;
	api_keys = require("./api_keys");
} catch (e) {
	console.log("You are missing files needed to test!\n" + e.stack);
	process.exit(1);
}

const media_identifier = new Identifier({api_keys, cache_location : __dirname + "/cache/"});

console.log();
console.log("Testing identification:");

for(let file_name of movie_names){
	media_identifier.identifyMovie(file_name).then(r => {
		console.log(file_name + ":", r.title);
	}).catch(e => console.log(e));
}
for(let file_name of tv_names){
	media_identifier.identifyTV(file_name).then(r => {
		console.log(r.series.name + " - " + r.episode.name);
	}).catch(e => console.log(e));
}
for(let file_name of song_names){
	media_identifier.identifySong(file_name).then(r => {
		console.log(r);
	}).catch(e => console.log(e.stack));
}