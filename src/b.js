import {MSG_REFRESH_CONTEXT_MENU, create, fetch_bookmarks, store_bookmarks} from "./lib.js";

chrome.contextMenus.onClicked.addListener((info, tab) => {
	const bookmarks = fetch_bookmarks();
	const bookmark = bookmarks[info.menuItemId];
	let url = bookmark["url"];

	// Google Chrome doesn't open the same URL as the previous.
	const last_url = window["localStorage"].getItem("l");
	if (url == last_url) url += "#";
	window["localStorage"].setItem("l", url);

	const form = create("form", {
		"target":"_blank",
		"action":url,
		"acceptCharset":bookmark["charset"]
	});
	if (bookmark["method"]) form.method = bookmark["method"];
	for (const n in bookmark["params"]) {
		const v = bookmark["params"][n] ?? info.selectionText;
		const i = create("input", {"name":n, "type":"hidden", "value":v});
		form.appendChild(i)
	}
	const body = document.getElementsByTagName("body")[0];
	body.appendChild(form);
	// "form.submit()" fails if the form containts a control named "submit".
	Object.getPrototypeOf(form).submit.call(form);
	body.removeChild(form);
});

function set_context_menu() {
	chrome.contextMenus.removeAll();

	let bookmarks = fetch_bookmarks();
	if (!(bookmarks instanceof Array)) {
		bookmarks = [];
		store_bookmarks(bookmarks);
	}

	for (let i = 0; i < bookmarks.length; i++) {
		const bookmark = bookmarks[i];
		if (bookmark["context"]) {
			chrome.contextMenus.create({
				"id":"" + i,
				"title":bookmark["title"],
				"contexts":["selection"]
			});
		}
	}

}

set_context_menu();

chrome.runtime.onMessage.addListener((request, sender) => {
	if (request == MSG_REFRESH_CONTEXT_MENU) {
		set_context_menu();
	} else {
		const bookmarks = fetch_bookmarks();
		bookmarks.push(request);
		store_bookmarks(bookmarks);
	}
});
