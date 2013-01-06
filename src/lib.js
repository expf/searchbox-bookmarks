/** @const */
var MSG_REFRESH_CONTEXT_MENU = 1;

function foreach(array, callback) {
	for (var i = 0; i < array.length; i++) callback(array[i]);
}

/**
 * @param {string} name
 * @param {Object.<string, *>} props
 * @return {Element}
 */
function create(name, props) {
	var elem = document.createElement(name);
	for (var a in props) {
		elem[a] = props[a];
	}
	return elem;
}

/**
 * @param {string} name
 * @param {Object.<string, *>} props
 * @param {Array.<Element>} children
 * @return {Element}
 */
function create2(name, props, children) {
	var elem = create(name, props);
	for (var i = 0; i < children.length; i++) {
		elem.appendChild(children[i]);
	}
	return elem;
}

function fetch_bookmarks() {
	return JSON.parse(window["localStorage"].getItem("b"));
}

function store_bookmarks(bookmarks) {
	window["localStorage"].setItem("b",JSON.stringify(bookmarks));
}

