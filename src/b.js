import {fetch_bookmarks} from "./lib.js";

let bookmarks_async = fetch_bookmarks();
let context_menu_bookmarks;

function context_menu(bookmark, selection_text) {
	const form = document.createElement("form");
	form.target = "_blank";
	form.action = bookmark["url"];
	form.acceptCharset = bookmark["charset"];
	form.style.display = "none";
	if (bookmark["method"]) form.method = bookmark["method"];
	for (const [name, value] of bookmark["params"]) {
		const input = document.createElement("input");
		input.name = name;
		input.type = "hidden";
		input.value = value ?? selection_text;
		form.appendChild(input)
	}
	const body = document.getElementsByTagName("body")[0];
	body.appendChild(form);
	// "form.submit()" fails if the form containts a control named "submit".
	Object.getPrototypeOf(form).submit.call(form);
	body.removeChild(form);
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	const bookmark = (context_menu_bookmarks ?? await bookmarks_async)[info.menuItemId];

	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: context_menu,
		args: [bookmark, info.selectionText]
	});
});

let store_state = 0;
function store(bookmarks) {
	if (store_state === 0) {
		store_state = 1;
		chrome.storage.local.set({"b": JSON.stringify(bookmarks)}, () => {
			const new_bookmarks = store_state;
			store_state = 0;
			if (new_bookmarks instanceof Array) {
				store(new_bookmarks);
			}
		});
	} else {
		store_state = bookmarks;
	}
}

function set_context_menu() {
	bookmarks_async.then((bookmarks) => {
		chrome.contextMenus.removeAll();
		context_menu_bookmarks = bookmarks;
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
	});
}

set_context_menu();

chrome.runtime.onMessage.addListener(async (request, sender) => {
	if (request instanceof Array) {
		const [count, new_bookmarks] = request;
		bookmarks_async = bookmarks_async.then((old_bookmarks) => {
			new_bookmarks.push(...old_bookmarks.slice(count));
			store(new_bookmarks);
			return new_bookmarks;
		});
		set_context_menu();
	} else {
		bookmarks_async = bookmarks_async.then((bookmarks) => {
			bookmarks.push(request);
			store(bookmarks);
			return bookmarks;
		});
	}
});
