import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const editionSource=fs.readFileSync(path.join(root,'dist/artist-editions.js'),'utf8');
const profileSource=fs.readFileSync(path.join(root,'dist/artist-profiles.js'),'utf8');
const audioSource=fs.readFileSync(path.join(root,'dist/reformat-audio.js'),'utf8');
const voiceSource=fs.readFileSync(path.join(root,'dist/voice-input.js'),'utf8');
const octoberSource=fs.readFileSync(path.join(root,'dist/october.js'),'utf8');
const playerSource=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
function session(initial={},options={}){
 const elements=new Map(),storage=new Map(Object.entries(initial)),windowEvents={},documentEvents={};
 const element=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',src:'',autoplay:false,playCalls:0,style:{},dataset:{},currentTime:0,ended:false,events:{},classList:{toggle(){},add(){},remove(){}},setAttribute(k,v){this[k]=v},getAttribute(k){return this[k]},removeAttribute(k){if(k!=='autoplay')delete this[k]},addEventListener(k,v){this.events[k]=v},load(){},pause(){this.events.pause?.()},async play(){this.playCalls++;this.events.play?.();this.events.playing?.()},focus(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(id)};
 const context=vm.createContext({console,URLSearchParams,setTimeout:()=>0,clearTimeout(){},location:{hash:'',search:''},window:{addEventListener:(name,fn)=>windowEvents[name]=fn,scrollTo(){}},document:{querySelector:element,querySelectorAll:()=>[],addEventListener(name,fn){(documentEvents[name]??=[]).push(fn)},body:element('body')},localStorage:{getItem:k=>{if(options.blockRead)throw Error("storage blocked");return storage.get(k)??null},setItem:(k,v)=>{if(options.blockWrite)throw Error("storage full");storage.set(k,v)}}});
 vm.runInContext(editionSource+'\n'+profileSource+'\n'+(options.october?audioSource+'\n'+voiceSource+'\n'+octoberSource+'\n':'')+playerSource,context);
 return {context,elements,storage,windowEvents,documentEvents,run:code=>vm.runInContext(code,context)};
}
const s=session();
assert.equal(s.run('records.length'),14);
assert.equal(JSON.parse(s.storage.get('porto-saved')).length,14);
assert.equal(s.elements.get('#audio').autoplay,false);
assert.equal(s.elements.get('#audio').src,'');
assert.equal(s.elements.get('#audio').playCalls,0);
assert.equal(s.run('playing'),false);
assert.equal(s.run('artistEditions.length'),5);
assert.equal(s.run('artistEditions.flatMap(r=>r.tracks.flat()).length'),15);
assert.equal(s.run('new Set(artistEditions.flatMap(r=>r.tracks.flat())).size'),15);
for(const r of s.run('records')){
 assert.equal(r.tracks.length,2);
 for(const [side,tracks] of r.tracks.entries())for(const [i,title] of tracks.entries()){
  assert(title);
  const file=`${r.id}-${side?'b':'a'}-${i+1}.${r.audioExt||'wav'}`;
  assert(fs.statSync(path.join(root,'dist/assets',file)).size>1000, file);
 }
 assert(fs.existsSync(path.join(root,'dist/assets',r.art)),r.art);
 assert(fs.existsSync(path.join(root,'dist/assets',`${r.id}-demo.zip`)),r.id);
 assert(!s.run(`detail(getRecord('${r.id}'))`).includes('undefined'));
 assert(!s.run(`sleeveNotes(getRecord('${r.id}'))`).includes('undefined'));
}
// Returning users receive only this edition's five records; old removals and ownership survive.
const returning=session({'porto-shelf-seed-v1':'1','porto-catalog-v2':'1','porto-saved':'["after-rain"]','porto-owned':'["second-skin"]'});
assert.equal(JSON.parse(returning.storage.get('porto-saved')).length,6);
assert.deepEqual(JSON.parse(returning.storage.get('porto-owned')),['second-skin']);
returning.run("saved=saved.filter(id=>id!=='sugar-circuit');persist()");
const repeat=session(Object.fromEntries(returning.storage));
assert(!JSON.parse(repeat.storage.get('porto-saved')).includes('sugar-circuit'));
// Queue entries replace skips and take priority over automatic side progression.
s.run("current=getRecord('sugar-circuit');side=0;track=0;source();resume();queueTrack('sugar-circuit',1,0);queueTrack('after-rain',0,1)");
assert.equal(s.run('queue.length'),2);
s.elements.get('#audio').events.ended();
assert.equal(s.run('current.id'),'sugar-circuit');assert.equal(s.run('side'),1);assert.equal(s.run('track'),0);
s.elements.get('#audio').events.ended();
assert.equal(s.run('current.id'),'after-rain');assert.equal(s.run('side'),0);assert.equal(s.run('track'),1);
assert.equal(s.run('queue.length'),0);
s.elements.get('#audio').events.ended();assert.equal(s.run('track'),2);
s.run("filter='All';query='Hyperpop'");assert.equal(s.run('filteredRecords().length'),1);
s.run("query='Dirt Rhodes'");assert.equal(s.run('filteredRecords()[0].id'),'after-the-blue');
const credits=JSON.parse(fs.readFileSync(path.join(root,'dist/audio-credits.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'dist/credits.html'),'utf8');
for(const c of credits){assert(html.includes(c.source),c.title);assert(html.includes(`id="${c.record}"`),c.record)}
console.log('PASS: 14 releases, 69 audio files, 15 distinct new recordings; asset references, attribution, shelf migration, search, cross-side navigation and side completion. DOM/audio events simulated, not browser playback.');

// Collection actions persist, keep ownership separate and never touch playback.
const flags={'porto-shelf-seed-v1':'1','porto-catalog-v2':'1','porto-catalog-v3':'1'};
const collection=session({...flags,'porto-saved':'[]','porto-owned':'[]'});
collection.run("toggleCollection('sugar-circuit')");
assert.deepEqual(JSON.parse(collection.storage.get('porto-saved')),['sugar-circuit']);
assert.equal(collection.run('owned.length'),0);
assert.equal(collection.run('playing'),false);
assert.equal(collection.elements.get('#audio').src,'');
const restored=session(Object.fromEntries(collection.storage));
assert.equal(restored.run("isCollected(getRecord('sugar-circuit'))"),true);
restored.run("toggleCollection('sugar-circuit')");
assert.deepEqual(JSON.parse(restored.storage.get('porto-saved')),[]);
assert.equal(session(Object.fromEntries(restored.storage)).run('saved.length'),0);
collection.storage.set('porto-saved','["borrowed-sun"]');
collection.windowEvents.storage({key:'porto-saved'});
assert.equal(collection.run('saved[0]'),'borrowed-sun');
const corrupt=session({...flags,'porto-saved':'not json','porto-owned':'["second-skin"]'});
assert.equal(corrupt.run('owned[0]'),'second-skin');
const invalid=session({...flags,'porto-saved':'["sugar-circuit","sugar-circuit","missing",42]'});
assert.equal(invalid.run('saved.length'),1);
const blocked=session({...flags,'porto-saved':'[]'}, {blockWrite:true});
blocked.run("toggleCollection('sugar-circuit')");
assert.equal(blocked.run('saved.length'),1);
assert.equal(blocked.storage.get('porto-saved'),'[]');
assert.match(blocked.elements.get('#toast').textContent,/this visit only/);
assert.equal(session({}, {blockRead:true,blockWrite:true}).run('storageAvailable'),false);
const ownedCopy=session({...flags,'porto-saved':'[]','porto-owned':'["second-skin"]'});
ownedCopy.run("toggleCollection('second-skin')");
assert.equal(ownedCopy.run("isCollected(getRecord('second-skin'))"),true);
assert.match(ownedCopy.run("saveButton(getRecord('second-skin'))"),/disabled/);
console.log('PASS: add/remove/reload, empty collections, independent ownership, cross-tab storage events, invalid data and blocked-storage feedback.');

// Artist browsing must not reload audio or alter collection/ownership state.
const artistSession=session();
const beforeArtistStorage=JSON.stringify(Object.fromEntries(artistSession.storage));
artistSession.run("current=getRecord('sugar-circuit');source();audio.currentTime=37;playing=true");
const audioBefore=artistSession.elements.get('#audio').src;
const artists=artistSession.run('allArtists()');
assert.equal(artists.length,14);
assert.equal(new Set(artists.map(a=>a.id)).size,14);
for(const artist of artists){
 const html=artistSession.run(`artistProfile('${artist.id}')`);
 assert(html.includes(artist.name.replaceAll('&','&amp;')));
 assert(html.includes('Their world'));
 assert(html.includes('data-action="artist-play"'));
 assert(!html.includes('undefined'));
 assert(!/data-action="(?:like|comment|follow|share|message)"/.test(html));
 for(const item of artist.items){
  if(item.type==='image')assert(fs.existsSync(path.join(root,'dist',item.src)),item.src);
  artistSession.run(`openWorldItem('${artist.id}','${item.id}')`);
  assert(artistSession.elements.get('#dialog').open);
  assert(artistSession.elements.get('#dialog-content').innerHTML.includes('world-dialog-title'));
  artistSession.elements.get('#dialog').close();
 }
}
assert.equal(artistSession.elements.get('#audio').src,audioBefore);
assert.equal(artistSession.elements.get('#audio').currentTime,37);
assert.equal(artistSession.run('playing'),true);
assert.equal(JSON.stringify(Object.fromEntries(artistSession.storage)),beforeArtistStorage);
assert(artistSession.run("artistProfile('missing-artist')").includes('Artist not found'));
artistSession.run("artistQuery='no-such-artist'");
assert(artistSession.run('artistDirectoryResults()').includes('No artists found'));
artistSession.run("artistQuery='';artistGenre='Ambient'");
assert(artistSession.run('artistDirectoryResults()').includes('1 artist'));
artistSession.run("records.push({...records[0],id:'test-second-release'})");
assert.equal(artistSession.run('allArtists().length'),14);
assert.equal(artistSession.run("allArtists().find(a=>a.id==='morrow').releases.length"),2);
assert.equal(artistSession.run(`escapeArtist('<img src=x onerror="bad">')`),'&lt;img src=x onerror=&quot;bad&quot;&gt;');
console.log('PASS: 14 artist profiles, unique slugs, multi-release grouping, empty/missing states, safe text, journal assets and dialogs; browsing preserves simulated audio and collection state.');

// October flows share the actual player but keep synthetic previews and money separate.
const october=session({}, {october:true});
const action=(s,oct,id='')=>s.documentEvents.click.forEach(fn=>fn({target:{closest:selector=>selector==='[data-oct]'?{dataset:{oct,id}}:null}}));
const submit=(s,text)=>{s.run("document.querySelector('#oct-prompt')").value=text;s.documentEvents.submit.forEach(fn=>fn({target:{id:'oct-prompt-form'},preventDefault(){}}))};
assert.equal(october.run('current.variationId'),'original');
assert.equal(october.elements.get('#audio').src,'');
assert.equal(october.elements.get('#audio').playCalls,0);
assert.match(october.run("PortoOctober.view('home')"),/Your feed/);
assert.match(october.run("PortoOctober.view('budget')"),/No subscription/);
assert.doesNotMatch(october.run("support()"),/25%|treasury/);
assert.match(october.run("PortoOctober.view('studio')"),/type="button"[^>]*data-oct="voice"/);
assert(october.run("PortoOctober.createVariation('Invent an opera').error"));
assert(october.run("PortoOctober.createVariation('Add guitar').error"));
submit(october,'Make it dreamy.');
let octoberState=JSON.parse(october.storage.get('porto-reformat-v2'));
const parentId=octoberState.variations[0].id;
assert.equal(octoberState.variations[0].parent,'original');
submit(october,'Slow it down.');
octoberState=JSON.parse(october.storage.get('porto-reformat-v2'));
const childId=octoberState.variations[1].id;
assert.equal(octoberState.variations[1].parent,parentId);
action(october,'lineage',childId);
assert.match(october.elements.get('#dialog-content').innerHTML,/Dreamy/);
assert.match(october.elements.get('#dialog-content').innerHTML,/Slow drift/);
action(october,'share',childId);
assert.equal(JSON.parse(october.storage.get('porto-reformat-v2')).variations[1].published,false);
action(october,'publish',childId);
assert.equal(JSON.parse(october.storage.get('porto-reformat-v2')).variations[1].published,true);
const octoberReload=session(Object.fromEntries(october.storage),{october:true});
assert.match(octoberReload.run("PortoOctober.view('you')"),/Reformat \/ Slow drift/);
action(octoberReload,'feed-filter','following');
assert.match(octoberReload.run("PortoOctober.view('feed')"),/Find your people/);
action(octoberReload,'follow','luna');
assert.match(octoberReload.run("PortoOctober.view('feed')"),/Reformat \/ Dreamy/);
action(octoberReload,'save','original');
assert.match(octoberReload.run("PortoOctober.view('you')"),/Saved versions/);
action(octoberReload,'budget-cap');
const beforeCapCalls=octoberReload.elements.get('#audio').playCalls;
action(octoberReload,'play','luna-dreamy');
assert.equal(octoberReload.elements.get('#audio').playCalls,beforeCapCalls);
assert.match(octoberReload.elements.get('#dialog-content').innerHTML,/Originals play on/);
action(octoberReload,'play','original');
assert.equal(octoberReload.elements.get('#audio').playCalls,beforeCapCalls+1);
assert.match(octoberReload.elements.get('#audio').src,/sugar-circuit-a-1.mp3/);
action(octoberReload,'confirm-topup');
action(octoberReload,'play','luna-dreamy');
assert.match(octoberReload.elements.get('#audio').src,/reformat-dreamy.mp3/);
assert.equal(JSON.parse(octoberReload.storage.get('porto-reformat-v2')).spent,10);
action(octoberReload,'budget-reset');
assert.equal(JSON.parse(octoberReload.storage.get('porto-reformat-v2')).spent,0);
assert.equal(JSON.parse(octoberReload.storage.get('porto-reformat-v2')).topup,0);
const beforeResetCollection=octoberReload.storage.get('porto-saved');
action(octoberReload,'reset');
assert.equal(octoberReload.storage.get('porto-saved'),beforeResetCollection);
assert.equal(JSON.parse(octoberReload.storage.get('porto-reformat-v2')).variations.length,0);
const brokenOctober=session({'porto-reformat-v2':JSON.stringify({variations:[{id:'you-invalid',preset:'<script>',parent:'original'}],follows:['unknown'],saved:['<img>'],spent:-10})},{october:true});
assert.doesNotMatch(brokenOctober.run("PortoOctober.view('you')"),/<script>|<img>/);
const noOctoberStorage=session({}, {october:true,blockRead:true,blockWrite:true});
submit(noOctoberStorage,'Make it dreamy.');
assert.match(noOctoberStorage.elements.get('#toast').textContent,/this visit only/);
for(const preset of ['dreamy','night','slow','dreamslow'])assert(fs.statSync(path.join(root,`dist/assets/reformat-${preset}.mp3`)).size>1000);
assert.match(october.run("PortoOctober.view('feed')"),/oct-track-person/);
assert.match(october.run("PortoOctober.view('original')"),/<h1>Original<\/h1>/);
assert(october.run("ReformatAudio.slow.duration>ReformatAudio.original.duration"));
assert.equal(october.run('ReformatAudio.original.peaks.length'),80);
console.log('PASS: October idle startup, supported requests, parent lineage, publish confirmation, persistence, follows, saved versions, cap enforcement, original access, top-up/reset, attribution and corrupt/blocked storage.');

const speechRequest=session({'porto-october-v1':'{"variations":[]}'},{october:true});
submit(speechRequest,'Please make it dreamy and slow it down!');
assert.equal(JSON.parse(speechRequest.storage.get('porto-reformat-v2')).variations[0].preset,'dreamslow');
assert.equal(speechRequest.storage.get('porto-october-v1'),'{'+'"variations":[]}');
assert(speechRequest.run("PortoOctober.createVariation('Slow it down and remove the guitar').error"));
console.log('PASS: punctuation-tolerant spoken requests, unsupported transformation rejection and earlier walkthrough data preservation.');
