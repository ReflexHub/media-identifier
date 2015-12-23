"use strict";

const ffmetadata = require("ffmetadata"); //ReflexHub/node-ffmetadata
const path = require("path");
const matcher = require("./util/matcher");
const iTunesAPI = require("./util/itunes");

class SongIdentifier{

	constructor(identifier){
		this.identifier = identifier;
	}

	identify(path_to_file, all_able){
		var self = this;
		return new Promise((resolve, reject) => {

			let file_name = path.basename(path_to_file);

			this.get_metadata(path_to_file)
				.then(data => {
					// we have some data...
					if(data.title && (data.artist || data.album_artist)){
						let title = data.title;
						let artist = (data.artist || data.album_artist);

						iTunesAPI.search(artist + " - " + title)
							.then(found)
							.catch(useFilename);

					}else{
						useFilename();
					}
				})
				.catch(useFilename);

			function found(result){
				resolve(result);
			}

			function useFilename(){
				iTunesAPI.search(self.cleanFileName(file_name), true)
					.then(found)
					.catch(failed);
			}

			function failed(err){
				if(all_able){
					resolve();
				}else{
					reject(err);
				}
			}

		});
	}

	get_metadata(path_to_file){
		return new Promise((resolve, reject) => {

			ffmetadata.read(path_to_file, (err, data) => {
				if(err){
					reject(err);
				}else{
					resolve(data);
				}
			});
		});
	}

	cleanFileName(name){
		name = name.replace(/_/g, " ");
		let tokens = this.identifier.tokenizer.tokenize(name);
		let final_tokens = [];

		for(let token of tokens){
			if(matcher.is_random_number(token) || ~this.identifier.options.remove_terms.indexOf(token)){
				continue;
			}
			final_tokens.push(token);
		}

		return final_tokens.join(" ");
	}

}

module.exports = SongIdentifier;