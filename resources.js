function create_icon(size, margin) {
	var outer_size = size+margin+margin;
	var canvas = document.createElement("canvas");
	canvas.width = outer_size;
	canvas.height = outer_size;
	var c = canvas.getContext('2d');
	c.translate(margin,margin);
	c.scale(size/16, size/16);
	c.lineWidth = 1.2;
	c.strokeStyle = "#666";
	c.fillStyle = "#fff";
	c.shadowColor = "rgba(85,85,85,0.5)";
	c.shadowOffsetX = 1;
	c.shadowOffsetY = 1;
	c.shadowBlur = 1;
	c.beginPath();
	c.moveTo(5,9);
	c.lineTo(11,9);
	c.quadraticCurveTo(14,9,14,11);
	c.lineTo(14,12);
	c.quadraticCurveTo(14,14,11,14);
	c.lineTo(5,14);
	c.quadraticCurveTo(2,14,2,12);
	c.lineTo(2,11);
	c.quadraticCurveTo(2,9,5,9);
	c.fill();
	c.stroke();
	c.lineWidth = 1.2;
	c.strokeStyle = "#333";
	var g = c.createRadialGradient(14,14,1,8,8,10);
	g.addColorStop(0, '#fff');
	g.addColorStop(1, '#ff0');
	c.fillStyle = g;
	c.shadowColor = "transparent";
	c.lineCap = "round";
	c.lineJoin = "round";
	c.beginPath();
	for (var i = 0, d = 5.5, m = c.moveTo; i < 6.3; i += Math.PI/5, d = 7.7-d, m = c.lineTo) m.call(c,6.5+Math.sin(i)*d, 7-Math.cos(i)*d);
	c.fill();
	c.stroke();
	return canvas.toDataURL();
}

function create_action() {
	var canvas=document.createElement("canvas");
	canvas.width=19;
	canvas.height=19;
	var c = canvas.getContext('2d');
	c.lineWidth = 1.5;
	c.strokeStyle = "#666";
	c.fillStyle = "#fff";
	c.shadowColor = "rgba(85,85,85,0.5)";
	c.shadowOffsetX = 1;
	c.shadowOffsetY = 1;
	c.shadowBlur = 1;
	c.beginPath();
	c.moveTo(6,10);
	c.lineTo(13,10);
	c.quadraticCurveTo(17,10,17,13);
	c.lineTo(17,14);
	c.quadraticCurveTo(17,17,13,17);
	c.lineTo(6,17);
	c.quadraticCurveTo(2,17,2,14);
	c.lineTo(2,13);
	c.quadraticCurveTo(2,10,6,10);
	c.fill();
	c.stroke();
	c.lineWidth = 1.5;
	c.strokeStyle = "#333";
	c.fillStyle = "#fff";
	c.shadowColor = "transparent";
	c.lineCap = "round";
	c.lineJoin = "round";
	c.beginPath();
	for (var i = 0, d = 7, m = c.moveTo; i < 6.3;i += Math.PI/5, d = 9.8-d, m = c.lineTo) m.call(c, 7+Math.sin(i)*d, 8-Math.cos(i)*d);
	c.fill();
	c.stroke();
	return canvas.toDataURL();
}

function create(file, src) {
	var div = document.createElement("div");
	var img = document.createElement("img");
	img.src = src
	div.appendChild(img);
	div.appendChild(document.createTextNode(file));
	document.body.appendChild(div);
}

create("dst/32.png", create_icon(32, 0));
create("dst/48.png", create_icon(48, 0));
create("dst/128.png", create_icon(128, 0));
create("images/icon.png", create_icon(96, 16));
create("dst/a.png", create_action());
