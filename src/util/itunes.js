"use strict";

const request = require("superagent-cache")();
const natural = require("natural");

function sortClosest(query, results) {
	for (let result of results) {
		result.closeness = natural.JaroWinklerDistance(query, (result.artistName + " - " + result.trackCensoredName).toLowerCase());
	}
	results = results.sort((a, b) => b.closeness - a.closeness);
	return results;
}

exports.search = (term, file_resort) => {

	return new Promise((resolve, reject) => {
		request
			.get(`https://itunes.apple.com/search?term=${term}&entity=musicTrack`)
			.end((err, res) => {

				if (err) {
					reject(err);
				} else {
					let data = JSON.parse(res.text || res.body).results;
					if (file_resort) {
						resolve(data[0]);
					} else {
						let closest = sortClosest(term, data.slice(0, 2))[0];
						resolve(closest);
					}
				}

			});
	});

}