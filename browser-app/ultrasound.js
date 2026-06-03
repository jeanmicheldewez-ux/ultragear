// Global variables to store tracks and count
let tracks = [];
// let tones =[];
let trackCount = 0;
let actualTrack = 0;
let flagNewTone = false;
let flagChangeTone = false;
let exActualTrack = 0;
let soundInit = false;
let isKeyPressed = false;
let countFX = [];
let osc = [];
let CC = [];

let actualSample = [];

let currentSound = null;

let flagSoundOn = false;


const waveforms = ["sine", "square", "triangle", "sawtooth", "pulse", "pwm"];

const filterType = [ "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass","peaking"];
// const filters = [
  // { label: '⌦', value: 'lowpass' },
  // { label: '⌧', value: 'highpass' },
  // { label: '≋', value: 'bandpass' },
  // { label: '∿-', value: 'lowshelf' },
  // { label: '-∿', value: 'highshelf' },
  // { label: '≠', value: 'notch' },
  // { label: '◍', value: 'allpass' },
  // { label: '⊖', value: 'peaking' }
// ];
// const filterSelect = new Nexus.Select('#filterType', {
  // options: filters.map(f => f.label)
// });

// const labelToFilter = Object.fromEntries(filters.map(f => [f.label, f.value]));

// filterSelect.on('change', v => {
  // const filter = labelToFilter[v.value];
  // console.log('Selected filter:', filter);
 
// });

const noise = [ "white","pink","brown" ];

let piano = null;


for (let i = 1; i <= 10; i++) {
  waveforms.push(`square${i}`, `sawtooth${i}`, `triangle${i}`);
}
  

async function initTone() {
    // Reverse your condition logic
    if (soundInit === true) {
        return; // Exit if already initialized
    }
    
    document.getElementById("soundon").checked = true;    
    
    console.log("tone starting");
    
    try {
        await Tone.start(); // This needs to be in an async function
        Tone.context.latencyHint = "interactive";
        Tone.context.lookAhead = 0;
        
        soundInit = true; // Mark as initialized
        console.log("Tone.js initialized with low latency settings");
        
        // Ensure default sample exists in local DB
        await ensureDefaultSample();
        
    } catch (error) {
        console.error("Audio context initialization failed:", error);
    }
}


async function ensureDefaultSample() {
    try {
        // Check if "Amen-break.wav" exists in IndexedDB
        const allSamples = await getAllLocalSamples();
        const hasAmenBreak = allSamples.some(name => 
            name.toLowerCase().includes("amen-break") || 
            name.toLowerCase().includes("amen_break") ||
            name === "Amen-break.wav"
        );
        
        if (!hasAmenBreak) {
            console.log("Amen-break.wav not found in local DB, downloading...");
            
            // Fetch the sample file
            const response = await fetch("./Amen-break.wav");
            if (!response.ok) {
                throw new Error(`Failed to fetch Amen-break.wav: ${response.status}`);
            }
            
            const blob = await response.blob();
            const file = new File([blob], "Amen-break.wav", { type: blob.type });
            
            // Save to IndexedDB
            await saveSampleToDB(file);
            console.log("Amen-break.wav saved to local database");
        } else {
            console.log("Amen-break.wav already exists in local database");
        }
    } catch (error) {
        console.error("Error ensuring default sample:", error);
        // Don't throw - this shouldn't break the app
    }
}





	function isMobileDevice() {
    // Regular expression to detect mobile devices
    const mobileRegex = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|WPDesktop/i;

    // Check user-agent string
    return mobileRegex.test(navigator.userAgent);
    }


	var mobile = isMobileDevice();


function addPiano() 
{
	return;
  const trackContainer = document.createElement('div');
  trackContainer.className = 'piano ';//hidden
  trackContainer.id = 'piano';
	trackContainer.onclick = () => {
	  console.log("click");
	};
  document.getElementById('mytracks').appendChild(trackContainer);

  let mesure = document.getElementById('bars');
  let widthInPixels = mesure.clientWidth - 10;
  // getElementById('mytracks')
  
  
  if( widthInPixels < 0 )return;
  
  console.log( widthInPixels );
  

  piano = new Nexus.Piano('#piano', {
    'size': [widthInPixels, 100],
    'mode': 'button',
    'lowNote': 12,
    'highNote': 118,
  });

    piano.colorize("dark", "#882200");

	 

 piano.on('change', function(v) {
    const midiNumber = v.note;
    const noteName = getNoteName(midiNumber);
 
    if (v.state) {
        // Note pressed
        if (!activeNotesStack.includes(midiNumber)) {
            activeNotesStack.push(midiNumber);
		
        }

        // Monophonic voice stealing
        const newestNote = activeNotesStack[activeNotesStack.length - 1];
        if (newestNote !== currentMidiNote) {
            if (currentMidiNote !== null) {
                noteOff(getNoteName(currentMidiNote), actualTrack);
                piano.toggleKey(currentMidiNote, false); // Update visual
            }
            currentMidiNote = newestNote;
            noteOn(getNoteName(currentMidiNote), actualTrack);
        }
    } else {
        // Note released
        const index = activeNotesStack.indexOf(midiNumber);
        if (index !== -1) {
            activeNotesStack.splice(index, 1);
        }

        if (midiNumber === currentMidiNote) {
            if (activeNotesStack.length > 0) {
                // Fall back to previous note
                const previousNote = activeNotesStack[activeNotesStack.length - 1];
                currentMidiNote = previousNote;
                noteOn(getNoteName(previousNote), actualTrack);
            } else {
                noteOff(getNoteName(currentMidiNote), actualTrack);
                currentMidiNote = null;
            }
        }
    }
 });
  
  console.log(piano);
  
}




function plusTrack( ) 
{
	 
	let trackCountHere = trackCount;
	countFX.push(0);

	// Create the track container
	const trackContainer = document.createElement('div');
	trackContainer.className = 'onetrack';
	trackContainer.id = 'track-' + trackCount;
	trackContainer.style.height = "170px";

	// Use event delegation for the container's click event
	trackContainer.addEventListener('click', function (event) {
		// Check if the clicked element is the container itself or one of its children
		const isContainerClicked = event.target === trackContainer;
		const isChildClicked = event.target.closest('.onetrack') === trackContainer;

		if (isContainerClicked || isChildClicked) {
			if (!tracks[trackCountHere].tones) return;

			if (actualTrack != trackCountHere) {
				actualTrack = trackCountHere;
				noteOff("C4", exActualTrack);
				exActualTrack = trackCountHere;
			}
		}
	});

	document.getElementById('mytracks').appendChild(trackContainer);
	

  
  trackContainer.addEventListener('mouseover', showId);
  trackContainer.addEventListener('mouseout', hideId);


    const osci = document.createElement('div'); 
    osci.classList.add('osc');	
    osci.id = 'osc-' + trackCount;  
    trackContainer.appendChild( osci );  
	
	
	osc[trackCount] = new Nexus.Oscilloscope('osc-' + trackCount,{
  'size': [200,30]
   })
   
   
      
    const valu = document.createElement('div'); 
    valu.classList.add('valu');	
    valu.id = 'valu-' + trackCount;  
	 
    trackContainer.appendChild( valu );  



   const plusTone = document.createElement('span');
  // plusTone.className = 'btnPlusTone';
   plusTone.classList.add('btnPlusTone');
  // if(mobile) plusTone.classList.add('font40');
   plusTone.id = 'plustone-' + trackCount;
   plusTone.innerHTML = "+"; 
 
   let thisCount = trackCount;
 
   plusTone.onclick = function() 
   {
     flipFX(thisCount);
   };
   
   trackContainer.appendChild( plusTone );
   
   
   
   const changetone = document.createElement('span');
   changetone.classList.add('btnChangeTone');
  //  if(mobile) changetone.classList.add('font40');
	
	 changetone.id = 'changetone-' + trackCount;
   changetone.innerHTML = "♻"; 
   
  
   changetone.onclick = function() 
   {
     flipNewTone(thisCount,1);
   };
   
   trackContainer.appendChild( changetone );
   
   
    trackContainer.addEventListener('scroll', () => {
    plusTone.style.transform = `translateX(${trackContainer.scrollLeft - 15}px)`;
    changetone.style.transform = `translateX(${trackContainer.scrollLeft - 15}px)`;	
    });
     
     plusTone.style.transform = `translateX(${trackContainer.scrollLeft - 15}px)`;
    changetone.style.transform = `translateX(${trackContainer.scrollLeft - 15}px)`;	
   
      plusTone.style.display = "none";  
	  changetone.style.display = "none";  
   
   const volTone = document.createElement('div');
   volTone.className = 'targetVol';
   volTone.id = 'targetVol-' + trackCount;  
   trackContainer.appendChild(  volTone );	   

	var multislider = new Nexus.Multislider('#targetVol-'+trackCount,{
	 'size': [15,80],
	 'numberOfSliders': 1,
	 'min':-24,
	 'max': 4,
	 'step': 0.2,
	 'candycane': 2,
	 'values': [0.8],
	 'smoothing': 0.3,
	 'mode': 'bar'  // 'bar' or 'line'
	});
	
	
	
	multislider.on('change',function(v) {	
 
		 if(tracks[trackCountHere].tones != null )
		 {

			
			let vol = v[0];
			if( vol < -22 )tracks[trackCountHere].tones.disconnect();
			else  
			{
               if(!tracks[trackCountHere].tones.connected) 
			   {
                    tracks[trackCountHere].tones.toDestination();
               }
			}
			
		 tracks[trackCountHere].tones.set({ volume:v[0]}); 
	 
			 
		 }		 

     })	
	
 
	

   const numTrack = document.createElement('div');
   numTrack.className = 'numTrack';
   numTrack.id = 'numTrack-' + trackCount;  
   numTrack.innerHTML= trackCount + 1;
   trackContainer.appendChild(  numTrack );	    

    // var textbutton = new Nexus.TextButton('#numTrack-'+trackCount,{
    // 'size': [20,20],
    // 'state': true,
    // 'text': trackCount + 1,
    // 'alternateText': 'M'
	// })


    const trackOsc = document.createElement('div'); 
	trackOsc.id = 'trackosc-' + trackCount;	
	trackOsc.className = 'trackosc';
	trackContainer.appendChild(trackOsc);
    
   	  const trackObject = {
		trackCount: trackCount,
		trackId:'track-' + trackCount,
		trackNum:tracks.length + 1,
		tones:null,
		fx:[],
		nexus:[],
		nexusFX:[],
		nexusColor:[],
		links:[],
		triggers:[],
		idfx:[],
		vol:multislider,
		 sample:null,
		 sampleLen:null
	  }; 
   
   
   
	  tracks.push(trackObject);
 		   
		function showId(event) {
			if( event.target.id =="" )return;
			//console.log( event.target.id.split("-"));
		 let spl = event.target.id.split("-");
		 let  idplus =  "plustone-"+spl[1];
		 document.getElementById(idplus).style.display="inline-block"; 
		 let  idchange =  "changetone-"+spl[1];
		 document.getElementById(idchange).style.display="inline-block"; 		 
		}

		function hideId(event) {
		 if( event.target.id =="" )return;
		 let spl = event.target.id.split("-");
		 let  idplus =  "plustone-"+spl[1];
		 document.getElementById(idplus).style.display="none";
		 let  idchange =  "changetone-"+spl[1];
		 document.getElementById(idchange).style.display="none";		 
		}

	//if(trackCount!=0)flipNewTone(trackCount);
	  trackCount++;
}

 
 
function changeToneOsc( str ,smpl)
{
   
	// const trackContainer = document.getElementById('track-' + actualtrack);
	osc[actualTrack].disconnect();
	 
	tracks[actualTrack].tones.disconnect();
		
	addOsc( str,smpl );
	


}




function flipNewTone(idxx,change = 0)
{ 
	
	let idx = Number(idxx);	  
	// console.log(tracks[idx].tones, flagNewTone);
	
	//if(idxx == 0 && change !=1  && flagNewTone == true)return;
	
	if (!tracks[idx] || !tracks[idx].tones )  
	{	
		if( flagNewTone )
		{
			//var cont = document.getElementById('menuSynth');
			// if(idx.target != cont )return;
			
			 document.getElementById("menuSynth").style.display="none";
			 flagNewTone = false;	
			 flagChangeTone = false;
			
		}
		else
		{
			 flagChangeTone = false;
			 document.getElementById("menuSynth").style.display="";
			 actualTrack = idx;
			 flagNewTone = true; 
		}
    }
	else
	{     
             document.getElementById("menuSynth").style.display="";
			 actualTrack = idx;
			 flagNewTone = true; 
			 flagChangeTone = true;
		
	}
	
}

let flagFX = false;

function flipFX(idxx)
{
		let idx = Number(idxx);	
		
	
		if( flagFX)
		{
			var cont = document.getElementById('menuFX');
			// if(idx.target != cont )return;
			
			 document.getElementById("menuFX").style.display="none";
			 flagFX= false;	
			
		}
		else
		{
	 
			 document.getElementById("menuFX").style.display="";
			 actualTrack = Number(idx);
			 flagFX = true;
		}		
	
}

function selectFX(str, event) 
{
	
    event.stopPropagation();
    document.getElementById("menuFX").style.display = "none";
    flagFX = false;
	
	
	 addFX(str);

	
}



function selectOsc(str, event ,smpl) 
{
    if(event)event.stopPropagation();
    document.getElementById("menuSynth").style.display = "none";
    flagNewTone = false;

	
	if( flagChangeTone == false )
	{
	plusTrack();	
	addOsc(str,smpl);		
	}
	else 
	{
	   changeToneOsc(str,smpl);	
	}

	
}


function getMidiNote(noteName) {
  const noteToPC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const modifiers = { '#': 1, 'b': -1 };
  
  const match = noteName.match(/^([A-G])(#|b)?(-?\d+)$/);
  if (!match) return null;
  
  const [, noteLetter, accidental, octave] = match;
  let noteNumber = noteToPC[noteLetter];
  
  if (accidental) {
    noteNumber += modifiers[accidental];
  }
  
  return noteNumber + (parseInt(octave) + 1) * 12;
}


function getNoteName(midiNumber) {
  const octave = Math.floor(midiNumber / 12) - 1;
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return notes[midiNumber % 12] + octave;
}


let baseOctave = 2;
const activeKeys = new Set();
const activeNotes = {}; // Keeps track of which keys are associated with which notes
let currentNote = null; // Tracks the currently playing note (for monophonic behavior)
let activeNotesStack = []; // Tracks pressed MIDI notes in order
let currentMidiNote = null; // Currently playing note
const keyToMidiMap = new Map(); // Tracks keyboard key to MIDI mapping

// Unified Note Handling
function handleNoteOn(midiNumber) {
	
		
	if(!soundInit )return;
	
	if( ! flagSoundOn )return;
    
	
    // Update note stack (last pressed note has priority)
    activeNotesStack = activeNotesStack.filter(n => n !== midiNumber);
    activeNotesStack.push(midiNumber);

    // Only trigger new note if different from current
    if (midiNumber !== currentMidiNote) {
        if (currentMidiNote !== null) {
            noteOff(getNoteName(currentMidiNote), actualTrack);
           // piano.toggleKey(currentMidiNote, false);
        }
        currentMidiNote = midiNumber;
        noteOn(getNoteName(midiNumber), actualTrack);
       // piano.toggleKey(midiNumber, true);
    }
	

}

function handleNoteOff(midiNumber) {
	
	if(!soundInit )return;
	
		if( ! flagSoundOn )return;
    
    activeNotesStack = activeNotesStack.filter(n => n !== midiNumber);

    // Handle note recycling
    if (midiNumber === currentMidiNote) {
        if (activeNotesStack.length > 0) {
            // Fall back to previous note
            const newNote = activeNotesStack[activeNotesStack.length - 1];
            currentMidiNote = newNote;
            noteOn(getNoteName(newNote), actualTrack);
            //piano.toggleKey(newNote, true);
        } else {
            // Silence
            noteOff(getNoteName(currentMidiNote), actualTrack);
            currentMidiNote = null;
        }
    }
    //piano.toggleKey(midiNumber, false);
}


function midiSound( dt1,dt2,dt3 )
{
 
	if( flagSoundOn == false )return;
	
	if(dt1<128)return;
    let vv = dt1%16;	
	let nn = getNoteName(dt2);
	
	if(vv >= tracks.length)return;	
	
	
	let myType = tracks.tone;
	
	console.log( myType );

	
	  if(dt1<144) noteOff( nn,vv  );
	  else if(dt1<160)noteOn( nn,vv );	
      else if(dt1 >= 176 && dt1 < 192 )soundCC( dt1,dt2,dt3 );	
	  else if(dt1 >= 224 && dt1 < 240 )soundBend( dt1,dt2,dt3 );	

}


function soundBend( dt1,dt2,dt3 )
{
	
	   let vv = dt1%16;
	   
        let lsb = dt2;
        let msb = dt3;
        let value = (msb << 7) | lsb;
        let normalized = (value - 8192) / 8192; // Range -1 to +1
        let bendInSemitones = normalized * 5; // e.g. 2 semitone range


   
     const synth = tracks[vv].tones;
    
      if (!synth) return;
   
      synth.detune.value = bendInSemitones * 100; // detune in cents	   

}




let lastTime = 0;


function noteOn(note, nnTrack) {
    if(tracks.length < 1) return;
	
		// console.log(note, nnTrack) 

    const now = Tone.now();
    const synth = tracks[nnTrack].tones;
    
    if (!synth) return;

    // Add a small offset (1ms) to prevent scheduling conflicts
    let safeTime = now + 0.001; 
	

	
	if( safeTime < lastTime )safeTime = lastTime + 0.001; 
	lastTime = safeTime;
 
    if (synth instanceof Tone.NoiseSynth || synth.name === "NoiseSynth"  ) {
        synth.triggerAttack(safeTime);
    } 
	else if(  synth instanceof Tone.Player || synth.name === "Player")
	{

		if( tracks[nnTrack].loop[actualSample[actualTrack]] == true)synth.start(safeTime);  //if(synth.loop == true)
		else
		{
	       let dura = tracks[nnTrack].end[actualSample[actualTrack]] - tracks[nnTrack].start[actualSample[actualTrack]];
		
 //		   let dura = tracks[nnTrack].nexus[3].elem.value - tracks[nnTrack].nexus[2].elem.value;
			if(dura < 0)dura = -dura;

		//	synth.stop(Tone.now());
	        // console.log(dura);
			   // synth.start(tracks[nnTrack].nexus[2].elem.value);
			   // synth.stop(tracks[nnTrack].nexus[3].elem.value);	
			   
			   
			   
			  synth.start(safeTime,tracks[nnTrack].nexus[2].elem.value,dura);
		}			
	}
	else {
        synth.triggerAttack(note, safeTime);
    }

	//	 document.getElementById("piano").classList.remove('hidden');
		 
		 
		  // if(timerPiano) 
		  // {
			  // clearTimeout(timerPiano);
			  // timerPiano = null;
			  
		  // }
		 
	
}

function noteOff(note, nnTrack) {
if(tracks.length < 1)return;
	
    const now = Tone.now();
	
	const synth = tracks[nnTrack].tones;
	
    if (synth != null) 
	{
		if( synth instanceof Tone.Player || synth.name === "Player" )
		{
			synth.stop(now);
		}
		else tracks[nnTrack].tones.triggerRelease(now);		
	}
	

 
}

let timerPiano = null;

document.addEventListener('keydown', (e) => {
	 
	 
	
		if(!soundInit )return;
	
    const key = e.key.toLowerCase();
    if (activeKeys.has(key)) return;

    // Handle octave changes
    if (key === 'w' || key === 'x') {
        baseOctave = Math.max(0, Math.min(8, key === 'w' ? baseOctave - 1 : baseOctave + 1));
        activeKeys.add(key);
        return;
    }

    const noteMap = {
        q: ['C', 0], s: ['D', 0], d: ['E', 0], f: ['F', 0],
        g: ['G', 0], h: ['A', 0], j: ['B', 0], k: ['C', 1],
        l: ['D', 1], m: ['E', 1], a: ['C#', 0], z: ['D#', 0],
        e: ['F#', 0], r: ['G#', 0], t: ['A#', 0], y: ['C#', 1],
        u: ['D#', 1], i: ['F#', 1], o: ['G#', 1], p: ['A#', 1]
    };

    if (noteMap[key]) {
        activeKeys.add(key);
        const [noteName, octaveOffset] = noteMap[key];
        const octave = baseOctave + octaveOffset;
        const fullNote = `${noteName}${octave}`;
        const midiNumber = getMidiNote(fullNote);

        // Store mapping and update state
        keyToMidiMap.set(key, midiNumber);
        handleNoteOn(midiNumber);
		

        
     //   console.log('KeyDown:', key, 'MIDI:', midiNumber, 'Stack:', activeNotesStack);
    }
});


document.addEventListener('keyup', (e) => {
	
		if(!soundInit )return;
	
    const key = e.key.toLowerCase();
    
    if (activeKeys.has(key)) {
        activeKeys.delete(key);
        
        if (keyToMidiMap.has(key)) {
            const midiNumber = keyToMidiMap.get(key);
            handleNoteOff(midiNumber);
            keyToMidiMap.delete(key);
            
          //  console.log('KeyUp:', key, 'MIDI:', midiNumber, 'Stack:', activeNotesStack);
        }
    }



   
    // if (activeKeys.size === 0 && keyToMidiMap.size === 0) {
      // timerPiano =  setTimeout(() => {
            // document.getElementById("piano").classList.add('hidden');
        // }, 1000);
    // }
	
	
});


 
let mySample = [];
 
function sampleLoaded(nn, nu) 
{
  
  var duration = tracks[nn].tones.buffer.duration;
  console.log( nn, " Sample length:", duration, "seconds" );
  tracks[nn].sampleLen = duration;

 	let slider2 = tracks[nn].nexus[2].elem;
	let slider3 = tracks[nn].nexus[3].elem;

 
	slider2.min = 0;
	slider2.max = duration;
	slider3.min = 0;
	slider3.max = duration;

    console.log(nu);

    if (nu === "new") {
        changeMiniSample(nn, 0);
    } else if (nu === "load") {
        // Juste mettre à jour les sliders sans changer les valeurs
        slider2.value = tracks[nn].start[0];
        slider3.value = tracks[nn].end[0];
		changeMiniSample(nn, 0);
    }
	
	
 
    // if(nu == "new")
	// {
  		// for(let i=0; i<1; i++)
		// {
			
			// tracks[actualTrack].start[i] = 0;
			// tracks[actualTrack].end[i] = duration ;
		// }		
	// }
	

	 
	// slider2.set({ value: 0 });
	// slider3.set({ value: duration });

 
  // if (slider2.draw) slider2.draw();
  // if (slider3.draw) slider3.draw();
 
 
 
}


function addOsc(str,smpl = null) 
{	 
	
    let synth;
 
    
 
    // Use a switch statement to create the appropriate synth type
    switch (str) {
        case 'Synth':
            synth = new Tone.Synth();
            break;
        case 'AMSynth':
            synth = new Tone.AMSynth();
            break;
        case 'FMSynth':
            synth = new Tone.FMSynth();
            break;
        case 'MembraneSynth':
            synth = new Tone.MembraneSynth();
            break;
        case 'MetalSynth':
            synth = new Tone.MetalSynth();
            break;
        case 'PluckSynth':
            synth = new Tone.PluckSynth();
            break;
        case 'DuoSynth':
            synth = new Tone.DuoSynth();
            break;
        case 'MonoSynth':
            synth = new Tone.MonoSynth();
            break;
        case 'NoiseSynth':
            synth = new Tone.NoiseSynth();
            break;
        case 'Looper':
            synth = new Tone.Player( "./Amen-break.wav"  );
			synth.loop = true;
            break;			
        case 'Player':
		
	
		
		if( smpl == null)
		{
			tracks[actualTrack].sample="Amen-break.wav";
			synth = new Tone.Player({
			url: "./Amen-break.wav", // "./Amen-break.wav"
			 onload: function() {
			sampleLoaded(actualTrack,"new"); }});
			synth.loop = true;		
		}		
		 else 
		 {
			synth = new Tone.Player();
		 }		

   
			
		
		// if( tracks[actualTrack].sample == null) changeSample();
		// else loadSample(tracks[actualTrack].sample[0],tracks[actualTrack].sample[1]	);
				

			
			

			
			
            break;	    
        default:
            console.error('Unknown synth type:', str);
            return; // Exit the function if the synth type is unknown
    }

   
	if(tracks[actualTrack].fx.length == 0)synth.toDestination();
    else synth.connect(tracks[actualTrack].fx[0]);
	
	 if( tracks[actualTrack].tones )tracks[actualTrack].tones.dispose();
	 tracks[actualTrack].tones = null;
	
	
    tracks[actualTrack].tones = synth;	

   CC[actualTrack] = [];




    osc[actualTrack].connect(tracks[actualTrack].tones);
	

    let params = synth.get();

 

	const orderedParams = ["volume", "detune",  "envelope", "voice0", "voice1",
	"oscillator","harmonicity",  "portamento", "filter", "filterEnvelope",
	"modulationEnvelope", "modulation", "attackNoise","dampening" ,"resonance" ,
	"noise", "loop" , "playbackRate","loopStart","loopEnd"  ];


    trackOsc = document.getElementById("trackosc-" + actualTrack);
	trackOsc.innerHTML = ""; 
	tracks[actualTrack].nexus = [];
	
	let hereTrack = actualTrack;
	
	
	if( str == "Player" )
	{
	const splCont  = document.getElementById("track-" + actualTrack);	
	const mspl = document.createElement('div'); 
	mspl.id = 'mySample-' + actualTrack;	
	mspl.className = 'mysample';
	mspl.innerHTML = "Amen-break";
	mspl.onclick = function(){changeSample(hereTrack);}
	splCont.appendChild(mspl);	
	
	
	const contSpl = document.createElement('div'); 
	contSpl.id = 'contSpl-' + actualTrack;	
	contSpl.className = 'contspl';
 
	splCont.appendChild(contSpl);	

     	
		for(let i=0; i<8; i++)
		{
			
			const miniSpl = document.createElement('span'); 
			miniSpl.id = "minispl-" + hereTrack + "-" + i;
			miniSpl.className = 'minispl';
			miniSpl.innerHTML = i+1;
			
		 	miniSpl.onclick = function(){changeMiniSample(hereTrack,i);}
			
			contSpl.appendChild(miniSpl);	
			
		}
		
		document.getElementById( "minispl-"+hereTrack+"-0").style.background = "#FF4400";
 
    
    if(tracks[actualTrack].loop)  console.log(tracks[actualTrack].start[0] , tracks[actualTrack].end[0] ); 
    else console.log("no exist");
	
		if (!tracks[actualTrack].start) 
		{
				console.log( "init sampler");
			
			tracks[actualTrack].loop = [];
			tracks[actualTrack].rate = [];
			tracks[actualTrack].start = [];
			tracks[actualTrack].end = [];	

			for(let i = 0; i < 8; i++) 
			{
				tracks[actualTrack].loop[i] = false;	
				tracks[actualTrack].start[i] = 0;	
				tracks[actualTrack].end[i] = 1;				
				tracks[actualTrack].rate[i] = 1;		
			}
		}
		
	}
	
	

	

	orderedParams.forEach(paramName => {
		if (paramName in params) {
	
			let paramValue = params[paramName];
				
			if (paramName === "envelope") {
				createADSR(synth, str);
			}
			if (paramName === "oscillator") {
				createWaveform(synth, "WaveShape");
			}
			if (paramName === "voice0") {
				createADSR(synth, str + "1", 0);				
				createWaveform(synth, "WaveShape 1", 0);
			}			
			if (paramName === "voice1") {
				createADSR(synth, str + "2", 1);				
				createWaveform(synth, "WaveShape 2", 1);
			}
			if (paramName === "harmonicity") {
				createHarmonicity(synth, "Harmonicity" );				
			}	
			if (paramName === "portamento") {
				 if(str =="MembraneSynth")createOctaves(synth, "Octaves")
				 else createPortamento(synth, "Portamento");				
			}	
			if (paramName === "filter") {
				
				if( str = 'MonoSynth')
				{
				createFiltType(synth, "Filter Type");					
				}					
				else
				{
				createFiltType(synth, "Filter Type");					
				createFilt(synth, "Filter Freq");	
				}
				
			}	
			if (paramName === "filterEnvelope") {
 
				if( str = 'MonoSynth')
				{				
				createADSR(synth, "FILTadsr");	
                createXY(synth, "FILTxy");				
				}					
				// else
				// {
				// createFiltType(synth, "Filter Type");					
				// createFilt(synth, "Filter Freq");	
				// }
				
			}				
			if (paramName === "modulationEnvelope") {
				createADSR(synth, "MODadsr");
			}   
			if (paramName === "modulation") {
				createWaveform(synth, "MODshape");
			}			
			if (paramName === "attackNoise") {
				createAD(synth, str );
			}  		
			if (paramName === "dampening") {
				createDampening(synth, "Dampening" );
			}  	
			if (paramName === "resonance") {
				createResonance(synth, "Resonance" );
			} 						
			if (paramName === "noise") {
				createNoise(synth, "Noise" );
				createPlayRate(synth, "PlayRate" );
			} 	// "loop" , "playbackRate","loopStart","loopEnd" 
			if (paramName === "loop") {
				 
				createLoop(synth, "Loop" );
			} 	
			if (paramName === "playbackRate") {
			
				playbackRate(synth, "Rate" );
			} 		
			if (paramName === "loopStart") {
			
				 sampleStart(synth, "Loop start" );  
			} 					
			if (paramName === "loopEnd") {
			
				 sampleEnd(synth, "Loop end" );
			} 			
		}
	});
	
	
	
		if(smpl != null && str == 'Player')selectSample(smpl) ;
		async function selectSample(smpl) 
		{		
		     tracks[actualTrack].sample = smpl
		     swapSample("local",smpl);		
			 
		
		
			 // tracks[actualTrack].sample = smpl;
			// await loadSample("local",smpl);		
             // console.log(tracks[actualTrack]);
             // synth = tracks[actualTrack].tones;		
             // console.log(synth);
		}		

 


// swapSample
}


function changeMiniSample(trk,nn)
{
	
 
	
		for(let i=0; i<8; i++)
		{ 
			
			let el= document.getElementById( "minispl-"+trk+"-"+i); 
			el.style.background = "#444";

		}
	
	document.getElementById( "minispl-"+trk+"-"+nn).style.background = "#FF4400";
	
	
	actualSample[trk] = nn;
	
	tracks[trk].myLoop = nn;
	
   
	 
	
	tracks[trk].nexus[0].elem.state = tracks[trk].loop[nn];	
	tracks[trk].nexus[1].elem.value = tracks[trk].rate[nn];		 
	tracks[trk].nexus[2].elem.value = tracks[trk].start[nn];		
	tracks[trk].nexus[3].elem.value = tracks[trk].end[nn];	
	
	//tracks[actualTrack].tones.set({ loop: tracks[trk].loop[nn] });
	
 
	
}


function visualizeAudioGraph() {
    let graph = "Synth";
    tracks[actualTrack].fx.forEach((fx) => {
        graph += ` → ${fx.constructor.name}`;
    });
    graph += " → Destination";
    console.log(graph);
}




function addFX(str) {	 

    let fx;
	let hereCountFX = countFX;
 
 
    
    switch(str) {
        case 'AutoFilter':
            fx = new Tone.AutoFilter();
            break;
        case 'Filter':
            fx = new Tone.Filter();
            break;
        case 'FeedbackDelay':
            fx = new Tone.FeedbackDelay();
            break;
        case 'Reverb':
            fx = new Tone.Reverb(3).set({decay: 2});
            break;
        case 'BitCrusher':
            fx = new Tone.BitCrusher();
            break;
        case 'Distortion':
            fx = new Tone.Distortion();
            break;
        case 'AutoPanner':
            fx = new Tone.AutoPanner();
            break;
        case 'AutoWah':
            fx = new Tone.AutoWah();
            break;
        case 'Chebyshev':
            fx = new Tone.Chebyshev();
            break;
        case 'Chorus':
            fx = new Tone.Chorus();
            break;
        case 'Convolver':
            fx = new Tone.Convolver();
            break;
        case 'FeedbackEffect':
            fx = new Tone.FeedbackEffect();
            break;
        case 'Freeverb':
            fx = new Tone.Freeverb();
            break;
        case 'JCReverb':
            fx = new Tone.JCReverb();
            break;
        case 'MidSideEffect':
            fx = new Tone.MidSideEffect();
            break;
        case 'Phaser':
            fx = new Tone.Phaser();
            break;
        case 'PingPongDelay':
            fx = new Tone.PingPongDelay();
            break;
        case 'PitchShift':
            fx = new Tone.PitchShift();
            break;
        case 'StereoEffect':
            fx = new Tone.StereoEffect();
            break;
        case 'StereoFeedbackEffect':
            fx = new Tone.StereoFeedbackEffect();
            break;
        case 'StereoWidener':
            fx = new Tone.StereoWidener();
            break;
        case 'StereoXFeedbackEffect':
            // Note: This might be a custom implementation check Tone.js docs
            fx = new Tone.StereoXFeedbackEffect();
            break;
        case 'Tremolo':
            fx = new Tone.Tremolo();
            break;
        case 'Vibrato':
            fx = new Tone.Vibrato();
            break;
        case 'Compressor':
            fx = new Tone.Compressor();
            break;		
        case 'Limiter':
            fx = new Tone.Limiter();
            break;	
        case 'EQ3':
            fx = new Tone.EQ3();
            break;				
        default:
            console.error('Unknown FX type:', str);
            return;
    }
	
	
	if(fx) {
 
        // console.log('-> ', str);
    }else  return;
	
	
    if(tracks[actualTrack].fx.length === 0 )
	{
		
	osc[actualTrack].disconnect();	
		
    tracks[actualTrack].tones.disconnect(); // Tone.Destination

	tracks[actualTrack].tones.connect(fx);
	
	fx.connect(Tone.Destination);	

	osc[actualTrack].connect( tracks[actualTrack].tones );		
	
	// if(osc[actualTrack])osc[actualTrack].disconnect();
    // if(osc[actualTrack])osc[actualTrack].connect( tracks[actualTrack].tones );	

    // console.log( osc[actualTrack] );
    // console.log( tracks[actualTrack].tones );

	
	
	}
	else
	{
	 let ln = tracks[actualTrack].fx.length;	
		
     tracks[actualTrack].fx[ln-1].disconnect(); //Tone.Destination

	 tracks[actualTrack].fx[ln-1].connect(fx);
	 fx.connect(Tone.Destination);		
	}

   tracks[actualTrack].fx.push(fx);
   tracks[actualTrack].idfx.push(countFX[actualTrack]);   
   tracks[actualTrack].nexusFX.push([]);   
   
   CC[actualTrack].push([]);   

    let params = fx.get();

   // visualizeAudioGraph();
   
 
   
   let hereColor = getRandomDarkColor(); 
   
    //const numFx = countFX[actualTrack];  //   
	const numFx = (tracks[actualTrack].fx.length) - 1;  
	
   
   	const trackContainer  = document.getElementById("track-" + actualTrack);
	  
    const fxContainer = document.createElement('div');	  	  
	fxContainer.id = "myFX-" +  actualTrack + "-" +  countFX[actualTrack];
	fxContainer.className= "myFX";
	fxContainer.style.backgroundColor = hereColor;
	trackContainer.appendChild(fxContainer);
	
	
	const labelfx = document.createElement('div');	 
	labelfx.innerHTML = str;
	labelfx.className= "labelfx";
	  fxContainer.appendChild(labelfx);
	  


	  

// "type" ,

	// const orderedParams = ["wet" , "feedback","resonance" , "depth" , "delayTime" , 
 // "frequency" ,  "octaves" , "baseFrequency" , "spread" , "bits" , 
 // "low", "lowFrequency", "mid", "highFrequency" , "high",
 // "attack", "knee", "release", "threshold" , "ratio",
 // "distortion", "roomSize" , "Q" , "sensitivity" , "type" 
 // , "pitch","decay","preDelay"];
 
 
 
 
 // const fxMin = [0, 0, 0, 0, 0,
 // 1, 1, 20, 0, 1,
 // 0, 0, 0, 0, 0,
 // 0, 0,0,0.01 ,2000,
 // -12 , 0.01 , 0,-18, 40,
 // -18,800 , -18 , 0, 0,
 // 0, -100, 1, 0 ,0 ,
 // 0 , 0.1, -40 ,0 , -24 ,
 // 0.01 , 1  ];
 // const fxMax = [1, 1, 10, 1, 1,
 // 24000, 8, 8000, 1, 16, 
 // 1, 10, 1, 2, 10,
 // 1, 1,1,1 , 10000,
 // 12 , 1, 1,12, 2000,
 // 12, 12000 , 12 ,0.100, 40 ,
 // 0.200, 0 ,20, 1 , 1 , 
// 1 , 10, 0,1, 24 ,
 // 500 , 100 ]; 
 
 
 const orderedParams = [
  "wet", "feedback", "resonance", "depth", "delayTime",
  "frequency", "octaves", "baseFrequency", "spread", "bits",
  "low", "lowFrequency", "mid", "highFrequency", "high",
  "attack", "knee", "release", "threshold", "ratio",
  "distortion", "roomSize", "Q", "sensitivity", "type",
  "pitch", "decay", "preDelay","width"
];

// Sensible min/max for each param (in order)
const fxMin = [
  0,      // wet
  0,      // feedback
  0,      // resonance
  0,      // depth
  0,      // delayTime
  20,      // frequency (Hz)
  0.1,    // octaves
  20,     // baseFrequency (Hz)
  0,      // spread
  1,      // bits (bitcrusher)
  0,      // low (EQ gain)
  20,     // lowFrequency (Hz)
  0,      // mid (EQ gain)
  1000,   // highFrequency (Hz)
  0,      // high (EQ gain)
  0.001,  // attack (s)
  0,      // knee (dB)
  0.01,   // release (s)
  -100,   // threshold (dB)
  1,      // ratio (compressor)
  0,      // distortion (amount)
  0,      // roomSize (reverb)
  0.01,   // Q (filter)
  -100,   // sensitivity (dB)
  0,      // type (enum, see note below)
  -24,    // pitch (semitones)
  0.1,    // decay (s)
  0 ,      // preDelay (s)
  0      //width
];

const fxMax = [
  1,      // wet
  0.95,   // feedback (avoid 1 to prevent infinite loop)
  10,     // resonance
  1,      // depth
  1,      // delayTime (s)
  16000,  // frequency (Hz)
  8,      // octaves
  8000,   // baseFrequency (Hz)
  360,    // spread (degrees)
  16,     // bits (bitcrusher)
  1,      // low (EQ gain)
  1000,   // lowFrequency (Hz)
  1,      // mid (EQ gain)
  20000,  // highFrequency (Hz)
  1,      // high (EQ gain)
  1,      // attack (s)
  40,     // knee (dB)
  1,      // release (s)
  0,      // threshold (dB)
  20,     // ratio (compressor)
  1,      // distortion (amount)
  1,      // roomSize (reverb)
  20,     // Q (filter)
  0,      // sensitivity (dB, see note)
  5,      // type (enum, see note below)
  24,     // pitch (semitones)
  10,     // decay (s)
  1 ,     // preDelay (s)
  1       // width
];
 
	
	let countBt = 0; 




	orderedParams.forEach((paramName, idx) => {  
	

	
	  if (paramName in params) {
		const min = fxMin[idx];
		const max = fxMax[idx];
		const val = (max - min) / 2;

			// createFXDial(fx, paramName, fxContainer, min, max, val);
		    // countBt++;
 
	 const currentFXIndex = tracks[actualTrack].fx.length -1;
	 
	 
	 
	 if( paramName == "preDelay" ) console.log(min , max);
	 
	 
		if (!(str === 'Phaser' && paramName === 'frequency')) 
		{
																		 
		 if(paramName === 'type')createFXType(fx, paramName, fxContainer,str, countFX[actualTrack]);
		 else
		 {
			 createFXDial(fx, paramName, fxContainer, min, max, val,countFX[actualTrack]  );
			 
			 
			 CC[actualTrack][currentFXIndex][countBt] = paramName;
			 
			 adCCFX( actualTrack,currentFXIndex, countBt, paramName, hereColor  );
		 
		 }			 
		  countBt++;
		}
		
	  }
	});
	
			 tracks[actualTrack].nexusColor.push( hereColor );	 
		
//	let wdh = parseInt(getComputedStyle(fxContainer).width, 10); // Get real width
	let wdh = fxContainer.offsetWidth;
	
 //console.log(wdh );
 
	if (countBt <= 2  ) {
	//	fxContainer.style.width = (wdh - 15) + "px";	
	}
	else if (countBt >= 3 && countBt <= 4 ) {
		//fxContainer.style.width = (wdh + 3) + "px";
		labelfx.style.marginLeft="-4px";
	} 
	else if (countBt == 5  ) {
		//fxContainer.style.width = (wdh + 55) + "px";
		labelfx.style.marginLeft="0px";	
 	 
	}	
	else if (countBt == 6) {
	//	fxContainer.style.width = (wdh + 22) + "px";
		labelfx.style.marginLeft="0px";		 
	}
	else if(countBt <= 7) 
	{
	//	fxContainer.style.width = (wdh + 32) + "px";
		labelfx.style.marginLeft="0px";		

	}	
      //  wdh = parseInt(getComputedStyle(fxContainer).width, 10); // Get real width
	 
	
	trackContainer.scrollTo({ left: trackContainer.scrollWidth, behavior: "smooth" });

	let btRemove = document.createElement('div');	 
	btRemove.innerHTML = "X";
	btRemove.className= "btRemove";
	fxContainer.appendChild(btRemove);
	
	if(countBt == 1 || countBt == 3 || countBt == 5 || countBt == 7 || countBt == 9 )
	{
		btRemove.style.top="57px";
		btRemove.style.left="20px";
	}
	
	if( countBt == 1 )btRemove.style.left="35px";	
	else if( countBt == 2 )btRemove.style.left="3px";
	else if( countBt == 3 )btRemove.style.left="27px";	
	else if( countBt == 4 )btRemove.style.left="-5px";
	else if( countBt == 5 )btRemove.style.left="15px";	
	
	
	let trackHere = actualTrack;
	let idfxHere = countFX[actualTrack];
	
	btRemove.addEventListener('click', function (event) {
	 
	 removeFX( trackHere , countFX[actualTrack] , idfxHere );
	 
	});
	

	countFX[actualTrack]++;
	
	


}


function removeFX(trackNum, fxNum, idFx) {
	
   
    let idx = tracks[trackNum].idfx.indexOf(idFx);
    if (idx === -1) return;
    fxNum = idx;

    // Remove the DOM element
    let elm = document.getElementById("myFX-" + trackNum + "-" + idFx);
    if (elm) elm.remove();

    // Remove from nexusFX array
    tracks[trackNum].nexusFX.splice(fxNum, 1);
	
	CC[trackNum].splice(fxNum, 1);
	tracks[trackNum].nexusColor.splice(fxNum, 1);
	
    
	removeCCFX(trackNum); // ,fxNum
	
	// countFX[trackNum] = countFX[trackNum] - 1;
	
	
	

    // Original length of the fx array before removal
    const originalLength = tracks[trackNum].fx.length;


	    osc[trackNum].disconnect();	


    // Reconnect nodes before disposing the effect
    if (originalLength === 1) {
        // Case: Only one effect, connect tones directly to destination

        tracks[trackNum].tones.disconnect();
        tracks[trackNum].tones.toDestination();

    } else if (fxNum === 0) {
        // Case: First effect, connect tones to next effect
		
		
        tracks[trackNum].tones.disconnect();
        tracks[trackNum].tones.connect(tracks[trackNum].fx[1]);
    } else if (fxNum === originalLength - 1) {
        // Case: Last effect, connect previous effect to destination
        tracks[trackNum].fx[fxNum - 1].toDestination();
    } else {
        // Case: Middle effect, connect previous to next
        tracks[trackNum].fx[fxNum - 1].disconnect(); // Disconnect from removed node
        tracks[trackNum].fx[fxNum - 1].connect(tracks[trackNum].fx[fxNum + 1]);
    }
	
			
	osc[trackNum].connect( tracks[trackNum].tones );	
		

    // Dispose and remove from arrays
    tracks[trackNum].fx[fxNum].dispose();
    tracks[trackNum].fx.splice(fxNum, 1);
    tracks[trackNum].idfx.splice(fxNum, 1);
	
	refreshRemoveButtons( trackNum );
	
	
}




function refreshRemoveButtons(trackNum) {
  const trackContainer = document.getElementById(`track-${trackNum}`);
  if (!trackContainer) return;

  // For each FX container in this track
  const fxContainers = trackContainer.querySelectorAll(".myFX");
  
  fxContainers.forEach(container => {
    // Extract stable id from container id, e.g., "myFX-0-3" -> 3
    const parts = container.id.split("-");
    const stableId = parseInt(parts[2], 10);

    // Find existing remove button inside container
    const removeBtn = container.querySelector(".btRemove");
    if (!removeBtn) return;

    // Remove existing click listeners by cloning the button
    const newRemoveBtn = removeBtn.cloneNode(true);
    removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);

    // Add fresh event listener with stableId and trackNum
    newRemoveBtn.addEventListener("click", () => {
      removeFX(trackNum, null, stableId);
    });

    // Optional: adjust button positioning if needed (same code as when created)
  });
}



function createFXType(fx, paramValue, fxContainer , str , nnFx)
{
	
 //	console.log(fx, paramValue, fxContainer , str , nnFx);
	
	  const target = document.createElement('div');	  
	  target.className = 'fx';
	  target.style.borderWidth = "1px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'fx-label';    
	  label.innerHTML = paramValue;
	  target.appendChild(label);	
	
	  let ln = tracks[actualTrack].nexusFX.length;	  
	  ln = ln-1;
	  let countElem = tracks[actualTrack].nexusFX[ln].length;
 	  
	  target.id = 'fx-' + actualTrack + "-" + countFX[actualTrack] + "-" + countElem ;
	  fxContainer.appendChild(target);
	
	var select = null;
	
	if( str =="Chorus" || str == "Compressor" || str == "AutoFilter" ||
	str == "Vibrato" || str == "AutoPanner" || str == "Tremolo"   )
    select = new Nexus.Select('#' + target.id, {
		'size': [40,40],
		  'options': waveforms 
		})  		
	 else select = new Nexus.Select('#' + target.id, {
		'size': [40,40],
		  'options': filterType 
		})  
    
	let trackHere = actualTrack;
 
    select.on('change', function(v) {
     
	 let idx = findFXIndexById(nnFx);
	 if(idx === null)return;
     tracks[trackHere].fx[idx].set({type: v.value });
		//console.log(v.value);
		
    });
	
	
		const fxObject = {
		id: target.id,
		container: fxContainer,
		elem: select,
		elemType:paramValue
		
	  };

	  tracks[actualTrack].nexusFX[ln].push(fxObject);

	
}

function findFXIndexById(targetIdFX) {
  for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
    const idfxIndex = tracks[trackIndex].idfx.indexOf(targetIdFX);
    if (idfxIndex !== -1) {
      return idfxIndex; // Return both track index and idfx index  // trackIndex, 
    }
  }
  return null; // If no matching idFX is found
}


function createFXDial(fx, paramValue ,fxContainer,min,max,val, nnFx)
{
	
//	console.log(fx, paramValue,fxContainer,min,max,val);
   	  
      const target = document.createElement('div');	  
	  target.className = 'fx';
	  target.style.borderWidth = "1px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'fx-label';    
	  label.innerHTML = paramValue;
	  target.appendChild(label);	
	
	  let ln = tracks[actualTrack].nexusFX.length;	  
	  ln = ln-1;
	  let countElem = tracks[actualTrack].nexusFX[ln].length;
 	                                            //ln
	  target.id = 'fx-' + actualTrack + "-" + countFX[actualTrack] + "-" + countElem ;
	  
	  
	  
	  fxContainer.appendChild(target);
	
	if(paramValue== "frequency" )console.log(min,max);
 
	var dial = new Nexus.Dial(target.id,{
	  'size': [40,40],
	  'interaction': 'radial', // "radial", "vertical", or "horizontal"
	  'mode': 'relative', // "absolute" or "relative"
	  'min': min,
	  'max': max,
	  'step': 0.002,
	  'value': val
	})
	
	
	let trackHere = actualTrack;
 
    dial.on('change', function(v) {
     
	 let idx = findFXIndexById(nnFx);
	 if(idx === null)return;
	 
	//   console.log( tracks[trackHere].fx[idx].name , paramValue  );
	// console.log(tracks[trackHere].fx[idx] );
	 
	 // if(tracks[trackHere].fx[idx].name == "frequency" )tracks[trackHere].fx[idx].set({ [paramValue]:mapvalLog(v,min,max,min,max)});
	  if(paramValue== "frequency" )tracks[trackHere].fx[idx].set({ [paramValue]:mapvalExp(v,min,max,min,max)}); 
	  else  tracks[trackHere].fx[idx].set({ [paramValue]: v });
	  
	  

    });
	
		
	  const fxObject = {
		id: target.id,
		container: fxContainer,
		elem: dial,
		elemType:paramValue
		
	  };

	  tracks[actualTrack].nexusFX[ln].push(fxObject);

}


function getRandomLightColor() {
    const randomColor = Math.floor(Math.random() * 0x7FFFFF + 0x800000).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
}


function getRandomDarkColor() {
    const randomColor = Math.floor(Math.random() * 0x7FFFFF).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
}


function createADSR(synth,str,vv)
{
	  // str = str.replace("Synth","");
	  // if(str =="")str = "Synth";
	  
	  	tracks[actualTrack].tones.set({
			envelope: {
				attackCurve: "exponential"
			}
		});

	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  

	 
      const label = document.createElement('div');	
     if(str != "MODadsr"   && str != "DuoSynth2" && str !=  "FILTadsr" )label.className = 'labelfx2';   //target-synth	  
	  else label.className = 'labelfx';    //target-label
	   if(str == "MODadsr")label.innerHTML = " &nbsp; " + str;
	  else label.innerHTML = str;
	  target.appendChild(label);	
	  
	 // 	  console.log(label);
	 
	  let countElem = tracks[actualTrack].nexus.length;
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);

	  const envelope = new Nexus.Envelope('#' + target.id, { 
		size: [150, 80], 
		noNewPoints: true,
		points: [
		  { x: 0.0, y: 0.0 , frozen:true },
		  { x: 0.05, y: 1 },
		  { x: 0.1, y: 0.3 },
		  { x: 0.75, y: 0.0 },		  
		  { x: 1.0, y: 0.0 , frozen:true  }
          ]
	  });
	  

 
			  
	  envelope.on('change', () => {
	 
	  if (envelope.points.length < 5) {
 
		
		envelope.addPoint(0.4,0.5);
	   
	  }
	   
		 let x1 = envelope.points[1].x;
		 let y1 = envelope.points[1].y;	
		 let x2 = envelope.points[2].x;		 
		 let y2 = envelope.points[2].y;			 
		 let x3 = envelope.points[3].x;
		 let y3 = envelope.points[3].y;	
		 let y4 = null;
	  	 if(envelope.points[4])
		 {
			 x4 = envelope.points[4].x;				 
			 y4 = envelope.points[4].y;		
		 }
		
		 if (y1 < 1) 
		 {
		 envelope.movePoint( 1, x1, 1.0 );
		 }
		 
		 if (x1 > 0.25) 
		 {
		 envelope.movePoint( 1, 0.25, y1 );
		 }	
		 
		 if (x2 > 0.5) 
		 {
		 envelope.movePoint( 2, 0.5, y2 );
		 }	
		 
		 if(y3 > 0.0)
		 {
		 envelope.movePoint( 3, x3, 0.0 );			 
		 }
		 
		 if(envelope.points[4])  
		 {
			 if(y4 > 0.0)
			 {
			 envelope.movePoint( 4, x4, 0.0 );			 
			 }			
			 if(x4 > 1.0)
			 {
			 envelope.movePoint( 4, 1.0, 0.0 );			 
			 }				 
		 }
		 
	    // console.log(tracks[actualTrack].tones.envelope);
	    // console.log();		
		  
 //console.log("-----  " +  mapval(x2, x1, 0.5,  0,4) );				  
		  
		  
		  
	if (vv == 0) {
		tracks[actualTrack].tones.set({
			["voice0"]: {
				envelope: {
					attack: mapval(x1, 0, 0.25, 0, 4),
					decay: mapval(x2, x1, 0.5, 0, 4),
					sustain: y2,
					release: mapval(x3, x2, 1, 0, 8)
				}
			}
		});
	} 
	else if (vv == 1) {
		tracks[actualTrack].tones.set({
			["voice1"]: {
				envelope: {
					attack: mapval(x1, 0, 0.25, 0, 4),
					decay: mapval(x2, x1, 0.5, 0, 4),
					sustain: y2,
					release: mapval(x3, x2, 1, 0, 8)
				}
			}
		});
	} 
	else if (str == "MODadsr" ) {
		tracks[actualTrack].tones.set({
			modulationEnvelope: {
					attack: mapval(x1, 0, 0.25, 0, 4),
					decay: mapval(x2, x1, 0.5, 0, 4),
					sustain: y2,
					release: mapval(x3, x2, 1, 0, 8) 
			}
		});
	} 	
	else if (str == "FILTadsr" ) {
		tracks[actualTrack].tones.set({
			modulationEnvelope: {
					attack: mapval(x1, 0, 0.25, 0, 4),
					decay: mapval(x2, x1, 0.5, 0, 4),
					sustain: y2,
					release: mapval(x3, x2, 1, 0, 8)
			}
		});
	//	console.log("kiki adsr");
	} 		
	else {
		tracks[actualTrack].tones.set({
			envelope: {
				attack: mapval(x1, 0, 0.25, 0, 4),
				decay: mapval(x2, x1, 0.5, 0, 4),
				sustain: y2,
				release: mapval(x3, x2, 1, 0, 8)
			}
		});
	}
 
	 });
	 
	 
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: envelope,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);
	  
	 
 
}



function createAD(synth,str,vv)
{
	  // str = str.replace("Synth","");
	  // if(str =="")str = "Synth";
	  
	  	tracks[actualTrack].tones.set({
			envelope: {
				attackCurve: "exponential"
			}
		});

	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'labelfx2';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);

	  const envelope = new Nexus.Envelope('#' + target.id, { 
		size: [150, 80], 
		noNewPoints: true,
		points: [
		  { x: 0.0, y: 0.0 , frozen:true },
		  { x: 0.05, y: 1 },
		  { x: 0.75, y: 0.0 }		  
          ]
	  });
	  

 
			  
	  envelope.on('change', () => {
	 
	  if (envelope.points.length < 3) {
 
		
		envelope.addPoint(0.6,0.5);
	   
	  }
	   
		 let x0 = envelope.points[0].x;
		 let y0 = envelope.points[0].y;		   
		 let x1 = envelope.points[1].x;
		 let y1 = envelope.points[1].y;	
		 let x2 = envelope.points[2].x;		 
		 let y2 = envelope.points[2].y;			 


         if( x0 > 0 || y0 > 0 )envelope.movePoint( 0, 0.0 , 0.0 );

		 if (y1 < 1) 
		 {
		 envelope.movePoint( 1, x1, 1.0 );
		 }
		 
		 if (x1 > 0.5) 
		 {
		 envelope.movePoint( 1, 0.5, y1 );
		 }	
		 
		 if (x2 < x1) 
		 {
		 envelope.movePoint( 2, x1, y2 );
		 }	
		 
		 if(y2 > 0.0)
		 {
		 envelope.movePoint( 2, x2, 0.0 );			 
		 }
		 
 
	
		tracks[actualTrack].tones.set({
			 
				attackNoise: mapval(x1, 0, 0.5, 0, 8),
				release: mapval(x2, x1, 1, 0, 8)
		 
		});
		
 
 
	 });
	 
	 
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: envelope,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);
	  
	 
 
}

function createWaveform(synth,str,vv)
{
	
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label';   
     	  
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);

      var select = new Nexus.Select('#' + target.id, {
		'size': [100,30],
		  'options': waveforms
		})  

 
select.on('change', function(v) {
    if (vv == 0) {
        tracks[actualTrack].tones.set({
            "voice0": { oscillator: { type: v.value } }
        });
    } 
    else if (vv == 1) {
        tracks[actualTrack].tones.set({
            "voice1": { oscillator: { type: v.value } }
        });
    } 
    else if (vv == "MODshape") {
        tracks[actualTrack].tones.set({
            modulation: { type: v.value }  
        });
    } 	
    else {
		    tracks[actualTrack].tones.set({ oscillator: {
			type:v.value }});			
    }

});



 	
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: select,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);
 
	
}


function createHarmonicity(synth, str )
{
 	
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label2';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
	var dial = new Nexus.Dial(target.id,{
	  'size': [50,50],
	  'interaction': 'radial', // "radial", "vertical", or "horizontal"
	  'mode': 'relative', // "absolute" or "relative"
	  'min': 0,
	  'max': 8,
	  'step': 0.1,
	  'value': 0
	})
	
	
	dial.on('change',function(v) {
		    tracks[actualTrack].tones.set({ harmonicity:mapvalExp(v,0,8,0,8) });		
   })
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: dial,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}


function createDampening(synth, str )
{
 	
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label2';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
	var dial = new Nexus.Dial(target.id,{
	  'size': [50,50],
	  'interaction': 'radial', // "radial", "vertical", or "horizontal"
	  'mode': 'relative', // "absolute" or "relative"
	  'min': 0.2,
	  'max': 8000,
	  'step': 1,
	  'value': 5500
	})
	
	
	dial.on('change',function(v) {
		    tracks[actualTrack].tones.set({ dampening:v });		
   })
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: dial,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}


function createResonance(synth, str )
{
 	
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label2';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
	var dial = new Nexus.Dial(target.id,{
	  'size': [50,50],
	  'interaction': 'radial', // "radial", "vertical", or "horizontal"
	  'mode': 'relative', // "absolute" or "relative"
	  'min': 0,
	  'max': 1,
	  'step': 0.002,
	  'value':0.5
	})
	
	
	dial.on('change',function(v) {
		    tracks[actualTrack].tones.set({ resonance:v });		
   })
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: dial,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}



function createPortamento(synth, str )
{
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label2';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
	var dial = new Nexus.Dial(target.id,{
	  'size': [50,50],
	  'interaction': 'radial',  
	  'mode': 'relative',  
	  'min': 0,
	  'max': 3.5,
	  'step': 0.1,
	  'value': 0
	})
	
	
	dial.on('change',function(v) {
		    tracks[actualTrack].tones.set({ portamento:mapvalExp(v,0,3.5,0,3.5) });		
   });
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: dial,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}

function createFilt(synth, str, vv )
{
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label2';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
	var dial = new Nexus.Dial(target.id,{
	  'size': [50,50],
	  'interaction': 'radial',  
	  'mode': 'relative',  
	  'min': 0,
	  'max': 24000,
	  'step': 1,
	  'value': 800
	})
	
	
	dial.on('change',function(v) {
       	    tracks[actualTrack].tones.set({ filter: {
			frequency:v}});	
			 
 	
   });
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: dial,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}


function createFiltType(synth, str, vv )
{
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
      var select = new Nexus.Select('#' + target.id, {
		'size': [100,30],
		  'options': filterType
		}) 
	
	 
	select.on('change',function(v) {
       	    tracks[actualTrack].tones.set({ filter: {
			type:v.value}});					
   });
   
   
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: select,
		elemType:str
		};
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}



function createLoop(synth, str)
{
	
	actualSample[actualTrack] = 0;
	
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'labelfx2';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
	  
	  
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
	 let valLoop = tracks[actualTrack].loop[0];	
 
      var toggle = new Nexus.Toggle('#' + target.id, {
		'size': [50,20],
		   'state': valLoop
		});

	toggle.on('change', function(v) {
	  let player = tracks[actualTrack].tones;

	  player.set({ loop: v });
		tracks[actualTrack].loop[actualSample[actualTrack]] = v;	
		
		

	  if (!v) {
		// Stop current playback and start only 1s playback without loop
	  //  player.stop();
	   // player.start(undefined, 0, 1);
	  } else {
		// Start normally looping playback
	  //  player.stop();
	  //  player.start(undefined, 0); // plays full buffer looping as loop=true
	  }

//	   console.log("change " + player.loop);
	   
	});

	
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: toggle,
		elemType:str
		};
	 
	  tracks[actualTrack].nexus.push(trackObject);

}


function playbackRate(synth, str)
{
		 
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	  
	  target.style.paddingLeft = "25px";
	  target.style.paddingRight = "25px";	
 
      var slider = new Nexus.Slider('#' + target.id, {
		     'size': [20,90],
			'mode': 'absolut',  // 'relative' or 'absolute'
			'min': 0.2,
			'max': 2,
			'step': 0,
			'value': 1
		});

	slider.on('change',function(v) {
		 
	 
		 
		 if( v < 1.03 && v > 0.97 ){
			 v == 1;
			 label.style.color="#000";
			   
		 }
		 else {
			 label.style.color = "#822";		
	
		 }  
		
       	    tracks[actualTrack].tones.set({ playbackRate:v});	
		 	tracks[actualTrack].rate[actualSample[actualTrack]] = v;				
			
   });
	
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: slider,
		elemType:str
		};
	 
	  tracks[actualTrack].nexus.push(trackObject);

}


function sampleStart(synth, str)
{
 
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      let target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      let label = document.createElement('div');	  
	  label.className = 'target-label';    
	  label.innerHTML = "Start";
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);

	let lenSmp = 1;
	if( tracks[actualTrack].sampleLen != null )lenSmp = tracks[actualTrack].sampleLen;
	
	
 
		 	
 
      var slider = new Nexus.Slider('#' + target.id, {
		     'size': [120,20],
			'mode': 'absolut',  // 'relative' or 'absolute'
			'min': 0,
			'max': lenSmp,
			'step': 0,
			'value': 0
		});

	slider.on('change',function(v) {
       	    tracks[actualTrack].tones.set({ loopStart:v});	
		  tracks[actualTrack].start[actualSample[actualTrack]] = v;	
   });
	
	  let trackObject = {
		id: target.id,
		container: trackContainer,
		elem: slider,
		elemType:str
		};
	 
	  tracks[actualTrack].nexus.push(trackObject);

}


function sampleEnd(synth, str)
{
 
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      let target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      let label = document.createElement('div');	  
	  label.className = 'target-label';    
	  label.innerHTML = "End";
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
	
	let lenSmp = 1;
	if( tracks[actualTrack].sampleLen != null )lenSmp = tracks[actualTrack].sampleLen;
		
    	for(let i=0; i<8; i++)
		{ tracks[actualTrack].end[i] = lenSmp;	}	
	
      var slider = new Nexus.Slider('#' + target.id, {
		     'size': [120,20],
			'mode': 'absolut',  // 'relative' or 'absolute'
			'min': 0,
			'max':lenSmp ,// tracks[actualTrack].sampleLen,
	    	'step': 0,
			'value':lenSmp ,// tracks[actualTrack].sampleLen
		});

	slider.on('change',function(v) {
	  	
       	    tracks[actualTrack].tones.set({ loopEnd:v});	
		   tracks[actualTrack].end[actualSample[actualTrack]] = v;		
   });
	
	
	  let trackObject = {
		id: target.id,
		container: trackContainer,
		elem: slider,
		elemType:str
		};
	 
	  tracks[actualTrack].nexus.push(trackObject);

}


function createNoise(synth, str)
{
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
      var select = new Nexus.Select('#' + target.id, {
		'size': [100,30],
		  'options': noise
		});
	
	 
 		

	select.on('change',function(v) {
       	    tracks[actualTrack].tones.set({ noise: {
			type:v.value}});					
   });
   	  
  
   
   
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: select,
		elemType:str
		};
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}


function createOctaves(synth, str, vv )
{
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label2';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
	var dial = new Nexus.Dial(target.id,{
	  'size': [50,50],
	  'interaction': 'radial',  
	  'mode': 'relative',  
	  'min': 0,
	  'max': 12,
	  'step': 0.01,
	  'value': 800
	})
	
	
	dial.on('change',function(v) {
       	    tracks[actualTrack].tones.set({ octaves:v});	
			//  console.log(tracks[actualTrack].tones.get());		
 	
   });
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: dial,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}


function createPlayRate(synth, str, vv )
{
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label2';    
	  label.innerHTML = "Speed";
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
 
	var dial = new Nexus.Dial(target.id,{
	  'size': [50,50],
	  'interaction': 'radial',  
	  'mode': 'relative',  
	  'min': 0.01,
	  'max': 24,
	  'step': 0.002,
	  'value': 1
	})
	
	
	dial.on('change',function(v) {
       	    tracks[actualTrack].tones.set({ noise:
				{ playbackRate:v }});	
		
   });
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem: dial,
		elemType:"filt"
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}



function createXY(synth, str, vv )
{
	  const trackContainer  = document.getElementById("trackosc-" + actualTrack);
      const target = document.createElement('div');	  
	  target.className = 'target';
	  target.style.borderWidth = "0px";
	  
	  
      const label = document.createElement('div');	  
	  label.className = 'target-label';    
	  label.innerHTML = str;
	  target.appendChild(label);	
	  
	  let countElem = tracks[actualTrack].nexus.length;
 
	  
	  target.id = 'tone-' + actualTrack + "-" + countElem ;
	  trackContainer.appendChild(target);
	
     
 
	
	
		var position = new Nexus.Position(target.id,{
	  'size': [80,80],
	  'mode': 'relative',  // "absolute" or "relative"
	  'x': 2,  // initial x value
	  'minX': 0,
	  'maxX': 12,
	  'stepX': 0.1,
	  'y': 200,  // initial y value
	  'minY': 20,
	  'maxY': 8000,
	  'stepY': 0.2
	});
		
	
	
	position.on('change',function(v) {
 
		    tracks[actualTrack].tones.set({ filterEnvelope:{octaves:v.x} });		
		    tracks[actualTrack].tones.set({ filterEnvelope:{baseFrequency:mapvalExp(v.y,20,8000,20,8000)} });	 
			
				//	  console.log(synth.get());		
   });
		
	  const trackObject = {
		id: target.id,
		container: trackContainer,
		elem:position,
		elemType:str
		
	  };
	 
 
	  tracks[actualTrack].nexus.push(trackObject);

}


function initStyle()
{
	
	document.body.style.backgroundColor = "#000";

	Nexus.colors.accent = "#FF4400";
	Nexus.colors.fill = "#551500";
	Nexus.colors.light = "#FFF";	
	Nexus.borderRadius = "20px";	
	
	Nexus.colors.dark = "#fff";
	
	
	// accent, fill, dark, light, mediumDark, mediumLight
	
	// if(mobile)
	// {
	// document.getElementById('logo').style.width="100px";
	// document.getElementById('logo').style.height="100px";	
	  // logo.style.backgroundSize = "cover"; 
    
	// }	



 	// drawCtrl();	
	
	 // if(piano == null)addPiano();
	
   return;

}

function loadSounds() {
    let templateNames = listSounds();
    document.getElementById("savesound").style.display = "block";
  
    var len = templateNames.length;
    let soundlistElem = document.getElementById('soundlist');
    soundlistElem.innerHTML = "";
  
    for (let i = 0; i < len; i++) {
        soundlistElem.innerHTML += 
            " &nbsp;- <span class='listitem' " +
            "onclick=\"loadSound('" + templateNames[i] + "')\">" + 
            templateNames[i] + 
            "</span><br>";
    }

    // Append shared sounds at the end
    loadSharedSounds();
}

function loadSharedSounds() { 
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "sharedSounds/listSounds.php", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let sharedSounds = JSON.parse(xhr.responseText);
            let soundlistElem = document.getElementById('soundlist');
            soundlistElem.innerHTML += "<hr><b>Shared Sounds:</b><br>";
            sharedSounds.forEach(function(name) {
                soundlistElem.innerHTML += 
                    " &nbsp;- <span class='listitem sharedsound' " +
                    "onclick=\"loadSharedSound('" + name + "')\">" + 
                    name + 
                    "</span><br>";
            });
        }
    };
    xhr.send(null);
}


function loadSharedSound(name) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "sharedSounds/getSound.php?name=" + encodeURIComponent(name), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
			 
					
                    let soundData = JSON.parse(xhr.responseText);
					console.log('in the routine ');
	                 console.log(soundData);
	 
                    loadSoundData(soundData, name);

                } catch (e) {
                    alert("Failed to parse sound data.----");
                }
            } else {
                alert("Failed to load shared sound: " + xhr.status);
            }
        }
    };
    xhr.send(null);
}


function loadSoundData(soundData, name) {
    // tracks = soundData; // your code to update or replace current tracks
    // currentSound = name;
    
    
	console.log("load from shared : ");
	console.log(soundData);
	
	  emptySounds();
	  fillSounds(soundData);
	
	  document.getElementById("soundname").value = name;
	
	  currentSound = name;
	
	 flipSoundOn(true);
	 
	 closeListSounds();
		
}




function loadSound(filename)
{
   // document.getElementById('loadsoundbt').style.background = "gold";	
    const myTemplates = JSON.parse(localStorage.getItem('mySounds')) || {};	
    const preset = myTemplates[filename];

    if (!preset) {
        document.getElementById('load').style.background = "red";    
        alert("Preset not found!");
        return;
    }
	
	  console.log("load from local : ");
	  console.log(preset);
	
	emptySounds();
	fillSounds(preset);
	
	document.getElementById("soundname").value = filename;
	
	currentSound = filename;

	
        document.getElementById("savesound").style.display="none";	  	
		
	    // setTimeout(function() {
        // document.getElementById('loadsoundbt').style.background = " linear-gradient(135deg, #3a3a3a 0%, #8c8cac 50%, #c0c0c0 100%)";
    // }, 700);
	
	
	flipSoundOn(true);
	
}



function listSounds()
{
 
	let myTemplates = JSON.parse(localStorage.getItem('mySounds')) || {};
	
	
	return Object.keys(myTemplates);
 	
}





function loadSound(filename)
{
   // document.getElementById('loadsoundbt').style.background = "gold";	
    const myTemplates = JSON.parse(localStorage.getItem('mySounds')) || {};	
    const preset = myTemplates[filename];

    if (!preset) {
        document.getElementById('load').style.background = "red";    
        alert("Preset not found!");
        return;
    }
	
 
	
	emptySounds();
	fillSounds(preset);
	
	document.getElementById("soundname").value = filename;
	
	currentSound = filename;

	
        document.getElementById("savesound").style.display="none";	  	
		
	    // setTimeout(function() {
        // document.getElementById('loadsoundbt').style.background = " linear-gradient(135deg, #3a3a3a 0%, #8c8cac 50%, #c0c0c0 100%)";
    // }, 700);
	
	
	flipSoundOn(true);
	
}


function emptySounds()
{
	
	CC.forEach((_, idx) => removeAllCCFX(idx));

	
	CC = [];
	
  // Tone.Transport.stop();
  // Tone.Transport.cancel();
  // Tone.Destination.mute = true;

 // Tone.Destination.disconnect();  

   tracks.forEach((elm,idx) => {	  
  // console.log(elm);
   
   let synth = elm.tones;
    if (synth.triggerRelease)synth.triggerRelease();
	synth.disconnect();
    synth.dispose();
	
	let arr = elm.fx;
	
	 arr.forEach(node => {
      node.disconnect();
      node.dispose();
    });
	
	
	arr = elm.nexus;
	
	 arr.forEach(component => {
  
       if (!component) return;

	  component.removeAllListeners?.(); 

	  if (typeof component.destroy === 'function') {
		component.destroy();
	  }

	  component = null;
  
    });
	
	
	arr = elm.nexusFX;
	
	 arr.forEach(component => {
  
       if (!component) return;

	  component.removeAllListeners?.(); 

	  if (typeof component.destroy === 'function') {
		component.destroy();
	  }

	  component = null;
  
    });	

  }); 
  
 
  const existingPiano = document.getElementById('piano');
  if (existingPiano) {
    existingPiano.remove();
    if (window.piano && typeof piano.destroy === 'function') {
      piano.destroy();
    }
  }
   
  
  document.getElementById('mytracks').innerHTML = "";
  tracks=[];

  
  trackCount = 0;
  actualTrack = 0;
  exActualTrack = 0;
  countFX = [];
  
  currentSound = null;
  
  
    
  
  
}



function fillSounds(preset)
{ 
console.log(preset);

	
 	Tone.Destination.mute = false;
  
	async function resumeAudioContext() {
	  if (Tone.context.state !== 'running') {
		await Tone.context.resume();
	  }
	}
	 
   resumeAudioContext();	
  
   Tone.Transport.start();  
   
	  

	
	
  preset.forEach((elm,idx) => {

	  
	actualTrack = idx;
	
	flagChangeTone = false;
	selectOsc(elm.tone,null,elm.sample);
	
	
	    if (elm.loop) tracks[idx].loop = [...elm.loop];
        if (elm.start) tracks[idx].start = [...elm.start];
        if (elm.end) tracks[idx].end = [...elm.end];
        if (elm.rate) tracks[idx].rate = [...elm.rate];
        if (elm.sampleLen) tracks[idx].sampleLen = elm.sampleLen;
 
	
	let allFX = elm.fx
	
	
	allFX.forEach((elm,idy) => {
		
	 addFX(elm);
	 
		
	}); 	
	
	 

	let setTone = elm.valtone	
	
	setTone.forEach((elmy,idy) => {		
		if( elmy instanceof Array )
		{
			 
			elmy.forEach((elmz,idz) => {	
				
				let x = elmy[idz].x;
				let y = elmy[idz].y;			 
				tracks[idx].nexus[idy].elem.movePoint( idz, x, y )
				
			}); 	
		
		} 
		// New check for boolean type
		// else if (typeof elmy === 'boolean') {
			// tracks[idx].nexus[idy].elem.state = elmy; // Nexus Toggles/Buttons use 'state'
		// }
		// Original catch-all (now the final else)
		else { 
			if( tracks[idx].tones.name != "Player" )tracks[idx].nexus[idy].elem.value = elmy;	
			 		
		}
	});
	
	
 
	
			// for(let i =0; i<8; i++) ***
		// {
		   // tracks[actualTrack].loop[i] = false;	

		   // tracks[actualTrack].rate[i] = 1;		
	
		// }
	 
	
	
	let setFX = elm.valfx;
	 
 
	setFX.forEach((elmy,idy) => {		
	
	    let arrFX = elmy;
		arrFX.forEach((elmz,idz) => {	
		
 	     // console.log(tracks[idx].nexusFX[idy][idz]);
		 // console.log(elmz);   
		 
		 
			if( elmz instanceof Array )tracks[idx].nexusFX[idy][idz].elem.setPoints(elmz);
			else tracks[idx].nexusFX[idy][idz].elem.value = elmz;
				
		}); 

	}); 	
	
	 
 
		if( elm.vol < -22 )tracks[idx].tones.disconnect();
		else  
		{
		   if(!tracks[idx].tones.connected) 
		   {
				tracks[idx].tones.toDestination();
		   }
		}
			
	    tracks[idx].tones.set({ volume:elm.vol}); 	 
 
  }); 
 
   //if(piano == null)addPiano();
  
  
 
}



function saveSounds()
{
    let filename = document.getElementById("soundname").value.trim();
	filename = filename.replace(" ","_");
	   
    if (!filename) {
        alert("Please enter a valid filename.");
        return;
    }	   

	currentSound = filename;
  
    const tracksParams = tracks.map(track => extractTrackParams(track));

 
    let myTemplates = JSON.parse(localStorage.getItem('mySounds')) || {};

 
    myTemplates[filename] = tracksParams;

 
    localStorage.setItem('mySounds', JSON.stringify(myTemplates));

  
    console.log(tracksParams);
  
    // document.getElementById("savesoundbt").style.background = "red";
	
    // setTimeout(() => {
        // document.getElementById("savesoundbt").style.background = "linear-gradient(135deg, #3a3a3a 0%, #8c8cac 50%, #c0c0c0 100%)";
    // }, 700);
	
}


function shareSounds() {
    let filename = document.getElementById("soundname").value.trim();
    filename = filename.replace(" ", "_");
    
    if (!filename) {
        alert("Please enter a valid filename.");
        return;
    }
    
    const tracksParams = tracks.map(track => extractTrackParams(track));
    
    let myTemplates = JSON.parse(localStorage.getItem('mySounds')) || {};
    
    myTemplates[filename] = tracksParams;
    
    // Update localStorage (optional if you want to keep the local copy updated)
   //  localStorage.setItem('mySounds', JSON.stringify(myTemplates));
    
    // Prepare data to send: JSON object with the single sound entry
    let dataToSend = {};
    dataToSend[filename] = tracksParams;
	
	  console.log(tracksParams);
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "sharedSounds/saveSound.php", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                alert("Sound shared successfully!");
            } else {
                alert("Error sharing sound. Server responded with status: " + xhr.status);
            }
        }
    };
    
    xhr.send(JSON.stringify(dataToSend));
	
}


function extractTrackParams(track) {
     // let fx = track.nexusFX.map(nex => nex.elem.value);
 
   // let arr = track.nexusFX;
   
   // let arrVal = [];
   
   // for(let i = 0; i<arr.length; i++)
   // {
	  // arrVal[i] = arr[i].map(nex=> {
	  // if (nex.elem.value !== undefined) {
		// return nex.elem.value;
	  // } 
	  // else if (nex.elem.points) {
		// return nex.elem.points; // For matrix-based components
	  // } 
	 
	  // else if (typeof nex.elem.getValue === 'function') {
		// return nex.elem.getValue();
	  // }
 
	  // return undefined;
	// }); 	   
	   
   // }
   
   
 let fx = track;
   
 
	
   return {
	 sample: track.sample || null,
	 sampleLen:track.sampleLen,
	 tone:track.tones.name,
	 loop:track.loop,
	 start:track.start,	 
	 end:track.end,
	 rate:track.rate,	 
     fx:track.fx.map(effect => effect.name),
	 valtone:track.nexus.map(nex=> {
	  if (nex.elem.value !== undefined) {
		return nex.elem.value;
	  } 
	  else if (nex.elem.state !== undefined && typeof nex.elem.state === 'boolean') {
	   // console.log(nex);
		return nex.elem.state;
	  }	  
	  else if (nex.elem.points) {
		 	return nex.elem.points; 
		 //return nex.elem.points.map(({ x, y }) => ({ x, y }));
	  } 
 
	  else if (typeof nex.elem.getValue === 'function') {
		return +nex.elem.getValue();
	  }
 
	  return undefined;
	}),
	
	
	
	
	
	valfx:track.nexusFX?.map(innerArray => 
        innerArray?.map(nex => {
            const elem = nex?.elem;
            const value = elem?.value ?? 
                         elem?.points ?? 
                         (typeof elem?.getValue === 'function' ? elem.getValue() : undefined);
            return value !== undefined ? value : null;
        })?.filter(val => val !== null) ?? []
    )?.filter(arr => arr.length > 0) ?? [],
	elemType:track.nexusFX?.map(innerArray => 
        innerArray?.map(nex => {
            const elem = nex?.elemType;
             return elem;
        })?.filter(val => val !== null) ?? []
    )?.filter(arr => arr.length > 0) ?? [],
	
	  vol:track.vol.values[0]

   };
   
   
}



function closeListSounds()
{
	
  document.getElementById("savesound").style.display="none";	
	
}


function soundCC( dt1, dt2, dt3 )
{
	 
	
	let vv = dt1 - 176;
	let fx = Math.floor(dt2 / 10);
    let set = dt2 % 10;

    if( dt2 >= 10 )
	{
		fx = fx - 1;
		
		let theCC = CC?.[vv]?.[fx]?.[set];

 
		 
		if( theCC )
		{   
		 tracks[vv].nexusFX[fx][set].elem.value =
		 mapval( dt3 , 0 , 127 , tracks[vv].nexusFX[fx][set].elem._value.min , tracks[vv].nexusFX[fx][set].elem._value.max);
		}	
		
	}
 

  //	CC[actualTrack][countFX[actualTrack]][countBt] = paramName;
	
}

let xyPos = null;
let xySize = null;

let xyMan = null;
let xyBox = null;

function drawCtrl()
{
	return;
 
	  xyPos = new Nexus.Position('#xypos',{
	  'size': [120,120],
	  'mode': 'relative',  // "absolute" or "relative"
	  'x': 0,  // initial x value
	  'minX': -1.2,
	  'maxX': 1.2,
	  'stepX': 0.1,
	  'y': 0,  // initial y value
	  'minY': -1.2,
	  'maxY': 2.8,
	  'stepY': 0.01
	});


	  xySize = new Nexus.Position('#xysize',{
	  'size': [120,120],
	  'mode': 'relative',  // "absolute" or "relative"
	  'x': 0.5,  // initial x value
	  'minX': 0.1,
	  'maxX': 1,
	  'stepX': 0.1,
	  'y': 0.5,  // initial y value
	  'minY': 0.1,
	  'maxY': 1,
	  'stepY': 0.1
	});


let countChangeXY = 2;
let _ignoreXYChange = false;
let _ignoreSZChange = false;

 
 xyPos.on('change',function(v) {
	 
	 if (_ignoreXYChange) return; 
	 	 
	 
	//if(countChangeXY>0){countChangeXY = countChangeXY -1;   return;} 
 
  	
	xBar[selBoneBar] = v.x;
	
 	yBar[selBoneBar] = mapval(v.y, -1.2, 2.8, 2.8, -1.2);	
  
 //  console.log("s : " + selBoneBar +" " +  mapval(v.y, -1.2, 2.8, 2.8, -1.2) );
 
 });

 xySize.on('change',function(v) {
	 
	if( _ignoreSZChange ) return; 
   
   	widthBar[selBoneBar] = v.x;
	heightBar[selBoneBar] = 1 - v.y;
 

 });	
	
	
	  xyMan = new Nexus.Position('#xyman',{
	  'size': [120,120],
	  'mode': 'relative',  // "absolute" or "relative"
	  'x': 64,  
	  'minX': 0,
	  'maxX': 127,
	  'stepX': 0.1,
	  'y': 64,   
	  'minY': 0,
	  'maxY': 127,
	  'stepY': 0.01
	});
	
	 xyMan.on('change',function(v) {
		 
      setCam(0,v.x);
	  setCam(1,v.y);
	 
	});	


	  xyBox= new Nexus.Position('#xybox',{
	  'size': [120,120],
	  'mode': 'relative',  // "absolute" or "relative"
	  'x': 1.8,  
	  'minX': 0,
	  'maxX':  3.6,
	  'stepX': 0.01,
	  'y': 1.8,   
	  'minY': 0,
	  'maxY':3.6,
	  'stepY': 0.01
	});
	
	 xyBox.on('change',function(v) {
   
	  facteurX = 1.8 - v.x;
	  facteurY = 1.8 - v.y;
	
	});		
	
}



function mapval(value, fromMin, fromMax, toMin, toMax) 
{
  
  let percentage = (value - fromMin) / (fromMax - fromMin);
  
  let ret = Number(toMin + percentage * (toMax - toMin));
  
  return ret;
  
}


 function mapvalExp2(value, fromMin, fromMax, toMin, toMax, exp = 1.05) {
    let percentage = (value - fromMin) / (fromMax - fromMin); // Normalize between 0 and 1
    percentage = 1 - Math.pow(1 - percentage, exp); // Apply exponential scaling, favoring lower values
	
	  console.log( value  +  " exp " +  (toMin + percentage * (toMax - toMin)) ) ;
	
    return toMin + percentage * (toMax - toMin);
}

function mapvalExp(value, fromMin, fromMax, toMin, toMax, exp = 2.6) {
  // Normalize between 0 and 1
  let p = (value - fromMin) / (fromMax - fromMin);
  p = Math.max(0, Math.min(1, p)); // clamp

  // Exponential shaping: slow rise at first, fast near the end
  const shaped = Math.pow(p, exp);

  // Map back to target range
  const result = toMin + shaped * (toMax - toMin);

 // console.log(value + " -> " + result);
  return result;
}


 

function mapvalLog(value, fromMin, fromMax, toMin, toMax, base = 10) {
  let percentage = (value - fromMin) / (fromMax - fromMin);
  percentage = Math.log1p(percentage * (base - 1)) / Math.log(base);
  
 // console.log( value  +  " log " +  (toMin + percentage * (toMax - toMin)) ) ;
  return toMin + percentage * (toMax - toMin);
}


function newSounds() {
    // Clear all existing sounds/tracks
    emptySounds();

    // Also clear the sound name input field
    const soundNameInput = document.getElementById("soundname");
    if (soundNameInput) soundNameInput.value = "";

    currentSound = null; // Reset currentSound tracker

    // Optionally hide save button etc.
    const saveButton = document.getElementById("savesound");
    if (saveButton) saveButton.style.display = "none";

    // Add piano back (optional: depends if you want to start with piano)
    if (piano == null) addPiano();
	
	
	
		flagNewTone = false;	
			flipNewTone(0);
		
		
	flipSoundOn(true);
}



function deleteSounds() {
    const soundNameInput = document.getElementById("soundname");
    if (!soundNameInput) return;

    const nameValue = soundNameInput.value.trim();
    if (nameValue === "") {
        alert("No sound name specified. Cannot delete a track.");
        return;
    }

    if (tracks.length === 0) {
        alert("No tracks to delete.");
        return;
    }

    // Remove the actual track from the tracks array and DOM
    const trackId = `track-${actualTrack}`;
    const trackElement = document.getElementById(trackId);
    if (trackElement) {
        trackElement.remove();
    }

    // Dispose of tone and effects in the actualTrack
    if (tracks[actualTrack]) {
        const track = tracks[actualTrack];

        if (track.tones) {
            track.tones.triggerRelease();
            track.tones.disconnect();
            track.tones.dispose();
        }

        track.fx.forEach(fxNode => {
            fxNode.disconnect();
            fxNode.dispose();
        });
    }

    // Remove track from array
    tracks.splice(actualTrack, 1);

    // Adjust counters accordingly
    trackCount = tracks.length;
    countFX.splice(actualTrack, 1);
    osc.splice(actualTrack, 1);
    CC.splice(actualTrack, 1);

    // Reset actualTrack index safely
    actualTrack = Math.min(actualTrack, tracks.length - 1);
    exActualTrack = actualTrack;

    // Remove from localStorage presets
    let myTemplates = JSON.parse(localStorage.getItem('mySounds')) || {};
    if (myTemplates.hasOwnProperty(nameValue)) {
        delete myTemplates[nameValue];
        localStorage.setItem('mySounds', JSON.stringify(myTemplates));
    }

    // Reset UI that depends on tracks, clear name field
    soundNameInput.value = "";

    // Clear everything and start fresh
    newSounds();
}





function flipSoundOn(st)
{
	flagSoundOn = st;
	
	if(st == true)
	{
		if(trackCount == 0)
		{
			flagNewTone = false;	
			flipNewTone(0);
				
		}
		
        if(!soundInit)initTone();
		 
		
	     

       //  loadPreset();
		 
		 document.getElementById("sound").style.display="";
	}
	else document.getElementById("sound").style.display = "none";
	
	
}





function changeCCFX(ch,nn,val,id)
{
 
	let sel = document.getElementById(id);
	
	let idx = -1;
	  for (let i = 0; i < sel.options.length; i++) {
		if (sel.options[i].value === val) {
		  idx = i;  
		}
	  }	
	 
 
  let selectedOption = sel.options[idx];
     
  
  let bgColor = window.getComputedStyle(selectedOption).backgroundColor;
  sel.style.backgroundColor = bgColor;
  
  if(val!=0)sel.style.color="white";
  else
  {
	  sel.style.color="#FF4400"; 
	  sel.style.backgroundColor = "black";  
  }	 

	val=Number( val );

  
    changeCC( ch,nn,val );
	
    document.getElementById(ch+"cc"+nn).value = val;
  
} 


function adCCFX( track,fx,bt,param,color)
{

	  for (let i = 1; i <= 4; i++) 
	  {	
			let sel = document.getElementById(track + 1 + "ccfx" + i);
			
			let option = document.createElement("option");
			option.value = 10 + (10 * fx) + bt;
			option.text = param;
			option.style.backgroundColor = color;
			
			sel.appendChild(option);
			
			sel.disabled = false;
			
	  }		
	
}


function removeCCFX(track,fx)
{
	removeAllCCFX(track);

	let len = CC[track].length;
	
	  for (let i = 0; i < len; i++) 
	  {	
          let len2=CC[track][i].length;
		  
			for (let j = 0; j < len2; j++) 
	        {		
	            adCCFX( track,i,j,CC[track][i][j],tracks[track].nexusColor[i]);

		    }
		   
	  }

}


function removeAllCCFX(track)
{
	track = track + 1;
	
	  for (let i = 1; i <= 4; i++) 
	  {	
			let sel = document.getElementById(track  + "ccfx" + i);
			
			    if (!sel) {
     
				  continue;
				}
			
			while (sel.options.length > 1) 
			{
               sel.remove(1);  
            }
	  }		
}

function selectSound(str,el)
{
	  const val = el.value;
      if (!val) return; // Ignore dummy option
	
	if(str == "load")loadSounds()
    else if(str == "save")saveSounds()
    else if(str == "delete")deleteSounds()		
    else if(str == "new")newSounds()	
	 else if(str == "share")shareSounds()		
		
	el.value = "";
		
}

function chooseCCminmax(ch,nn)
{

	document.getElementById("minccval"+ch).innerHTML = nn;
	
	document.getElementById("mincc"+ch).value = arrCCmin[ch-1][nn-1];
	document.getElementById("maxcc"+ch).value = arrCCmax[ch-1][nn-1];	
	
}



function minCC(ch,val)
{	
	val = Number(val);
	
	let nn = Number(document.getElementById("minccval"+ch).innerHTML);
	

	
	ch = ch -1;
	nn=nn-1;
	
	arr=[143,112 + (4 * ch) + nn ,val];
	sendMidiUsb(arr);	
	
	arrCCmin[ch][nn] = val;
	
}

function maxCC(ch,val)
{
	val = Number(val);	
	
	let nn = Number(document.getElementById("minccval"+ch).innerHTML);
	
	console.log(ch,nn,val);
	
		ch = ch -1;
	nn=nn-1;
	
	arr=[143, 52 + (4 * ch) + nn ,val];
	sendMidiUsb(arr);	
	
    arrCCmax[ch][nn] = val;
	
}


///////////////////SAMPLES//////////

const dbName = 'localSamplesDB';
const storeName = 'samples';
let db;


// Make these functions globally accessible
window.saveSampleToDB = async (file) => {
  await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Store only { name, blob } to avoid File issues
    const data = { name: file.name, blob: file };

    const request = store.put(data);
    request.onsuccess = () => {
      console.log('Sample saved to DB:', file.name);
      resolve(true);
    };
    request.onerror = () => reject(request.error);
  });
};

window.getAllLocalSamples = async () => {
  await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.map(r => r.name));
    request.onerror = () => reject(request.error);
  });
};
 
window.openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = e => {
      db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'name' });
      }
    };
  });
};




// --- Wait until DOM is ready ---
document.addEventListener('DOMContentLoaded', () => {

  // --- IndexedDB setup ---
  const dbName = 'localSamplesDB';
  const storeName = 'samples';
  let db;

  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };
      request.onupgradeneeded = e => {
        db = e.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'name' });
        }
      };
    });
  };

const saveSampleToDB = async (file) => {
  await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Store only { name, blob } to avoid File issues
    const data = { name: file.name, blob: file };

    const request = store.put(data);
    request.onsuccess = () => {
     // console.log('Sample saved to DB:', storeName);  // ✅ logs
      resolve(true);
    };
    request.onerror = () => reject(request.error);
  }).then(() => {
    
	let nm = file.name.split("."); 
	console.log(nm[0]);
    closeSamplePage(); // ✅ will run
  });
};


  const getSampleFromDB = async (name) => {
    await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(name);
      request.onsuccess = () => resolve(request.result ? request.result.blob : null);
      request.onerror = () => reject(request.error);
    });
  };
  
   window.getSampleFromDB = getSampleFromDB;
   window.getSampleFromDB = getSampleFromDB;

  const getAllLocalSamples = async () => {
    await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.map(r => r.name));
      request.onerror = () => reject(request.error);
    });
  };

  // --- Upload button handler ---
  function chooseSample() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.wav,.mp3';
    input.onchange = async e => {
      const file = e.target.files[0];
      if (file) {
        await uploadLocalSample(file);
        await loadSampleList();
      }
    };
    input.click();
  }

  // --- Initialize upload button ---
  const uploadBtn = document.getElementById('uploadSampleBtn');
  if (uploadBtn) uploadBtn.onclick = chooseSample;

  // --- Create a sample div with optional share button ---
  function createSampleDiv(name, type, filename) {
    const div = document.createElement('div');
    div.className = 'buttsample';
    div.textContent = name;

    div.addEventListener('click', async () => {
   
      await loadSample(type, filename || name);
    });

    if (type === 'local') {
      const share = document.createElement('button');
      share.textContent = '⇪';
      share.style.marginLeft = '5px';
      share.title = 'Share on server';
      share.addEventListener('click', async e => {
        e.stopPropagation();
        await shareSample(name);
        await loadSample('local', name);
      });
      div.appendChild(share);
    }

    return div;
  }

  // --- Load sample list ---
  async function loadSampleList() {
    const container = document.getElementById('samplelist');
    if (!container) return;
    container.innerHTML = '';

    // LOCAL SAMPLES
    const localSamples = await getAllLocalSamples();
    if (localSamples.length) {
      const h3 = document.createElement('h3'); h3.textContent = 'Local Samples'; container.appendChild(h3);
      for (const name of localSamples) {
        container.appendChild(createSampleDiv(name, 'local'));
      }
    }

    container.appendChild(document.createElement('hr'));

    // SHARED SAMPLES
    try {
      const resp = await fetch('samples/sample_list.php');
	  
	//  console.log(resp);
	  
      const sharedSamples = await resp.json();
      if (sharedSamples.length) {
        const h3 = document.createElement('h3'); h3.textContent = 'Shared Samples'; container.appendChild(h3);
        for (const filename of sharedSamples) {
          const realName = filename.split('_sp_').slice(1).join('-').replace(/\.[^/.]+$/, '');
          container.appendChild(createSampleDiv(realName, 'shared', filename));
        }
      }
    } catch (err) {
      console.error('Failed to fetch shared samples', err);
    }
  }

  // --- Upload local sample ---
  async function uploadLocalSample(file) {
    await saveSampleToDB(file);
  }

  // --- Share sample to server ---
  async function shareSample(filename) {
    try {
      const blob = await getSampleFromDB(filename);
      if (!blob) {
        alert('Sample not found locally!');
        return;
      }

      const file = new File([blob], filename, { type: blob.type });
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('samples/sample_upload.php', { method: 'POST', body: formData });
      const data = await uploadRes.json();

      if (data.success) {
        alert('Shared successfully!');
        await loadSampleList();
      } else {
        alert('Share failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Share failed: ' + err.message);
    }
  }

  // --- Load sample into Tone.Player ---
  
async function loadSample(type, filename) {
  return new Promise(async (resolve, reject) => { // <-- Wrap in Promise
    let url;
    if (type === 'local') {
      const blob = await getSampleFromDB(filename);
      if (!blob) {
        alert('Local sample missing!');
        return resolve(false); // Resolve/Reject appropriately
      }
      url = URL.createObjectURL(blob);
    } else {
      url = 'samples/' + filename;
      // ... (rest of the local DB storage logic remains the same)
      const localSamples = await getAllLocalSamples();
      const realName = filename.split('_sp_').slice(1).join('-');
      if (!localSamples.includes(realName)) {
        const res = await fetch(url);
        const blob = await res.blob();
        await saveSampleToDB(new File([blob], realName, { type: blob.type }));
      }
    }

    const nameWithoutExt = filename.replace(/^.*_sp_/, '').replace(/\.[^/.]+$/, '');
    
    let justName = filename.split("_sp_");
    if(justName.length > 1)justName = justName[1];
    else justName = filename;
          
    // tracks[actualTrack].tones = new Tone.Player({
      // url,
      // onload: () => {
        // sampleLoaded(actualTrack);
        // resolve(tracks[actualTrack].tones); 
      // onerror: (e) => {  
        // console.error("Tone.Player Error:", e);
        // reject(e);
      // }
    // }).toDestination();
	
	
	    tracks[actualTrack].tones.load( 
      url, () => {
        sampleLoaded(actualTrack);
       // resolve(tracks[actualTrack].tones); // <-- Resolve the Promise here!
      });
    
    tracks[actualTrack].sample = justName;
    
 

    closeSamplePage();	
    console.log( "mySample-" + actualTrack );
    const elem = document.getElementById("mySample-" + actualTrack);
    if (elem) elem.textContent = nameWithoutExt;

  }); // End of new Promise
}
 
  window.loadSample = loadSample;

  // --- Sample page control ---
  window.changeSample = function(trackCount) {
	  actualTrack = trackCount;
    document.getElementById("samplepage").style.display = "block";
    loadSampleList();
  };

  window.closeSamplePage = function() {
    document.getElementById("samplepage").style.display = "none";
  };

});




async function swapSample(type, filename) {
    // We no longer wrap the entire function in a new Promise, 
    // because the 'async' function implicitly returns a Promise.
    
    let url;
    // ... (Your logic to determine 'url' and save to DB remains here) ...
    if (type === 'local') {
        const blob = await getSampleFromDB(filename);
        if (!blob) {
            alert('Local sample missing!');
            return false; // Return false or throw an error
        }
        url = URL.createObjectURL(blob);
    } else {
        url = 'samples/' + filename;
        // ... (Local DB storage logic) ...
    }

    const nameWithoutExt = filename.replace(/^.*_sp_/, '').replace(/\.[^/.]+$/, '');
    let justName = filename.split("_sp_");
    if(justName.length > 1) justName = justName[1];
    else justName = filename;
    
    // --- The Crucial Change ---
    try {
        console.log("swap: Loading started...");
        
        // Use await player.load(url). This is what causes the function 
        // to pause until loading is complete (success or failure).
        await tracks[actualTrack].tones.load(url);
        
        // --- This code runs ONLY after the sample is fully loaded and decoded ---
        console.log("swap-resolve: Sample loaded successfully!");
        sampleLoaded(actualTrack,"load"); // <-- **Now it fires correctly!**

    } catch (error) {
        console.error("Tone.Player load failed:", error);
        // You can throw or return false here to indicate failure
        return false; 
    }
    // -------------------------
    
    tracks[actualTrack].sample = justName;
    console.log(tracks[actualTrack].sample);

    closeSamplePage();	
    console.log("mySample-" + actualTrack);
    const elem = document.getElementById("mySample-" + actualTrack);
    if (elem) elem.textContent = nameWithoutExt;
    
    // If the function completes, it resolves the original Promise returned by 'async'
    return tracks[actualTrack].tones; 
}

function patchNexusUIConstructors() {
    const componentTypes = [ 'Slider', 'Dial',  'Multislider' ];
    componentTypes.forEach(type => {
        const OriginalConstructor = Nexus[type];
        if (!OriginalConstructor) return;

        // Use a generic function signature to capture all arguments
        Nexus[type] = function(...args) { 
            // A. Call the original constructor to create the component
            const component = new OriginalConstructor(...args);

            // B. --- ATTACH GLOBAL LISTENER HERE ---

            // 1. Get the container element (the parent of the created Nexus Canvas/SVG)
            const containerElement = component.element.parentElement;
            
            // 2. Prioritize the container's ID, then Nexus's internal label/type
            const componentId = containerElement && containerElement.id
                ? containerElement.id  // <--- The ID you want
                : component.label || component.type;
				
				let spl = componentId.split("-");
				let id = "valu-" + spl[1];
				let elm = document.getElementById(id);

            component.on('change', (value) => {
                // console.log(`\n\n📡 AUTO-LOG: ${type} Change`);
                // console.log(`   ID:    ${componentId}`); // <-- Logs the container ID
				
				let vv = value;
				if (Array.isArray(value))vv = value[0];
				
				//console.log(value);
				let val = vv.toFixed(2);
				if(value>9.99)val = vv.toFixed(0);
				elm.innerHTML = val;
                
                const logValue = typeof value === 'object' ? JSON.stringify(value) : value;
                // console.log(`   VALUE: ${logValue}`);
				
				
				
            });
            // ------------------------------------

            return component;
        };

        // Ensure the prototype is maintained
        Nexus[type].prototype = OriginalConstructor.prototype;
    });

    console.log("✅ Nexus UI constructors successfully patched to log Container ID (via parentElement).");
}

// Ensure this runs after Nexus UI is loaded but before components are created
document.addEventListener('DOMContentLoaded', () => {
    // A small timeout ensures Nexus UI itself has finished initializing.
    setTimeout(patchNexusUIConstructors, 50); 
});


 initStyle();



