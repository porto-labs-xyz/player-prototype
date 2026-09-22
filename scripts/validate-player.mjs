import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const editionSource=fs.readFileSync(path.join(root,'dist/artist-editions.js'),'utf8');
const profileSource=fs.readFileSync(path.join(root,'dist/artist-profiles.js'),'utf8');
const playerSource=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
function session(initial={},options={}){
 const elements=new Map(),storage=new Map(Object.entries(initial)),windowEvents={};
 const element=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',src:'',autoplay:false,playCalls:0,style:{},dataset:{},currentTime:0,ended:false,events:{},classList:{toggle(){},add(){},remove(){}},setAttribute(k,v){this[k]=v},getAttribute(k){return this[k]},removeAttribute(k){if(k!=='autoplay')delete this[k]},addEventListener(k,v){this.events[k]=v},load(){},pause(){this.events.pause?.()},async play(){this.playCalls++;this.events.play?.();this.events.playing?.()},focus(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(id)};
 const context=vm.createContext({console,URLSearchParams,setTimeout:()=>0,clearTimeout(){},location:{hash:'',search:''},window:{addEventListener:(name,fn)=>windowEvents[name]=fn,scrollTo(){}},document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){},body:element('body')},localStorage:{getItem:k=>{if(options.blockRead)throw Error("storage blocked");return storage.get(k)??null},setItem:(k,v)=>{if(options.blockWrite)throw Error("storage full");storage.set(k,v)}}});
 vm.runInContext(editionSource+'\n'+profileSource+'\n'+playerSource,context);
 return {context,elements,storage,windowEvents,run:code=>vm.runInContext(code,context)};
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
