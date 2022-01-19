import {foreach} from "./lib.js";

const classname = 'https://github.com/expf/searchbox-bookmarks$' + chrome.runtime.id;

function reset() {
	foreach(document.getElementsByClassName(classname), (element) => {
		element.parentNode.removeChild(element);
	});
}

reset();

function make_handler(form, target) {return (e) => {
	const params = {};
	foreach(form.elements, (input) => {
		if (!((input.type == "checkbox" || input.type == "radio") && !input.checked)) {
			params[input.name] = (input === target) ? null : input.value;
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

function draw(c){

	c.lineWidth=2;
	c.strokeStyle="#333";
	c.fillStyle="#ff6";
	c.lineCap="round";
	c.lineJoin="round";
	c.beginPath();
	for (let i = 0, d = 13, m = c.moveTo; i < 6.3; i += Math.PI/5, d = 18.2-d, m = c.lineTo) m.call(c,14+Math.sin(i)*d, 14-Math.cos(i)*d);
	c.fill();
	c.stroke();

	c.lineWidth=1;
	c.strokeStyle="#060";
	c.fillStyle="#6c6";
	c.beginPath();
	const a1=17.5, a2=21.5, a3=24.5, a4=28.5;
	c.moveTo(a2,a1);
	c.lineTo(a3,a1);
	c.lineTo(a3,a2);
	c.lineTo(a4,a2);
	c.lineTo(a4,a3);
	c.lineTo(a3,a3);
	c.lineTo(a3,a4);
	c.lineTo(a2,a4);
	c.lineTo(a2,a3);
	c.lineTo(a1,a3);
	c.lineTo(a1,a2);
	c.lineTo(a2,a2);
	c.lineTo(a2,a1);
	c.fill();
	c.stroke();

}

foreach(document.forms, (form) => {
	foreach(form.elements, (input) => {
		if (input.type == "text" || input.type == "search") {
			const span = document.createElement("span");
			span.className = classname;
			const canvas = document.createElement("canvas");
			const z = window.getComputedStyle(input, "").zIndex;
			canvas.style.zIndex = isNaN(z) ? 1 : z+1;
			canvas.style.position = "absolute";
			canvas.style.cursor = "pointer";
			canvas.width = 30;
			canvas.height = 30;
			draw(canvas.getContext("2d"));
			canvas.onclick = make_handler(form, input);
			span.appendChild(canvas);
			input.parentNode.insertBefore(span, input);
		}
	});
});

