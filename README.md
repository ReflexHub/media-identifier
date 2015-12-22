# Media Identifier

**Requires node 4.0.0+**

Media Identifier for use with reflex-server, however can be used for other purposes.

Aims to identify the context and type of media from existing metadata and filenames.

## Installing

`npm install --save ReflexHub/media-identifier`

## Usage

```js
var Identifier = require("../identifier"),
	media_identifer = new Identifier({
		api_keys : {
			"tmdb" : "..."
	});

media_identifier.identifyMovie("the.hunger.games.2013").then(r => {
	console.log(r.title);
});

media_identifier.identifyTV("brooklyn.nine.nine.101").then(r => {
	console.log(r.series.name + " - " + r.episode.name);
});
```
