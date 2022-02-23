import {create, create2, fetch_bookmarks} from "./lib.js";

const DRAG_FORMAT = "text/x-bookmark-index";

const add = document.getElementById("add");
const addmark = document.getElementById("addmark");
const recyclebin = document.getElementById("recyclebin");
const removedrop = document.getElementById("removedrop");
const list = document.getElementById("list");
const drophidden = document.getElementById("drophidden");

const size = add.clientHeight;
addmark.height = size;
const pad = (size-14)>>1;
let c = addmark.getContext("2d");
c.lineWidth = 1;
c.strokeStyle = "#060";
c.fillStyle = "#6c6";
c.beginPath();
const a1=1.5, a2=5.5, a3=8.5, a4=12.5;
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

const bookmarks = await fetch_bookmarks();
let bookmarks_count = bookmarks.length;

add.onclick = async () => {
	window.close();
	const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
	chrome.scripting.executeScript({
		target: {tabId: tab.id, allFrames: true},
		files: ["c.js"],
	});
};

let opened_item = null;
function clear_item(item) {
	const drop = item.firstChild;
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
	const save_data = [];
	for (let e = list.firstChild; e; e = e.nextSibling) {
		if (e.className == "item") {
			save_data.push(bookmarks[e.id]);
		}
	}
	chrome.runtime.sendMessage([bookmarks_count, save_data]);
	bookmarks_count = save_data.length;
}

function show_search_form(e) {
	const item = e.currentTarget.parentNode;
	const bookmark = bookmarks[item.id];

	const form = create("form", {
		"target":"_blank",
		"action":bookmark["url"],
		"acceptCharset":bookmark["charset"]
	});
	if (bookmark["method"]) form.method = bookmark["method"];
	let focus;
	for (const [name, value] of bookmark["params"]) {
		const input = create("input", {"name":name});
		if (value == null) {
			input.type="text";
			focus=input;
		} else {
			input.type="hidden";
			input.value=value;
		}
		form.appendChild(input);
	}
	form.appendChild(create("input", {"type":"submit"}));

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
	const item = e.currentTarget.parentNode;
	const bookmark = bookmarks[item.id];

	const title_input = create("input", {"type":"text", "value":bookmark["title"]});
	const checkbox = create("input", {"type":"checkbox", "id":"check"});
	if (bookmark["context"]) {
		checkbox.checked = true;
	}
	const form = create2("form", {"className":"edit"}, [
		title_input,
		create("br", {}),
		checkbox,
		create2("label", {"htmlFor":"check"}, [
			document.createTextNode("add to context menu")
		]),
		create("br", {}),
		create("input", {"type":"submit", "value":"OK", "onclick":() => {
			bookmark["title"] = title_input.value;
			bookmark["context"] = checkbox.checked ? true : undefined;
			save();
			close_item();
			return false;
		}}),
		create("input", {"type":"submit", "value":"Cancel", "onclick":() => {
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
	e.dataTransfer.setData(DRAG_FORMAT, e.currentTarget.id);
	e.dataTransfer.effectAlloewd = "move";
	drophidden.disabled = true;
}

function item_ondragend(e) {
	drophidden.disabled = false;
}

function drop_ondragover(e) {
	const types = e.dataTransfer.types;
	for (let i = 0; i < types.length; i++) {
		if (types[i] == DRAG_FORMAT) {
			e.preventDefault();
			return;
		}
	}
}

const movedrop_props = {
	"className":"movedrop",
	"ondragover":drop_ondragover,
	"ondragenter":(e) => {
		e.currentTarget.style.backgroundColor = "rgba(51,51,51,0.5)";
	},
	"ondragleave":(e) => {
		e.currentTarget.style.backgroundColor = "transparent";
	},
	"ondrop":(e) => {
		e.preventDefault();
		e.currentTarget.style.backgroundColor = "transparent";
		const drag_id = e.dataTransfer.getData(DRAG_FORMAT);
		if (drag_id == "" || isNaN(drag_id)) return;
		const drag = document.getElementById(drag_id);
		if (!drag) return;
		const drop = e.currentTarget.parentNode;
		if (drag === drop) return;
		list.removeChild(drag);
		list.insertBefore(drag, drop);
		save();
	}
};

removedrop["ondragover"] = drop_ondragover;
removedrop["ondrop"] = (e) => {
	e.preventDefault();
	e.currentTarget.style.backgroundColor = "transparent";
	const drag_id = e.dataTransfer.getData(DRAG_FORMAT);
	if (drag_id == "" || isNaN(drag_id)) return;
	const drag = document.getElementById(drag_id);
	if (!drag) return;
	list.removeChild(drag);
	save();
};

bookmarks.forEach((bookmark, i) => {
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
