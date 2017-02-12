var add = document.getElementById("add");
var addmark = document.getElementById("addmark");
var recyclebin = document.getElementById("recyclebin");
var removedrop = document.getElementById("removedrop");
var list = document.getElementById("list");
var drophidden = document.getElementById("drophidden");

var size = add.clientHeight;
addmark.height = size;
var pad = (size-14)>>1;
var c = addmark.getContext("2d");
c.lineWidth = 1;
c.strokeStyle = "#060";
c.fillStyle = "#6c6";
c.beginPath();
var a1=1.5, a2=5.5, a3=8.5, a4=12.5;
c.moveTo(a2,pad+a1);
c.lineTo(a3,pad+a1);
c.lineTo(a3,pad+a2);
c.lineTo(a4,pad+a2);
c.lineTo(a4,pad+a3);
c.lineTo(a3,pad+a3);
c.lineTo(a3,pad+a4);
c.lineTo(a2,pad+a4);
c.lineTo(a2,pad+a3);
c.lineTo(a1,pad+a3);
c.lineTo(a1,pad+a2);
c.lineTo(a2,pad+a2);
c.lineTo(a2,pad+a1);
c.fill();
c.stroke();

c = recyclebin.getContext("2d");
c.lineWidth = 1.7;
c.strokeStyle = "#000";
c.lineCap = "round";
c.lineJoin = "round";
c.beginPath();
c.moveTo(1,4);
c.lineTo(14,4);
c.stroke();
c.beginPath();
c.moveTo(3,4);
c.lineTo(3,14);
c.lineTo(12,14);
c.lineTo(12,4);
c.stroke();
c.beginPath();
c.moveTo(6,7);
c.lineTo(6,11);
c.stroke();
c.beginPath();
c.moveTo(9,7);
c.lineTo(9,11);
c.stroke();
c.beginPath();
c.arc(7.5,3.5,2.5,Math.PI,Math.PI*2);
c.stroke();

var bookmarks = fetch_bookmarks();

add.onclick = function() {
	window.close();
	chrome.tabs.executeScript({"file":"c.js", "allFrames":true});
};

var opened_item = null;
function clear_item(item) {
	var drop = item.firstChild;
	while (drop.nextSibling) {
		item.removeChild(drop.nextSibling);
	}
}
function open_item(item) {
	if (item !== opened_item) {
		close_item();
	}
	clear_item(item);
	opened_item = item;
}
function close_item() {
	if (opened_item) {
		clear_item(opened_item);
		opened_item.appendChild(create_title(bookmarks[opened_item.id]));
		opened_item = null;
	}
}

function save() {
	var save_data = [];
	for (var e = list.firstChild; e; e = e.nextSibling) {
		if (e.className == "item") {
			save_data.push(bookmarks[e.id]);
		}
	}
	store_bookmarks(save_data);
	chrome.runtime.sendMessage(MSG_REFRESH_CONTEXT_MENU);
}

function show_search_form(e) {
	var item = e.currentTarget.parentNode;
	var bookmark = bookmarks[item.id];

	var form = create("form", {
		"target":"_blank",
		"action":bookmark["url"],
		"acceptCharset":bookmark["charset"]
	});
	if (bookmark["method"]) form.method = bookmark["method"];
	var focus;
	for (var n in bookmark["params"]) {
		var v = bookmark["params"][n];
		var input = create("input", {"name":n});
		if (v == null) {
			input.type="text";
			focus=input
		} else {
			input.type="hidden";
			input.value=v
		}
		form.appendChild(input);
	}
	input = create("input", {"type":"submit"});
	form.appendChild(input);

	open_item(item);
	item.appendChild(create2("div", {"className":"search_title", "onclick":show_edit_form}, [
		create2("div", {"className":"edit"}, [
			document.createTextNode("[Edit]")
		]),
		document.createTextNode(bookmark["title"])
	]));
	item.appendChild(form);
	focus.focus();
}

function show_edit_form(e) {
	var item = e.currentTarget.parentNode;
	var bookmark = bookmarks[item.id];

	var title_input = create("input", {"type":"text", "value":bookmark["title"]});
	var checkbox=create("input", {"type":"checkbox", "id":"check"});
	if (bookmark["context"]) {
		checkbox.checked = true;
	}
	var form = create2("form", {"className":"edit"}, [
		title_input,
		create("br", {}),
		checkbox,
		create2("label", {"htmlFor":"check"}, [
			document.createTextNode("add to context menu")
		]),
		create("br", {}),
		create("input", {"type":"submit", "value":"OK", "onclick":function() {
			bookmark["title"] = title_input.value;
			bookmark["context"] = checkbox.checked ? true : undefined;
			save();
			close_item();
			return false;
		}}),
		create("input", {"type":"submit", "value":"Cancel", "onclick":function() {
			close_item();
			return false;
		}})
	]);
	open_item(item);
	item.appendChild(form);
}

function create_title(bookmark) {
	return create2("div", {"className":"menu", "onclick":show_search_form}, [
		document.createTextNode(bookmark["title"])
	]);
}

function item_ondragstart(e) {
	e.dataTransfer.setData("text/x-bookmark-index", e.currentTarget.id);
	e.dataTransfer.effectAlloewd = "move";
	drophidden.disabled = true;
}

function item_ondragend(e) {
	drophidden.disabled = false;
}

function drop_ondragover(e) {
	var types = e.dataTransfer.types;
	for (var i = 0; i < types.length; i++) {
		if (types[i] == "text/x-bookmark-index") {
			e.preventDefault();
			return;
		}
	}
}

var movedrop_props = {
	"className":"movedrop",
	"ondragover":drop_ondragover,
	"ondragenter":function(e) {
		e.currentTarget.style.backgroundColor = "rgba(51,51,51,0.5)";
	},
	"ondragleave":function(e) {
		e.currentTarget.style.backgroundColor = "transparent";
	},
	"ondrop":function(e) {
		e.preventDefault();
		e.currentTarget.style.backgroundColor = "transparent";
		var drag_id = e.dataTransfer.getData("text/x-bookmark-index");
		if (drag_id == "" || isNaN(drag_id)) return;
		var drag = document.getElementById(drag_id);
		if (!drag) return;
		var drop = e.currentTarget.parentNode;
		if (drag === drop) return;
		list.removeChild(drag);
		list.insertBefore(drag, drop);
		save();
	}
};

removedrop["ondragover"] = drop_ondragover;
removedrop["ondrop"] = function(e) {
	e.preventDefault();
	e.currentTarget.style.backgroundColor = "transparent";
	var drag_id = e.dataTransfer.getData("text/x-bookmark-index");
	if (drag_id == "" || isNaN(drag_id)) return;
	var drag = document.getElementById(drag_id);
	if (!drag) return;
	list.removeChild(drag);
	save();
};

bookmarks.forEach(function(bookmark, i) {
	list.appendChild(create2("div", {
		"id":i,
		"className":"item",
		"draggable":true,
		"ondragstart":item_ondragstart,
		"ondragend":item_ondragend
	}, [
		create("div", movedrop_props),
		create_title(bookmark)
	]));
});

list.appendChild(create2("div", {"className":"bottom"}, [
	create("div", movedrop_props)
]));
