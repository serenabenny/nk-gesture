//by Niklen
//���Զ���������� u,d,l,r �ֱ��Ӧ��������
var pageUpGesture           = 'u'; //�Ϸ�ҳ
var pageDownGesture         = 'd'; //�·�ҳ
var newTabGesture           = 'lr'; //�±�ǩ
var closeTabGesture         = 'dr'; //�رձ�ǩ
var historyBackGesture      = 'l'; //����
var historyForwardGesture   = 'r'; //ǰ��
var refreshGesture          = 'ud'; //ˢ��
var selectLeftGesture       = 'ul'; //ǰһ����ǩ
var selectRightGesture      = 'ur'; //��һ����ǩ
var goTopGesture            = 'ru'; //�����
var goBottonGesture         = 'rd'; //����׶�

var BTN_RIGHT = 2;
var SENSITIVITY = 15; //��Сƫ������ �����е���
var startX;
var startY;
var gesture = "";
var preventContextMenu = false;
//open port to nkGestures extension
var port = chrome.extension.connect('nkGestures');
var alpha=1.0;

function cancel (e)
{
	if (e.preventDefault)
	{
		e.preventDefault ();
	}
	return false;
}

function getCookie(c_name)
{
if (document.cookie.length>0)
  {
  c_start=document.cookie.indexOf(c_name + "=");
  if (c_start!=-1)
    { 
    c_start=c_start + c_name.length+1 ;
    c_end=document.cookie.indexOf(";",c_start);
    if (c_end==-1) c_end=document.cookie.length
    return unescape(document.cookie.substring(c_start,c_end));
    } 
  }
return ""
}

document.addEventListener ('dragover', cancel, false);
document.addEventListener ('dragenter', cancel, false);

document.addEventListener ('drop', function (e)
{
	// stops the browser from redirecting off to the text.
	if (e.preventDefault) e.preventDefault ();

	var link = e.dataTransfer.getData('Text');
	if (link.indexOf ('http://') < 0)
	{
		link = 'http://www.google.cn/search?aq=f&ie=UTF-8&q=' + link;
	}	
	//var port = chrome.extension.connect('nkGestures');
	
	//send drag event data text
	port.postMessage({message: 'tab', values: link});
	return false;
});
//���嶯��
function pageUpAction() {
        window.scrollBy(0,45-window.innerHeight);
}

function pageDownAction() {
        window.scrollBy(0,window.innerHeight-45);
}

function goBottonAction(){top.window.scrollBy(0,top.document.body.scrollHeight);window.scrollBy(0,document.body.scrollHeight);}

function goTopAction(){top.window.scrollBy(0,-top.document.body.scrollHeight);window.scrollBy(0,-document.body.scrollHeight);}

function historyBackAction() {
        window.history.back();
}

function historyForwardAction() {
        window.history.forward();
}

function refreshAction() {
        window.location.reload(true);
}

var myGestures = [];
myGestures[newTabGesture]           = "NT";
myGestures[closeTabGesture]         = "CT";
myGestures[historyBackGesture]      = historyBackAction;
myGestures[historyForwardGesture]   = historyForwardAction;
myGestures[refreshGesture]          = refreshAction;
myGestures[pageUpGesture]           = pageUpAction;
myGestures[pageDownGesture]         = pageDownAction;
myGestures[goTopGesture]            = goTopAction;
myGestures[goBottonGesture]         = goBottonAction;
myGestures[selectLeftGesture]       = "LT";
myGestures[selectRightGesture]      = "RT";

function showGesture(move){
        if (!document.getElementById("ChromeGestureBox")){
                gestureDiv = document.createElement('div');
                gestureDiv.id = "ChromeGestureBox";
                gestureDiv.className = "gesture_"+move;
                document.body.appendChild(gestureDiv);
        } else {
                document.getElementById("ChromeGestureBox").className="gesture_"+move;
        }
}

function hideGesture(){
        if(alpha>0){
                alpha-=.1;
                document.getElementById("ChromeGestureBox").style.opacity=alpha;
                setTimeout(function(){hideGesture();},40); 
        } else {
                alpha=1.0;
                document.getElementById("ChromeGestureBox").style.opacity=alpha;
                document.getElementById("ChromeGestureBox").className="gesture_hide";
        }
}

function mgMouseDown(e)
{
        if(e.button == BTN_RIGHT) {
                startX = e.clientX;
                startY = e.clientY;
                gesture = "";
                showGesture("click");
                window.addEventListener("mousemove",mgMouseMove,true);
                window.addEventListener("mouseup",mgMouseUp,true);
        }
}

function mgMouseMove(e)
{
        checkMove(startY - e.clientY, 'u', e);
        checkMove(e.clientX - startX, 'r', e);
        checkMove(e.clientY - startY, 'd', e);
        checkMove(startX - e.clientX, 'l', e);
        showGesture(gesture[gesture.length-1]);
}

function checkMove(p, t, e)
{
        if (p >= SENSITIVITY) {
                startX = e.clientX;
                startY = e.clientY;
                if (gesture[gesture.length-1] != t) {
                        gesture += t;
                }
        }
}

function mgMouseUp(e)
{
        //alert(gesture);
        preventContextMenu = false;
        if (myGestures[gesture]) {               
                preventContextMenu = true;
                if ( myGestures[gesture] == "LT" || myGestures[gesture] == "RT" || myGestures[gesture] ==  "NT" || myGestures[gesture] ==  "CT" ) {
                    port.postMessage({message: 'gestures', values: myGestures[gesture]});
                }
                else
                    myGestures[gesture]();                 
        }        
        window.removeEventListener("mousemove",mgMouseMove,true);
        window.removeEventListener("mouseup",mgMouseUp,true);
        hideGesture();
}

function mgContextMenu(e)
{
    if(preventContextMenu)
        e.preventDefault();
}

window.addEventListener("mousedown",mgMouseDown,true);
window.addEventListener("contextmenu",mgContextMenu,true);