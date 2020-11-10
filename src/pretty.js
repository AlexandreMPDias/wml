const path = require('path');

function fix(link) {
	return {
		src: path.resolve(link.src),
		dest: link.dest && path.resolve(link.dest)
	};
}

function getSource(link) {
	return fix(link).src.split(path.sep).reverse()[0].cyan;
}

function getDest(l) {
	const link = fix(l);
	const base = link.src.split(path.sep).reverse().slice(1).reverse().join(path.sep);
	return link.dest.replace(base, '').split(path.sep)[1].blue
}


class Pretty {
	constructor(raw) {
		this.raw = raw
	}

	get src() {
		return getSource(this.raw)
	}

	get dest() {
		return getDest(this.raw);
	}
}

exports.makePretty = (link) => {
	return new Pretty(link);
}