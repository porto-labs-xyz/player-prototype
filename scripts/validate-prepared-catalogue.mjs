import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const ctx=vm.createContext({URL,location:{href:'https://porto.test/'},localStorage:{getItem:()=>null}});
for(const name of ['artist-editions','reformat-audio','feed-audio','prepared-audio','audio-warp','october'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),ctx);
const jobs=vm.runInContext('PortoOctober.catalogue()',ctx),assets=vm.runInContext('PreparedAudio',ctx);
assert.equal(jobs.length,57);assert.equal(assets.length,jobs.length);assert.equal(new Set(assets.map(a=>a.id)).size,jobs.length);
let bytes=0;
for(const job of jobs){
 const item=assets.find(a=>a.id===job.id);assert(item,job.id);assert.equal(item.source,job.source);assert.equal(JSON.stringify(item.settings),JSON.stringify(job.settings));
 const data=fs.readFileSync('dist/'+item.file);assert.equal(data.length,item.bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),item.sha256);bytes+=data.length;
 const audio={src:'https://porto.test/'+item.file,dataset:{originalSource:job.source},currentTime:0,load(){throw Error('Prepared source unnecessarily reloaded')},play(){throw Error('Prepared source needed gesture priming')}};
 ctx.audio=audio;ctx.settings=job.settings;assert.equal(vm.runInContext('PortoWarp.prepare(audio,settings)',ctx),true);assert.equal(audio.playbackRate,job.settings.speed);
 audio.currentTime=42;assert.equal(vm.runInContext('PortoWarp.prepare(audio,settings)',ctx),true);assert.equal(audio.currentTime,42);
}
console.log(`PASS: all ${jobs.length} Tone-rendered versions, settings and file hashes verified; ${(bytes/1e6).toFixed(1)} MB; every version starts synchronously and resumes without reloading.`);
