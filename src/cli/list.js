'use strict';
require('colors');
var links = require('../links.js');
var prettify = require('../pretty').makePretty;

exports.command = 'list';

exports.describe = 'Lists all links';

exports.builder = {};

exports.handler = function () {
	links.load();

	var found;

	console.log('Links:');

	for (var linkId in links.data) {
		var link = prettify(links.data[linkId]);
		var status = link.enabled ? 'enabled'.green : 'disabled'.red;
		console.log(`${status} (${linkId}) ${link.src} -> ${link.dest}`);
		found = true;
	}

	if (!found) {
		console.log('(no links set)');
	}
}
