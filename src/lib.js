export function foreach(array, callback) {
	Array.from(array).forEach(callback);
}

export function create_element(name, ...args) {
	const element = Array.isArray(name) ? document.createElementNS(...name) : document.createElement(name);
	args.forEach(arg => {
		if (typeof arg === "function") {
			arg(element);
		} else {
			element.append(arg);
		}
	});
	return element;
}

export const set_class = className => e => {e.className = className;};
export const set_attr = (name, value) => e => {e.setAttribute(name, value);};

export async function fetch_bookmarks() {
	const b = await chrome.storage.local.get("b");
	if (b["b"]) {
		return JSON.parse(b["b"]);
	} else {
		return [];
	}
}
