/*
this tries to identify things such as season/epsiode in
a file name
*/

const remove_terms = require("../data/remove_from").all.map(v => v.toLowerCase());
const hp_remove_terms = require("../data/remove_from").high_priority.map(v => v.toLowerCase());

exports.is_season_or_episode = str => {

	/*
		S01E01
		S1E1
		101

		todo
	*/
	return false;
};

exports.is_year = str => {
	if(str.length === 4){
		// if the string is 4 digits long
		if(str.startsWith("19") || str.startsWith("20")){
			// if the string starts with 19 or 20
			if(!isNaN(str)){
				// if the string is a valid numbers
				return true;
			}
		}
	}
	return false;
}

exports.is_random_number = n => {
	// checks if a number is not important in any way
	if(isNaN(n)){
		return false;
	}else{
		if(exports.is_year(n)){
			return false;
		}else{
			return true;
		}
	}
}

exports.is_remove_term = n => {

	return ~hp_remove_terms.indexOf(n.toLowerCase());

};