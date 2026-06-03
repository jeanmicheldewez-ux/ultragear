//  var soundUrl ="1713432807_SFHH_95_-groove-loops-120.mp3"; 
var soundUrl ="";  // amenbrk.mp3

var bpm = 120;

var liblux = 0;

var libsound = 0;
var soundon = 0;

var armnn = [0,0,0,0];

var mpe = [0,0,0,1];

var scriptUrl = "sound-js.js";


var msSpeed = 20;

var pingtime = new Date();

var settool=0;
var setcc=0;
var setnn=[0,0,0,0];
var runCC =0;

var sendmidi = 3;

var bigcc=[];

var numTrack = 0;


for (let i = 0; i <= 3; i++) {
	bigcc[i] = []; 
	for (let l = 0; l <= 3; l++) {
		bigcc[i][l] = []; 
		 for (let k = 0; k <= 23; k++) {
			bigcc[i][l][k] = [];
			//drum1[k]=16.00;
			//drum2[k]=32.00;
			 for (let m = 0; m <= 16; m++) {
				 let rnd = Math.floor(Math.random() * 12700);
				rnd = rnd / 100;
				bigcc[i][l][k][m] = rnd;
			}			
		}	 
	} 
} 
// extra ALL cc 4 : vol ,
//              5 : len , 
// bass : type1, type2, feedback , freq filt sidechain 
 //remove wooble 
// arpeggio : realfm type + modulation type, panplug, FeedbackDelay
// drone : type synth, type fmsynth + mudulation,  2x factor portamento


//drum eq bass, sidechain freq filt + ratio, set comp 



var label = [];

label[0]=["filt.","dual&nbsp","speed","width"];
label[1]=["delay","mode&nbsp","magic","speed"];
label[2]=["delay","pitch","lengt","speed"];
label[3]=["filt.","start","lengt","pitch"];

var labeltool = ["BASS ","ARPG.","DRONE","DRUM "];

var labelExtra = [];
labelExtra[0] = ["osc1 ","osc 2","balnc","ratio",
                "smoth", "wooFt",  "feedB"];
labelExtra[1] =[ "oscBs","oscMd","panFq","panWt","panOc","panSt"];
labelExtra[2] =[ "osc1 ","osc 2","oscMd","rvbSz"];
labelExtra[3] =[ "eqLo ","eqHi ","chnFr","compR"];


var currentnote=[];

var mycc=[];


var resend =[0,0,0,0,0]; 
var resendcc =[0,0,0,0,0]; 
var senddin =[0,0,0,0,0]; 
var sendusb =[1,1,1,1,1]; 

var flagdir = [];
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

var chan=[];
var lnScale=[];
var cMax=[];
var cMin=[];
var allCC=[]
var lockCC=[];
var lockBend=[];
var routeGear=[0,0,0,0,0];
 
var listScale=[];


let arrCCmin = [];
let arrCCmax = [];


for (let l = 0; l <= 3; l++) {
    chan[l] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    lnScale[l] = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
    cMax[l] = [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80];
    cMin[l] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    listScale[l] = []; 
	allCC[l]=[];
	lockCC[l]=[];
	flagdir[l] = [0,0,0,0]; 
	currentnote[l]= [0,0,0,0];
	lockBend[l] = [0,0,0,0]; 
	
	arrCCmin[l] = [0,0,0,0];
	arrCCmax[l] = [127,127,127];	
	
	mycc[l] = []; 
 
     for (let k = 0; k <= 3; k++) {
		// currentnote[l][k]=[0,0,0,0];
        listScale[l][k] = [];
		allCC[l][k] = [(k*4)+2,(k*4)+3,(k*4)+4,(k*4)+5];
		lockCC[l][k] = [0,0,0,0];
		mycc[l][k] = [64,64,64,64]; 
		
		
     
    }
}


var exBall = 1;

var toolNow=1;

var playChannel=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];


 var pageHeight;
 var cm1 = 0;
 var note=60;
 var velo = 0;
 var flagStop =0;
 var flagMenu =0;
 
 var exNote =0;
 
 var gearN =1;
 var gearCode =["","","","","","","","",""];
 var myGear="";
  
 
 
     getPageHeight();




function processMidiUSB( dt1,dt2,dt3 )
{
	//console.log( dt1,dt2,dt3 );
	let gg = gearN -1;
	
	let idx = 0;
	if(dt1 < 144)idx=127;	
	else if(dt1 < 160)idx=143;
	else if(dt1 < 176)idx=159;
	else if(dt1 < 192)idx=175;
	else if(dt1 < 208)idx=191;	
	else if(dt1 < 224)idx=207;	
	else if(dt1 < 240)idx=223;		
	else if(dt1 < 240)idx=223;		
	
	let tt = chan[gearN-1].indexOf(dt1-idx);
	tt = tt + 1;
	// console.log( chan[gearN-1] )
	// console.log( dt1-idx )
	
	if(idx != 0)processMidi(dt1,dt2,dt3,tt,gg);
	
	
}
 

// *************************************************
//************WS **************************
//********************************************

// let myWs = "wss://ultragear1.local";

// const ws = new WebSocket(myWs);


/////////////////////////////////////
//ws.onopen = () => ws.send('note_on:60,127'); // Send MIDI-like message
// ws.onmessage = (event) => console.log(event.data); // Receive from ESP32


 // function sendMidi(type, channel, dataArr) {
  // ws.send(JSON.stringify({
    // type: type,
    // channel: channel,
    // data: dataArr
  // }));
// }





// ******************************
// ****** socket  **************
// **************************



// var connectionOptions = {
  // "force new connection": true,
  // "reconnectionAttempts": "Infinity",
  // "timeout": 7000,
  // "transports": ['websocket']
// };

// var socket = io.connect('wss://speeddevis.fr:9748', connectionOptions);


// socket.on('askpreset', function(data){	

  // console.log("auto send preset");  
  // console.log( thisGear );


// });





// socket.on('kiki', function(data){	

  // document.getElementById ("calicm").innerHTML = data.cm;

// });

    

// socket.on('midi', function(data){	

     // var dt = data.midi;
  	

 // sendMIDIMessage(dt[0],	 dt[1],	dt[2]);
  
 // let gg = gearCode.indexOf(data.room);

 // processMidi(dt[0],	 dt[1],	dt[2], data.tool,gg);
 // window.postMessage(dt, '*'); // midi from chrome tab to tab
// }); 


// socket.on('pong', function(data){	


	// var  pong = new Date();
	// var ping = (pong  - pingtime )/2;

  // console.log("ping ms : " + ping.toFixed(0) );  
  // return; 
	// if(ping<700) document.getElementById("pingms").innerHTML =  ping.toFixed(0);

    // var getgear =  gearCode.indexOf(data.codemachine);
		
 // if(getgear != -1)document.getElementById("grx"+(getgear + 1)).style.background="#DDD";
 
 // if(getgear != -1)document.getElementById("gr"+(getgear + 1)).style.background="#aaa";
 
// });


// ws.onmessage = function(event) {
  // let msg;
  // try {
    // msg = JSON.parse(event.data);
  // } catch (e) {
    // console.error("Invalid JSON:", event.data);
    // return;
  // }
  // if (!msg.event) return;

  // switch (msg.event) {
    // case 'askpreset':
      // console.log("auto send preset");
      // console.log(thisGear);
      // break;

    // case 'kiki':
      // document.getElementById("calicm").innerHTML = msg.cm;
      // break;

    // case 'midi':
      // var dt = msg.midi;
      // sendMIDIMessage(dt[0], dt[1], dt[2]);
      // let gg = gearCode.indexOf(msg.room);
      // processMidi(dt[0], dt[1], dt[2], msg.tool, gg);
      // window.postMessage(dt, '*');
      // break;

    // case 'pong':
      // var pong = new Date();
      // var ping = (pong - pingtime) / 2;
      // console.log("ping ms : " + ping.toFixed(0));
 

      // var getgear = gearCode.indexOf(msg.codemachine);
      // if (getgear != -1) document.getElementById("grx" + (getgear + 1)).style.background = "#DDD";
      // if (getgear != -1) document.getElementById("gr" + (getgear + 1)).style.background = "#aaa";
      // break;
  // }
// };






/////////////// 	SOCKET END    //////////////////


// document.addEventListener('touchmove', function(event) {
   // if (event.touches && event.touches.length >= 2) {
    // if (!(event.target instanceof HTMLInputElement && event.target.type === 'range')) {
       // if (Math.abs(event.touches[0].clientX - event.touches[1].clientX) > Math.abs(event.touches[0].clientY - event.touches[1].clientY)) {
           // if (!isDescendantOfMenuContent(event.target)) {
                // event.preventDefault();  
            // }
          // } 
		 // }
    // }
// }, { passive: false });


function processMidi(dt1,dt2,dt3,tt,gg)
{
	//console.log(dt1,dt2,dt3,tt,gg);
	
	 let vv=0;
	 let nn = 0;
	 let dtx = dt2;
 
	 if (dt1>=224)
	 {
		if(dt2 != 64 && dt3 != 0 ) {dt2 = dt3; dt3 = dtx;}
	   
       if( libsound == 1)
	   {
		   bendsound(gg,tt-1,dt2,dt3);
	   
	   }
		   bendshow(gg,tt-1,dt2,dt3);		   
	 }		 
	 else if(dt1<144){
		vv = tt;
	
		nn=listScale[gg][vv-1].indexOf(dt2);
		if(nn != -1)currentnote[gg][vv-1]=nn; 
		
		if( libsound == 1) 
		{
			
		//	console.log( listScale[gg] [vv-1] + " stop",gg,vv-1,nn,dt2);
			stopsound(gg,vv-1,nn,dt2);
			
		}	
		
	//	if(liblux == 1)recordLux(0,0);
		
		document.getElementById ("ball" + tt).style.borderColor="#888";
		// document.getElementById ("numset").innerHTML=" "+tt+" ";
       // settool = tt-1;	
	  
	 }	 
	 else if(dt1<160)
	{
		//gg = gearCode.indexOf(data.room);
		vv = tt;
		
		 
 // console.log(gg,vv-1,dt2);
		nn=listScale[gg][vv-1].indexOf(dt2);

		
		if(nn != -1)currentnote[gg][vv]=nn;
		
		if( libsound == 1)
		{
		playsound(gg,vv-1,nn,dt2);

		}	
		
		
		let idx = nn;
		 if(mpe[vv-1] != -1)idx =  mpe[vv-1];		

			for(let i = 1; i <= lnScale[gg][vv-1]; i++)
			{
			  if(i == idx+1)document.getElementById ( (vv)+"skl"+i).style.background = "gold"; // "#FF4400"; 
			  else document.getElementById ( (vv)+"skl"+i ).style.background = "#Fdb";
			}		
			
			
			 		
			for(let i = 1; i <= lnScale[gg][vv-1]; i++)
			{
			  if(i == nn+1)document.getElementById ( (vv)+"skl"+i ).style.border  = "solid #FF4400 4px";
			  else document.getElementById ( (vv)+"skl"+i ).style.border = "solid blue 0px";    
			}			
		
										//data.tool
		document.getElementById ("ball" +tt ).style.borderColor="gold";

		
	 } 
	 
	 else if(dt1>= 176 && dt1< 192 )//
	 {
		var goodgear =  gg;
		let cc = 0; 
		
				//console.log(allCC[goodgear],tt-1);
				
        if(goodgear != -1)cc = allCC[goodgear][tt - 1].indexOf( dt2);
		
	
		if(goodgear != -1)mycc[goodgear][tt - 1][cc] = dt3; 
		
			//	console.log( currentnote[goodgear][tt-1], goodgear, tt  );
	
		if( libsound == 1 && nn != -1 )
		{	
		   
		  setsound(goodgear,tt-1,currentnote[goodgear][tt-1],cc,dt3);
		 		 
		}
		
		//if(liblux == 1)recordLux(dt3,1);
	 }
	 
	 if(vv !=0 && vv != -1 )
	 {

		
		 
	 }
	 
}		





function isDescendantOfMenuContent(element) {
    var menuContentElement = document.getElementById('menucontent');
    while (element) {
        if (element === menuContentElement) {
            return true;
        }
        element = element.parentNode;
    }
    return false;
}



   document.addEventListener('dblclick', function(event) {
        event.preventDefault();
    });


 var el = document.getElementById('cont');

          el.innerHTML = '';


for(let i = 1; i<=4; i++)
{ 
	
	var col ="433";
	if (i % 2 === 0)col="544";
	//    onclick="clickPos(event,3);" 
 el.innerHTML =	el.innerHTML+'<div id="tool'+i+'<div id="tool'+i+'"  class="barman"    style="width:100%;'+   //onclick="flipChannel('+i+',event)"
'color:#CCC; background:#'+col+'; padding-top:22px; padding-bottom:20px; '+
' position:relative; z-index:10; "> <canvas class="canv"    id="cnv'+i+'"> </canvas>'+
'<div class="bartran"    id="bartran'+i+'"></div>'+
'<div class="barloop"    id="barloop'+i+'"></div>'+
'<div class="barloop"    id="bar2loop'+i+'"></div>'+
' <span class="ball" '+
' id="ball'+i+'" style="width:64px;  overflow: hidden; text-size-adjust: auto; "'+
 //  onmouseout="fastclicoff('+i+')" 
'onmousedown="fastclic('+i+');"  ontouchstart="fastclic('+i+');" '+
'   onmouseup="fastclicoff('+i+')"   ontouchend="fastclicoff('+i+')" >TOOL '+i+'</span>'+
 
  '<span  class="ball3" style="margin-left:6px;" id="lk'+i+'"  onclick="flipplay('+i+');"  > LOCK </span>'+
  // '<span  class="ball3"  style="margin-right:6px;"  id="mpe'+i+'"  onclick="flipMpe('+i+');"  > MPE </span>'+
 
  

' <span class="nada"><span class="ball" '  +
' id="'+i+'ctrl1"  " '+
'onmouseout="selectCtrl('+i+',1,0)"'+
'  onmousedown="selectCtrl('+i+',1,1)"  onmouseup="selectCtrl('+i+',1,0)" ontouchstart="selectCtrl('+i+',1,1)"  ontouchend="selectCtrl('+i+',1,0)" '+
'>CC 1</span> '+

'<span class="ball" '+
'  onmousedown="selectCtrl('+i+',2,1)"  onmouseup="selectCtrl('+i+',2,0)" ontouchstart="selectCtrl('+i+',2,1)"  ontouchend="selectCtrl('+i+',2,0)" '+
'onmouseout="selectCtrl('+i+',2,0)"'+
' id="'+i+'ctrl2"  " >CC 2</span> '+

' <span class="ball" '+
'  onmousedown="selectCtrl('+i+',3,1)"  onmouseup="selectCtrl('+i+',3,0)" ontouchstart="selectCtrl('+i+',3,1)"  ontouchend="selectCtrl('+i+',3,0)" '+
'onmouseout="selectCtrl('+i+',3,0)"'+
' id="'+i+'ctrl3"  " >CC 3</span> '+

'<span class="ball" '+
'  onmousedown="selectCtrl('+i+',4,1)"  onmouseup="selectCtrl('+i+',4,0)" ontouchstart="selectCtrl('+i+',4,1)"  ontouchend="selectCtrl('+i+',4,0)" '+
'onmouseout="selectCtrl('+i+',4,0)"'+
' id="'+i+'ctrl4"  " >CC 4</span></span> '+



// '<span><span class="ball" '+
// 'style="color:white; background:black;"'+
// '  onmousedown="flipbend('+i+',1)"'+  
// 'onmouseup="flipbend('+i+',0)" ontouchstart="flipbend('+i+',1)" '+
// ' ontouchend="flipbend('+i+',0)" '+  //' onmouseout="flipbend('+i+',0)"' + 

// ' id="bend'+i+'">'+
// '<span class="underbend" id="underbend'+i+'" style="display:none;">""</span>BEND'+
// '</span>'+

// '<span><span class="ball" '+
// 'style="color:white; background:black;"'+
// '  onmousedown="flipbend('+i+',1)"'+  
// 'onmouseup="flipbend('+i+',0)" ontouchstart="flipbend('+i+',1)" '+
// ' ontouchend="flipbend('+i+',0)" '+
// ' onmouseout="flipbend('+i+',0)"' + 
// ' id="bend'+i+'">'+
// '<span class="underbend" id="underbend'+i+'">""</span>BEND'+
// '</span>'+

'<span class="arw" style="color:#FF4400; position: absolute; right: 17px; font-size:35px; margin-top:-28px;"'+
'  onclick="flipChannel('+i+')" '+
' >&#9660;</span>  '+


		
   '<div id="chancon'+i+'" class="chancon"  style="display:none; padding:0px;">'+
   
'<div id="extrahead'+i+'" style="display:inline-block;"></div>' + 
  
 
// '<br><div id="beatfader'+i+'" style="display: inline-block; margin-right: 10px;background:black; border-radius:5px; padding-left:3px; padding-right:3px; margin-top:10px;"'+
// ' onclick="directchange('+i+')" >BEATFADER</div>' + 

  

  
'<br>CHANNEL   <select class="selek" id="chan'+i+'" onchange="getChan('+i+',this.value)"></select>'+ 
  ' | SCALE Lenght   <select class="selek" id="scale'+i+'"  onchange="getScaleLen('+i+',this.value)"></select>'+ 
 
  ' | <span onclick="octminus('+i+')" class ="btt1" style="padding-left:5px; padding-right:5px; background:#FF4400; color:#fff; font-weight:bold;" >-</span>'+
  '<span style="color:white; background:black; border-radius:5px; padding-left:3px; padding-right:3px; margin-top:10px;">octave</span><span onclick="octplus('+i+')" id="oct2'+i+'" class ="btt1" style="padding-left:5px; padding-right:5px; background:#FF4400; color:#fff; font-weight:bold;" >+</span>'+
     
   
   '<br><div style="display: inline-block;" id="scl'+i+'"</div></div>' +

 // '<br><span id="cmin'+i+'" >min <span id="min-value'+i+'" style="color:#FF4400; display: inline-block;  width:60px;">10</span></span>'+
 // '&nbsp;<input  id="slmin'+i+'"style="width:150px;"  class="orange-slider"  type="range" min="0" max="300" value="0" step="1"'+
// ' onchange="changemincm('+i+',Number(this.value))" oninput="movemincm('+i+',Number(this.value))"  style="margin-bottom:12px; ">'+
	

 // ' CM <span id="cmax'+i+'" >max<span id="max-value'+i+'" style="color:#FF4400; display: inline-block;  width:60px;">10</span></span>'+
// '<input  id="slmax'+i+'" style="width:150px;" class="orange-slider"  type="range" min="12" max="400" value="0" step="1"'+
// ' onchange="changecm('+i+',Number(this.value))" oninput="movecm('+i+',Number(this.value))"  style="margin-bottom:12px;">'+

// onclick="chooseCCminmax('+i+',1)"

   ' <br><div  onclick="chooseCCminmax('+i+',1)"  style="display:inline-block; margin-right: 10px; margin-top:4px;" ><select id="'+i+'ccfx1" onchange="changeCCFX('+i+',1,this.value,this.id)"  disabled style="background-color:black; color:#FF4400;"><option  value="0" > Control 1 &nbsp; </option></select></div>' +
  '<input   onclick="chooseCCminmax('+i+',1)"   type="number" onchange="changeCC('+i+',1,this.value)" id="'+i+'cc1" min="0" max="127" value="' + 1 + '" style="display: inline-block; padding: 0px; border:none; font-size:20px;  border-radius:5px; outline: none; background: black; color: inherit;" /> ' +  
  // ' <div id="'+i+'lock1" style="display: inline-block; margin-right: 10px; background:black; border-radius:5px; padding-left:3px; padding-right:3px;" '+
// ' onclick="flipCC('+i+',1)"> LOCK</div>' +

   ' | <div  onclick="chooseCCminmax('+i+',2)"  style="display: inline-block; margin-right: 10px; margin-top:4px;"><select id="'+i+'ccfx2" onchange="changeCCFX('+i+',2,this.value,this.id)" disabled  style="background-color:black; color:#FF4400;" ><option  value="0" > Control 2 &nbsp; </option></select> </div>' +
  '<input   onclick="chooseCCminmax('+i+',2)"  type="number" onchange="changeCC('+i+',2,this.value)" id="'+i+'cc2" min="0" max="127" value="' + 2 + '" style="display: inline-block; padding: 0px; border:none; font-size:20px;  border-radius:5px; outline: none; background: black; color: inherit;" /> <input onchange="minCC('+i+',this.value)"id="mincc'+i+'" value="0" min="0" max="127" type="range"/> MIN &nbsp;<span id="minccval'+i+'" style="display:inline-block;position:relative;top:14px;color:#FF4400;font-size:30px;font-weight:bold;">1</span>' +  
  // ' <div id="'+i+'lock2" style="display: inline-block; margin-right: 10px;background:black; border-radius:5px; padding-left:3px; padding-right:3px; "'+
// ' onclick="flipCC('+i+',2)"> LOCK</div>' +
 
   ' <br><div  onclick="chooseCCminmax('+i+',3)"  style="display: inline-block; margin-right: 10px; margin-top:4px;"><select id="'+i+'ccfx3" onchange="changeCCFX('+i+',3,this.value,this.id)" disabled  style="background-color:black; color:#FF4400;" ><option value="0" > Control 3 &nbsp; </option></select> </div>' +
  '<input  onclick="chooseCCminmax('+i+',3)"  type="number" onchange="changeCC('+i+',3,this.value)" id="'+i+'cc3" min="0" max="127" value="' + 3 + '" style="display: inline-block; padding: 0px; border:none; font-size:20px;  border-radius:5px; outline: none; background: black; color: inherit;" />' +  
  // ' <div id="'+i+'lock3" style="display: inline-block; margin-right: 10px;background:black; border-radius:5px; padding-left:3px; padding-right:3px;"'+
// ' onclick="flipCC('+i+',3)" > LOCK</div>' +

   ' | <div  onclick="chooseCCminmax('+i+',4)"  style="display: inline-block; margin-right: 10px; margin-top:4px;"><select id="'+i+'ccfx4" onchange="changeCCFX('+i+',4,this.value,this.id)" disabled  style="background-color:black; color:#FF4400;" ><option value="0" > Control 4 &nbsp; </option></select> </div>' +
  '<input  onclick="chooseCCminmax('+i+',4)"  type="number"  onchange="changeCC('+i+',4,this.value)" id="'+i+'cc4" min="0" max="127" value="' + 4 + '" style="display: inline-block; padding: 0px; border:none; font-size:20px;  border-radius:5px; outline: none; background: black; color: inherit;" /> <input  onchange="maxCC('+i+',this.value)" id="maxcc'+i+'"    value="127" min="0" max="127" type="range"/> MAX '+// <span id="maxccval'+i+'" style="color:#FF4400; font-size:40px;" >1</span>' +
  // ' <div id="'+i+'lock4" style="display: inline-block; margin-right: 10px;background:black; border-radius:5px; padding-left:3px; padding-right:3px;"'+
// ' onclick="flipCC('+i+',4)" > LOCK</div></span> &nbsp;' +


// '<div  class="btt1 btt2" style="color:#F11; float:right; " onclick="sendTool(gearN,'+i+')"> SEND </div>'+
'<br><div id="extra'+i+'" style="display:inline-block; display:none;">xx4xx</div>'+ 
'</div>';
	



}


for(let i = 1; i<=3; i++)
{
	
	document.getElementById('cnv'+i).style.zIndex = -9999;
	document.getElementById('bartran'+i).style.display = "none";
	document.getElementById('barloop'+i).style.display = "none";	
	document.getElementById('bar2loop'+i).style.display = "none";		
	
}
	document.getElementById('cnv'+4).style.zIndex = -9999;

document.getElementById('ball1').style.background="#FF4400";
document.getElementById('ball1').style.color="#FFF";
document.getElementById('chancon1').style.display="";



for(var j = 1; j<=4; j++)
{

 el = document.getElementById('chan'+j);

          el.innerHTML = '';

	for(var i = 1; i<=16; i++)
	{
		const option = document.createElement('option');
		option.text = i;
		option.value = i;
		el.appendChild(option);
		 
	}

el.value = j;

 el = document.getElementById('scale'+j);

          el.innerHTML = '';
		  

	   
	for(var i = 1; i<=8; i++)
	{
		
		const option = document.createElement('option');
		option.text = i;
		option.value = i;
		el.appendChild(option);
          listScale[0][j-1][i-1]=32+(j*12);
          listScale[1][j-1][i-1]=32+(j*12);		
          listScale[2][j-1][i-1]=32+(j*12);
          listScale[3][j-1][i-1]=32+(j*12);
		
	}
	

  el.value = 4;
 
  drawScale(j,4);
 
//	document.getElementById('lk'+1).style.color="#FF4400";	
}



  
  // ****************************
  // *** RESIZE ****
  // ***************************
  
      function getPageHeight() {
    
        pageHeight = document.documentElement.scrollHeight;
		
      document.getElementById("cm").style.height = (pageHeight / 80) * cm1;

    }

 
  window.addEventListener('resize', getPageHeight);

 
 
 //  ************************************
 // ********  M I D I *****************
 //  ********************************
 
  let midiOutput;
  let midiInput;
  let midiinid;
  
  let midiOutput2;
  let midiInput2;
  let midiinid2;
  
  
  var thedevice;
  var thedevicein;  
  
 let midi = null; // global MIDIAccess object
 
 function listMIDIDevices() {
	// return;
	// console.log("checking for MIDI devices...");
  navigator.requestMIDIAccess()
	.then((midiAccess) => {
		
	  const midiDevicesSelect = document.getElementById('midiDevices');	   
	  midiDevicesSelect.innerHTML = '';

	  const midiDevicesSelectin = document.getElementById('midiDevicesin');	   
	  midiDevicesSelectin.innerHTML = ''; 
	  
	  //  TinyUSB MIDI
	  let nrOutput = null;
	  let nrInput = null;	
	  
	  
		let option = document.createElement('option');
		option.text = "No midi output";
		option.value = null;	  
	  
	  
	  midiAccess.outputs.forEach((output) => {
		  

		
		//console.log("out " + output.id +" " +output.name);
		
		midiDevicesSelect.appendChild(option);      
		  
		//  console.log(output);
		  
		  
		  
		  
		  
	  if( output.name != "TinyUSB MIDI" && output.name != "ESP32S3_DEV")  
	  {
		  option = document.createElement('option');
		option.text = output.name;
		option.value = output.id;
		
		//console.log("out " + output.id +" " +output.name);
		
		midiDevicesSelect.appendChild(option);         
	  }
	  
	  if( output.name == "TinyUSB MIDI"  ||  output.name == "ESP32S3_DEV")  
	  {
		  nrOutput = output.id;
	  }
	  
	 });
	 
	  const option2 = document.createElement('option');
		option2.text = "no";
		option2.value = "null";
		


	   midiAccess.inputs.forEach((input) => {
		   
		   

	

		  if( input.name == "TinyUSB MIDI" ||  input.name == "ESP32S3_DEV")  
		  {
			  nrInput = input.id;
			
			  document.getElementById("extra1").innerHTML += input.name;  
		  }
		 else
		 {
			 
			const option3 = document.createElement('option');
			option3.text = input.name;
			option3.value = input.id;
			midiDevicesSelectin.appendChild(option3);
				 
		 }
		  
		
		//console.log("IN--* " + input.manufacturer +" " +input.name);
		
		     

	  });
	  

	   initializeMIDIOutput();
	   initializeMIDIInput();
	   
	   
	   
	  midiDevicesSelect.value = nrOutput;
	  midiDevicesSelectin.value = nrInput;	

	if(nrOutput) changedevicein(nrInput,1);	
	if(nrInput)	 changedevice(nrOutput,1);	
        	   
      
	   
	   //setTimeout(() => initializeMIDIInput(), 300); 

  
	})
	.catch((error) => {
	  console.error('Error accessing MIDI devices:', error);
	});
	
}

 
  
async function initializeMIDIOutput() {
	
	initializeMIDIOutput2();
	
  const selectedDeviceId = document.getElementById('midiDevices').value;

  try {
    const midiAccess = await navigator.requestMIDIAccess();
    midiOutput = midiAccess.outputs.get(selectedDeviceId);

    if (!midiOutput) {
    //  console.error('Selected MIDI OUT device not found.');
      return;
    }

  } catch (error) {
    console.error('Error accessing MIDI devices:', error);
  }

}

 
  
async function initializeMIDIOutput2() {
		// return;
  const selectedDeviceId = document.getElementById('midiDevices').value;

  try {
    const midiAccess = await navigator.requestMIDIAccess();
    midiOutput2 = midiAccess.outputs.get(selectedDeviceId);

    if (!midiOutput2) {
     // console.error('Selected MIDI OUT device not found.');
      return;
    }

  } catch (error) {
    console.error('Error accessing MIDI devices:', error);
  }

}


async function initializeMIDIInput() {
 // const selectedDeviceId = document.getElementById('midiDevices').value;
 if(!midiinid)return;
 
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    midiInput = midiAccess.inputs.get(midiinid);
	
	

    if (!midiInput) {
      console.error('Selected MIDI IN device not found.');
      return;
    }

  } catch (error) {
    console.error('Error accessing MIDI devices:', error);
  }
  
}


var myScale = [
    [37, 39, 40, 42, 44, 56, 61, 64],
    [56, 59, 63, 68, 70, 73, 75, 92],
    [44, 61, 63, 64, 68, 70, 71, 75],
    [49, 52, 56, 59, 63, 68, 70, 73],
    [45, 47, 50, 52, 55, 59, 62, 65]
];




function sendMIDIMessage(dt1,dt2,dt3) {
	 
	if(thedevice =="null" ||thedevice =="" )return;
	if(!thedevice )return;	
	
  if (!midiOutput) {
    console.error('MIDI output not initialized. Call initializeMIDIOutput() first.');
    return;
  }
  
  let idx = 0;
  
      if(dt1 < 144){
		  // idx = dt1 - 128;
        // dt2 = myScale[idx][dt2];

    	let midiMessage = [dt1, dt2, dt3];
	//console.log(midiMessage);
    midiOutput.send(midiMessage);
       // MIDI.sendNoteOff(dt2, dt3, dt1 - 127 );
        }
       else if(dt1 < 160  ){ 
  ///86+
  
  
  		  // idx = dt1 - 144;
        // dt2 = myScale[idx][dt2];
  
	let midiMessage = [dt1, dt2, dt3];
//	console.log(midiMessage);
    midiOutput.send(midiMessage);
 }
 
 else
 {
	 
	let midiMessage = [dt1, dt2, dt3];
	//console.log(midiMessage);
    midiOutput.send(midiMessage); 
	 
 }
 
 
}



function changedevice(deviz)
{
	console.log("changedevice " + deviz);
	thedevice  = deviz ;
	         console.log("Selected MIDI device:", deviz);
	if(deviz!="null")
	{
	 navigator.requestMIDIAccess({ sysex: true })
        .then(midiAccess => {
 
          	midiOutput = midiAccess.outputs.get(deviz);
			  sendTrackNum(0);
        })
        .catch(error => {
          console.error("Error accessing MIDI devices:", error);
        });

	}
}


function changedevice2(deviz) // OUT 2 routing
{
	console.log("changedevice 2" + deviz);
	thedevice  = deviz ;
	         console.log("Selected MIDI device 2 :", deviz);
	if(deviz!="null")
	{
	 navigator.requestMIDIAccess({ sysex: true })
        .then(midiAccess => {
 
          	midiOutput2 = midiAccess.outputs.get(deviz);
			 // sendTrackNum(0);
        })
        .catch(error => {
          console.error("Error accessing MIDI devices:", error);
        });

	}
}


function changedevicein(deviz)
{
	console.log("changedevice IN");
	thedevicein  = deviz ;
	console.log("Selected MIDI device IN:", deviz);
	if(deviz!="null")
	{
	 navigator.requestMIDIAccess()
        .then(midiAccess => {
 
          	midiinput = midiAccess.inputs.get(deviz);
						
			midiinput.onmidimessage = function(event) {
			  const data = event.data;
			  
			  document.getElementById("extra1").innerHTML = data;
			  
			  
			  // Check for SysEx (starts with 0xF0, ends with 0xF7, length >= 3)
			  if (data[0] === 0xF0 && data[data.length - 1] === 0xF7) {
				// Handle SysEx message
				processSysEx(Array.from(data));
			    console.log("SysEx message received:", Array.from(data));
			  } else {
				// Handle regular MIDI messages (1-3 bytes)
				// Defensive: check length to avoid undefined
				const d1 = data[0] !== undefined ? data[0] : 0;
				const d2 = data[1] !== undefined ? data[1] : 0;
				const d3 = data[2] !== undefined ? data[2] : 0;
				
				if(d1 == 143)fakeSysex(d1,d2,d3);
				//pgm change 192 !!!!!!!!!!
				else {
					midiSound( d1,d2,d3 );
				 	routeMidi(d1,d2,d3);
				 
				}
				
				
			//	processMidiUSB(d1, d2, d3);
				// Optionally: console.log("MIDI message received:", d1, d2, d3);
			  }
			};
			
        })
        .catch(error => {
          console.error("Error accessing MIDI devices:", error);
        });
	
	}
}

function routeMidi(d1,d2,d3)
{
	if (!midiOutput2) return;
	//console.log( d1,d2,d3 );
	 if(d1>=192  && d1 < 224)midiOutput2.send([ d1,d2]);
	 else midiOutput2.send([ d1,d2,d3 ]);
	 
	 
	 
	
}


function processSysEx(sysexArray) {
  // Do something with the SysEx data
  console.log("Received SysEx:", sysexArray);
}


function handleMIDIDeviceChange(event) {
	
  listMIDIDevices();
  
}




function sendStream()
{
	console.log("stream settings");
	//socket.emit('setting', { setvoice: 4, midi:"data"}); 
//	ws.send(JSON.stringify({ event: 'setting', setvoice: 4, midi: "data" }));
	
	
	
	
	// ws.send(JSON.stringify('setting', { setvoice: 4, midi:"data"})); 	
	
	 // ws.send(JSON.stringify({
    // type: type,
    // channel: channel,
    // data: dataArr
  // }));
	
	
	// sendMidi("note_on", 1, [60, 127]);
	
	
}


function flipWifi(nn)
{
	
	
	if(nn == 1)
	{
		
		document.getElementById('wf1').style.display  = "";
		document.getElementById('pss1').style.display = "";	
		
		document.getElementById('wf2').style.display  = "none";
		document.getElementById('pss2').style.display = "none";			
		
		document.getElementById('wifi1').style.color="#f40";
		document.getElementById('wifi2').style.color="#111";		
		
	}
		if(nn == 2)
	{
		
		document.getElementById('wf1').style.display  = "none";
		document.getElementById('pss1').style.display = "none";	
		
		document.getElementById('wf2').style.display  = "";
		document.getElementById('pss2').style.display = "";			
		
		document.getElementById('wifi1').style.color="#111";
		document.getElementById('wifi2').style.color="#f40";		
		
	}
	
}

		document.getElementById('wf2').style.display  = "none";
		document.getElementById('pss2').style.display = "none";	




document.getElementById('wifi1').addEventListener('click', function() {
  flipWifi(1);
});

document.getElementById('wifi2').addEventListener('click', function() {
  flipWifi(2);
});


function flipMenu(nn)
{	
	 
	if(nn ==0)document.getElementById('menucontent').style.display  = "none";
	else document.getElementById('menucontent').style.display  = "";
	
	if(nn ==0)document.getElementById('grxall').style.display = "";
	else document.getElementById('grxall').style.display = "none";
	
	if(nn ==0)document.getElementById('grxall-menu').style.display = "none";
	else document.getElementById('grxall-menu').style.display = "";	
	 
  
}
	


document.getElementById('menu').addEventListener('click', function() {
	        if (isMobile()) {goFullscreen();  forceFullScreen(); }

  if(flagMenu == 0){flagMenu =1; flipMenu(1);  }
  else {flagMenu = 0; flipMenu(0);}
  
});






function sendWifi()
{
	
	let dd2 = document.getElementById('wf2').style.display;
	
	let nn = 2;
	
	if(dd2 == "none")nn =1;
	
	
	let wf = document.getElementById('wf'+nn).value;
	let pss = document.getElementById('pss'+nn).value;	
	
	//socket.emit('wifi', { room:gearCode[gearN-1], nn: nn, wf:wf, pss:pss });  
    // ws.send(JSON.stringify({ event: 'wifi', room:gearCode[gearN-1], nn: nn, wf:wf, pss:pss  }));

	
	// setCookie("wifi"+nn, wf , 1000);
	// setCookie("wificode"+nn, pss , 1000);	
	
	
	   document.getElementById('sendWifi').style.background = "red";					
	   document.getElementById('sendWifi').style.color="#EEE";
	   
	   alert("please reboot device to change wifi network.");
	
}


document.getElementById('sendWifi').addEventListener('click', function() {
  sendWifi();
});




function setCookie(name, value, daysToExpire) {
  const date = new Date();
  date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}



// setCookie("exampleCookie", "exampleValue", 7);

function getCookie(name) {
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return "";
}



function deleteCookie(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function getCookieSizeInKB() {
  const cookies = document.cookie.split(';');
  let totalSize = 0;

  for (const cookie of cookies) {
	 // console.log(cookie);
    const parts = cookie.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=');
    totalSize += (key.length + value.length) * 2; // Assuming each character is 2 bytes
  }

  // Convert to KB and round to 2 decimal places
  const sizeInKB = (totalSize / 1024).toFixed(2);
  return sizeInKB;
}

// const cookieSizeKB = getCookieSizeInKB();
// if (cookieSizeKB)console.log('COOKIES in KB:', cookieSizeKB);




// const cookieValue = getCookie("exampleCookie");
// console.log("Value of exampleCookie:", cookieValue);





function flipGear(nn)
{	 
	
//	socket.emit('panic', { room:gearCode[gearN-1], state: 1});  
	
	
    // console.log(gearCode[gearN-1]);
	
	// return;
     	
	
	
	//delay(200);
	
  	document.getElementById('route').value = routeGear[nn-1];
	
	for (let i = 1; i < 5; i++) {
    if(i == nn) 
	{
       document.getElementById('gr'+i).style.color="#f40";
       document.getElementById('grx'+i).style.color="#f40";	  
	   
		
    }
	else 
	{
		document.getElementById('gr'+i).style.color="#111";
		document.getElementById('grx'+i).style.color="#111";
	}
	
	if(nn == i)document.getElementById('route').options[i].disabled = true;
    else document.getElementById('route').options[i].disabled = false;
	
	document.getElementById ("ball" + i).style.borderColor="#888";
		 
  }
  
  gearN = nn;
  myGear =  gearCode[gearN-1];
  
  
  
  	if(resend[gearN-1] == 1)
	{
		document.getElementById('sdback').style.background="#FF4400";
		//document.getElementById('sdback').innerHTML	="&nbsp;ON &nbsp; ";	
		// socket.emit('sendback', { room:gearCode[gearN-1], sdback: 1});  
	//	ws.send(JSON.stringify({ event: 'sendback', room:gearCode[gearN-1], sdback: 1  }));
    }
	else
	{
		document.getElementById('sdback').style.background="#000";
		//document.getElementById('sdback').innerHTML	="&nbsp;OFF&nbsp;";				
    }	
  
 
 
  document.getElementById('grc').value = gearCode[gearN-1];
  
  //	socket.emit('joinroom', { room: myGear });  
	
	// ws.send(JSON.stringify({ event: 'joinroom',  room: myGear   }));
	
	//loadGear(nn);	
	
	fillTool(nn);
	
   //	
  



}


function setGear()
{
	var theval = document.getElementById('grc').value;
	
	if(theval ==""){alert("Fill gear code"); return; }
	
	 
	    var getgear =  gearCode.indexOf(theval); 
	
	if(getgear == -1 )
	{
		gearCode[gearN-1] = theval;	
		//setCookie("lastgear", theval , 1000);	
		//console.log("cookie lastgear saved");
	    setCookie("gearcode"+gearN, gearCode[gearN-1] , 2000);			
    }
	else alert( "this gear exist yet" );
	
	
	
	    // var getgear =  gearCode.indexOf(data.codemachine);
		// console.log( getgear );
 // if(getgear != -1)document.getElementById("grx"+(getgear + 1)).style.background="#DDD";

	
}



// document.getElementById('gr1').addEventListener('click', function() {
  // flipGear(1);
// });
// document.getElementById('gr2').addEventListener('click', function() {
  // flipGear(2);
// });
// document.getElementById('gr3').addEventListener('click', function() {
  // flipGear(3);
// });
// document.getElementById('gr4').addEventListener('click', function() {
  // flipGear(4);
// });


// document.getElementById('grx1').addEventListener('click', function() {
  // flipGear(1);
// });
// document.getElementById('grx2').addEventListener('click', function() {
  // flipGear(2);
// });
// document.getElementById('grx3').addEventListener('click', function() {
  // flipGear(3);
// });
// document.getElementById('grx4').addEventListener('click', function() {
  // flipGear(4);
// });

 


function loadCookies()
{
	//return;
	
	let cook; 
	
	
	for (let i = 1; i < 5; i++) 
	{
       cook = getCookie("gearcode"+i);
	  if(cook) 
	  {
		 gearCode[i-1] = cook;
		 if(i==1)
		 {
			 gearN = 1;
			 myGear =  gearCode[gearN-1];
			 document.getElementById('grc').value = cook;
	//		ws.send(JSON.stringify({ event:'joinroom',   room: myGear }));  
		 
		 }	 	 
	  }	
	
		
    }
	
	
	  cook = getCookie("lastgear");
	  if(cook && cook != "") 
	  {
		 
         gearN = (gearCode.indexOf(cook))+1;		 
		 gearCode[gearN - 1] = cook;
		 myGear = cook;	 
		  
	  }
 

      cook = getCookie("authmidiusage");
	  if(cook) 
	  {
		  
		  startMidi();
		  
	  }
	  else document.getElementById("splashmidi").style.display="flex";
	  
   // document.getElementById("splashmidi").style.display="flex";

	console.log("cookie midi " + cook);

	 
	
	
	cook = getCookie("lastpatch");	
	if(cook)
	{
	 //thisTrack(cook);
	}	  
	
	
	
	cook = getCookie("wifi1");
	if(cook)
	{
	document.getElementById('wf1').value = cook;
	cook = getCookie("wificode1");
	document.getElementById('pss1').value = cook;	
	}
	
	cook = getCookie("wifi2");	
	if(cook)
	{
	document.getElementById('wf2').value = cook;
	cook = getCookie("wificode2");
	document.getElementById('pss2').value = cook;	
	}	
		
		
	return;	
	
	
}

loadCookies();


function getChan(nn,chann)
{
	 
	chan[gearN-1][Number(nn)-1]=Number(chann);
	console.log(chan[gearN-1][Number(nn)-1]);
	
	let arr=[ 143, 3+nn, chann ];
	sendMidiUsb(arr)
	
	
}

function getScaleLen(nn,lenn)
{
console.log(nn);
	lnScale[gearN-1][Number(nn)-1]=Number(lenn);

	drawScale(Number(nn),Number(lenn));
	
		let arr=[ 143, 72+Number(nn)-1, lenn ];
	sendMidiUsb(arr)
	
	
}


function createSelectNt(tlz,scn) {
  var selNt = document.createElement('select');
  selNt.classList.add('selek');
  selNt.setAttribute('id', tlz+'noto'+ scn);
   selNt.onchange = function () {  
   
   
   changeNote(tlz,scn,Number(this.value));
   // sendTool(tlz);

  };
  
  
  // selNt.onclick = function() {
    // playthisnote(gearN,tlz,scn);
  // };
  
  
  for (var i = 0; i <= 11; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.textContent = notes[i];
    selNt.appendChild(option);
  }
  
  
  selNt.value =listScale[gearN-1][tlz-1][scn-1] % 12;

 if( !selNt.value  ){
	 //console.log(listScale[gearN-1][tlz-1][0] % 12);
	 selNt.value =(listScale[gearN-1][tlz-1][0] % 12);
 }
	 
  return selNt;
  
  
}



function createSelectOct(tlz,scn) {
	

  var selOct = document.createElement('select');
  selOct.classList.add('selek');
  selOct.setAttribute('id', tlz+'octo'+ scn);  
  
  
  
  selOct.onchange = function () {  
    changeOctave(tlz,scn,Number(this.value));
	//console.log("oct " + tlz);
	 
	 sendTool(gearN,tlz);
  };


 var lastval = 0;
  for (var i = 0; i <= 10; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    selOct.appendChild(option);
  }
 
  var theVal = Math.floor((listScale[gearN-1][tlz-1][scn-1]) / 12) ; 
  
   //  console.log( listScale[gearN-1][tlz-1][scn-1] , theVal   );
  
  
  	 selOct.value = theVal;
  
  // if(theVal)selOct.value =  theVal;
  // else
	// {	  
   
	 // selOct.value = Math.floor((listScale[gearN-1][tlz-1][0]-24) / 12);
	// }
	
	
  
  return selOct;
}

function drawScale(nn, lns) {
	
	 

  var dcc = document.getElementById("scl" + nn);
  dcc.innerHTML = "";

  for (var i = 1; i <= lns; i++) {

    var skalDiv = document.createElement('div');
    skalDiv.classList.add('skal');
    skalDiv.id = nn + 'skl' + i;
   // skalDiv.textContent = '7D#';

    var selectContainer = document.createElement('div'); 
 
    selectContainer.appendChild(createSelectOct(nn,i));
    selectContainer.appendChild(createSelectNt(nn,i));

    skalDiv.appendChild(selectContainer);
    dcc.appendChild(skalDiv);
	 // if (i % 8 === 0 && i !== 0) dcc.appendChild(document.createElement('br'));
  }
}

var clickCount =0;
var  flagdbl = 0;






function flipplay(nn)
{

 
	if( playChannel[nn-1] == 0 )
	{	

		playChannel[nn-1] = 1;
		document.getElementById('ball'+nn).style.background="#FF4400";
		document.getElementById('ball'+nn).style.color="#FFF";	
		document.getElementById('lk'+nn).style.color="#FF4400";		
		
        //armnn[nn-1] = setnn[nn-1];
			let arr=[143,31 + nn,3];
	        sendMidiUsb(arr);
	}
	else 
	{

		playChannel[nn-1] = 0;
	    document.getElementById('ball'+nn).style.background="#FFF";
		document.getElementById('ball'+nn).style.color="#000";
		document.getElementById('lk'+nn).style.color="#FFF";

			let arr=[143,31 + nn,4];
	        sendMidiUsb(arr);		
	    //armnn[nn-1] = -1;
		
	}
	
	//ws.send(JSON.stringify({ event:'mute', room:gearCode[gearN-1],mutechan: playChannel , tool:nn}));  
 
		
	exBall = nn;

}


function fastclic(nn)
{
	if(settool != nn-1)setnn[nn-1] = 0;
	settool = nn-1;
	 
	
		document.getElementById ("numset").innerHTML= nn;
		if( libsound == 1)showLabel(settool);
	   var arrcopy = Array.from(playChannel);
	  // if(playChannel[nn-1] == 0){
		   
	    arrcopy[nn-1] = 1;
 
		document.getElementById('ball'+nn).style.background="#FF4400";
		document.getElementById('ball'+nn).style.color="#FFF";
	
	//	ws.send(JSON.stringify({ event:'mute',  room:gearCode[gearN-1],mutechan: arrcopy, tool: nn })); 
		
		if(liblux == 1)fastVon[nn-1]=1;
		
		// for (var i = 1; i <= 4; i++) {

		 // document.getElementById('ball'+i).style.boxShadow = "inset 0 0 0 0px #000";
		
	    // }
		// document.getElementById('ball'+nn).style.boxShadow = "inset 0 0 0 3px #FF4400";
		
			let arr=[143,31 + nn,1];
	        sendMidiUsb(arr);
}

function fastclicoff(nn)
{
	
 
	 // document.getElementById('ball'+nn).style.background="#FFF";
	 // document.getElementById('ball'+nn).style.color="#000"; 
	 
	// if(playChannel[nn-1] == 1){	
	 // document.getElementById('ball'+nn).style.background="#FF4400";
	 // document.getElementById('ball'+nn).style.color="#FFF";   }
	// else{	
	 // document.getElementById('ball'+nn).style.background="#FFF";
	 // document.getElementById('ball'+nn).style.color="#000";   }
	 
	if(playChannel[nn-1] == 0){		
	
	var col = document.getElementById('ball'+nn).style.color;
	
	if(col !== "rgb(0, 0, 0)")
	  {	
    
	 document.getElementById('ball'+nn).style.background="#FFF";
	 document.getElementById('ball'+nn).style.color="#000";   
//	ws.send(JSON.stringify({ event:'mute',  room:gearCode[gearN-1], mutechan: playChannel , tool:nn }));  

			let arr=[143,31 + nn,1];
	        sendMidiUsb(arr);

       }	
	 }	 
	
		

 	//console.log("off : " + playChannel);
	
}


function flipChannel(nn)//,event
{
	//console.log('chancon'+nn);
	
	toolNow = nn;
	
	if(document.getElementById('chancon'+nn).style.display=="")document.getElementById('chancon'+nn).style.display="none";	
	
	else document.getElementById('chancon'+nn).style.display="";
	
   // if(clickCount!=0)return;
		
		
	// document.getElementById('chancon'+toolNow).style.display="none";				

	// document.getElementById('chancon'+nn).style.display="";	
	
	// toolNow = nn;
	
	
	
}

function changeOctave(tlz,scn,val)
{
	let nNote = Number(document.getElementById(tlz+'noto'+scn).value);
	let valNote = (val * 12) + nNote ;
	listScale[gearN-1][tlz-1][scn-1] = valNote;
	
		let arr=[ 143, 80 + ((tlz-1)*8) +  (scn - 1) , valNote ];
		
		console.log( arr );
	    sendMidiUsb(arr)
	
}


function changeNote(tlz,scn,val)
{
	let nOct = Number(document.getElementById(tlz+'octo'+scn).value);
	let valNote = (nOct * 12) + val;	
	listScale[gearN-1][tlz-1][scn-1] = valNote;
	  
	  
	    let arr=[ 143, 80 + ((tlz-1)*8) +  (scn - 1) , valNote ];
			console.log( arr );
	    sendMidiUsb(arr) 
	  
  // sendTool(gearN,tlz);

 }


function changespeed(val)
{
     msSpeed = val;
	// ws.send(JSON.stringify({ event:'speedultra',  room:gearCode[gearN-1], speed: val }));  
  //  console.log(val);
	
}

function movespeed(val)
{
	
	document.getElementById("speedmon").innerHTML = val;
	

}


function changecmmax(val)
{
	pingtime = new Date();
	// ws.send(JSON.stringify({ event:'calibre', room:gearCode[gearN-1], cm: val }));  
   // console.log(val);
	
}

function movecmmax(val)
{
	
	document.getElementById("cmmon").innerHTML = val;
	

}


function changecm(nn,val)
{
	 
	cMax[gearN-1][nn-1] = Number(val);
	
}


function changemincm(nn,val)
{
	//console.log(nn,val);
	//document.getElementById("max-value"+nn).innerHTML = val;
	
	cMin[gearN-1][nn-1] = Number(val);
} 

function movecm(nn,val)
{
	// var stval =val;
	  // if(val<10)val= stval = "00"+val;
	// else if(val<100)stval="0"+val;	
	document.getElementById("max-value"+nn).innerHTML = val;
	
	if( (cMin[gearN-1][nn-1] -12 ) >= Number(val))
	{		
		document.getElementById("min-value"+nn).innerHTML=val-12;
		document.getElementById("slmin"+nn).value=val-12;
		cMin[gearN-1][nn-1] = val-12;
	}
	
}

function movemincm(nn,val)
{
	// var stval =val;
	// if(val<10)val= stval = "00"+val;
	// else if(val<100)stval="0"+val;	
	document.getElementById("min-value"+nn).innerHTML =  val;	
	
	  if( (cMax[gearN-1][nn-1] +12 ) <= Number(val))
	  {
		
		  document.getElementById("max-value"+nn).innerHTML=val+12;
		  document.getElementById("slmax"+nn).value=val+12;
		  cMin[gearN-1][nn-1] = val+12;
		  
	  }
}

function deletetrack() {
    var patchField = document.getElementById("thepatch");
    
    // Toggle visibility if hidden
    if (patchField.style.display === "none") {
        patchField.style.display = "";
        document.getElementById("jmx").style.display = "";
        return;
    }
    
    var cnt = patchField.value;
    if (!cnt) {
        alert("Please enter a patch name");
        return;
    }
    
    var fieldName = cnt.replace(/\s/g, "");
    var ggr = gearCode[gearN - 1];
    var patchKey = 'patch_' + fieldName;
    var tracksKey = 'tracks_' + ggr;
    
    // FIX: Removed extra parenthesis here
    if (!localStorage.getItem(patchKey)) {
        alert("Patch not found in local storage");
        return;
    }
    
    try {
        // Delete patch data
        localStorage.removeItem(patchKey);
        
        // Update tracks list
        var tracksData = localStorage.getItem(tracksKey);
        var tracks = [];
        if (tracksData) {
            try {
                tracks = JSON.parse(tracksData);
            } catch (e) {
                console.error("Error parsing tracks:", e);
            }
        }
        
        var originalLength = tracks.length;
        var updatedTracks = tracks.filter(t => {
            var normalizedTrack = t.replace(/\.jmx$/, '').replace(/\s/g, "");
            return normalizedTrack !== fieldName;
        });
        
        if (updatedTracks.length < originalLength) {
            try {
                localStorage.setItem(tracksKey, JSON.stringify(updatedTracks));
                alert("Patch deleted successfully");
            } catch (e) {
                console.error("Error saving updated tracks:", e);
                alert("Patch deleted but error updating tracks list");
            }
        } else {
            alert("Patch data deleted but not found in tracks list");
        }
        
        // Clear UI and cookies
        patchField.value = "";
        deleteCookie("lastpatch");
        getTracks(); // Refresh tracks list
    } catch (e) {
        console.error("Error deleting patch:", e);
        alert("Error deleting patch: " + e.message);
    }
}

function savetrack()
{
	var disp=document.getElementById("thepatch").style.display;
	
	if(disp == "none"){
	
	document.getElementById("thepatch").style.display="";
	document.getElementById("jmx").style.display ="";
	return;
	}
	
	var cnt = document.getElementById("thepatch").value;
	
	if(cnt==""){alert("Please fill name for Patch");return;}
	


var toolsArray = [];  

 for (var j = 1; j <= 4; j++) 
 {
  var tools = [];

	  for (var i = 1; i <= 4; i++) {
		var toolData = {
		  scaleLength: lnScale[j - 1][i - 1],
		  channel: chan[j - 1][i - 1],
		  mincm: cMin[j - 1][i - 1],
		  maxcm: cMax[j - 1][i - 1],
		  scales: listScale[j - 1][i - 1],
		  allcc: allCC[j - 1][i - 1],
		  lockcc: lockCC[j - 1][i - 1],
		  beatfader: flagdir[j - 1][i - 1],
		};

		tools.push(toolData);
	  }
 //console.log(lockCC[j - 1]);	  
	  toolsArray.push(tools);  
	}
	
	


 var settingsData = 
 {
	 
	gear1:gearCode[0],
	gear2:gearCode[1],
	gear3:gearCode[2],
	gear4:gearCode[3],	
	wf1:document.getElementById('wf'+1).value,
	pss1:document.getElementById('pss'+1).value,
	wf2:document.getElementById('wf'+2).value,
	pss2:document.getElementById('pss'+2).value,
	sendtogear:Number(document.getElementById('route').value),	
	sendmidi:sendmidi,
    browserout:thedevice,
	cmmax:Number(document.getElementById("maxcm").value),
	freqcc:Number(document.getElementById("speedultra").value),
	bendtrig:Number(document.getElementById("bendtrig").value),
	bendspeed:Number(document.getElementById("bendspeed").value)
	
	
 };

	  
	
  if(libsound == 1)
  { 	
    
	var jsonData = {
	  settings:settingsData,
	  tools: toolsArray,
	  sounds:bigcc,
	  version: "V0.99",
	  bpm:bpm, soundurl:soundUrl ,
	  //len:len, vol:vol,
	  labeltool : labeltool ,
	  label:label
	  	   
	};	
		
  }
  else
  {
	  
	var jsonData = {
	  settings:settingsData,
	  tools: toolsArray,
	  version: "V0.98"
	};
	  
  }




var jsonString = JSON.stringify(jsonData);

//console.log(jsonString);	

postPatch(jsonString,cnt);
	

}

function postPatch(jString, name) {
    // Normalize the name (remove spaces for storage key)
    var fieldName = name.replace(/\s/g, "");
    var content = jString;
    var ggr = gearCode[gearN - 1];
    
    // Create patch data object
    var patchData = {
        fieldName: fieldName,
        content: content,
        gear: ggr,
        displayName: name, // Keep original name for display
        timestamp: new Date().toISOString()
    };
    
    try {
        // Save patch data
        localStorage.setItem('patch_' + fieldName, JSON.stringify(patchData));
        
        // Update tracks list
        var tracksKey = 'tracks_' + ggr;
        var tracks = JSON.parse(localStorage.getItem(tracksKey) || '[]');
        var displayName = name + ".jmx";
        
        // Add or update track in list
        var existingIndex = tracks.findIndex(t => 
            t.replace(/\.jmx$/, '').replace(/\s/g, "") === fieldName
        );
        
        if (existingIndex !== -1) {
            tracks[existingIndex] = displayName; // Update existing
        } else {
            tracks.push(displayName); // Add new track
        }
        
        localStorage.setItem(tracksKey, JSON.stringify(tracks));
        alert('Patch saved successfully to local storage');
    } catch (e) {
        console.error('Error saving patch:', e);
        alert('Error saving patch: ' + e.message);
    }
}

// Load tracks list for current gear
function getTracks() {
    // Create storage key based on current gear
    var storageKey = 'tracks_' + gearCode[gearN - 1];
    
    // Try to load from local storage
    var storedData = localStorage.getItem(storageKey);
    
    // Get the list element
    var listElement = document.getElementById("listtrack");
    listElement.innerHTML = ""; // Clear existing list
    
    if (storedData) {
        try {
            // Parse the stored data
            var trackList = JSON.parse(storedData);
            
            // Check if we have a valid array
            if (Array.isArray(trackList) && trackList.length > 0) {
                // Populate the list
                trackList.forEach(function(trackName) {
                    var div = document.createElement('div');
                    div.className = 'listed';
                    div.textContent = trackName;
                    
                    // Use a closure to preserve trackName value
                    div.onclick = (function(name) {
                        return function() {
                            thisTrack(name);
                        };
                    })(trackName);
                    
                    listElement.appendChild(div);
                });
            } else {
                // Handle empty or invalid track list
                listElement.innerHTML = 
                    "<div class='empty'>No tracks found for this gear</div>";
            }
            
        } catch (e) {
            console.error('Error parsing stored tracks:', e);
            listElement.innerHTML = 
                "<div class='error'>Error loading tracks</div>";
        }
    } else {
        // No data found in local storage
        listElement.innerHTML = 
            "<div class='empty'>No tracks found for this gear</div>";
    }
}
function loadGear(nn)
{
	 
	console.log("********loadGear******");
 //return;
	 var cookieValue = getCookie("geardata"+nn);
	 // console.log(cookieValue);
     if (cookieValue) 
	  {
		  var jsonData = JSON.parse(cookieValue);
		  
		  lnScale[nn-1] = jsonData.tools.map(tool => tool.scaleLength);
		  chan[nn-1] = jsonData.tools.map(tool => tool.channel);
		  cMin[nn-1] = jsonData.tools.map(tool => tool.mincm);		  
		  cMax[nn-1] = jsonData.tools.map(tool => tool.maxcm);
		  listScale[nn-1] = jsonData.tools.map(tool => tool.scales);
		  
		 // if(tool.allcc)allcc[nn-1] = jsonData.tools.map(tool => tool.allcc);
		  if (jsonData.tools[0].allcc) {
   
				allCC[nn - 1] = jsonData.tools.map(tool => tool.allcc);				
			}
		  if (jsonData.tools[0].lockcc) {
   
				lockCC[nn - 1] = jsonData.tools.map(tool => tool.lockcc);				
			}

	  }

    
		 fillTool(nn);
	
}


function fillTool(nn)
{
	 // console.log(cMax[nn-1]);
	 for (var i = 1; i <= 4; i++) {
		 
		document.getElementById("chan"+i).value=chan[nn-1][i-1];
		document.getElementById("scale"+i).value=lnScale[nn-1][i-1];
		document.getElementById("max-value"+i).innerHTML=Number(cMax[nn-1][i-1]);	
		document.getElementById("min-value"+i).innerHTML=Number(cMin[nn-1][i-1]);			
		document.getElementById("slmax"+i).value=Number(cMax[nn-1][i-1]);	
		document.getElementById("slmin"+i).value=Number(cMin[nn-1][i-1]);
		
		if(flagdir[nn-1][i-1] == 1)document.getElementById('beatfader'+i).style.background="#FF4400";
		else document.getElementById('beatfader'+i).style.background="#000";
		
		
		for (var j = 0; j <= 3; j++) 
		{
	      document.getElementById( i+"cc"+(j+1) ).value=Number(allCC[nn-1][i-1][j]);
		  		
				
  // console.log(lockCC[nn-1][i-1][j]);				
			if(lockCC[nn-1][i-1][j] == 1){
			document.getElementById(i+'lock'+(j+1)).style.background="#FF4400";

			document.getElementById(i+'ctrl'+(j+1)).style.background="#FF4400";
			document.getElementById(i+'ctrl'+(j+1)).style.color="#FFFFFF";	
			
			}
			else
			{
				
				document.getElementById(i+'lock'+(j+1)).style.background="#000";
			 
				 
				document.getElementById(i+'ctrl'+(j+1)).style.background="#FFFFFF";		
				document.getElementById(i+'ctrl'+(j+1)).style.color="#000";
			}
		  //lockCC
		 // console.log( i+"cc"+(j+1) );
		 // console.log(allCC[nn-1][i-1][j]);
		  
		}	
		//console.log(nn+"cc"+i);
		//
	 
		//console.log(allCC[nn-1][i-1]);
		//console.log("fill tool " + nn );
      	 
         

		 
		drawScale(i, lnScale[nn-1][i-1] );

 
	 }
	 
	
} 
  
function loadTrack()
{
	
	document.getElementById("load").style.display ="";
	
	 getTracks();
		

}

 function getTracks() {
    // Create storage key based on current gear
    var storageKey = 'tracks_' + gearCode[gearN - 1];
    
    // Try to load from local storage
    var storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
        try {
            // Parse the stored data (assuming it's stored as JSON)
            var trackList = JSON.parse(storedData);
            
            // Clear existing list
            document.getElementById("listtrack").innerHTML = "";
            
            // Populate the list
            trackList.forEach(function(trackName) {
                var div = document.createElement('div');
                div.className = 'listed';
                div.textContent = trackName;
                div.onclick = function() { thisTrack(trackName); };
                document.getElementById("listtrack").appendChild(div);
            });
            
        } catch (e) {
            console.error('Error parsing stored tracks:', e);
            document.getElementById("listtrack").innerHTML = 
                "<div class='error'>Error loading tracks</div>";
        }
    } else {
        // No data found in local storage
        document.getElementById("listtrack").innerHTML = 
            "<div class='empty'>No tracks found for this gear</div>";
        console.log('No tracks found in local storage for gear', gearCode[gearN - 1]);
    }
}

function thisTrack(track) {
    var normalizedTrack = track.replace(/\.jmx$/, '');
    document.getElementById("load").style.display = "none";
    document.getElementById("thepatch").style.display = "";
    document.getElementById("jmx").style.display = "";
    document.getElementById("thepatch").value = normalizedTrack;
    
    var fieldName = normalizedTrack.replace(/\s/g, "");
    var ggr = gearCode[gearN - 1];
    var storageKey = 'patch_' + fieldName;
    
    var storedData = localStorage.getItem(storageKey);
    if (storedData) {
        try {
            var patchData = JSON.parse(storedData);
            
            // Verify gear compatibility
            if (patchData.gear !== ggr) {
                alert("This patch belongs to a different gear!");
                return;
            }
            
            parsePatch(patchData.content);
            setCookie("lastgear", ggr, 1000);	
            setCookie("lastpatch", fieldName + ".jmx", 1000);
        } catch (e) {
            console.error("Error loading patch:", e);
            alert("Error loading patch: " + e.message);
        }
    } else {
        alert("Patch not found in local storage");
    }
}


function parsePatch(patch)
{


	var jData = JSON.parse(patch);
	console.log(jData.version);
 
	
	 parseSettings( jData.settings )

	for (var i = 1; i <= 4; i++) 
	{
		 
	  var nn =i;
		 
	  var jsonData = jData.tools[i-1];
	 
     if (jsonData) 
	  {

		  lnScale[nn-1] = jsonData.map(tool => tool.scaleLength);
		  chan[nn-1] = jsonData.map(tool => tool.channel);
		  cMin[nn-1] = jsonData.map(tool => tool.mincm);		  
		  cMax[nn-1] = jsonData.map(tool => tool.maxcm);
		  
       if (jsonData[0].beatfader)  flagdir[nn-1] = jsonData.map(tool => tool.beatfader);	  
		//  else flagdir[nn-1] = 0;	  
	 
		
		
			// console.log(tool.scales ) ;
			 
		  listScale[nn-1] = jsonData.map(tool => tool.scales);
         // console.log(listScale[nn-1]);
		  
			if (jsonData[0].allcc) {
   
				allCC[nn - 1] = jsonData.map(tool => tool.allcc);				
			}
		  if (jsonData[0].lockcc) {
   
				lockCC[nn - 1] = jsonData.map(tool => tool.lockcc);				
			}
		  
	      fillTool(nn);
		  
	  }
	  
	 

	  
	  
	 }	
	 
	for (var j = 1; j <= 4; j++) 
	{
		
		sendTool(gearN,j);
		
	}


    if(jData.sounds)
	{
   
     
     if(libsound == 0)
	 {	 
		   document.getElementById("splashsound").style.display=""; 

	 }
	 
	 if(jData.sounds[0][0][0].length > 4){bigcc = jData.sounds;  }	 
	 
	}
	
    if(jData.bpm)
	{
		bpm = jData.bpm;
		document.getElementById("bpm").innerHTML = bpm;
		 
	}
    if(jData.soundurl)
	{
		 
		soundUrl = jData.soundurl;
		
		//console.log(soundUrl);
	}			
    if(jData.label)
	{
		 label = jData.label;
		  // console.log(label[0]);
	}	
    if( jData.labeltool )
	{
		 labeltool = jData.labeltool;
	 
	}
    if( jData.scripturl )
	{
		 scriptUrl = jData.scripturl;
	 
	}	
	
	// bpm:bpm, soundurl:soundUrl, 
	  // len:len, vol:vol,	 
	
	 
	 fillTool(gearN);

    
	 flagMenu = 0;
	 flipMenu(0);	
	 
		 
}	



function sendTool(jj,nn)
{
	return;
	//if(jj ==0)jj=gearN;
	
	   // console.log(jj,nn);
     // console.log(jj,nn);
 

  var tl= { toolid:nn,
			channel:chan[jj-1][nn-1],
			mincm: cMin[jj-1][nn-1],			
			maxcm: cMax[jj-1][nn-1],
			len:lnScale[jj-1][nn-1],
			beatfader:flagdir[jj-1][nn-1],
			scale: listScale[jj-1][nn-1].slice(0, lnScale[jj-1][nn-1]),
			version:"V.01",
			room:gearCode[jj-1],
			allcc: allCC[jj-1][nn-1] ,
 	        lockcc: lockCC[jj-1][nn-1]
			};
			
	
      var jsonData = tl;

       console.log(midiOutput.name, midiOutput.manufacturer);
       const sysexMessage = [0xF0, 0x7E, 0x7F, 0x09, 0x01, 0xF7]; 
       let arr = [0xF0,1,1,2,3,4,5,6,7,8,4,0xF7];
	   
	     try {
			midiOutput.send(arr);
			alert('SysEx sent!');
		  } catch (e) {
			alert('Failed to send SysEx: ' + e);
			console.error(e);
		  }
	 
 

     return;

     // ws.send(JSON.stringify({ event:'tool', tool:jsonData }));  
	 // ws.send(JSON.stringify({ event:'mute', room:gearCode[jj-1], mutechan: playChannel,tool:nn }));  
  

}

function changeCC( tlz , cc , val)
{
	
	val = Number(val);
 
	allCC[gearN-1][tlz-1][cc-1] = val;
	
	let arr=[ 143, (4*(tlz-1)) + (cc-1) + 8, val ];
 
	sendMidiUsb(arr)
	
}



function selectCtrl(tlz,cc,ison)
{

     if(ison == 1)
	 {
		 
      runCC = 1;		 
      settool=tlz-1;
	  
		for(let i = 0; i<= 3; i++)
		{
			document.getElementById("lblcc"+i).innerHTML = label[settool][i];
			
		}
	  
	  document.getElementById ("numset").innerHTML= tlz;
	  
      setcc=cc-1;
     // console.log(settool,setcc);		
       if( libsound == 1 )
	   {
		for (let i = 0; i <= 3; i++) 
	    {
		if(setcc == i)document.getElementById("lblcc"+i).style.color="gold";
		else  document.getElementById("lblcc"+i).style.color="grey";
        } 
		   
			showLabel(settool);
			
	   }		   
	 }
	 else
	 {
		 
		 runCC = 0;
		 
	 }
	 
	
	if(lockCC[gearN-1][tlz-1][cc-1] == 1)return;
		
		
	
		
	var newlock = lockCC[gearN-1][tlz-1];
	 
	
	if(ison){
		document.getElementById(tlz+'ctrl'+cc).style.background="#FF4400";
		document.getElementById(tlz+'ctrl'+cc).style.color="#FFFFFF";	
		newlock = [...newlock];
		newlock[cc - 1] = 1;
	 //  ws.send(JSON.stringify({ event:'mutecc', room:gearCode[gearN-1], lockcc: newlock , toolid: tlz }));  
	 
 		
	}
	else
	{
		

	    newlock = [...newlock];
		newlock[cc - 1] = 0;
       
	
	var col = document.getElementById(tlz+'ctrl'+cc).style.color;
	if( col !=="black" &&  col !=="rgb(0, 0, 0)")
	 {	

		document.getElementById(tlz+'ctrl'+cc).style.background="#FFFFFF";		
		document.getElementById(tlz+'ctrl'+cc).style.color="black";		
		
	// ws.send(JSON.stringify({ event:'mutecc', room:gearCode[gearN-1], lockcc: newlock , toolid: tlz }));  
 			
	 }
	}
	
	 
	 
	 
	 if(lockCC[gearN-1][tlz-1][cc-1] == 1)ison = 1;
	if(liblux == 1)vCCON[tlz-1][cc-1] = ison;
	
}

function flipCC(tlz,cc)
{
	
	//console.log(lockCC[tlz][cc]);
	
	
		if(lockCC[gearN-1][tlz-1][cc-1] == 0){
		document.getElementById(tlz+'lock'+cc).style.background="#FF4400";
		
		lockCC[gearN-1][tlz-1][cc-1] = 1;
		if(liblux == 1)vCCON[tlz-1][cc-1] = 1;
		
		document.getElementById(tlz+'ctrl'+cc).style.background="#FF4400";
		document.getElementById(tlz+'ctrl'+cc).style.color="#FFFFFF";	
	 	
	}
	else
	{
		
		document.getElementById(tlz+'lock'+cc).style.background="#000";
		
		lockCC[gearN-1][tlz-1][cc-1] = 0;
		if(liblux == 1)vCCON[tlz-1][cc-1] = 0;		 
		 
		 
		document.getElementById(tlz+'ctrl'+cc).style.background="#FFFFFF";		
		document.getElementById(tlz+'ctrl'+cc).style.color="#000";
	}
	
	// ws.send(JSON.stringify({ event:'mutecc', room:gearCode[gearN-1], lockcc: lockCC[gearN-1][tlz-1] , toolid: tlz }));  
 
	
}



///////////// !!!!!!!  ABOUT SEND TO OTHER GEAR 

// const io = require('socket.io')(server);

 
// const userMap = new Map();

// io.on('connection', (socket) => {
    // console.log(`User connected: ${socket.id}`);

 
    // socket.on('identifySpecialUser', () => {
        
        // userMap.set('specialUserId', socket.id);
        // console.log(`Special user identified: ${socket.id}`);
    // });

  
    // socket.on('sendMessageToSpecialUser', (message) => {
    
        // const specialUserId = userMap.get('specialUserId');

 
        // if (specialUserId) {
            // io.to(specialUserId).emit('message', message);
        // } else {
            // console.log('Special user not identified yet');
        // }
    // });

    // socket.on('disconnect', () => {
        // console.log(`User disconnected: ${socket.id}`);

      
        // if (socket.id === userMap.get('specialUserId')) {
            // userMap.delete('specialUserId');
            // console.log('Special user disconnected');
        // }
    // });
// });
function sendroute()
{
		
	var val = Number(document.getElementById('route').value);
	
	// if(val==0)ws.send(JSON.stringify({ event:'routegear', room:gearCode[gearN-1], route: "null" }));  
   // else ws.send(JSON.stringify({ event:'routegear', room:gearCode[gearN-1], route: gearCode[val-1] }));  
 
	
	console.log(gearN , val);
	routeGear[gearN-1]=val;

}

function midibrowser()
{
	
	senddin[gearN-1] = 0;
	sendusb[gearN-1] = 0;	
	resend[gearN-1]  = 1;	
	sendmidi = 3;
	
	document.getElementById('mididin').style.background="#000";	
	document.getElementById('midiusb').style.background="#000";	
	document.getElementById('sdback').style.background="#FF4400";
	document.getElementById('midiDevices').style.display="";
	document.getElementById('midiDevicesin').style.display="none";	
	
	// ws.send(JSON.stringify({ event:'sendmidi', room:gearCode[gearN-1], state: 3}));  
	

}


function mididin()
{
	senddin[gearN-1] = 1;
	sendusb[gearN-1] = 0;	
	resend[gearN-1]  = 0;
	sendmidi = 1;
		
	document.getElementById('mididin').style.background="#FF4400";	
	document.getElementById('midiusb').style.background="#000";	
	document.getElementById('sdback').style.background="#000";		
	
	document.getElementById('midiDevices').style.display="none";
	document.getElementById('midiDevicesin').style.display="none";	
	
	// ws.send(JSON.stringify({ event:'sendmidi', room:gearCode[gearN-1], state: 1}));  
	
	
	// if(senddin[gearN-1] == 0)
	// {
		// resend[gearN-1] = 1;
		// sendback();
		
		// resendcc[gearN-1] = 1;
		// sendbackcc();
		
		// senddin[gearN-1] = 1;
		// document.getElementById('mididin').style.background="#FF4400";
		// document.getElementById('mididin').innerHTML	="&nbsp;ON &nbsp; ";

		
		// socket.emit('sendmididin', { room:gearCode[gearN-1], state: 1});  
 
    // }
	// else
	// {
		
		// senddin[gearN-1] = 0;
		// document.getElementById('mididin').style.background="#000";
		// document.getElementById('mididin').innerHTML	="&nbsp;OFF&nbsp;";			
		// socket.emit('sendmididin', { room:gearCode[gearN-1], state: 0}); 		
    // }		
	
	
}

function midiusb()
{
	senddin[gearN-1] = 0;
	sendusb[gearN-1] = 1;	
	resend[gearN-1]  = 0;
	sendmidi = 2;
	
	document.getElementById('mididin').style.background="#000";	
	document.getElementById('midiusb').style.background="#FF4400";	
	document.getElementById('sdback').style.background="#000";

	document.getElementById('midiDevices').style.display="none";
	document.getElementById('midiDevicesin').style.display="";	
	
//	ws.send(JSON.stringify({ event:'sendmidi',  room:gearCode[gearN-1], state: 2}));  
	
}


function calibrate()
{
	return;
	pingtime = new Date();
	//ws.send(JSON.stringify({ event:'calibrate', room:gearCode[gearN-1], calibrate: 1}));  
}




function authmidi()
{

	
	setCookie("authmidiusage", 1 , 1000);
	
	startMidi();
	
}	


function startMidi()
{
	// return;
	 document.getElementById("splashmidi").style.display="none";
 
	 console.log("midi stazrt");
	 
	 listMIDIDevices();
	 
	 navigator.requestMIDIAccess({ sysex: true })
  .then((midiAccess) => {
	  console.log("change ");
  // if (midiAccess.sysexEnabled) {
   // console.log("SYSEX OK !!");
  // }
    midiAccess.onstatechange = handleMIDIDeviceChange;
  })
  .catch((error) => {
    console.error('Error accessing MIDI devices:', error);
  });
	
}	




// (function () {
		
		// var oldLog = console.log;
		// console.log = function (message) {
			// updateConsoleOutput('log', message);
			// oldLog.apply(console, arguments);
		// };

		// var oldError = console.error;
		// console.error = function (message) {
			// updateConsoleOutput('error', message);
			// oldError.apply(console, arguments);
		// };

		// var oldWarn = console.warn;
		// console.warn = function (message) {
			// updateConsoleOutput('warn', message);
			// oldWarn.apply(console, arguments);
		// };

	  
		// function updateConsoleOutput(type, message) {
			// var consoleOutput = document.getElementById('consoleOutput');
			// if (consoleOutput) {
				// consoleOutput.innerHTML += '<p class="' + type + '">' + message + '</p>';
				// consoleOutput.scrollTop = consoleOutput.scrollHeight;
			// }
		// }
	// })();
	

	
 function octplus(nn)
 {	
	 
	let ln = lnScale[gearN-1][nn-1];
 
	var arr = Array.from(listScale[gearN-1][nn-1]);
	    
 
    		
	for (let i = 1; i <= 8; i++) 
	{
		
		let tnt = (arr[i-1])+12;
		
		
		while(tnt> 127 )tnt =tnt-12;
		
		
		 listScale[gearN-1][nn-1][i-1] = tnt;  
		 
		 let oct = Math.floor( tnt/12 );
		 
		 let elm =document.getElementById(nn+'octo'+i) 
		 if(elm)elm.value=oct;

	}		
		

  
 
	
	let arr2;
	
		for (let i = 1; i <= 8; i++) 
		{
			arr2=[ 143, 80 + ((nn-1)*8) +  (i- 1) , listScale[gearN-1][nn-1][i-1] ];
			sendMidiUsb(arr2); 
	 
			
		}		

 // sendTool(gearN,nn);

}	  
 
 
 
 function octminus(nn)
 {
	 
	let ln = lnScale[gearN-1][nn-1];
 
	var arr = Array.from(listScale[gearN-1][nn-1]);
	    
	var exs =0;
	

    		
	for (let i = 1; i <= 8; i++) 
	{
		
		let tnt = (arr[i-1])-12;
		
		while(tnt<0)tnt = tnt + 12;
		
		
	    var oct= Math.floor(tnt / 12);
			
		listScale[gearN-1][nn-1][i-1] = tnt;	
		
		 let elm =document.getElementById(nn+'octo'+i) 
		 if(elm)elm.value=oct;
		 
	}		
		
 
 
	
 
   		for (let i = 1; i <= 8; i++) 
		{
			let arr2=[ 143, 80 + ((nn-1)*8) +  (i- 1) , listScale[gearN-1][nn-1][i-1] ];
			sendMidiUsb(arr2); 
	 
		}		

    
	// sendTool(gearN,nn);

	 
 }	
 
 
 
 
 function octplus2(nn)
 {	
	 
	let ln = lnScale[gearN-1][nn-1];
 
	var arr = Array.from(listScale[gearN-1][nn-1]);
	    
	var exs =0;
	
    		
	for (let i = 1; i <= 8; i++) 
	{
		
		let tnt = (arr[i-1])+12;
	    var oct= ((tnt-30)/12).toFixed(0);
			
		
		if(oct  > 8){exs=1;  }
	}		
		

	if(exs == 0)
	{
		for (let i = 1; i <= 8; i++) 
		{
			
			 tnt = (arr[i-1])+12;
			 oct= ((tnt-30)/12).toFixed(0);
			 
			 let elm =document.getElementById(nn+'octo'+i) 
			 if(elm)elm.value=oct;
			 listScale[gearN-1][nn-1][i-1] = tnt;

		}	
	}	 
	
	console.log( listScale[gearN-1][nn-1] );
	
	
	let arr2;
	
		for (let i = 1; i <= 8; i++) 
		{
			arr2=[ 143, 80 + ((nn-1)*8) +  (i- 1) , listScale[gearN-1][nn-1][i-1] ];
			sendMidiUsb(arr2); 
			console.log( arr2 );
			
		}		
		
		
		
		
		

 // sendTool(gearN,nn);

}	 
 
 function octminus2(nn)
 {
	 
	let ln = lnScale[gearN-1][nn-1];
 
	var arr = Array.from(listScale[gearN-1][nn-1]);
	    
	var exs =0;
	

    		
	for (let i = 1; i <= 8; i++) 
	{
		
		let tnt = (arr[i-1])-12;
	    var oct= ((tnt-30)/12).toFixed(0);
			
			
		if(tnt  < 24){exs=1; console.log(tnt); }
	}		
		

	if(exs == 0)
	{
		for (let i = 1; i <= 8; i++) 
		{
			
			 tnt = (arr[i-1])-12;
			 oct= ((tnt-30)/12).toFixed(0);
			 
			 if(oct == -0)oct=0;
			 console.log(  oct );
			 if(oct < 0)oct=0;
			 
				 let elm =document.getElementById(nn+'octo'+i) 
				 if(elm)elm.value=oct;
			 listScale[gearN-1][nn-1][i-1] = tnt;

		}	

	}

 
 	console.log(  listScale[gearN-1][nn-1]);
	
	
 
   		for (let i = 1; i <= 8; i++) 
		{
			let arr2=[ 143, 80 + ((nn-1)*8) +  (i- 1) , listScale[gearN-1][nn-1][i-1] ];
			sendMidiUsb(arr2); 
			
			console.log( arr2 );
		}		

    
	// sendTool(gearN,nn);

	 
 }	
 
 
 
 function changebendtrig(val)
{

	// ws.send(JSON.stringify({ event:'bendtrig', room:gearCode[gearN-1], state: val }));  
 
	
}

function movebendtrig(val)
{
	
	document.getElementById("bendtrigmon").innerHTML = val;
	

}


 
 function changebendspeed(val)
{

	//  ws.send(JSON.stringify({ event:'bendspeed', room:gearCode[gearN-1], state: val }));  
 
	
}

function movebendspeed(val)
{
	
	document.getElementById("bendspeedmon").innerHTML = val;
	

}


function flipbend(nn,stt)
{	 

 
    if(stt != 0)armnn[nn-1] = stt;
	
    if(stt == 1)
	{
		runCC =1;
	document.getElementById ("bend" + nn).style.background="#ff4400";
	// ws.send(JSON.stringify({ event:'bend', room:gearCode[gearN-1], state: stt, tool : nn }));  		
	}
    else
	{
	 runCC = 0;
	 var col = document.getElementById ("bend" + nn).style.background;		
	
	  if(col =="rgb(255, 68, 0)")
		{			
		ws.send(JSON.stringify({ event:'bend', room:gearCode[gearN-1], state: stt, tool : nn })); 
		document.getElementById ("bend" + nn).style.background="black";
		if(libsound == 1)bendOff(nn-1);
		}

    }
}

function flipdouble(nn,stt)
{	 
	
	// ws.send(JSON.stringify({ event:'noteout', room:gearCode[gearN-1], state: stt, tool : nn }));  
    if(stt == 1)document.getElementById ("double" + nn).style.background="#ff4400";
    else document.getElementById ("double" + nn).style.background="black";

}


    // Force landscape orientation
    window.addEventListener('orientationchange', function () {
        if (window.orientation === 0 || window.orientation === 180) {
       document.getElementById ("portrait").style.display="flex";
	   }
	  else document.getElementById ("portrait").style.display="none"; 
    });

   function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Function to force full screen on mobile devices
	///////// = ONLOAD !!! 
	
	
    function forceFullScreen() {
        if (isMobile()) {
         //   document.documentElement.requestFullscreen();
			
		if (window.orientation === 0 || window.orientation === 180) {
       document.getElementById ("portrait").style.display="flex";
	   }
	  else document.getElementById ("portrait").style.display="none"; 	
        }
		
		calibrate();
    }

    // Force full screen on page load
    window.addEventListener('load', forceFullScreen);

    // Force full screen on orientation change
    window.addEventListener('orientationchange', forceFullScreen);

    // Force full screen on click (you can customize this part)
    document.documentElement.addEventListener('click', forceFullScreen);
	
	
function flipvgear(nn)
{
	if(nn == 1)
	{
		document.getElementById("fake").style.display="";
		document.getElementById("vgear").style.background="#FF4400";		
	}
	else 
	{
		document.getElementById("fake").style.display="none";
		document.getElementById("vgear").style.background="#000";		
	}	
}	


    function playvgear(height, posY) {
      // Calculate the percentage based on posY and height
      var percentage = (posY / height) * 100;
	  
      console.log('Clicked at ' + percentage.toFixed(2) + '%');
    }
	
	
function playthisnote(gr,tlz,nn)// for MIDI mapping ableton
{
 setnn[tlz - 1] = nn-1;
 settool = tlz - 1;
 //setcc =  
 
   // console.log(gr,tlz,nn);
   // console.log(143 +  chan [gr-1][tlz-1], listScale[gr-1][tlz-1][nn-1] , 127 );   
   
    sendMIDIMessage( 143 +  chan [gr-1][tlz-1], listScale[gr-1][tlz-1] [nn-1], 127  );
    sendMIDIMessage( 127 +  chan [gr-1][tlz-1], listScale[gr-1][tlz-1] [nn-1], 0  );	
 
}	
	
	
function directchange(nn)
{
	
	if(flagdir[gearN-1][nn-1] == 0)
    {	
	document.getElementById("beatfader"+nn).style.background="#ff4400"; 
	flagdir[gearN-1][nn-1] = 1;
	}
    else	
    {	
	document.getElementById("beatfader"+nn).style.background="#000"; 
	flagdir[gearN-1][nn-1] = 0;
	}	


//	ws.send(JSON.stringify({ event:'directchange', room:gearCode[gearN-1], state: flagdir[gearN-1]}));   
		
}
	
	
	
function startSplash()
{
	
	
//	Tone.start();
	
    initsound();
   
	

   libsound = 1;
   soundon = 1;	
   
   document.getElementById("soundbt").style.background="#ff4400";
   document.getElementById("splashsound").style.display="none";
   
}



	
function startsound()
{
	
	flipSoundOn(true); 
	document.getElementById("splashsound").style.display="none";
	return;
	

  if( libsound == 0 )
  {
 // soundScript.src = "https://cdn.jsdelivr.net/npm/tone@latest";  	  
	  

  let  soundScript; 
 
 
	  soundScript = document.getElementById("sound-js-script");
	if (soundScript) {
		soundScript.parentNode.removeChild(soundScript);
		console.log("remove old")
	}
	
	
	soundScript = document.createElement('script');
 
 
 soundScript.src = scriptUrl+"?v=" + Date.now();
 // soundScript.id = "sound-js-script"; 
 // soundScript.onload = initializeTone; 
  document.head.appendChild(soundScript);
  
 
   libsound = 1;
   
  }
  else flipSoundOn(true);  
    
 }


// function startsound()
// {
	 // initializeTone; 

	

  // if( libsound == 0 )
  // {
  // document.getElementById("soundbt").style.background="#ff4400";
  // document.getElementById("splashsound").style.display="none";
  
  // const soundScript = document.createElement('script');

 
 // soundScript.src = "sound-js.js?v=" + Date.now();


  // document.head.appendChild(soundScript);
    
  
   // libsound = 1;
   // soundon = 1;
   
  // }
  // else flipsoundon();  
    
 // }


function mapval(value, fromMin, fromMax, toMin, toMax) 
{
  
  let percentage = (value - fromMin) / (fromMax - fromMin);
  
  let ret = Number(toMin + percentage * (toMax - toMin));
  
  return ret;
  
}


// function maplog(value, minValue, maxValue, outMinValue, outMaxValue) {
	
     // if (value === 0) return outMinValue;  
     // if (value === 127) return outMaxValue;  

	
    // let normalizedValue = value / 127;
  
    // let scaledValue = Math.pow(10, normalizedValue * Math.log10(outMaxValue / outMinValue));

    // let mappedValue = outMinValue + (outMaxValue - outMinValue) * (scaledValue - minValue) / (maxValue - minValue);

    // return mappedValue;
// }


function maplog(value, minValue, maxValue, outMinValue, outMaxValue) {
    if (value === 0) return outMinValue;  
    if (value === 127) return outMaxValue;  

    let normalizedValue = value / 127;
    let scaledValue = Math.pow(10, normalizedValue * Math.log10(outMaxValue / outMinValue));
    let mappedValue = outMinValue * Math.pow((outMaxValue / outMinValue), normalizedValue);  

    return mappedValue;
}
 
function parseSettings(sets)
{
 
	
	if(sets == "undefined")return;
	
 
 
	gearCode[0] = sets.gear1;
	gearCode[1] = sets.gear2;	
	gearCode[2] = sets.gear3;
	gearCode[3] = sets.gear4;
	
 
	
	document.getElementById('grc').value = sets.gear1;
	
	document.getElementById('wf'+1).value = sets.wf1;
	document.getElementById('pss'+1).value = sets.pss1;
	document.getElementById('wf'+2).value = sets.wf2;
	document.getElementById('pss'+2).value = sets.pss2;
	
    document.getElementById('route').value = sets.sendtogear;
	
	sendmidi = sets.sendmidi;
	thedevice = sets.browserout;
	
	if(sendmidi == 1)
	{
		senddin[gearN-1] = 1;
		sendusb[gearN-1] = 0;	
		resend[gearN-1]  = 0;
			
		document.getElementById('mididin').style.background="#FF4400";	
		document.getElementById('midiusb').style.background="#000";	
		document.getElementById('sdback').style.background="#000";		
		
		document.getElementById('midiDevices').style.display="none";				
	}
	else if(sendmidi == 2)
	{
	senddin[gearN-1] = 0;
	sendusb[gearN-1] = 1;	
	resend[gearN-1]  = 0;	
	
	document.getElementById('mididin').style.background="#000";	
	document.getElementById('midiusb').style.background="#FF4400";	
	document.getElementById('sdback').style.background="#000";

	document.getElementById('midiDevices').style.display="none";				
	}
	else if(sendmidi == 3)
	{
		senddin[gearN-1] = 0;
		sendusb[gearN-1] = 0;	
		resend[gearN-1]  = 1;	
		
		document.getElementById('mididin').style.background="#000";	
		document.getElementById('midiusb').style.background="#000";	
		document.getElementById('sdback').style.background="#FF4400";
		document.getElementById('midiDevices').style.display="";
	}	
	// ws.send(JSON.stringify({ event:'sendmidi',  room:gearCode[gearN-1], state: sendmidi}));  	
	
	
	document.getElementById("maxcm").value = sets.cmmax;
	document.getElementById("cmmon").innerHTML = sets.cmmax;	
	
    document.getElementById("speedultra").value = sets.freqcc;
	document.getElementById("speedmon").innerHTML =	sets.freqcc;
	
	document.getElementById("bendtrig").value = sets.bendtrig;
	document.getElementById("bendtrigmon").innerHTML = sets.bendtrig;
	
	document.getElementById("bendspeed").value = sets.bendspeed;
	document.getElementById("bendspeedmon").innerHTML = sets.bendspeed;


	// ws.send(JSON.stringify({ event:'calibre',  room:gearCode[gearN-1], cm: sets.cmmax }));  	
	// ws.send(JSON.stringify({ event:'speedultra', room:gearCode[gearN-1], speed: sets.freqcc }));   		
	// ws.send(JSON.stringify({ event:'bendtrig', room:gearCode[gearN-1], state: sets.bendtrig }));
	// ws.send(JSON.stringify({ event:'bendspeed', room:gearCode[gearN-1], state: sets.bendspeed }));  
 
	
}

function midiToNoteName(midiNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor((midiNote - 12) / 12); // Adjust MIDI note to start from octave 0

    // Get the note name from the noteNames array
    const noteName = noteNames[midiNote % 12];

    return noteName + (octave - 1); // Adjust octave number to start from 0
}


function getFrequency(note) {

    const noteMap = {
        'C': 261.63,
        'C#': 277.18,
        'D': 293.66,
        'D#': 311.13,
        'E': 329.63,
        'F': 349.23,
        'F#': 369.99,
        'G': 392.00,
        'G#': 415.30,
        'A': 440.00,
        'A#': 466.16,
        'B': 493.88
    };

    const octave = parseInt(note.slice(-1)); // Extract octave number
    const noteName = note.slice(0, -1);      // Extract note name

    if (noteName in noteMap) {
        return noteMap[noteName] * Math.pow(2, octave - 4);
    } else {
        throw new Error('Invalid note name');
    }
}


function setccfast(cc)
{
    setcc = cc;
	

	
		for (let i = 0; i <= 3; i++) 
	    {
		if(setcc == i)document.getElementById("lblcc"+i).style.color="gold";
		else  document.getElementById("lblcc"+i).style.color="grey";
        } 
	
}

function flipMpe(nn)
{   
	let col = "#FF4400";
	if(mpe[nn-1]== -1){ mpe[nn-1] = setnn[nn-1]; col = "#FFFFFF";}
	else { mpe[nn-1] = -1; }
	
	document.getElementById("mpe"+nn).style.color = col;
	
}




function goLux()
{

 
 
 	console.log("POSE TRACKER loaded");	
	
  document.getElementById("lux").style.display="";	
	
 //if( liblux == 0 )startVideo();
 
//  if( liblux == 0 )startCam(); 
 
  liblux = 1;
  
  
  
}

  function goFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();   

  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();   

  }
}



// (function() {
  // var logDiv = document.getElementById('console-log-div');
  // var oldLog = console.log;
  // var oldError = console.error;

  // console.log = function(...args) {
    // oldLog.apply(console, args);
    // var msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    // var div = document.createElement('div');
    // div.textContent = msg;
    // logDiv.appendChild(div);
  // };

  // console.error = function(...args) {
    // oldError.apply(console, args);
    // var msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    // var div = document.createElement('div');
    // div.style.color = 'yellow';
    // div.textContent = '[Error] ' + msg;
    // logDiv.appendChild(div);
	
	
	// document.getElementById("extra1").innerHTML = msg;
	
  // };
// })();

window.addEventListener('error', function(event) {
  var logDiv = document.getElementById('console-log-div');
  var div = document.createElement('div');
  div.style.color = 'yellow';
  div.textContent = '[Uncaught Error] ' + event.message + ' at ' + event.filename + ':' + event.lineno;
  logDiv.appendChild(div);
  
  	document.getElementById("extra1").innerHTML += event.message + ' at ' + event.filename + ':' + event.lineno;
  
});






function sendMidiUsb(arr)
{	
	if(!midiOutput)return;
	midiOutput.send(arr);
	
}


function newBpm( val  )
{

	let bpmLSB = val & 0x7F;           // Lower 7 bits
	let bpmMSB = (val>> 7) & 0x7F;    // Upper 7 bits
	
	let arr=[143,2,bpmLSB];
	sendMidiUsb(arr);
	
	arr=[143,3,bpmMSB];
	sendMidiUsb(arr);
	
}




function selectTrack( val, idx )
{
	console.log("selTrack " + idx );
	
	val = document.getElementById("mytracklist").options[idx].text;
	
      numTrack = idx;
	  let rpl = idx + 1;
	  rpl=rpl+"";
	  
	 
	  
	  let val2 = val.replace(" \u00A0\u00A0 " , "" );
	  
	  val2 = val2.replace(rpl , "" );
 
	if(val == rpl)document.getElementById("mytrack").value = "";
	else document.getElementById("mytrack").value = val2;
	

	 sendTrackNum(idx);	
	
	
	let tpSound = getCookie("templateSound-" + rpl);
	
		
	if( tpSound)
	{
		
		loadSound(tpSound);
		
	}
}

function changeTextSelect( txt )
{
	console.log(txt);
	
	// let sel = document.getElementById("mytracklist");
	// let idx = sel.selectedIndex;
	
	// sel.options[idx].textContent = (idx + 1) + " " +  "\u00A0"   + " " +  txt;
	// sel.options[idx].value = txt;
	
	  
	
}



function sendTrackNum(idx)
{	
	arr=[143,1,idx];
	sendMidiUsb(arr);	
}


function sendTrack() // SAVE TRACK
{
	
	let name = document.getElementById("mytrack").value;
	
	if(!name){ alert("Need a name for the template"); return; }
	
	 numTrack = document.getElementById("mytracklist").value;	
	
	arr=[143,24,numTrack];
	sendMidiUsb(arr);	
	
	let sel = document.getElementById("mytracklist");
	let idx = sel.selectedIndex;
	
	sel.options[idx].textContent = (idx + 1) + " "+  "\u00A0"  +  "\u00A0"   + " " +  name +  "\u00A0" ;
	sel.options[idx].value = idx + 1;
	
	
	setCookie("templateName-" + numTrack , name);
	
	
	if( currentSound != null &&  flagSoundOn == true)
	{
		
		setCookie("templateSound-" + numTrack , currentSound);
		
	}
	
}

function fillTrackList()
{
	 
	
	let sel = document.getElementById("mytracklist");	
	sel.innerHTML="";
	
	for (let i = 1; i <= 16; i++) 
	{

        let txt = getCookie("templateName-" +i);

		if(txt)
		{
		const option = document.createElement('option');
		option.text = i;
		option.value = i;
		option.textContent = (i) + " "+  "\u00A0"  +  "\u00A0"   + " " +  txt +  "\u00A0"  
		sel.appendChild(option);			
		}
		else 
		{
		const option = document.createElement('option');
		option.text = i;
		option.value = i;
		option.textContent = i;		
		sel.appendChild(option);			
		}			

	}

}

 
let lBpm = 0;



function fakeSysex(dt1,dt2,dt3) // RECEIVE
{
	let zero = 0;
	
	// console.log("sysex  ");
	 // console.log(dt1,dt2,dt3);
	 
	 
	if( dt2 == 0)zero = 1;
	else if(dt2 == 1 )
	{
		
		console.log("new bank : " + dt3);
		// selectTrack("kiki", dt3, 1 )
		
		let idx = dt3;
		
		let val = document.getElementById("mytracklist").options[idx].text;
	
      numTrack = idx;
	  let rpl = idx + 1;
	  rpl=rpl+"";
	  
	 	  
	  let val2 = val.replace(" \u00A0\u00A0 " , "" );
	  
	  val2 = val2.replace(rpl , "" );
 
	if(val == rpl)document.getElementById("mytrack").value = "";
	else document.getElementById("mytrack").value = val2;
	

	 // sendTrackNum(idx);	
	
	
	let tpSound = getCookie("templateSound-" + rpl);
	
		
	if( tpSound)
	{
		
		flipSoundOn(true);
		loadSound(tpSound);
		
	}
	else 
	{
		flipSoundOn(false);
		
		for (let track = 1; track <= 4; track++) {
          removeAllCCFX(track);
          }
		
	}
	
	
	document.getElementById("mytracklist").value = rpl;
	

	
		/////////////////////////////////////////////////////////////////
		
		// numTrack = dt3;
		// document.getElementById("mytracklist").selectedIndex = dt3;
		
		// let val = document.getElementById("mytracklist").options[dt3].textContent;
		// let val2 = val.replace(" \u00A0 " , "" );
	
      // let idx = dt3;	
	  // let rpl = idx + 1;
	  // rpl=rpl+"";
 
		// if(val == rpl)document.getElementById("mytrack").value = "";
		// else document.getElementById("mytrack").value = val2;
		
		// console.log("SYSEX load track : " + rpl );
			
	}
	else if(dt2==2)lBpm = dt3;
	else if(dt2==3)
	{
		let mBpm = dt3;
		bpm = (mBpm << 7) | lBpm;
		document.getElementById("mybpm").value = bpm;
	}
	else if(dt2 < 8)
	{
		chan[gearN-1][Number(dt2)-4]=Number(dt3);
		document.getElementById("chan" + (dt2-3) ).value = dt3;
	}
    else if(dt2 < 24 )
    {      
		dt2 = dt2 - 8;
	   let c = Math.floor(dt2 / 4);
	   let i = dt2%4;
	   allCC[gearN-1][c][i] = dt3;
		document.getElementById( (c+1) + "cc" + (i+1) ).value = dt3;	       
		
		
		
    } 	
	else if( dt2 >= 32 && dt2 < 36 )
	{
		console.log( dt2, dt3 );
	}
	else if( dt2 >= 36 && dt2 < 40 )
	{
		console.log( dt2, dt3 );
	}
	else if( dt2 >= 52 && dt2 < 68 )//ccmax
	{
		dt2 = dt2 - 52;
	   let c = Math.floor(dt2 / 4);
	   let i = dt2%4;
		arrCCmax[c][i] = dt3;
		
	}	
    else if(dt2 > 71 && dt2 < 76 )
	{
		document.getElementById("scale" + (dt2-71) ).value = dt3;	     		
		
		lnScale[gearN-1][dt2-72]=Number(dt3);
		
	   // drawScale(dt2-71,Number(dt3));
		
	}
	else if( dt2>79 && dt2 < 112 )
    {
            dt2 = dt2 - 80;
           let c = Math.floor(dt2 / 8);
           let i = dt2%8;
           listScale[gearN-1][c][i] = dt3;
		   
		  //  console.log(c+1,lnScale[gearN-1][c]);		   
		   
	    if(i == 7)drawScale(c+1,lnScale[gearN-1][c]);		   
		   
    }
		else if( dt2 >= 112 && dt2 < 128 )//ccmax
	{
		dt2 = dt2 - 112;
	   let c = Math.floor(dt2 / 4);
	   let i = dt2%4;
		arrCCmin[c][i] = dt3;
		
	}
	
	
}

fillTrackList();