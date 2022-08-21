import { foreach, create_element, set_class, set_attr } from "./lib.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const classname = 'https://github.com/expf/searchbox-bookmarks$' + chrome.runtime.id;

function reset() {
	foreach(document.getElementsByClassName(classname), (element) => {
		element.parentNode.removeChild(element);
	});
}

reset();

function make_handler(form, target) {return (e) => {
	const params = [];
	foreach(form.elements, (input) => {
		if (!((input.type == "checkbox" || input.type == "radio") && !input.checked)) {
			params.push((input === target) ? [input.name] : [input.name, input.value]);
		}
	});
	const bookmark = {
		"title":document.title,
		"method":form.method,
		"url":form.action,
		"params":params,
		"charset":form.acceptCharset||document.characterSet
	};
	chrome.runtime.sendMessage(bookmark);
	reset();
};}

foreach(document.forms, (form) => foreach(form.elements, (input) => {
	if (input.type == "text" || input.type == "search") {
		const span = create_element("span",
			set_class(classname),
			create_element([SVG_NS, "svg"],
				set_attr("version", "1.1"),
				set_attr("width", 30),
				set_attr("height", 30),
				(el) => {
					const z = window.getComputedStyle(input, "").zIndex;
					el.style.zIndex = isNaN(z) ? 1 : z + 1;
					el.style.position = "absolute";
					el.style.cursor = "pointer";
					el.onclick = make_handler(form, input);
				},
				create_element([SVG_NS, "polygon"],
					// [..."0123456789"].flatMap(i=>{const r=i*Math.PI/5,d=13-(i%2)*8;return[14+Math.sin(r)*d,14-Math.cos(r)*d]}).map(v=>Math.round(v*10)/10).join(",");
					set_attr("points", "14,1,16.9,10,26.4,10,18.8,15.5,21.6,24.5,14,19,6.4,24.5,9.2,15.5,1.6,10,11.1,10"),
					set_attr("stroke", "#333"),
					set_attr("stroke-width", "2"),
					set_attr("stroke-linecap", "round"),
					set_attr("stroke-linejoin", "round"),
					set_attr("fill", "#ff6"),
				),
				create_element([SVG_NS, "path"],
					set_attr("d", "M21.5,17.5h3v4h4v3h-4v4h-3v-4h-4v-3h4v-4z"),
					set_attr("stroke", "#060"),
					set_attr("stroke-width", "1"),
					set_attr("fill", "#6c6"),
				),
			),
		);
		input.parentNode.insertBefore(span, input);
	}
}));
