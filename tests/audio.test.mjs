import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { create, act } from 'react-test-renderer';

const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
let useAudio, api, renderer;
let instances=[], blocked=false, listeners=new Map();
const original={};
class Media {
  constructor(src){this.src=src;this.volume=1;this.loop=false;this.paused=true;this.playCount=0;this.pauseCount=0;this.events=new Map();instances.push(this);}
  addEventListener(name,fn){this.events.set(name,fn);}
  removeEventListener(name){this.events.delete(name);}
  play(){this.playCount++;if(blocked){this.paused=true;return Promise.reject(Object.assign(new Error('Gesture required'),{name:'NotAllowedError'}));}this.paused=false;this.events.get('playing')?.();return Promise.resolve();}
  pause(){this.paused=true;this.pauseCount++;}
  load(){}
  removeAttribute(name){if(name==='src')this.src='';}
}
function Probe({enabled=true,bgm=.3,sfx=.3,chapter=0}){api=useAudio(enabled,bgm,sfx,chapter);return null;}
before(async()=>{
  for(const key of ['Audio','document','IS_REACT_ACT_ENVIRONMENT'])original[key]=Object.getOwnPropertyDescriptor(globalThis,key);
  Object.defineProperty(globalThis,'Audio',{configurable:true,value:Media});
  Object.defineProperty(globalThis,'document',{configurable:true,value:{hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)}});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const result=await build({entryPoints:['src/hooks/useAudio.ts'],bundle:true,write:false,format:'esm',platform:'node',external:['react'],define:{'import.meta.env.BASE_URL':JSON.stringify('./')},logLevel:'silent'});
  const dir=resolve('node_modules/.cache/wanted-me-audio-tests');mkdirSync(dir,{recursive:true});const file=resolve(dir,'audio.mjs');writeFileSync(file,result.outputFiles[0].text);useAudio=(await import(pathToFileURL(file).href)).useAudio;
});
after(async()=>{if(renderer)await act(async()=>renderer.unmount());for(const key of Object.keys(original)){if(original[key])Object.defineProperty(globalThis,key,original[key]);else delete globalThis[key];}});
async function mount(props={}){if(renderer)await act(async()=>renderer.unmount());instances=[];blocked=false;listeners=new Map();document.hidden=false;await act(async()=>{renderer=create(React.createElement(Probe,props));});}
async function update(props){await act(async()=>renderer.update(React.createElement(Probe,props)));}

test('first gesture starts an audible looping soundtrack and reports actual playback',async()=>{
  await mount();assert.equal(instances.length,0,'no autoplay before a gesture');
  await act(async()=>api.start());
  assert.equal(instances.length,1,'a bundled soundtrack is created');
  assert.match(instances[0].src,/case-001-ambient\.wav$/);assert.equal(instances[0].loop,true);
  assert.equal(instances[0].volume,.3);assert.equal(instances[0].paused,false);assert.equal(api.status,'playing');
});
test('enabling sound starts in the same gesture, including before React rerenders',async()=>{
  await mount({enabled:false});await act(async()=>api.start());assert.equal(instances.length,0);
  await act(async()=>api.start(true));assert.equal(instances.length,1);assert.equal(instances[0].paused,false);
  await update({enabled:true,bgm:.55});assert.equal(instances[0].volume,.55);
  await update({enabled:false});assert.equal(instances[0].paused,true);assert.equal(api.status,'paused');
});
test('autoplay rejection is visible and the next gesture can retry',async()=>{
  await mount();blocked=true;await act(async()=>api.start());assert.equal(api.status,'blocked');
  blocked=false;await act(async()=>api.start(true));assert.equal(api.status,'playing');assert.equal(instances.length,1);
});
test('a hidden page pauses and returns to the same soundtrack, while muted audio stays paused',async()=>{
  await mount();await act(async()=>api.start());const media=instances[0];
  document.hidden=true;await act(async()=>listeners.get('visibilitychange')());assert.equal(media.paused,true);
  document.hidden=false;await act(async()=>listeners.get('visibilitychange')());assert.equal(media.paused,false);
  await update({enabled:false});const calls=media.playCount;
  document.hidden=true;await act(async()=>listeners.get('visibilitychange')());document.hidden=false;await act(async()=>listeners.get('visibilitychange')());assert.equal(media.playCount,calls);
  await act(async()=>renderer.unmount());renderer=null;assert.equal(media.paused,true);assert.equal(media.src,'');
});
