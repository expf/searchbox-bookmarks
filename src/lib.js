export const MSG_REFRESH_CONTEXT_MENU = 1;

export function foreach(array, callback) {
	for (var i = 0; i < array.length; i++) callback(array[i]);
}

export function create(name, props) {
	const elem = document.createElement(name);
	for (var a in props) {
		elem[a] = props[a];
	}
	return elem;
}

export function create2(name, props, children) {
	const elem = create(name, props);
	for (let i = 0; i < children.length; i++) {
		elem.appendChild(children[i]);
	}
	return elem;
}

export function fetch_bookmarks() {
	return JSON.parse(window["localStorage"].getItem("b"));
}

export function store_bookmarks(bookmarks) {
	window["localStorage"].setItem("b",JSON.stringify(bookmarks));
}

