/*
	this file contains keywords that should be removed
	from file names when identifying, such as `720p`.

	This can help to improve the accuracy of the
	identification process.
*/

exports.high_priority = [
	"HDTV", "x264", "LOL", "ettv", "720p", "BATV",
	"DL", "AAC", "1080p", "4k", "bluray", "eng",
	"subs", "h264", "dvdscr", "xvid", "ac3", "hq"
]

exports.all = [
	"Season", "Episode"
].concat(exports.high_priority);