'use strict';

var path = require('path');
var fs = require('fs-extra');
var prettify = require('../pretty').makePretty;

module.exports = function (config) {
	return function (resp) {
		const count = { copy: 0, delete: 0 }
		const pretty = prettify({ src: resp.root });
		for (var i in resp.files) {
			var f = resp.files[i];
			if (f.type === 'f') {
				const link = {
					src: path.join(config.src, f.name),
					dest: path.join(config.dest, f.name),
				}

				if (f.exists) {
					// console.log('[copy]', src, '->', dest);
					fs.copy(link.src, link.dest);
					count.copy++;
				} else {
					// console.log('[delete]', dest);
					fs.remove(link.dest);
					count.delete++;
				}
			}
		}

		if (count.copy > 0) {
			console.log(`[ ${pretty.src} ]: ${count.copy} files ${"copied".green}`)
		}
		if (count.delete > 0) {
			console.log(`[ ${pretty.src} ]: ${count.delete} files ${"deleted".red}`)
		}
	}
}
