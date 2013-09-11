var last_url = "";
function create_handler(bookmark) {return function(info, tab) {
	var url = bookmark["url"];
	// Google Chrome doesn't open the same URL as the previous.
	if (url == last_url) url += "#";
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
	form.submit();
	last_url=url;
};}

function set_context_menu() {
	var bookmarks = fetch_bookmarks();
	if (!(bookmarks instanceof Array)) {
		bookmarks = [];
		store_bookmarks(bookmarks);
	}

	bookmarks.forEach(function(bookmark) {
		if (bookmark["context"]) {
			chrome.contextMenus.create({
				"title":bookmark["title"],
				"contexts":["selection"],
				"onclick":create_handler(bookmark)
			});
		}
	});

}

set_context_menu();

chrome.runtime.onMessage.addListener(function(request, sender) {
	if (request == MSG_REFRESH_CONTEXT_MENU) {
		chrome.contextMenus.removeAll();
		set_context_menu();
	} else {
		var bookmarks = fetch_bookmarks();
		bookmarks.push(request);
		store_bookmarks(bookmarks);
	}
});
