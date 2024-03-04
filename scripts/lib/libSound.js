"use strict";

export const EAudioStateType = {Stopped: 1, Playing: 2, Paused: 3};

export const EOctave = {Octave1: 0, Octave2: 1, Octave3: 2, Octave4: 3, Octave5: 4, Octave6: 5, Octave7: 6, Octave8: 7, Octave9: 8};
export const ENoteName = {C: "C", Db: "Db", D: "D", Eb: "Eb", E: "E", F: "F", Fb: "Fb", G: "G", Gb: "Gb", A: "A", Bb: "Bb", B: "B" }

const Notes = {
  //       0      1     2        3        4      5         6      7         8
     C: [16.35, 32.70,  65.41, 130.80, 261.60, 523.30, 1047.00, 2093.00, 4186.00],
    Db: [17.32, 34.65,  69.30, 138.60, 277.20, 554.40, 1109.00, 2217.00, 4435.00],
     D: [18.35, 36.71,  73.42, 146.80, 293.70, 587.30, 1175.00, 2349.00, 4699.00],
    Eb: [19.45, 38.89,  77.78, 155.60, 311.10, 622.30, 1245.00, 2489.00, 4978.00],
     E: [20.60, 41.20,  82.41, 164.80, 329.60, 659.30, 1319.00, 2637.00, 5274.00],
     F: [21.83, 43.65,  87.31, 174.60, 349.20, 698.50, 1397.00, 2794.00, 5588.00],
    Fb: [23.12, 46.25,  92.50, 185.00, 370.00, 740.00, 1480.00, 2960.00, 5920.00],
     G: [24.50, 49.00,  98.00, 196.00, 392.00, 784.00, 1568.00, 3136.00, 6272.00],
    Gb: [25.96, 51.91, 103.80, 207.70, 415.30, 830.60, 1661.00, 3322.00, 6645.00],
     A: [27.50, 55.00, 110.00, 220.00, 441.00, 880.00, 1760.00, 3520.00, 7040.00],
    Bb: [29.14, 58.27, 116.50, 233.10, 466.20, 932.30, 1865.00, 3729.00, 7459.00],
     B: [30.87, 61.74, 123.50, 246.90, 493.90, 987.80, 1976.00, 3951.00, 7902.00]
};

let atx = null;
const tones = [];

/*----------------------------------------------------------------
------ Class TTone -----------------------------------------------
----------------------------------------------------------------*/
// This class is private, use "createTone" to make an instance of TTone
function TTone(aTone, aType) {
  const oscillator = atx.createOscillator();
  const gain = atx.createGain();
  gain.gain.value = 0;
  oscillator.type = aType;
  oscillator.connect(gain);
  oscillator.frequency.setValueAtTime(aTone, atx.currentTime);
  oscillator.start(0);
  //gain.gain.setTargetAtTime(1, atx.currentTime + 0.01, 0.01);
  let isConnected = false;

  this.play = function () {
    if (!isConnected) {
      gain.connect(atx.destination);
      isConnected = true;
    }
    gain.gain.setTargetAtTime(1, atx.currentTime + 0.001, 0.005);
  };

  this.stop = function () {
    gain.gain.setTargetAtTime(0, atx.currentTime + 0.001, 0.005);
  };

  this.getNote = function () {
    const note = oscillator.frequency.value.toFixed(2);
    return parseFloat(note);
    //return oscillator.frequency.value;
  } 
}

/*----------------------------------------------------------------
------ Class TSound -----------------------------------------------
----------------------------------------------------------------*/
export function TSound(aSoundFile){
  const audio = new Audio(aSoundFile);
  let audioState = EAudioStateType.Stopped;
  let soundMuted = false;

  this.play = function(){
    if(!soundMuted){
      audio.currentTime = 0;
      audio.play();
      audioState = EAudioStateType.Playing;
    }
  }

  this.stop = function(){
    audio.pause();
    audio.currentTime = 0;
    audioState = EAudioStateType.Stopped;
  }

  this.pause = function(){
    audio.pause();
    audioState = EAudioStateType.Paused;
  }

  this.resume = function(){
    if(!soundMuted){
      audio.play();
      audioState = EAudioStateType.Playing;
    }
  }

  this.getAudioState = function(){
    return audioState;
  }
}

export function createTone(aNoteName, aOctave, aType = "sine") {
  if(!atx){
    atx = new AudioContext();
  }
  const note = Notes[aNoteName][aOctave];
  for (let f = 0; f < tones.length; f++) {
    if (tones[f].getNote() === note) {
      return tones[f];
    }
  }
  const newTone = new TTone(note, aType);
  tones.push(newTone);
  return newTone;
};