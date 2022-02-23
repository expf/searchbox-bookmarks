export function foreach(array, callback) {
	Array.from(array).forEach(callback);
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

export async function fetch_bookmarks() {
	const b = await chrome.storage.local.get("b");
	if (b["b"]) {
		return JSON.parse(b["b"]);
	} else {
		return [];
	}
}
