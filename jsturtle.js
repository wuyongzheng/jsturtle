var TUTSHAPES = ["&gt;", "^", "&lt;", "V"];
var world;
var running = false;
var program_arr;
var program_counter;
var tutx;
var tuty;
var tutd;
var OPCODES = new Array();

function debuglog (message)
{
	var log = document.getElementById("logid");
	log.innerHTML = message + "<br/>" + log.innerHTML;
}

function onbodyload ()
{
	world = new Array(WORLD_H);
	for (var y = 0; y < WORLD_H; y ++) {
		world[y] = new Array(WORLD_W);
		for (var x = 0; x < WORLD_H; x ++) {
			world[y][x] = {type:" ", stat:0};
		}
	}

	var table = document.getElementById("tableid");
	for (var y = 0; y < WORLD_H; y ++) {
		var row = table.insertRow(0);
		for (var x = 0; x < WORLD_H; x ++) {
			var col = row.insertCell(0);
			col.height = CELLSIZE;
			col.width = CELLSIZE;
			col.align = "center";
			col.vAlign = "middle";
		}
	}

	reset();
	redrawMap();
	setInterval(ontimer, 500);
}

function redrawMap ()
{
	var table = document.getElementById("tableid");
	for (var y = 0; y < WORLD_H; y ++) for (var x = 0; x < WORLD_H; x ++) {
		var td = table.rows[WORLD_H-1-y].cells[x];
		if (x == tutx && y == tuty) {
			td.innerHTML = TUTSHAPES[tutd];
		} else {
			td.innerHTML = world[y][x].type;
		}
		if (world[y][x].stat == 0)
			td.bgColor = "white";
		else
			td.bgColor = "grey";
	}
}

function reset ()
{
	program_counter = 0;
	tutx = TUTINIT_X;
	tuty = TUTINIT_Y;
	tutd = TUTINIT_D;
	for (var y = 0; y < WORLD_H; y ++) for (var x = 0; x < WORLD_H; x ++) {
		type = MAPDATA.charAt((WORLD_H-1-y) * WORLD_W + x);
		world[y][x] = {type:type, stat:0};
	}
}

function onrun ()
{
	arr = document.getElementById("progta").value.split(/\s+/);
	for (var i = 0; i < arr.length; i ++) {
		if (!(arr[i] in OPCODES)) {
			alert(arr[i] + " is invalid");
			return;
		}
	}

	program_arr = arr;
	program_counter = 0;
	tutx = TUTINIT_X;
	tuty = TUTINIT_Y;
	tutd = TUTINIT_D;
	debuglog(document.getElementById("progta").value);
	for (var i = 0; i < program_arr.length; i ++)
		debuglog("[" + program_arr[i] + "]");
	running = true;
	redrawMap();
}

function onstop ()
{
	running = false;
	debuglog("stop");
}

function ontimer ()
{
	if (!running)
		return;
	execute();
}

function execute ()
{
	var ins = program_arr[program_counter];
	program_counter ++;
	OPCODES[ins]();
	if (program_counter >= program_arr.length || ins == "halt") {
		running = false;
	}
	redrawMap();
}

OPCODES["go"] = function ()
{
	switch (tutd) {
	case 0:
		if (tutx < WORLD_W-1 && world[tuty][tutx+1].type != "O")
			tutx ++;
		break;
	case 1:
		if (tuty < WORLD_H-1 && world[tuty+1][tutx].type != "O")
			tuty ++;
		break;
	case 2:
		if (tutx > 0 && world[tuty][tutx-1].type != "O")
			tutx --;
		break;
	case 3:
		if (tuty > 0 && world[tuty-1][tutx].type != "O")
			tuty --;
		break;
	}
}

OPCODES["left"]  = function () { tutd = (tutd + 1) % 4; }
OPCODES["right"] = function () { tutd = (tutd + 3) % 4; }

OPCODES["draw"] = function ()
{
	if (world[tuty][tutx].type == 'T')
		world[tuty][tutx].stat = !world[tuty][tutx].stat;
}

OPCODES["halt"] = function () {}
