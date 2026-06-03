void loadBank(int b, int fromGear = 0);
void sendSysex(int b, int fromGear = 0);

#include <WiFi.h>
#include <HTTPUpdate.h>

// Public release defaults. Fill these locally only if you use the OTA updater.
const char* SSID = "";
const char* PASS = "";
  
#include <FastLED.h>
#define NUM_LEDS 9
#define DATA_PIN 21
#define CLOCK_PIN 13
CRGB leds[NUM_LEDS]; 

 
const int chanToLed[8] = {4,5,6,7,8, 1, 2 , 3};      

#include "USB.h"
#include "USBMIDI.h"
USBMIDI MIDI;
 
#include <EEPROM.h>

long lastUltra = 0;

#define SYSEX_BUFFER_SIZE 256
uint8_t sysexBuffer[SYSEX_BUFFER_SIZE];
size_t sysexLength = 0;
bool receivingSysEx = false;

int cntLED = 0;
int exDist = 0;
int exCC = 0;
float distance2;
int hereNote = 0;
int cntTouch= 1;

int flagBank = 0;
int bank = 0;

int chan[] = {0,0,0,0};
int flagChan[] = {0,0,0,0};
int locked[] = {0,0,0,0};

int shift = 0;
int stop = 0; 
int play = 0;

int cc[] = {0,0,0,0};
int isOn[] = { 0,0,0,0};
int note[] = { -1,-1,-1,-1 };

int calib[] = { 33000,33000,33000,33000,33000,33000,33000,33000,33000,33000,33000,33000,33000,33000 };

int myPin[14] = {9,10,11,12  ,4,5,6,7,  13,14,    8,3,   1,2}; // old 

// int myPin[14] = { 13,12,11,10,9,7,3,8,4,5,6 };  // new

const int trigPin = 47;
const int echoPin = 45;

int noHandCount = 0; 
unsigned long lastSeenHandTime = 0;
const unsigned long handTimeout = 20; // ms
bool handDetected = false; 

int switched[] = {0,0,0,0};
int flagSendBank = 0;

int arrCC[4][4] = {
  {0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0}
};

// EEPROM Layout comments...
uint8_t scale[4][8] = {
  {0,1,2,3,4,5,6,7},
   {0,1,2,3,4,5,6,7},
    {0,1,2,3,4,5,6,7},
    {0,1,2,3,4,5,6,7}
};

uint8_t memCC[4][4] = 
{  
   {2,3,4,5},{6,7,8,9},{10,11,12,13},{14,15,16,17} 
};

uint8_t memCCmin[4][4] = 
{  
   {0,0,0,0} ,{0,0,0,0} ,{0,0,0,0} ,{0,0,0,0} 
};

uint8_t memCCmax[4][4] = 
{  
   {127,127,127,127}, {127,127,127,127},{127,127,127,127},{127,127,127,127} 
};

int memChan[4] = {  1,2,3,4 };
int memLen[4]={5,6,8,8};

int flagRec = 0;
unsigned long lastNoteTime = 0;
int bpm = 110 ;
int recOn = 0;
int playOn = 0;
int recCount = 0;
int loopCount = 0;
int playCount = 0;
int maxPlay = 0;

int doRec = 0;
int maxCount = 0;
int loopLen = 0;

unsigned long pacer = (60.0 / (bpm * 8.0)) * 1000000;

int unsigned timeLoop[8000];
uint8_t eventLoop[8000];
uint8_t noteLoop[8000];
uint8_t veloLoop[8000];
uint8_t idxLoop[8000];

int maxLoop = 8000;

int eventFader[4];
int noteFader[4];
int countFader[]={0,0,0,0};
int noteLoopLast[] = { -1,-1,-1,-1};

int startBend = -1;
int nowBend = 0; 
long pitchBend = 0;

int flagCalib = 0;
int countCalib = 0;

int flagUpdate = 0;
int countUpdate = 0;

// Touch reading variables
int touchValues[14];
int lastTouchValues[14];
int touchDebounce[14];
const int TOUCH_DEBOUNCE_COUNT = 3;

void loopLoop()
{
  unsigned long now = micros();
  unsigned long elapsed = now - lastNoteTime;
  if (elapsed >= pacer) {  
    lastNoteTime = now;
    if(playOn == 1 && maxCount > 0)playLoop();
    loopCount++; 
    playFader();
    if(loopCount >= loopLen  && maxCount != 0 && doRec == 0)
    {
      loopCount = 0;
      playCount = 0;
    }
  }
}

void playFader()
{
  for(int i = 0; i < 4; i++) 
  {
    if(countFader[i] == 1)
    {
      MIDI.noteOff(note[i], 0, eventFader[i] - 143);
      if (distance2 > 0 || distance2 < 45) 
      {
        MIDI.noteOn( noteFader[i], 127, eventFader[i] - 143 );
        note[i] = noteFader[i];
        isOn[i] = 1;
      }
      else
      {
        note[i] = -1;
        isOn[i] = 0;
      } 

      if(recOn == 1)
      {
        // recLoop( eventFader[i] - 16 , note[i] , 0 );
      }
      switched[i] = 0;
      countFader[i] = 0;
    }
  }
}

void recFader(int event, int note)
{
  int chn = event - 144;     
  eventFader[chn] = event;
  noteFader[chn] = note;
  countFader[chn]= 1;    
}

void playLoop()
{
  int hereCnt = timeLoop[playCount];
  while( playCount < maxCount && timeLoop[playCount] == loopCount )
  {
    if( eventLoop[playCount] < 144)
    {
     MIDI.noteOff(noteLoop[playCount],0,eventLoop[playCount] - 127 );
     noteLoopLast[ idxLoop[playCount]] = -1;
    }
    else if( eventLoop[playCount] < 160)
    {
      MIDI.noteOn(noteLoop[playCount], 127, eventLoop[playCount] - 143  );
      MIDI.pitchBend((uint16_t)8192, eventLoop[playCount] - 143 );
      noteLoopLast[idxLoop[playCount]] = noteLoop[playCount];
    }
    else if( eventLoop[playCount] >= 176 && eventLoop[playCount] < 192)
    {
      MIDI.controlChange(noteLoop[playCount] , veloLoop[playCount] , eventLoop[playCount] - 175   );
    }
    else if( eventLoop[playCount] >= 224 && eventLoop[playCount] < 240 )
    {
      uint16_t pBend = (veloLoop[playCount] << 7) | noteLoop[playCount];
      MIDI.pitchBend( pBend  , eventLoop[playCount] - 223 );
    }       
    playCount++;
    if(playCount >= maxCount){break; }
  }
  if(playCount >= maxCount){ playCount = 0;  }
}

void recLoop( int dt1 , int dt2 , int dt3, int idx = 0 )
{
  if(dt1 >= 128 && dt1 < 160 )
  {
    timeLoop[recCount] = loopCount;
    eventLoop[recCount] = dt1;
    noteLoop[recCount] = dt2;
    veloLoop[recCount] = dt3;
    idxLoop[recCount] = idx;
    recCount++;
  }
  else if( dt1 >= 176 && dt1 < 192)
  {
    timeLoop[recCount] = loopCount;
    eventLoop[recCount] = dt1;
    noteLoop[recCount] = dt2;
    veloLoop[recCount] = dt3;
    idxLoop[recCount] = idx;
    recCount++;
  }
  else if( dt1 >= 224 && dt1 < 240 )
  {
    timeLoop[recCount] = loopCount;
    eventLoop[recCount] = dt1;
    noteLoop[recCount] = dt2;
    veloLoop[recCount] = dt3;
    idxLoop[recCount] = idx;
    recCount++;
  }

  if( recCount > maxLoop )
  {
    recOn = 0;
    playOn = 1;
    recCount = 0;
    loopCount = 0;
    playCount = 0;
    loopLen = loopCount; 
    maxCount = recCount;
    doRec = 0;
  }
}

void setup() {
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);  
    Serial.begin(115200);
  delay(80);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  MIDI.begin(); 
  USB.begin();
  EEPROM.begin(2048);
  delay(25);

  // Initialize touch arrays
  for(int i = 0; i < 14; i++) {
    touchValues[i] = 0;
    lastTouchValues[i] = 0;
    touchDebounce[i] = 0;
  }

  byte val = EEPROM.read(0);
  if(val != 86)
  {
    initEEprom();
   //  Serial.println("init eeprom ");
    delay(100);
    delay(200);
  }
  else 
  {
    byte lastTrack = EEPROM.read(1);      
    delay(200);
  }

  loadBank(0,1);
  calibrage();
}

int nn = 30;

void loop() 
{
  ultraLoop();
  touchLoop();
  readMidi();
  loopLoop();
}

void ultraLoop()
{
  long duration;
  digitalWrite(trigPin, LOW);
  delayMicroseconds(4);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH, 6000);
  float distance = duration * 0.0343 / 2;
  int hereCC;

  if (duration < 15 || duration > 4800)distance = -1;
  else if (distance < 0 || distance > 60) 
  {
    distance = -1;
    hereCC = 0;
  } 
  else 
  {
    if(distance > 45 )distance = 45;
    hereCC = map(distance, 0, 45, 0, 127);
  }

  distance2 = distance;
  int diffCC = abs(hereCC - exCC);

  if (diffCC >= 1 && distance > 0 && distance < 45) {
    // NOTE ON/OFF LOGIC PER CHANNEL
    for (int ch = 0; ch < 4; ch++) {
      hereNote = map(distance, 0, 45, 0, memLen[ch] ); // - 1
      int daNote = scale[ch][hereNote];
        
      if (chan[ch] == 1 && isOn[ch] == 0)
      {
        if (note[ch] != -1)  MIDI.noteOff(note[ch], 0, memChan[ch]);
        MIDI.noteOn(daNote, 127, memChan[ch]);
        MIDI.pitchBend((uint16_t)8192, memChan[ch]);

        if (recOn == 1) {
          recLoop(143 + memChan[ch], daNote, 127, ch );
        }
        note[ch] = daNote;
        isOn[ch] = 1;
      }
      else if (switched[ch] >= 1) 
      { 
        if (switched[ch] == 1) {
          MIDI.noteOn(daNote, 127, memChan[ch]);
          MIDI.pitchBend((uint16_t)8192, memChan[ch]);
          if (recOn == 1) {
            recLoop(143 + memChan[ch], daNote, 127,ch);
          }
          note[ch] = daNote;
          isOn[ch] = 1;
        }
        else if (switched[ch] == 2) 
        {
          if (note[ch] != -1)
            MIDI.noteOff(note[ch], 0, memChan[ch]);
          if (recOn == 1) {
            if (note[ch] != -1)
              recLoop(127 + memChan[ch], note[ch], 0 , ch);
          }
          note[ch] = -1;
          isOn[ch] = 0;
        }
        switched[ch] = 0;
      } 
      else  if (note[ch] != daNote && locked[ch] == 1 && flagChan[ch] == 1 && isOn[ch] == 1) 
      {
         if( cc[0]== 0 && cc[1]== 0 &&  cc[2]== 0 &&  cc[3]== 0 ) recFader(143 + memChan[ch], daNote);
      }
    }

    hereCC = (int)(hereCC * 1.3); // scale hereCC

    if (hereCC < 127) 
    {
      for (int ch = 0; ch < 4; ch++) {
        for (int cc_idx = 0; cc_idx < 4; cc_idx++) {
         // if (chan[ch] == 1 && cc[cc_idx] == 1  && locked[ch] == 1 ) {
          if (flagChan[ch] == 1 && cc[cc_idx] == 1  ) {            
            if (arrCC[ch][cc_idx] != hereCC) 
            {
              int nowCC = map(hereCC,0,127,memCCmin[ch][cc_idx],memCCmax[ch][cc_idx]);
              MIDI.controlChange(memCC[ch][cc_idx], nowCC, memChan[ch]);
              if(recOn == 1 )recLoop( 175 + memChan[ch] , memCC[ch][cc_idx] , nowCC  );
              arrCC[ch][cc_idx] = hereCC;
            }
          }
        }
      }
    }

    if( shift == 1 )
    {
      if( startBend == -1 )
      {
        startBend = hereCC;
      } 

      int diffBend = startBend - hereCC;

      if( diffBend != nowBend ) 
      { 
        nowBend = diffBend;
        pitchBend = map(nowBend, -127, 127, 16383 , 0); 
        byte lsb = pitchBend & 0x7F;             // lower 7 bits
        byte msb = (pitchBend >> 7) & 0x7F; 

        for (int ch = 0; ch < 4; ch++) 
        {
          if(isOn[ch])
          {
            MIDI.pitchBend((uint16_t)pitchBend, ch + 1);
            if(recOn == 1) recLoop(223 + memChan[ch], lsb, msb);
          }
        }
      }
    }
    else startBend = -1;

    handDetected = true;
  }
  else if (distance > 45 || distance <= 0)  // NOTE OFF 
  {
    if (handDetected == true) {
      handDetected = false;
      return;
    }
    
    // NOTE OFF FOR ALL CHANNELS IF HAND NOT DETECTED
    for (int ch = 0; ch < 4; ch++) {
      if (isOn[ch] == 1) 
      {     
        MIDI.noteOff(note[ch], 0, memChan[ch]);
        if (recOn == 1)recLoop(127 + memChan[ch], note[ch], 0);
        isOn[ch] = 0;
        note[ch] = -1;
      }

      if (countFader[ch] != 0) 
      {
        countFader[ch] = 0;
      }
    }
  }

  exDist = distance;
  exCC = hereCC;

  if (flagSendBank == 1) {
    recOn = 0;
    playOn = 0;
    recCount = 0;
    loopCount = 0;
    playCount = 0;
    maxPlay = 0;
    doRec = 0;
    maxCount = 0;
    MIDI.programChange(bank, 1);
    flagSendBank = 0;
  }

  delay(8);
}

// Fixed touch reading function////////////////////////////////////////////////////////////////////////////
void readAllTouchInputs() {
  // Read all touch inputs with debouncing
  for(int i = 0; i < 14; i++) {
   int touchVal = touchRead(myPin[i]);
    
   float fact = 1.45;
   if(i == 2)fact = 1.06;
   else if(i == 6)fact = 4.75;

   if( touchVal > calib[i] * fact  || touchVal < calib[i] * 0.85  )continue;
      
    if(touchVal > calib[i]  ) { //&& touchVal < calib[i] * 2.35



        // Serial.print( calib[i] );
        // Serial.print(" touchVal  : " );
        // Serial.println( touchVal );  

      if(touchDebounce[i] < TOUCH_DEBOUNCE_COUNT) {
        touchDebounce[i]++;
      }
      if(touchDebounce[i] >= TOUCH_DEBOUNCE_COUNT) {
        touchValues[i] = 1;
      }
    } else {
      if(touchDebounce[i] > 0) {
        touchDebounce[i]--;
      }
      if(touchDebounce[i] <= 0) {
        touchValues[i] = 0;
      }
    }

     delayMicroseconds(180);

    //   if( i == 6 ) {
    // Serial.print( calib[i] );
    // Serial.print(" touchVal  : " );
    //     Serial.println( touchVal );
    //   }
  }


}

// Simplified touch loop
void touchLoop()
{
  readAllTouchInputs();
  
  // Control buttons (using array indices for myPin array)
  int playTouch = touchValues[12];    // myPin[12]
  int stopTouch = touchValues[13];    // myPin[13] 
  int shiftTouch = touchValues[8];    // myPin[8]
  int shift2Touch = touchValues[9];   // myPin[9]
  int plusTouch = touchValues[10];    // myPin[10]
  int minusTouch = touchValues[11];   // myPin[11]

  // CC buttons
  for(int i = 0; i < 4; i++) {
    cc[i] = touchValues[4 + i];       // myPin[4-7]
  }

  // Channel buttons
  for(int i = 0; i < 4; i++) {
    int chanTouch = touchValues[i];   // myPin[0-3]
    
    if(chanTouch && !flagChan[i]) {
      // Channel just pressed
      flagChan[i] = 1;
      switched[i] = 1;
      
      if(shiftTouch) {
        locked[i] = !locked[i];
      }
      
      chan[i] = 1;
    } else if(!chanTouch && flagChan[i]) {
      // Channel just released
      flagChan[i] = 0;
      switched[i] = 2;
      
      if(!locked[i]) {
        chan[i] = 0;
      }
    }
  }

  // Control logic
  if(shiftTouch && (plusTouch || minusTouch)) {
    // Bank change logic
    if(playOn == 1) offAllNotes();
    
    if(flagBank == 0) {
      flagBank = 1;
      if(plusTouch) bank++;
      else if(minusTouch) bank--;

      if(bank > 15) bank = 0;       
      else if(bank < 0) bank = 15;

      loadBank(bank);
      
      for (int j = 0; j < 4; j++) { 
        for(int k = 0; k < 4; k++) {
          arrCC[j][k] = 0;
        }
        cc[j] = 0;
        chan[j] = 0;
      }       
      flagSendBank = 1;
    }

    // LED display for bank selection
    for (int j = 0; j < 8; j++) {
      int led = chanToLed[j];  
      int bankHalf = bank % 8;
      
      if (bankHalf == j) { 
        if(bank < 8) leds[led] = CRGB(0,0,180);  
        else leds[led] = CRGB(70,0,70);  
      } else {
        leds[led] = CRGB(3 - (j/2), 0+ (j/2) ,0);  
      }
    }
    FastLED.show();
  } else if(!playTouch && stopTouch && !shiftTouch) {
    // STOP loop
    if(playOn == 1) offAllNotes();
    
    if(doRec == 1) {
      loopLen = loopCount; 
      maxCount = recCount;
      doRec = 0;
    } else if(flagRec == 0) {
      recOn = 0;
      playOn = 0;
    }
  } else if(playTouch && !stopTouch && !shiftTouch) {
    // PLAY loop
    if(playOn == 1) offAllNotes();
    
    if(doRec == 1) {
      loopLen = loopCount; 
      maxCount = recCount;
      doRec = 0;
    }  

    if(flagRec == 0) {
      recOn = 0;
      playOn = 1;
      recCount = 0;
      loopCount = 0;
      playCount = 0;
    }
  } else if(playTouch && stopTouch && !shiftTouch) {
    // REC loop
    if(flagRec == 0) {
      flagRec = 1;
      if(recOn == 0) {
        playOn = 0;
        recCount = 0;
        loopCount = 0;
        playCount = 0;
        doRec = 1; 
      }
    }
  } else if(!playTouch && !stopTouch && !shiftTouch) {
    flagRec = 0;
    flagBank = 0;
    flagCalib = 0;
    countUpdate = 0;
    flagUpdate = 1;
  } else if(!playTouch && !stopTouch && shiftTouch) {
    flagBank = 0;
    if(flagCalib == 0) {
      flagCalib = 1;
      countCalib++; 
    }
    flagUpdate = 0;
  } else if(!playTouch && stopTouch && shiftTouch) {
    if(flagUpdate == 0) {
      flagUpdate = 1;
      countUpdate++; 
      if(countUpdate >= 5) update();
      flagCalib = 1;
      countCalib = 0; 
    }
  }

  // Reset counters if any channel is active
  if(isOn[0] || isOn[1] || isOn[2] || isOn[3]) {
    flagCalib = 0;
    countCalib = 0;
    flagUpdate = 0;
    countUpdate = 0;           
  }

  // Update shift and play/stop states
  shift = shiftTouch;
  play = playTouch;
  stop = stopTouch;

  cntTouch++;
  if(cntTouch > 2) cntTouch = 1;   

  // LED updates
  cntLED++;
  if(cntLED == 1) {
    if(recOn == 1) {
      if (isOn[0] == 1 || isOn[1] == 1 || isOn[2] == 1 || isOn[3] == 1) 
        leds[0] = CRGB(100,0,3); 
      else 
        leds[0] = CRGB(10,0,0); 
    } else if(playOn == 1) {
      if (isOn[0] == 1 || isOn[1] == 1 || isOn[2] == 1 || isOn[3] == 1)
        leds[0] = CRGB(88,22,0);  
      else if(noteLoopLast[0] != -1 ||  noteLoopLast[1] != -1 ||  noteLoopLast[2] != -1 ||  noteLoopLast[3] != -1)
        leds[0] = CRGB(0,88,10); 
      else 
        leds[0] = CRGB(0,9,1);   
    } else if (isOn[0] == 1 || isOn[1] == 1 || isOn[2] == 1 || isOn[3] == 1) {
      leds[0] = CRGB(88,22,0);  
    } else {
      if(distance2 > 0 && distance2 < 45) 
        leds[0] = CRGB(0,5,15);       
      else
        leds[0] = CRGB(21,25,23);       
    }
    FastLED.show();
  } else if(cntLED == 3) {
    const int chanToLed[4] = {1,3,5,7}; 
    const int chanToLed2[4] = {2,4,6,8}; 

    if(flagBank == 0) {
      for (int j = 0; j < 4; j++) {
        int led1 = chanToLed[j];  
        int led2 = chanToLed2[j];      

        if (chan[j] == 1) { 
          leds[led1] = CRGB(80,19+j,0);  
          leds[led2] = CRGB(80,20+j,0);
        } else {
          leds[led1] = CRGB(1,8-j,2+j);  
          leds[led2] = CRGB(1,7-j,3+j);  
        }
      }
      FastLED.show();  
    }
  } else if(cntLED == 5) {
    cntLED = 0;
  }
}

void offAllNotes()
{
  // Add note off logic here if needed
}

void calibrage()
{
  for (int j = 0; j <= 8; j++) {   
    leds[j] = CRGB( 150 + (8 * j ) ,30 - j , 1);  
    delay(  40 + (j * 40 ));
    FastLED.show();
  }
                 
  delay( 500 );

  for(int i = 0; i < 14; i++) {
    calib[i] = touchRead(myPin[i]);
    delay(2);
  }

  for(int j = 0; j < 40; j++) {
    int hereLed = j/4;
    if( hereLed > 8)hereLed = 8;

    for(int i = 0; i < 14; i++) {
      if( i <= 8) {
        leds[hereLed] = CRGB(120 - (hereLed * 3), 88 -  (j/2) , 0 * i);  
        delay(2);                
      }
      
      int val = touchRead(myPin[i]);
      int val2 = val + calib[i];
      calib[i] = val2 / 2;
    }
    FastLED.show();  
    delay(20);  
  }

  for(int i = 0; i < 14; i++) {
    if( i == 2 )calib[i] = calib[i] + 300;
    else calib[i] = calib[i] + 850;  

    
  }

   

  countCalib = 0;
}

void initEEprom()
{
  for(int b = 0; b < 16; b++) { 
    int val = 2;
    EEPROM.write( (8 + b), 110);
    EEPROM.write( (24 + b), 0);
    
    for(int c = 0; c < 4; c++) { 
      EEPROM.write( (344 + (b * 4) + c ) , c+1);
      EEPROM.write( (408 + (b * 4) + c ) , memLen[c]);

      for(int i = 0; i < 8; i++) { 
        EEPROM.write( (472 + (b*32)  + (c * 8 ) + i) , i );
        if(i<4) {  
          EEPROM.write( (88 + (b * 16 ) + (c*4) + i) , val  ); 
          EEPROM.write( (1024 + (b * 16 ) + (c*4) + i) , 0 ); 
          EEPROM.write( (1280 + (b * 16 ) + (c*4) + i) , 127 );                
          val++;
        }
      }
    }
  }
  EEPROM.write(0,86);
  EEPROM.commit();
}

void loadBank(int b, int fromGear ) 
{
  EEPROM.write(1, b); // Update last used bank
  EEPROM.commit();

  byte bpmLSB = EEPROM.read( 8 + b);
  byte bpmMSB = EEPROM.read( 24 + b);

  bpm = (bpmMSB << 7) | bpmLSB;
  pacer = (60.0 / (bpm * 16.0)) * 1000000;

  for(int c = 0; c < 4; c++) { 
    memChan[c] = EEPROM.read( (344 + (b * 4) + c ) );
    memLen[c] = EEPROM.read( (408 + (b * 4) + c ) );

    for(int i = 0; i < 8; i++) { 
      scale[c][i] = EEPROM.read( (472 + (b*32)  + (c * 8 ) + i) );
      if(i<4) {  
        memCC[c][i] = EEPROM.read( (88 + (b * 16 ) + (c*4) + i) ); 
        memCCmin[c][i] = EEPROM.read( (1024 + (b * 16 ) + (c*4) + i) ); 
        memCCmax[c][i] = EEPROM.read( (1280 + (b * 16 ) + (c*4) + i) ); 
      }
    }
  } 

  delay(100);
  sendSysex(b,fromGear);
}

void saveBank(int b)
{
  bank = b;
  byte bpmLSB = bpm & 0x7F;
  byte bpmMSB = (bpm >> 7) & 0x7F;
  
  EEPROM.write( (8 + b), bpmLSB );
  EEPROM.write( (24 + b), bpmMSB );

  for(int c = 0; c < 4; c++) { 
    EEPROM.write( (344 + (b * 4) + c ) , memChan[c]);
    EEPROM.write( (408 + (b * 4) + c ) , memLen[c] );

    for(int i = 0; i < 8; i++) { 
      EEPROM.write( (472 + (b*32)  + (c * 8 ) + i) , scale[c][i]);
      if(i<4) {  
        EEPROM.write( (88 + (b * 16 ) + (c*4) + i) , memCC[c][i] ); 
        EEPROM.write( (1024 + (b * 16 ) + (c*4) + i) , memCCmin[c][i] ); 
        EEPROM.write( (1280 + (b * 16 ) + (c*4) + i) , memCCmax[c][i] ); 
      }
    }
  }
  EEPROM.commit();
}

void readMidi()
{
  midiEventPacket_t packet;
  while (MIDI.readPacket(&packet)) {
    uint8_t cin  = packet.header & 0x0F;
    uint8_t b1   = packet.byte1;
    uint8_t b2   = packet.byte2;
    uint8_t b3   = packet.byte3;

    switch (cin) {
      case MIDI_CIN_NOTE_ON:
        break;

      case MIDI_CIN_NOTE_OFF:
        if( b1 == 143)fakeSysex(b1,b2,b3);
        break;

      case MIDI_CIN_CONTROL_CHANGE:
        break;

      case MIDI_CIN_SYSEX_START:
        if (!receivingSysEx) {
          receivingSysEx = true;
          sysexLength = 0;
        }
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b1;
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b2;
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b3;
        break;

      case MIDI_CIN_SYSEX_END_1BYTE:
        if (!receivingSysEx) { sysexLength = 0; }
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b1;
        printSysEx();
        break;
      case MIDI_CIN_SYSEX_END_2BYTE:
        if (!receivingSysEx) { sysexLength = 0; }
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b1;
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b2;
        printSysEx();
        break;
      case MIDI_CIN_SYSEX_END_3BYTE:
        if (!receivingSysEx) { sysexLength = 0; }
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b1;
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b2;
        if (sysexLength < SYSEX_BUFFER_SIZE) sysexBuffer[sysexLength++] = b3;
        printSysEx();
        break;

      default:
        break;
    }
  }
}

void printSysEx() 
{
  Serial.print("SysEx Message: ");
  return;

  int typeMsg = sysexBuffer[2];
  int nTrack = sysexBuffer[3]; 
  int nVoice = sysexBuffer[4];
  int nArray[8];
  int nData;

  for (size_t i = 0; i < sysexLength - 1; ++i) {
    if (sysexBuffer[i] < 16) Serial.print('0');
    if( typeMsg == 1 || typeMsg == 4 ) {
      if( i > 4 )nArray[i-5]=sysexBuffer[i];
    }
  }
  
  sysexLength = 0;
  receivingSysEx = false;

  if( typeMsg == 0 ){
    bpm = sysexBuffer[4]; 
    pacer = (60.0 / (bpm * 16.0)) * 1000000;
  }
  else if( typeMsg == 1 ) {
    for(int i = 0; i < 4; i++) { 
      memCC[nVoice][i] = nArray[i];
    }
  }
  else if( typeMsg == 2 ) {
    memChan[nVoice] = sysexBuffer[5]; 
  }    
  else if( typeMsg == 3 ) {
    memLen[nVoice]  =  sysexBuffer[5];  
  }  
  else if( typeMsg == 4 ) {
    for(int i = 0; i < 8; i++) { 
      scale[nVoice][i] = nArray[i];
    }
  }
  else if( typeMsg == 5 )saveBank(bank);
  else if( typeMsg == 6 ) {
    bank = sysexBuffer[3];
    loadBank(bank,1);
  }
}

void sendSysex(int b, int fromGear )  // FAKE sysex SEND all patch
{
  if(fromGear == 0)MIDI.noteOff(1, bank, 16);    

  byte bpmLSB = bpm & 0x7F;           // Lower 7 bits
  byte bpmMSB = (bpm >> 7) & 0x7F;    // Upper 7 bits

  MIDI.noteOff(2, bpmLSB, 16);
  MIDI.noteOff(3, bpmMSB, 16);

  for(int c = 0; c < 4; c++) { 
    MIDI.noteOff(4+c, memChan[c], 16);
    MIDI.noteOff(72+c, memLen[c], 16);          

    for(int i = 0; i < 8; i++) { 
      MIDI.noteOff( 80 + (c*8) + i , scale[c][i], 16);
      if(i<4){  
        MIDI.noteOff( 8 + (c*4) + i , memCC[c][i] , 16);        
        MIDI.noteOff( 112 + (c*4) + i , memCCmin[c][i] , 16);               
        MIDI.noteOff( 52 + (c*4) + i , memCCmax[c][i] , 16);   
      }
    }
  }
}

int lBpm = 0;

void fakeSysex(int dt1,int dt2,int dt3) // RECEIVE
{
  if(dt2 == 1) {
    bank = dt3;
    loadBank(bank,0);
  }
  else if(dt2 == 2) {
    lBpm = dt3;
  }  
  else if(dt2 == 3) {
    int mBpm = dt3;
    bpm = (mBpm << 7) | lBpm;
  }  
  else if(dt2 < 8 ) {
    memChan[dt2-4] = dt3;
  }
  else if(dt2 < 24 ) {      
    dt2 = dt2 - 8;
    int c = int(dt2 / 4);
    int i = dt2%4;
    memCC[c][i] = dt3;
  } 
  else if(dt2 == 24)saveBank(bank);
  else if(dt2 >= 32 && dt2 < 36) {
    if(dt3<2)chan[dt2 - 32] = dt3;
    else {
      chan[dt2 - 32] = dt3-2;
      locked[dt2 - 32] = dt3-2;
    }
  }
  else if(dt2 >= 46 && dt2 < 52) {
    // cc control logic if needed
  }
  else if( dt2>51 && dt2 < 68 ) {
    dt2 = dt2 - 52;
    int c = int(dt2 / 4);
    int i = dt2%4;
    memCCmax[c][i] = dt3;    
  }    
  else if(dt2 > 71 && dt2 < 76 )memLen[dt2-72] = dt3;
  else if( dt2>79 && dt2 < 112 ) {
    dt2 = dt2 - 80;
    int c = int(dt2 / 8);
    int i = dt2%8;
    scale[c][i] = dt3;    
  }
  else if( dt2>111 && dt2 < 128 ) {
    dt2 = dt2 - 112;
    int c = int(dt2 / 4);
    int i = dt2%4;
    memCCmin[c][i] = dt3;    
  }
}

void update()
{
  Serial.println("update");

  for (int j = 0; j <= 8; j++) {   
    leds[j] = CRGB(0,10,j);  
    delay(30);
    FastLED.show();
  }

  flagUpdate = 0;
  countUpdate = 0; 

  int cnt = 0;
  int cnt2 = 0;

  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) {
    leds[cnt] = CRGB(25 - (cnt),30 + cnt,2 + cnt2);  
    FastLED.show();

    cnt++;
    if(cnt > 8) {
      cnt = 0;
      cnt2 = cnt2 + 5;
    }
    delay(350);
    Serial.print(".");
  }
  Serial.println("\nConnected!");

  for (int j = 0; j <= 8; j++) {   
    leds[j] = CRGB(0,50-j,30+j);  
    delay(30);
    FastLED.show();
  }

  WiFiClient client;
  const char* host = "ultragear.midistream.com";
  int port = 80;
  const char* path = "/update-UG1/UG4_V1_01.ino.bin";

  t_httpUpdate_return ret = httpUpdate.update(client, host, port, path);

  switch (ret) {
    case HTTP_UPDATE_FAILED:
      Serial.printf("HTTP_UPDATE_FAILED Error (%d): %s\n",
                    httpUpdate.getLastError(),
                    httpUpdate.getLastErrorString().c_str());
      break;
    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("HTTP_UPDATE_NO_UPDATES");
      break;
    case HTTP_UPDATE_OK:
      Serial.println("HTTP_UPDATE_OK");
      break;
  }
}
