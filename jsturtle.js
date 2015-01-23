var TUTSHAPES = ["&gt;", "^", "&lt;", "V"];
var world;
var running = false;
var program_arr;
var program_counter;
var stack;
var stack_ptr;
var tutx;
var tuty;
var tutd;
var OPCODES = new Array();

function debuglog (message)
{
	var log = document.getElementById("logid");
	log.innerHTML = message + "<br/>" + log.innerHTML;
}

function debugclear (message)
{
	var log = document.getElementById("logid");
	log.innerHTML = "";
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
	var stackp = document.getElementById("stackid");
	stackp.innerHTML = "Stack:";
	for (var i = 0; i < stack_ptr; i ++)
		stackp.innerHTML += " " + stack[i];
}

function reset ()
{
	program_counter = 0;
	tutx = TUTINIT_X;
	tuty = TUTINIT_Y;
	tutd = TUTINIT_D;
	stack = new Array();
	stack_ptr = 0;
	for (var y = 0; y < WORLD_H; y ++) for (var x = 0; x < WORLD_H; x ++) {
		type = MAPDATA.charAt((WORLD_H-1-y) * WORLD_W + x);
		world[y][x] = {type:type, stat:0};
	}
}

function onrun ()
{
	debugclear();

	arr = document.getElementById("progta").value.split(/\s+/);
	for (var i = 0; i < arr.length; i ++) {
		if (arr[i].match(/^label[0-9]$/) ||
			arr[i].match(/^jump[0-9]$/) ||
			arr[i].match(/^jnz[0-9]$/) ||
			arr[i].match(/^jz[0-9]$/) ||
			arr[i].match(/^[0-9]{1,3}/))
			continue;
		if (!(arr[i] in OPCODES)) {
			alert(arr[i] + " is invalid");
			return;
		}
	}

	program_arr = arr;
	reset();
	for (var i = 0; i < program_arr.length; i ++)
		debuglog("[" + program_arr[i] + "]");
	running = true;
	document.getElementById("stopid").disabled = false;
	redrawMap();
}

function onstop ()
{
	running = false;
	document.getElementById("stopid").disabled = true;
	debuglog("stop");
}

function ontimer ()
{
	if (!running)
		return;
	try {
		execute();
	} catch (err) {
		alert(err);
		onstop();
	}
}

function execute ()
{
	var ins = program_arr[program_counter];
	debuglog("{" + ins + "}");
	program_counter ++;
	if (ins.match(/^label[0-9]$/)) {
	} else if (ins.match(/^jump[0-9]$/)) {
		jump(ins.charAt(4));
	} else if (ins.match(/^jnz[0-9]$/)) {
		if (pop() != 0)
			jump(ins.charAt(3));
	} else if (ins.match(/^jz[0-9]$/)) {
		if (pop() == 0)
			jump(ins.charAt(2));
	} else if (ins.match(/^[0-9]{1,3}/)) {
		push(parseInt(ins));
	} else {
		OPCODES[ins]();
	}
	if (program_counter >= program_arr.length) {
		onstop();
	}
	redrawMap();
}

function jump (n) // n can be int or string
{
	for (var i = 0; i < program_arr.length; i ++) {
		if (program_arr[i] == "label" + n) {
			program_counter = i;
			break;
		}
	}
}

function push (n)
{
	if (stack_ptr >= STACKSIZE)
		throw "stack overflow";
	stack[stack_ptr++] = n;
}

function pop ()
{
	if (stack_ptr <= 0)
		throw "stack underflow";
	return stack[--stack_ptr];
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
	if (world[tuty][tutx].type == 'T') {
		world[tuty][tutx].stat = world[tuty][tutx].stat == 0 ? 1 : 0;
		debuglog("draw " + tuty + "," + tutx);
	}
}

OPCODES["halt"] = function () { onstop(); }

OPCODES["pop"] = function () { pop(); }
OPCODES["dup"] = function () { var x = pop(); push(x); push(x); }
OPCODES["inc"] = function () { push(pop() + 1); }
OPCODES["dec"] = function () { push(pop() - 1); }
OPCODES["swap"] = function () { var x = pop(); var y = pop(); push(x); push(y); }
OPCODES["neg"] = function () { push(-pop()); }
OPCODES["add"] = function () { var x = pop(); var y = pop(); push(y+x); }
OPCODES["sub"] = function () { var x = pop(); var y = pop(); push(y-x); }
OPCODES["mul"] = function () { var x = pop(); var y = pop(); push(y*x); }
OPCODES["div"] = function () { var x = pop(); var y = pop(); push(~~(y/x)); }
OPCODES["mod"] = function () { var x = pop(); var y = pop(); push(y%x); }
