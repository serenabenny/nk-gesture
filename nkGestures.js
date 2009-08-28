//nkGestures Mouse Gesture for Chrome 
//Copyright (C) 2009  CJvoid, Niklen, BugVuln
// 
//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.
// 
//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.
// 
//You should have received a copy of the GNU General Public License
//along with this program.  If not, see <http://www.gnu.org/licenses/>.


//js by nk niklenxyz@gmail.com
//This js use to handle mouse event and analyze mouse gestures
//The control code will send to extension's ToolStrip

Direction = { up:'U' , right:'R', down:'D',left:'L'};
directions = "";
lastDirection = "";
x = 0;
y = 0;
isRightButtonDown = false;
isRightClickDisable = false;
connection = null;

actionsConfig =  new Array(
    //newtab	        : 
    "U",
    //close           : 
    "DR",
    //goback	        : 
    "L",
    //goforward		: 
    "R",
    //stop		    : 
    "D",
    //reload	        : 
    "UD",
    //refresh         : 
    "RD",
    //righttab	    : 
    "UR",
    //lefttab	        : 
    "UL",
    //firsttab	    : 
    "LU",
    //lasttab	        : 
    "RU"
);

actionNames =
	new Array(
	//newtab			: 
	"新标签",
	//close			: 
	"关标签",
	//back			: 
	"后退",
	//forward		    : 
	"前进",
	//stop			: 
	"停止",
	//reload		    : 
	"重载",		
	//reload		    : 
	"刷新",
	//righttab		: 
	"右标签",
    //lefttab		    : 
    "左标签",
	//firsttab		: 
	"前端标签",
	//lasttab		    : 
	"后端标签"		
);	
actions = new Array(
    // 		newtab	        : 
    function(connection) { connection.postMessage("do:newtab"); 	},
    // 	    close           : 
    function(connection) { connection.postMessage("do:close"); 	},
    // 	    goback	        : 
    function(connection) { history.back(); 						},
    // 	    goforward		: 
    function(connection) { history.forward(); 					},
    // 	    stop		    : 
    function(connection) { stop(); 								},
    // 	    reload	        : 
    function(connection) { window.location.reload(true);          },
    // 	    refresh         : 
    function(connection) { window.location.reload();              },
    // 	    righttab	    : 
    function(connection) { connection.postMessage("do:righttab");	},
    // 	    lefttab	        : 
    function(connection) { connection.postMessage("do:lefttab");	},
    // 	    firsttab	    : 
    function(connection) { connection.postMessage("do:firsttab");	},
    // 	    lasttab	        : 
    function(connection) { connection.postMessage("do:lasttab");	}
);

function init()
{
	connection = chrome.extension.connect("nkGestures");
	window.addEventListener("mousedown", 		handleMousedown,	true);
	window.addEventListener("contextmenu",		handleContextmenu,	true);
}

function uninit()
{
	window.removeEventListener("mousedown", 		handleMousedown, true);
	window.removeEventListener("mousemove", 		handleMousemove, true);
	window.removeEventListener("mouseup", 			handleMouseup, true);
	window.removeEventListener("contextmenu", 		handleContextmenu, true);
}


function handleMousedown(event)
{
    console.log("down");
	if (event.button == 2) 
	{
//		isRightButtonDown = true; 
		x = event.clientX; 
		y = event.clientY;
		connection.postMessage("begin");		
        window.addEventListener("mousemove", handleMousemove, true);
        window.addEventListener("mouseup", handleMouseup, true);
	} 
	else
	{
		stopGesture();
	}
	
}
function handleMousemove(event)
{
    console.log("move");
// 	if (isRightButtonDown)
// 	{ 
		var tx		= event.clientX;
		var ty 		= event.clientY;
		var offsetX = tx - x;
		var offsetY = ty - y;
		var direction; 
		var actname = null;
		if (Math.pow(offsetX, 2) + Math.pow(offsetY, 2) > 100)
		{
			var tan = offsetY / offsetX;
			if(Math.abs(offsetY) > Math.abs(offsetX))
			{
				if(offsetY < 0)
				{
					direction	= Direction.up;
				} else
				{
					direction 	= Direction.down; 
				}
			} else
			{
				if(offsetX < 0)
				{
					direction = Direction.left;
				} else
				{
					direction = Direction.right; 
				}
			}	
			if(lastDirection != direction)
			{
				directions += direction;
				lastDirection = direction;
                for(i = 0;i<actionsConfig.length;i++)
			    {
			        if(actionsConfig[i] == directions)
			        {    
			            actname = actionNames[i];
			            break;
			        }
			    }
			    connection.postMessage(directions + " : <b>" + actname + "</b>");
			}
			drawLine(x, y, tx, ty);
			x = tx;
			y = ty;
		}
//	}
}
function handleMouseup(event)
{
    console.log("up");
//	if (event.button == 2 && isRightButtonDown)
//	{        
        window.removeEventListener("mousemove", handleMousemove, true);
        window.removeEventListener("mouseup", handleMouseup, true); 
//		isRightButtonDown = false; 
		if(directions.length)
		{
		    isRightClickDisable = true;	
			for(i = 0;i<actionsConfig.length;i++)
			{
			    if(actionsConfig[i] == directions)
			    {
			        actions[i](connection);						        						    
			    }
			}
			
		}
		stopGesture();
//	}
}
function handleContextmenu(event)
{
	if(isRightClickDisable)
	{
		isRightClickDisable = false;
		event.preventDefault(); 
	}
	connection.postMessage("Ready");
}


function stopGesture()
{
	directions = "";		
	lastDirection = "";
    clearLines();
	connection.postMessage("Ready");
}
	
function clearLines()
{
	var canvas = document.getElementById('_drag_canvas');
	if(canvas)
	{
		document.body.removeChild(canvas);
	}
}

function drawLine(x, y, tx, ty)
{
	x 	+= pageXOffset ; 
	tx 	+= pageXOffset ;
	y 	+= pageYOffset;
	ty 	+= pageYOffset;
	var canvas = document.getElementById('_drag_canvas');
	if(!canvas)
	{
		canvas = document.createElement('canvas');
		canvas.id = '_drag_canvas';
		canvas.width = document.width;
		canvas.height = document.height;
		canvas.style.position = 'absolute';
		canvas.style.top = '0px';
		canvas.style.left= '0px';
		canvas.style.zIndex = "2147483647";
		document.body.appendChild(canvas);
	}
	var g = canvas.getContext("2d");
	g.lineWidth = 4;
	g.strokeStyle = "blue";
	g.beginPath( );              
	g.moveTo(x,y);
	g.lineTo(tx,ty);
	g.stroke();
}


function string2array(string,array) {
    var i,j;
    j = 0;
    for(i=0;i<array.length;i++)
	{
	    var temp = '';
	    while (j<string.length && string[j]!=',') {
	        temp += string[j];
	        j++;
	    }
	    j++;
	    array[i] = temp;
	}
}
//监听端口接收用户自定义手势
chrome.extension.onConnect.addListener(function (port) {
    if(port.name != "nkGesturesTab")
        return;
    port.onMessage.addListener(function (message) {
        string2array(message,actionsConfig );
    });
});
//initialize nkGestures Object
connection = chrome.extension.connect("nkGestures");
window.addEventListener("mousedown", 		handleMousedown,	true);
window.addEventListener("contextmenu",		handleContextmenu,	true);
//window.addEventListener("unload", function(){ uninit(); }, false);
