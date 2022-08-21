import { create_element, set_class, set_attr, fetch_bookmarks } from "./lib.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const DRAG_FORMAT = "text/x-bookmark-index";

const list = create_element("div");
const addmark = create_element([SVG_NS, "svg"],
	set_attr("version", "1.1"),
	set_attr("width", 14),
	set_attr("height", 15),
	create_element([SVG_NS, "path"],
		set_attr("d", "M5.5,1.5h3v4h4v3h-4v4h-3v-4h-4v-3h4v-4z"),
		set_attr("stroke", "#060"),
		set_attr("stroke-width", "1"),
		set_attr("fill", "#6c6"),
	),
);
addmark.style.verticalAlign = "middle";
const recyclebin = create_element([SVG_NS, "svg"],
	set_attr("version", "1.1"),
	set_attr("width", 15),
	set_attr("height", 15),
	create_element([SVG_NS, "path"],
		set_attr("d", "M1,4H14M3,4V14H12V4M6,7V11M9,7V11M5,3.5A2.5,2.5,0,1,1,10,3.5"),
		set_attr("stroke-width", "1.7"),
		set_attr("stroke-linecap", "round"),
		set_attr("stroke-linejoin", "round"),
		set_attr("fill", "transparent"),
	),
);
const removedrop = create_element("span",
	set_class("removedrop"),
	recyclebin,
);
const add = create_element("div",
	set_class("menu"),
	addmark,
	"bookmark a search-box on this page ",
	removedrop,
);

const drophidden = document.getElementById("drophidden");

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
		opened_item.append(create_title(bookmarks[opened_item.id]));
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

	let focus;
	const inputs = bookmark["params"].map(([name, value]) => create_element("input",
		(el) => {
			el.name = name;
			if (value == undefined) {
				el.type="text";
				focus=el;
			} else {
				el.type="hidden";
				el.value=value;
			}
		},
	));

	const form = create_element("form",
		(el) => {
			el.target = "_blank";
			el.action = bookmark["url"];
			el.acceptCharset = bookmark["charset"];
			el.method = bookmark["method"];
		},
		...inputs,
		create_element("input",
			(el) => {
				el.type = "submit";
			},
		),
	);

	open_item(item);
	item.append(create_element("div",
		set_class("search_title"),
		(el) => {
			el.onclick = show_edit_form;
		},
		create_element("div",
			set_class("edit"),
			"[Edit]",
		),
		bookmark["title"],
	));
	item.append(form);
	focus.focus();
}

function show_edit_form(e) {
	const item = e.currentTarget.parentNode;
	const bookmark = bookmarks[item.id];

	const title_input = create_element("input",
		(el) => {
			el.type = "text";
			el.value = bookmark["title"];
		},
	);
	const checkbox = create_element("input",
		(el) => {
			el.type = "checkbox";
			el.id = "check";
			el.checked = bookmark["context"];
		},
	);
	const form = create_element("form",
		set_class("edit"),
		title_input,
		create_element("br"),
		checkbox,
		create_element("label",
			(el) => {
				el.htmlFor = "check";
			},
			"add to context menu",
		),
		create_element("br"),
		create_element("input",
			(el) => {
				el.type = "submit";
				el.value = "OK";
				el.onclick = () => {
					bookmark["title"] = title_input.value;
					bookmark["context"] = checkbox.checked ? true : undefined;
					save();
					close_item();
					return false;
				};
			},
		),
		create_element("input",
			(el) => {
				el.type = "submit";
				el.value = "Cancel";
				el.onclick = () => {
					close_item();
					return false;
				};
			},
		),
	);
	open_item(item);
	item.appendChild(form);
}

function create_title(bookmark) {
	return create_element("div",
		set_class("menu"),
		(el) => {
			el.onclick = show_search_form;
		},
		bookmark["title"],
	);
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

function movedrop_ondragenter(e) {
	e.currentTarget.style.opacity = 0.4;
}

function movedrop_ondragleave(e) {
	e.currentTarget.style.opacity = 0;
}

function movedrop_ondrop(e) {
	e.preventDefault();
	e.currentTarget.style.opacity = 0;
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

function create_movedrop() {
	return create_element("div",
		set_class("movedrop"),
		(el) => {
			el.ondragover = drop_ondragover;
			el.ondragenter = movedrop_ondragenter;
			el.ondragleave = movedrop_ondragleave;
			el.ondrop = movedrop_ondrop;
		},
	);
}

removedrop.ondragover = drop_ondragover;
removedrop.ondrop = (e) => {
	e.preventDefault();
	const drag_id = e.dataTransfer.getData(DRAG_FORMAT);
	if (drag_id == "" || isNaN(drag_id)) return;
	const drag = document.getElementById(drag_id);
	if (!drag) return;
	list.removeChild(drag);
	save();
};

bookmarks.forEach((bookmark, i) => {
	list.append(create_element("div",
		set_class("item"),
		(el) => {
			el.id = i;
			el.draggable = true;
			el.ondragstart = item_ondragstart;
			el.ondragend = item_ondragend;
		},
		create_movedrop(),
		create_title(bookmark),
	));
});

list.append(create_element("div",
	set_class("bottom"),
	create_movedrop(),
));

document.body.append(list, create_element("hr"), add);
