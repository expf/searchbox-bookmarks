const esbuild = require('esbuild');
const fs = require('fs');

const options = {};

let minify = true;
options.nominify = () => {minify = false;};

let sourcemap = false;
options.sourcemap = () => {sourcemap = true;};

let watch = false;
options.watch = () => {watch = true;};

const manifest = {
	name: "SearchBox Bookmarks",
	version: "0",
	manifest_version: 2,
	description: "Bookmark search-boxes and use the search-box in the toolbar popup.",
	icons: {
		32: "32.png",
		48: "48.png",
		128: "128.png",
	},
	background: {
		scripts: ["b.js"],
		persistent: false,
	},
	browser_action: {
		default_popup: "p.html",
		default_icon: "a.png",
	},
	permissions: [
		"activeTab",
		"contextMenus",
	],
};

for (const arg of process.argv.splice(2)) {
	if (options.hasOwnProperty(arg)) {
		options[arg]();
	} else {
		manifest.version = arg;
	}
}

fs.writeFileSync('dst/manifest.json', JSON.stringify(manifest));

esbuild.build({
	entryPoints: ['src/b.js', 'src/c.js', 'src/p.js'],
	outdir: 'dst/',
	target: ['chrome88'],
	bundle: true,
	minify: minify,
	sourcemap: sourcemap,
	watch: watch,
}).catch(() => process.exit(1));

const convertHtml = () => {
	fs.readFile('src/p.html', 'utf8', (err, data) => {
		if (err) throw err;
		if (minify) {
			data = data.replaceAll(/[\r\n\t]/g, '');
		}
		fs.writeFileSync('dst/p.html', data);
	});
};

convertHtml();

if (watch) {
	fs.watchFile('src/p.html', convertHtml);
}
