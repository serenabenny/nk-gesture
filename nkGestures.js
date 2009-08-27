//nkGestures Mouse Gesture for Chrome
//by nk niklenxyz@gmail.com
//This js use to handle mouse event and analyze mouse gestures
//The control code will send to extension's ToolStrip
var nkGestures = 
{
	Direction : { up:'U' , right:'R', down:'D',left:'L'},
	directions : '',
	lastDirection : null,
	x : 0,
	y : 0,
	isRightButtonDown : false,
	isRightClickDisable : false,
	connection : null,

    actionsConfig : 
    new Array(
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
    ),
	
    actionNames :
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
	),	
	actions :
	new Array(
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
	),
	init: 	function()
	{
		this.connection = chrome.extension.connect("nkGestures");
		window.addEventListener('mousedown', 		this,	true);
		window.addEventListener('contextmenu',		this,	true);
	},
	

	uninit: function()
	{
		window.removeEventListener("mousedown", 		this, true);
		window.removeEventListener("mousemove", 		this, true);
		window.removeEventListener("mouseup", 			this, true);
		window.removeEventListener("contextmenu", 		this, true);
	},
		

	
	handleEvent: function(event)
	{
		switch (event.type) {
			case "mousedown":
				if (event.button == 2) 
				{
					this.isRightButtonDown = true; 
					this.x = event.clientX; 
					this.y = event.clientY;
					this.connection.postMessage("begin");
                    window.addEventListener('mousemove', 		this,	true);
                    window.addEventListener('mouseup',			this,	true);
				} else
				{
					this.stopGesture();
				}
				break;
			case "mousemove":
				if (this.isRightButtonDown)
				{ 
					var tx		= event.clientX;
					var ty 		= event.clientY;
					var offsetX = tx - this.x;
					var offsetY = ty - this.y;
					var direction; 
					var actname = null;
					if (Math.pow(offsetX, 2) + Math.pow(offsetY, 2) > 100)
					{
						var tan = offsetY / offsetX;
						if(Math.abs(offsetY) > Math.abs(offsetX))
						{
							if(offsetY < 0)
							{
								direction	= this.Direction.up;
							} else
							{
								direction 	= this.Direction.down; 
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
                            for(i = 0;i<this.actionsConfig.length;i++)
						    {
						        if(this.actionsConfig[i] == this.directions)
						        {    
						            actname = this.actionNames[i];
						            break;
						        }
						    }
						    this.connection.postMessage(this.directions + " : <b>" + actname + "</b>");
						}
						this.drawLine(this.x, this.y, tx, ty);
						this.x = tx;
						this.y = ty;
					}
				}
				break;
			case "mouseup":
				if (event.button == 2 && this.isRightButtonDown)
				{
                    window.removeEventListener("mousemove", 		this, true);
		            window.removeEventListener("mouseup", 			this, true); 
					this.isRightButtonDown = false; 
					if(this.directions.length)
					{ 
						this.isRightClickDisable = true;
						for(i = 0;i<this.actionsConfig.length;i++)
						{
						    if(this.actionsConfig[i] == this.directions)
						    {
						        this.actions[i](this.connection);						        						    
						    }
						}
						this.stopGesture();
					}
				}
				break;
			case "contextmenu":
				if(this.isRightClickDisable)
				{
					this.isRightClickDisable = false;
					event.stopPropagation();
					event.preventDefault(); 
				}
				this.connection.postMessage("Ready");
				break;
		}
	},


	stopGesture: function()
	{
		this.directions = '';		
		this.lastDirection = null;
        this.clearLines();
		this.connection.postMessage("Ready");
	},
		
	clearLines: function()
	{
		var canvas = document.getElementById('_drag_canvas');
		if(canvas)
		{
			document.body.removeChild(canvas);
		}
	},

	drawLine: function(x, y, tx, ty)
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
};
//监听端口接手用户自定义手势
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
};

chrome.extension.onConnect.addListener(function (port) {
    if(port.name != "nkGesturesTab")
        return;
    port.onMessage.addListener(function (message) {
        string2array(message,nkGestures.actionsConfig );
    });
});
//initialize nkGestures Object
nkGestures.init();
window.addEventListener("unload", function(){ nkGestures.uninit(); }, false);
