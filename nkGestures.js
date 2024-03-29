/*
﻿ * nkGestures Mouse Gesture for Chrome
 * Copyright (C) 2009  CJvoid, Niklen, BugVuln
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

//js by nk niklenxyz@gmail.com
//This js use to handle mouse event and analyze mouse gestures
//The control code will send to extension's ToolStrip

var nkGestures =
{
	open_drag_name : "isOpenDrag",
	open_hint_name : "isOpenHint",
	is_en_name : "isEnglish",
	gesturesName : "GesturesArray",

	Direction : { up:'U' , right:'R', down:'D', left:'L', forward:'F', back:'B' },
	directions : '',
	lastDirection : null,
	x : 0,
	y : 0,
	isRightButtonDown : false,
	isRightClickDisable : false,
	connection : null,
	isOpenDrag : false,
	isOpenHint : false,
	isEnglish : false,

	actionsConfig :
	new Array(
		//newtab:
		"U",
		"DR",
		"L",
		"R",
		"D",
		"UD",
		"RD",
		"UL",
		"UR",
		"LU",
		"RU",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"URDLD"
	),

	actionNames :
		new Array(
			"新标签",
			"关标签",
			"后退",
			"前进",
			"停止",
			"重载",
			"刷新",
			"左标签",
			"右标签",
			"前端标签",
			"后端标签",
			"上翻页",
			"下翻页",
			"到最顶端",
			"到最底端",
			"关游览器",
			"关全部标签除当前标签",
			"关左标签",
			"关右标签",
			"当前标签开主页",
			"恢复刚关闭标签",
			"打开配置文件"
		),
	actionNames_en :
		new Array(
			"New Tab",
			"Close Tab",
			"Back",
			"Forward",
			"Stop",
			"Reload",
			"Refresh",
			"Left Tab",
			"Right Tab",
			"First Tab",
			"Last Tab",
			"Page Up",
			"Page Down",
			"Goto Top",
			"Goto Bottom",
			"Exit Browser",
			"Close Others",
			"Close All Left Tab",
			"Close All Right Tab",
			"Open Home Page",
			"Restore Tab",
			"Configure"
		),
	actions :
		new Array(
		//			newtab:
		function(connection) { connection.postMessage("do:newtab");},
		//			close:
		function(connection) { connection.postMessage("do:close");},
		//			goback:
		function(connection) { history.back();},
		//			forward:
		function(connection) { history.forward();},
		//			stop:
		function(connection) { stop();},
		//			reload:
		function(connection) { window.location.reload(true);},
		//			refresh:
		function(connection) { window.location.reload();},
		//			lefttab:
		function(connection) { connection.postMessage("do:lefttab");},
		//			righttab:
		function(connection) { connection.postMessage("do:righttab");},
		//			firsttab:
		function(connection) { connection.postMessage("do:firsttab");},
		//			lasttab:
		function(connection) { connection.postMessage("do:lasttab");},
		//			pageup
		function(connection) { window.scrollBy(0,45-window.innerHeight);},
		//			pagedown
		function(connection) { window.scrollBy(0,window.innerHeight-45);},
		//			gotop
		function(connection) { top.window.scrollBy(0,-top.document.body.scrollHeight);window.scrollBy(0,-document.body.scrollHeight);},
		//			gobotton
		function(connection) { top.window.scrollBy(0,top.document.body.scrollHeight);window.scrollBy(0,document.body.scrollHeight);},
		//			closeall
		function(connection) { connection.postMessage("do:closeall");},
		//			closeonly
		function(connection) { connection.postMessage("do:closeonly");},
		//			closeleft
		function(connection) { connection.postMessage("do:closeleft");},
		//			closeright
		function(connection) { connection.postMessage("do:closeright");},
		//			openindex
		function(connection) { connection.postMessage("do:openindex");},
		//			restore
		function(connection) { connection.postMessage("do:restore");},
		//			openconfig
		function(connection) { connection.postMessage("do:config");}
	),
	init: 	function()
	{
		this.connection = chrome.extension.connect({name : "nkGestures"});
		this.connection.onMessage.addListener(function (message) {
			if ( message == 'OpenDrag' ) {
				nkGestures.isOpenDrag = true;
			}
			else if( message == 'OpenHint' )
			{
				nkGestures.isOpenHint = true;
			}
			else if( message == 'isEnglish' )
			{
				nkGestures.isEnglish = true;
			}
			else{
				string2array(message,nkGestures.actionsConfig );
			}
		});
		window.addEventListener('mousedown', this, false);
		window.addEventListener('mousemove', this, false);
		window.addEventListener('mouseup', this, false);
		window.addEventListener('mousewheel', this, false);
		window.addEventListener('contextmenu', this, false);
		window.addEventListener ('drop', this, false);
		window.addEventListener ('drag', this, false);
		window.addEventListener ('dragstart', this, false);
		window.addEventListener ('dragover', this, false);
		window.addEventListener ('dragenter', this, false);
	},


	uninit: function()
	{
		window.removeEventListener('mousedown', this, false);
		window.removeEventListener('mousemove', this, false);
		window.removeEventListener('mouseup', this, false);
		window.removeEventListener('mousewheel', this, false);
		window.removeEventListener('contextmenu', this, false);
		window.removeEventListener('drop', this, false);
		window.removeEventListener('drag', this, false);
		window.removeEventListener('dragstart', this, false);
		window.removeEventListener('dragover', this, false);
		window.removeEventListener('dragenter', this, false);
	},



	handleEvent: function(event)
	{
		switch (event.type) {
		case "mousedown":
			if (event.button == 2)
			{
				//console.log("mouse down");
				this.isRightButtonDown = true;
				this.x = event.clientX;
				this.y = event.clientY;
//				window.captureEvents(Event.MouseMove|Event.MouseUp);
//				window.addEventListener('mousemove', this, true);
//				window.addEventListener('mouseup', this, true);
//				window.addEventListener('mousewheel', this, true);
//				window.removeEventListener('mousedown', this, true);
			} else
			{
				this.stopGesture();
			}
			break;
			
		case "mousemove":
		case "drag":
			if (this.isRightButtonDown)
			{
				var tx		= event.clientX;
				var ty 		= event.clientY;
				var offsetX = tx - this.x;
				var offsetY = ty - this.y;
				var direction;
				var actname = null;
				if (Math.pow(offsetX,2) + Math.pow(offsetY,2) > 30)
				{
					console.log('Mouse Move:' + event.clientX + ':' + event.clientY );
					this.isRightClickDisable = true;
					var tan = offsetY / offsetX;
					if(Math.abs(offsetY) > Math.abs(offsetX))
					{
						if(offsetY < 0)
						{
							direction = this.Direction.up;
						} else
						{
							direction = this.Direction.down;
						}
					} else
					{
						if(offsetX < 0)
						{
							direction = this.Direction.left;
						} else
						{
							direction = this.Direction.right;
						}
					}
					if(this.lastDirection != direction)
					{
						this.directions += direction;
						this.lastDirection = direction;
						if(this.isOpenHint)
						{
							for(i = 0;i<this.actionsConfig.length;i++)
							{
								if(this.actionsConfig[i] == this.directions)
								{
									actname = this.isEnglish?this.actionNames_en[i]:this.actionNames[i];
									break;
								}
							}
							if(event.type != "drag")
								this.createHint( this.directions + ' : ' + actname );
						}
					}
					if(event.type != "drag")
						this.drawLine(this.x, this.y, tx, ty);
					this.x = tx;
					this.y = ty;
				}
			}
			break;
			
		case "mouseup":
			if (event.button == 2 && this.isRightButtonDown)
			{
				//console.log("mouse up");
//				window.releaseEvents(Event.MouseMove|Event.MouseUp);
//				window.addEventListener('mousedown', this, true);
//				window.removeEventListener('mousemove', this, true);
//				window.removeEventListener('mouseup', this, true);
//				window.removeEventListener('mousewheel', this, true);				
				this.isRightButtonDown = false;
				this.clearLines();
				if(this.directions.length)
				{
					for(i = 0;i<this.actionsConfig.length;i++)
					{
						if(this.actionsConfig[i] == this.directions)
						{
							this.actions[i](this.connection);
							break;
						}
					}
				}
				this.stopGesture();
			}
			break;
			
		case "contextmenu":
			if(this.isRightClickDisable)
			{
				this.isRightClickDisable = false;
				event.stopPropagation();
				event.preventDefault();
			}
			break;
			
		case "drop":
			if (!this.isOpenDrag) {
				break;
			}
			this.isRightButtonDown = false;
			var direction = this.directions;
			this.stopGesture();

			if (event.preventDefault) event.preventDefault ();
			var link = window.getSelection().toString();
			if (link != '') {
				this.connection.postMessage(new Array("do:dragtxt", link, direction));
				break;
			}
			link = event.dataTransfer.getData("URL");
			if (link != '') {
				this.connection.postMessage(new Array("do:dragurl", link, direction));
				break;
			}
			link = event.dataTransfer.getData("Text");
			if (link != '') {
				this.connection.postMessage(new Array("do:dragtxt", link, direction));
				break;
			}
			break;
			
		case "dragover":
		case "dragenter":
			if (!this.isOpenDrag) {
				break;
			}
			if (event.preventDefault)
			{
				event.preventDefault();
			}
			break;
			
		case "dragstart":
			if (!this.isOpenDrag) {
				break;
			}
			this.x = event.clientX;
			this.y = event.clientY;
			this.isRightButtonDown = true;
			break;
			
		case "mousewheel":
			if (this.isRightButtonDown)
			{
				var direction;
				var actname = null;
				this.isRightClickDisable = true;
	
				if (event.wheelDelta > 0) {
					direction = this.Direction.forward;
				}
				else
					direction = this.Direction.back;
				if (this.lastDirection != direction) {
					this.lastDirection = direction;
					this.directions += direction;
					if(this.isOpenHint)
					{
						for(i = 0;i<this.actionsConfig.length;i++)
						{
							if(this.actionsConfig[i] == this.directions)
							{
								actname = this.isEnglish?this.actionNames_en[i]:this.actionNames[i];
								break;
							}
						}
						this.createHint( this.directions + ' : ' + actname );
					}
				}
				if (event.preventDefault)
				{
					event.preventDefault();
				}
			}
			break;
		}
	},


	stopGesture: function()
	{
		this.directions = '';
		this.lastDirection = null;
		this.clearLines();
		if(this.isOpenHint)
		    this.deleteHint();
	},

	clearLines: function()
	{
		var canvas = document.getElementById('_nk_drag_svgline');
		if(canvas)
		{
			while( canvas.lastChild )
			{
				canvas.removeChild( canvas.lastChild ).innerHTML = '';
			}
			document.body.removeChild(canvas).innerHTML = '';
		}
	},
	
	drawLine: function(x, y, tx, ty)
	{
		x 	+= pageXOffset;
		tx 	+= pageXOffset;
		y 	+= pageYOffset;
		ty 	+= pageYOffset;
		var canvas = document.getElementById('_nk_drag_svgline');
		if(!canvas)
		{
			canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			canvas.setAttribute("id", "_nk_drag_svgline");
			canvas.setAttribute("width",document.width);
			canvas.setAttribute("height",document.height);
			canvas.setAttribute("xmlns","http://www.w3.org/2000/svg");
			canvas.setAttribute("style","position:absolute;top:0px;left:0px");
			document.body.appendChild(canvas);
		}
		var line=document.createElementNS('http://www.w3.org/2000/svg','line');
		line.setAttribute("x1", x);
		line.setAttribute("y1", y);
		line.setAttribute("x2", tx);
		line.setAttribute("y2", ty);
		line.setAttribute("style","stroke:blue;stroke-width:4");
		canvas.appendChild( line );
	},

	createHint : function (msg) {
	var hint = document.getElementById('_nk_drag_hint');
		if(!hint)
		{
			hint = document.createElement('div');
			hint.id = '_nk_drag_hint';
			hint.innerHTML = '<div style="height:20px;position:fixed;display:block;bottom:0px;left:1px;zIndex:1000;background:#D2E1F6;font-size:10px;color:#808080;">'
			+'<span id="_nk_drag_dirs"></span></div>';
			document.body.appendChild(hint);
		}
		hint.firstChild.innerHTML = msg;
	},
	
	deleteHint : function () {
		var hint = document.getElementById('_nk_drag_hint');
		if(hint)
		{
			var child = hint.childNodes;
			var i = child.length;
			while(i>0)
			{
				hint.removeChild(child[i-1]);
				i--;
			}
			document.body.removeChild(hint);
		}
	} 
};
//监听端口接手用户自定义手势
function string2array(string,array) {
	var i,j;
	var temp = '';
	i = 0;
	j = 0;
	while(string[j])
	{
		temp = '';
		while (j<string.length && string[j] != ',') {
			temp += string[j];
			j++;
		}
		array[i] = temp;
		j++;
		i++;
	}
}
/*
function listenMsg(){
	chrome.extension.onConnect.addListener(function (port) {
		if(port.name != "nkGesturesTab")
			return;
		port.onMessage.addListener(function (message) {
			if( message.name == 'MouseEvent' ){
				nkGestures.handleEvent( message );
			}
		});
	});
}
	
function nkPostEvent( event )
{
	var xy = { name:'MouseEvent', type:event.type, button:event.button, clientX:event.clientX, clientY:event.clientY };
	nkGestures.connection.postMessage( xy );
}
*/
//initialize nkGestures Object
window.captureEvents(Event.MouseDown|Event.MouseMove|Event.MouseUp);
nkGestures.init();
/*
if ( window.parent == window ) {
	window.captureEvents(Event.MouseDown|Event.MouseMove|Event.MouseUp);
	nkGestures.init();
//	window.addEventListener('unload', function(){ nkGestures.uninit(); }, false);
}else{
	nkGestures.connection = chrome.extension.connect({name : "nkGestures"});
	window.addEventListener('mousedown', nkPostEvent, false);
	window.addEventListener('mousemove', nkPostEvent, false);
	window.addEventListener('mouseup', nkPostEvent, false);
}
*/