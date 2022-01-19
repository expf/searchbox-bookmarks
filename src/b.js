chrome.contextMenus.onClicked.addListener(function(info, tab) {
	var bookmarks = fetch_bookmarks();
	var bookmark = bookmarks[info.menuItemId];
	var url = bookmark["url"];

	// Google Chrome doesn't open the same URL as the previous.
	var last_url = window["localStorage"].getItem("l");
	if (url == last_url) url += "#";
	window["localStorage"].setItem("l", url);

	var form = create("form", {
		"target":"_blank",
		"action":url,
		"acceptCharset":bookmark["charset"]
	});
	if (bookmark["method"]) form.method = bookmark["method"];
	for (var n in bookmark["params"]) {
		var v = bookmark["params"][n];
		if (v == null) v = info.selectionText;
		var i = create("input", {"name":n, "type":"hidden", "value":v});
		form.appendChild(i)
	}
	var body = document.getElementsByTagName("body")[0];
	body.appendChild(form);
	// "form.submit()" fails if the form containts a control named "submit".
	Object.getPrototypeOf(form).submit.call(form);
	body.removeChild(form);
});

function set_context_menu() {
	chrome.contextMenus.removeAll();

	var bookmarks = fetch_bookmarks();
	if (!(bookmarks instanceof Array)) {
		bookmarks = [];
		store_bookmarks(bookmarks);
	}

	for (var i = 0; i < bookmarks.length; i++) {
		var bookmark = bookmarks[i];
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

chrome.runtime.onMessage.addListener(function(request, sender) {
	if (request == MSG_REFRESH_CONTEXT_MENU) {
		set_context_menu();
	} else {
		var bookmarks = fetch_bookmarks();
		bookmarks.push(request);
		store_bookmarks(bookmarks);
	}
});
