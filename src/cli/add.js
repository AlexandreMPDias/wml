'use strict';

var fs = require('fs-extra');
var path = require('path');
var untildify = require('untildify');
var inquirer = require('inquirer');
var isThere = require('is-there');
var links = require('../links.js');
var prettify = require('../pretty').makePretty;

exports.command = 'add <src> <dest>';

exports.describe = 'Adds a link';

exports.builder = {};

function promptForIgnoredFolders(src, rules) {
	var prompts = [];

	rules.forEach((rule) => {
		if (isThere(path.resolve(src, rule.relPath))) {
			prompts.push({
				name: rule.name,
				message: rule.message,
				default: rule.default,
				type: 'confirm'
			});
		}
	});

	return new Promise(resolve => {
		var ignoredFolders = [];
		rules.forEach((rule) => {
			ignoredFolders.push(rule.ignore);
		});
		resolve(ignoredFolders)
	})
	return inquirer.prompt(prompts).then((answers) => {
		console.log(prompts);
		var ignoredFolders = [];

		rules.forEach((rule) => {
			if (answers[rule.name]) {
				ignoredFolders.push(rule.ignore);
			}
		});

		console.log(ignoredFolders)

		return ignoredFolders;
	});
}

function dedupeArray(array) {
	var arr = array.concat();

	for (var i = 0; i < arr.length; i++) {
		for (var j = i + 1; j < arr.length; j++) {
			if (arr[i] === arr[j]) {
				arr.splice(j--, 1);
			}
		}
	}

	return arr;
}

exports.handler = function (argv) {
	links.load();
	var i;
	const link = prettify({
		src: path.resolve(untildify(argv.src)),
		dest: path.resolve(untildify(argv.dest))
	})

	for (i in links.data) {
		if (links.data[i].src === link.raw.src &&
			links.data[i].dest === link.raw.dest) {
			console.log('Error: link already exists');
			return;
		}
	}

	promptForIgnoredFolders(link.raw.src, [{
		name: 'git',
		relPath: '.git',
		ignore: '.git',
		message: 'Source folder is a git repo, add `.git` to ignored folders?',
		default: true
	}, {
		name: 'npm',
		relPath: 'package.json',
		ignore: 'node_modules',
		message: 'Source folder is an npm package, add `node_modules` to ignored folders?',
		default: true
	}]).then((ignoredFolders) => {
		var watchmanConfigPath = path.resolve(link.raw.src, '.watchmanconfig');

		var watchmanConfig = (() => {
			try {
				return fs.readJsonSync(watchmanConfigPath);
			} catch (err) {
				return {
					ignore_dirs: []
				};
			}
		})();

		ignoredFolders = ignoredFolders.concat(watchmanConfig.ignore_dirs);
		watchmanConfig.ignore_dirs = dedupeArray(ignoredFolders);

		fs.outputJsonSync(watchmanConfigPath, watchmanConfig);

		i = 0;
		while (links.data[i]) i++;

		links.data[i] = {
			src: link.raw.src,
			dest: link.raw.dest,
			enabled: true,
			createdTime: new Date()
		};

		links.save();
		console.log(`Added link: (${i}) ${link.src} -> ${link.dest}`);
	});
}
