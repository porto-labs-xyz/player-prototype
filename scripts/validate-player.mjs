import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const editionSource=fs.readFileSync(path.join(root,'dist/artist-editions.js'),'utf8');
const profileSource=fs.readFileSync(path.join(root,'dist/artist-profiles.js'),'utf8');
const audioSource=fs.readFileSync(path.join(root,'dist/reformat-audio.js'),'utf8');
const feedAudioSource=fs.readFileSync(path.join(root,'dist/feed-audio.js'),'utf8');
const voiceSource=fs.readFileSync(path.join(root,'dist/voice-input.js'),'utf8');
const warpSource=fs.readFileSync(path.join(root,'dist/audio-warp.js'),'utf8');
const graphSource=fs.readFileSync(path.join(root,'dist/genealogy-graph.js'),'utf8');
const octoberSource=fs.readFileSync(path.join(root,'dist/october.js'),'utf8');
const playerSource=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
function session(initial={},options={}){
 const elements=new Map(),storage=new Map(Object.entries(initial)),windowEvents={},documentEvents={};
 const element=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',src:'',autoplay:false,playCalls:0,style:{},dataset:{},currentTime:0,ended:false,events:{},classList:{toggle(){},add(){},remove(){}},setAttribute(k,v){this[k]=v},getAttribute(k){return this[k]},removeAttribute(k){if(k!=='autoplay')delete this[k]},addEventListener(k,v){const old=this.events[k];this.events[k]=old?(...args)=>{old(...args);v(...args)}:v},load(){this.currentTime=0;this.events.emptied?.()},pause(){this.paused=true;this.events.pause?.()},async play(){this.paused=false;this.playCalls++;this.events.play?.();this.events.playing?.()},focus(){},querySelector:selector=>element(selector),show(){this.open=true},showModal(){this.open=true},close(){this.open=false;this.events.close?.()}});return elements.get(id)};
 const context=vm.createContext({console,URLSearchParams,setTimeout:()=>0,clearTimeout(){},location:{hash:'',search:''},window:{SpeechRecognition:options.Recognition,addEventListener:(name,fn)=>windowEvents[name]=fn,scrollTo(){}},document:{querySelector:element,querySelectorAll:()=>[],addEventListener(name,fn){(documentEvents[name]??=[]).push(fn)},body:element('body')},localStorage:{getItem:k=>{if(options.blockRead)throw Error("storage blocked");return storage.get(k)??null},setItem:(k,v)=>{if(options.blockWrite)throw Error("storage full");storage.set(k,v)}}});
 vm.runInContext(editionSource+'\n'+profileSource+'\n'+(options.october?audioSource+'\n'+feedAudioSource+'\n'+voiceSource+'\n'+warpSource+'\n'+graphSource+'\n'+octoberSource+'\n':'')+playerSource,context);
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
const action=(s,oct,id='')=>s.documentEvents.click.forEach(fn=>fn({preventDefault(){},target:{closest:selector=>selector==='[data-oct]'?{dataset:{oct,id},focus(){}}:null}}));
const submit=(s,text)=>{action(s,'prompt-open');s.run("document.querySelector('#oct-prompt')").value=text;s.documentEvents.submit.forEach(fn=>fn({target:{id:'oct-prompt-form'},preventDefault(){}}))};
assert.equal(october.run('current.variationId'),'original');
assert.equal(october.elements.get('#audio').src,'');
assert.equal(october.elements.get('#audio').playCalls,0);
assert.match(october.run("PortoOctober.view('home')"),/In your rotation/);
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
assert.match(october.run(`PortoOctober.view('variation/${childId}')`),/Dreamy/);
assert.match(october.run(`PortoOctober.view('variation/${childId}')`),/Slow drift/);
action(october,'share',childId);
assert.equal(JSON.parse(october.storage.get('porto-reformat-v2')).variations[1].published,false);
action(october,'publish',childId);
assert.equal(JSON.parse(october.storage.get('porto-reformat-v2')).variations[1].published,true);
const octoberReload=session(Object.fromEntries(october.storage),{october:true});
assert.match(octoberReload.run("PortoOctober.view('you')"),/Untitled 011/);
action(octoberReload,'feed-filter','following');
assert.match(octoberReload.run("PortoOctober.view('feed')"),/Find your people/);
action(octoberReload,'follow','luna');
assert.match(octoberReload.run("PortoOctober.view('feed')"),/Velvet Afterhours/);
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
assert.match(october.run("PortoOctober.view('original')"),/<h1>Reformat<\/h1>/);
assert(october.run("ReformatAudio.slow.duration>ReformatAudio.original.duration"));
assert.equal(october.run('ReformatAudio.original.peaks.length'),80);
console.log('PASS: October idle startup, supported requests, parent lineage, publish confirmation, persistence, follows, saved versions, cap enforcement, original access, top-up/reset, attribution and corrupt/blocked storage.');

const speechRequest=session({'porto-october-v1':'{"variations":[]}'},{october:true});
submit(speechRequest,'Please make it dreamy and slow it down!');
assert.equal(JSON.parse(speechRequest.storage.get('porto-reformat-v2')).variations[0].preset,'dreamslow');
assert.equal(speechRequest.storage.get('porto-october-v1'),'{'+'"variations":[]}');
assert(speechRequest.run("PortoOctober.createVariation('Slow it down and remove the guitar').error"));
console.log('PASS: punctuation-tolerant spoken requests, unsupported transformation rejection and earlier walkthrough data preservation.');

// Edition identities survive old-state migration and repeated edits of the same preset.
const legacyVersions={variations:[{id:'you-old',preset:'dreamy',parent:'original',creator:'you',published:true},{id:'you-child',preset:'dreamy',parent:'you-old',creator:'you',published:false}],follows:[],saved:['you-old']};
const editions=session({'porto-reformat-v2':JSON.stringify(legacyVersions)},{october:true});
assert.equal(editions.run("PortoOctober.title('luna-dreamy')"),'@luna.wav / Velvet Afterhours');
assert.equal(editions.run("PortoOctober.title('you-old')"),'@you / Untitled 010');
assert.equal(editions.run("PortoOctober.title('you-child')"),'@you / Untitled 011');
const oldCover=editions.run("PortoOctober.artwork('you-old')");
submit(editions,'Make it dreamy.');
const editionState=JSON.parse(editions.storage.get('porto-reformat-v2'));
assert.deepEqual(editionState.variations.map(v=>v.number),[10,11,12]);
const lastVersion=editionState.variations[2].id;
assert.notEqual(editions.run(`PortoOctober.artwork('${lastVersion}')`),oldCover);
assert.match(editions.run("PortoOctober.artwork('luna-dreamy')"),/@luna.wav/);
assert.match(editions.run("PortoOctober.view('search')"),/Dreamy · @luna.wav/);
const reloadedEditions=session(Object.fromEntries(editions.storage),{october:true});
assert.equal(reloadedEditions.run(`PortoOctober.title('${lastVersion}')`),'@you / Untitled 012');
assert.equal(reloadedEditions.run("PortoOctober.artwork('you-old')"),oldCover);
action(reloadedEditions,'play','luna-dreamy');
assert.equal(reloadedEditions.elements.get('#mini-title').textContent,'@luna.wav / Velvet Afterhours');
assert.equal(reloadedEditions.elements.get('#oct-mini-stamp').textContent,'@luna.wav');
console.log('PASS: stable numbered editions, old drafts migrated, per-edition artwork, creator stamps, player identity and mood search metadata.');

// Multi-source versions must never borrow another track's audio, artwork or lineage.
const community=session({}, {october:true});
assert.match(community.run("PortoOctober.view('home')"),/In your rotation/);
assert.equal((community.run("PortoOctober.view('feed')").match(/class="oct-post"/g)||[]).length,57);
for(const [source,clips] of Object.entries(community.run('FeedAudio'))){
 for(const clip of Object.values(clips)){
  assert.equal(clip.peaks.length,80);
  assert(fs.statSync(path.join(root,'dist/assets',clip.file)).size>1000);
  assert(fs.readFileSync(path.join(root,'dist/credits.html'),'utf8').includes(clip.file));
 }
 action(community,'play','original-'+source);
 assert.equal(community.elements.get('#audio').src,'assets/'+clips.original.file);
 action(community,'play',source+'-dreamy');
 assert.equal(community.elements.get('#audio').src,'assets/'+clips.dreamy.file);
}
community.run("PortoOctober.view('original/dream-culture')");
submit(community,'Make it dreamy');
const newCommunityState=JSON.parse(community.storage.get('porto-reformat-v2'));
const juneVersion=newCommunityState.variations[0];
assert.equal(juneVersion.source,'dream-culture');assert.equal(juneVersion.number,9);
assert.equal(juneVersion.parent,'original-dream-culture');
assert.equal(community.run(`PortoOctober.title('${juneVersion.id}')`),'@you / Untitled 009');
assert.match(community.run(`PortoOctober.artwork('${juneVersion.id}')`),/borrowed-sun.webp/);
assert.doesNotMatch(community.run(`PortoOctober.artwork('${juneVersion.id}')`),/sugar-circuit.webp/);
const reloadCommunity=session(Object.fromEntries(community.storage),{october:true});
action(reloadCommunity,'play',juneVersion.id);
assert.equal(reloadCommunity.elements.get('#audio').src,'assets/feed-dream-culture-dreamy.mp3');
action(reloadCommunity,'lineage',juneVersion.id);
assert.match(reloadCommunity.run(`PortoOctober.view('variation/${juneVersion.id}')`),/Dream Culture/);
assert.doesNotMatch(reloadCommunity.run(`PortoOctober.view('variation/${juneVersion.id}')`),/<h1>Reformat/);
action(reloadCommunity,'budget-cap');
action(reloadCommunity,'play','original-dream-culture');
assert.equal(reloadCommunity.elements.get('#audio').src,'assets/borrowed-sun-a-1.mp3');
assert.equal(reloadCommunity.run('playing'),true);
action(reloadCommunity,'genre','Rock');
const rockFeed=reloadCommunity.run("PortoOctober.view('home')");
assert.match(rockFeed,/Paper Satellites/);assert.doesNotMatch(rockFeed,/Window Seat/);
action(reloadCommunity,'genre','all');
action(reloadCommunity,'feed-filter','following');
assert.equal((reloadCommunity.run("PortoOctober.view('feed')").match(/class="oct-post"/g)||[]).length,0);
action(reloadCommunity,'follow','noor');
assert.match(reloadCommunity.run("PortoOctober.view('feed')"),/Window Seat/);
console.log('PASS: 8 source tracks, 57 seeded posts, distinct playable audio, measured waveforms, source artwork, per-track numbering, migration, lineage, filters and original access after budget cap.');

// A genealogy contains siblings, descendants and local drafts, never another song.
const dna=session({}, {october:true});
let family=dna.run("PortoOctober.view('variation/luna-dreamy')");
for(const title of ['@luna.wav / Velvet Afterhours','@kaiwaves / Neon Detour','@milo.fm / Half Speed Heart','@sora.loop / Clouds Below Us'])assert(family.includes(title));
assert.equal((family.match(/class="oct-gene-node /g)||[]).length,9);
assert(!family.includes('Dream Culture/'));
assert.doesNotMatch(dna.run("PortoOctober.view('home')"),/Your feed\./);
dna.run("PortoOctober.view('variation/luna-dreamy')");
submit(dna,'Pitch up 5 semitones.');
let dnaState=JSON.parse(dna.storage.get('porto-reformat-v2'));
const custom=dnaState.variations[0];
assert.equal(custom.parent,'luna-dreamy');assert.equal(custom.settings.pitch,7);assert.equal(custom.published,false);
assert.equal(custom.number,10);
const dnaReload=session(Object.fromEntries(dna.storage),{october:true});
assert.equal(JSON.parse(dnaReload.storage.get('porto-reformat-v2')).variations[0].settings.pitch,7);
assert.doesNotMatch(dnaReload.run(`PortoOctober.view('variation/${custom.id}')`),/data-warp/);
assert(dnaReload.run(`PortoOctober.view('variation/${custom.id}')`).match(/<input[^>]+type="range"[^>]+>/g).every(input=>input.includes('data-wave-seek=')));
assert.equal((dnaReload.run("PortoOctober.view('original')").match(/class="oct-gene-node /g)||[]).length,10);
assert.equal(dnaReload.run("PortoWarp.sanitize({speed:99,pitch:-200,echo:Infinity}).speed"),1.4);
assert.equal(dnaReload.run("PortoWarp.sanitize({pitch:-200}).pitch"),-12);
// Count actual incremental playback once per source session. Pauses and seeks do not inflate it.
action(dnaReload,'play','luna-dreamy');
const media=dnaReload.elements.get('#audio');media.duration=219;media.playbackRate=1;
for(let i=1;i<=15;i++){media.currentTime=i;media.events.timeupdate();}
media.pause();media.currentTime=40;media.events.timeupdate();
media.paused=false;
for(let i=41;i<=60;i++){media.currentTime=i;media.events.timeupdate();}
assert.equal(JSON.parse(dnaReload.storage.get('porto-reformat-v2')).plays['luna-dreamy'],1);
for(let i=61;i<=100;i++){media.currentTime=i;media.events.timeupdate();}
assert.equal(JSON.parse(dnaReload.storage.get('porto-reformat-v2')).plays['luna-dreamy'],1);
media.currentTime=180;media.events.timeupdate();
assert.equal(JSON.parse(dnaReload.storage.get('porto-reformat-v2')).plays['luna-dreamy'],1);
assert.match(session(Object.fromEntries(dnaReload.storage),{october:true}).run("PortoOctober.view('variation/luna-dreamy')"),/1 in this browser/);
console.log('PASS: complete genealogy, source isolation, custom effects saved as child versions, effect bounds, sustained-play counting, pause/seek protection and count persistence.');

const sheet=session({}, {october:true});
action(sheet,'voice');
assert.equal(sheet.elements.get('#oct-voice-sheet').open,true);
assert.doesNotMatch(sheet.elements.get('#oct-voice-sheet').innerHTML,/How should it sound|placeholder=|oct-suggestions|Make this track yours|Speak or type a request/);
assert.match(sheet.elements.get('#oct-voice-status').textContent,/unavailable/);
action(sheet,'close-sheet');assert.equal(sheet.elements.get('#oct-voice-sheet').open,false);
action(sheet,'prompt-open');
assert.equal(sheet.elements.get('#oct-voice-sheet').open,true);
submit(sheet,'Make it dreamy and add more distortion');
const prompted=JSON.parse(sheet.storage.get('porto-reformat-v2')).variations[0];
assert.equal(prompted.settings.grit,.2);assert.equal(prompted.settings.echo,.32);
assert.equal(sheet.elements.get('#oct-voice-sheet').open,false);
console.log('PASS: bottom voice/text sheet opens and closes, unsupported speech feedback stays in the sheet, prompt-only effects create a child and no sound sliders are rendered.');

// Graph edges use real parents, and illustrative royalties stay separate from plays.
assert.equal((family.match(/data-node=/g)||[]).length,9);
assert.equal((family.match(/data-from=/g)||[]).length,8);
assert.match(family,/data-from="luna-dreamy" data-to="sora-dreamslow"/);
assert.match(family,/Royalties generated/);
assert.match(family,/Illustrative amounts, not earned or paid/);
const demoTotal=family.match(/Royalties generated[\s\S]*?<strong>([^<]+)/)[1];
const countedFamily=session({'porto-reformat-v2':JSON.stringify({plays:{original:200}})},{october:true}).run("PortoOctober.view('original/reformat')");
assert.equal(countedFamily.match(/Royalties generated[\s\S]*?<strong>([^<]+)/)[1],demoTotal);
assert.match(dna.run(`PortoOctober.view('variation/${JSON.parse(dna.storage.get('porto-reformat-v2')).variations[0].id}')`),/This version <b>DEMO<\/b><\/span><strong>£0.00/);
const deepNodes=Array.from({length:35},(_,i)=>({id:String(i),parent:i?String(i-1):null}));
const graphContext=vm.createContext({window:{addEventListener(){}}});vm.runInContext(graphSource,graphContext);
graphContext.nodes=deepNodes;
const positions=vm.runInContext('PortoGeneGraph.layout(nodes)',graphContext);
assert.equal(positions.length,35);assert(positions.every(p=>[p.x,p.y,p.z].every(Number.isFinite)));
assert.equal(positions.at(-1).depth,34);
assert.notDeepEqual(vm.runInContext('PortoGeneGraph.project({x:100,y:50,z:70},0,0)',graphContext),vm.runInContext('PortoGeneGraph.project({x:100,y:50,z:70},.8,.4)',graphContext));
sheet.run("PortoOctober.view('original/dream-culture')");action(sheet,'prompt-open');
assert.match(sheet.elements.get('#oct-voice-sheet').innerHTML,/Co-create with June Arcade/);
console.log('PASS: graph parent edges, every version, deep-family projection, independent demo royalties and source-specific co-create heading.');

assert.equal((family.match(/class="oct-orbit-picture"/g)||[]).length,9);
assert.doesNotMatch(family,/gene-sphere|radialGradient/);
const deepTrack=session({}, {october:true});
action(deepTrack,'track-details','sora-dreamslow');
assert.equal(deepTrack.run('location.hash'),'variation/sora-dreamslow');
assert.notEqual(deepTrack.elements.get('#dialog').open,true);
const trackDetail=deepTrack.run("PortoOctober.view('variation/sora-dreamslow')");
for(const detail of ['@sora.loop / Clouds Below Us','@sora.loop','@luna.wav / Velvet Afterhours','data-oct="play"','data-oct="refine"','aria-label="Track details"'])assert(trackDetail.includes(detail));
assert(trackDetail.indexOf('oct-deep-track')<trackDetail.indexOf('oct-genealogy-first'));
assert(trackDetail.indexOf('oct-genealogy-first')<trackDetail.indexOf('oct-royalty-summary'));
assert.equal((family.match(/class="oct-orbit-avatar"/g)||[]).length,9);
for(const file of ['luna.png','kai.png','milo.png','sora.png'])assert(family.includes('assets/creators/'+file));
for(const match of trackDetail.matchAll(/class="oct-orbit-avatar" href="([^"]+)"/g))assert(fs.existsSync(path.join(root,'dist',match[1])));
action(deepTrack,'refine','sora-dreamslow');
assert.equal(deepTrack.elements.get('#oct-voice-sheet').open,true);
assert.match(deepTrack.elements.get('#oct-voice-sheet').innerHTML,/Co-create with Kiki Static/);
console.log('PASS: graph avatar assets, immediate deep track details, lineage-first layout and co-create handoff.');

// User titles persist without changing identity, lineage, settings or artwork treatment.
const named=session({}, {october:true});submit(named,'Make it dreamy.');
const untitled=JSON.parse(named.storage.get('porto-reformat-v2')).variations[0];
assert.equal(named.elements.get('#dialog').open,true);
assert.match(named.elements.get('#dialog-content').innerHTML,/oct-name-form/);
const nameSubmit=value=>{named.elements.get('#oct-version-title').value=value;named.documentEvents.submit.forEach(fn=>fn({target:{id:'oct-name-form',dataset:{id:untitled.id}},preventDefault(){}}));};
nameSubmit('   ');assert.equal(named.elements.get('#dialog').open,true);
nameSubmit('  Night <b>Drive</b> & "Glow"  ');
let savedName=JSON.parse(named.storage.get('porto-reformat-v2')).variations[0];
assert.equal(savedName.userTitle,'Night <b>Drive</b> & "Glow"');
assert.equal(savedName.id,untitled.id);assert.equal(savedName.parent,untitled.parent);assert.deepEqual(savedName.settings,untitled.settings);
const namedReload=session(Object.fromEntries(named.storage),{october:true});
assert.equal(namedReload.run(`PortoOctober.title('${untitled.id}')`),'@you / Night <b>Drive</b> & "Glow"');
for(const route of ['variation/'+untitled.id,'studio/'+untitled.id,'search','you']){const html=namedReload.run(`PortoOctober.view('${route}')`);assert(!html.includes('Night <b>Drive</b>'));}
action(named,'play',untitled.id);action(named,'rename',untitled.id);nameSubmit('Velvet Morning');
assert.equal(named.elements.get('#mini-title').textContent,'@you / Velvet Morning');
assert.equal(JSON.parse(named.storage.get('porto-reformat-v2')).variations.length,1);
console.log('PASS: title entry, rename, reload, player sync, HTML escaping and unchanged lineage.');

// Scrubbing changes position without starting playback, altering the queue or buying a copy.
const transport=session({}, {october:true});
const ta=transport.elements.get('#audio');
transport.run('seekTo(35)');
assert.equal(ta.playCalls,0);assert.equal(transport.run('pendingSeek'),35);
ta.duration=219;ta.readyState=1;ta.events.loadedmetadata();
assert.equal(ta.currentTime,35);
await transport.run('resume()');
transport.run('seekTo(90)');assert.equal(ta.currentTime,90);assert.equal(ta.paused,false);
transport.run('pause();seekTo(12)');assert.equal(ta.currentTime,12);assert.equal(ta.paused,true);
transport.run('seekTo(-10)');assert.equal(ta.currentTime,0);
transport.run('seekTo(9999)');assert.equal(ta.currentTime,219);
transport.run('seekTo(NaN)');assert.equal(ta.currentTime,219);
transport.run("queueTrack('after-rain',0,1)");
await transport.run('resume()');transport.elements.get('#stop').events.click();
assert.equal(ta.currentTime,0);assert.equal(ta.paused,true);assert.equal(transport.run('queue.length'),1);
assert.equal(transport.run('owned.length'),0);
transport.run('seekTo(42)');await transport.run('toggle()');assert.equal(ta.currentTime,42);assert.equal(ta.paused,false);
transport.run('pause();source();seekTo(33);stopPlayback()');ta.events.loadedmetadata();assert.equal(ta.currentTime,0);
// Actual speech-controller callbacks must leave audio running, including interim text and close.
let recognition;
class SpeechMock { constructor(){recognition=this;this.aborted=false} start(){this.onstart()} abort(){this.aborted=true} stop(){this.onend()} }
const talking=session({}, {october:true,Recognition:SpeechMock});
await talking.run('source();resume()');const talkAudio=talking.elements.get('#audio');talkAudio.currentTime=24;
action(talking,'voice');assert.equal(talkAudio.paused,false);assert.equal(talkAudio.currentTime,24);
recognition.onresult({results:[[{transcript:'make it dreamy'}]]});assert.equal(talkAudio.paused,false);
assert.equal(talking.elements.get('#oct-prompt').value,'make it dreamy');
talking.run('pause()');await talking.run('resume()');
assert.equal(recognition.aborted,false);assert.equal(talkAudio.currentTime,24);
action(talking,'close-sheet');assert.equal(talkAudio.paused,false);assert.equal(talkAudio.currentTime,24);
console.log('PASS: queued metadata seeks, playing/paused scrubs, stop/reset, queue preservation and voice capture without interrupting playback.');

// Wild presets remain request-driven and compose with inherited settings.
for(const [request,preset] of [['reverse it','reverse'],['under water','underwater'],['chop it up','chopped'],['distorted','crushed']]){
 const result=community.run(`PortoWarp.parseRequest(${JSON.stringify(request)})`);
 assert.equal(result.preset,preset);assert(!result.error);
}
const combo=community.run("PortoWarp.parseRequest('reverse it and make it underwater and chop it up')");
assert.equal(combo.settings.reverse,1);assert.equal(combo.settings.chop,1);assert.equal(combo.settings.tone,480);
assert(community.run("PortoWarp.parseRequest('reverse it and remove the drums').error"));
// Comment fixtures, local posting, escaped output, reload and per-track separation.
const comments=session({}, {october:true});
const thread=comments.run("PortoOctober.view('variation/reformat-wild-chopped')");
assert.match(thread,/Track comments/);assert.match(thread,/Demo conversation/);
comments.run("document.querySelector('#oct-comment-text').value='dope <script>alert(1)</script>'");
for(const listener of comments.documentEvents.submit)listener({target:{id:'oct-comment-form',dataset:{id:'reformat-wild-chopped'}},preventDefault(){}});
assert.match(comments.elements.get('#oct-comments').innerHTML,/dope &lt;script&gt;/);
const savedComments=JSON.parse(comments.storage.get('porto-reformat-v2')).comments;
assert.equal(savedComments['reformat-wild-chopped'].length,1);
const commentsReload=session(Object.fromEntries(comments.storage),{october:true});
assert.match(commentsReload.run("PortoOctober.view('variation/reformat-wild-chopped')"),/dope &lt;script&gt;/);
assert.doesNotMatch(commentsReload.run("PortoOctober.view('variation/luna-dreamy')"),/alert\(1\)/);
assert.equal(comments.elements.get('#audio').playCalls,0);
const sample=community.run('PortoWarp.chopSamples(Float32Array.from({length:144},(_,i)=>Math.floor(i/18)+1),100)');
assert.equal(sample[9],1);assert.equal(sample[27],1);assert.equal(sample[45],4);assert.equal(sample[63],2);
const pcm=community.run('PortoWarp.wavBytes({numberOfChannels:1,length:3,sampleRate:44100,getChannelData:()=>new Float32Array([-1,0,1])})');
const wav=new DataView(pcm);assert.equal(wav.getUint32(24,true),44100);assert.equal(wav.getInt16(44,true),-32768);assert.equal(wav.getInt16(48,true),32767);
console.log('PASS: 32 wild seeded variations, compound prompts, sample slicing, PCM encoding and per-track local comments with safe rendering.');

// Track-local transport must win over both current playback and delayed edits.
const switching=session({}, {october:true});
const sa=switching.elements.get('#audio');sa.readyState=1;sa.duration=219;
const scrub=(id,value)=>switching.documentEvents.input.forEach(fn=>fn({target:{dataset:{waveSeek:id},value:String(value)}}));
action(switching,'play','luna-dreamy');await new Promise(setImmediate);
assert.equal(switching.run('current.variationId'),'luna-dreamy');assert.equal(sa.paused,false);
action(switching,'play','kai-night');await new Promise(setImmediate);
assert.equal(switching.run('current.variationId'),'kai-night');assert.equal(sa.paused,false);
action(switching,'play','kai-night');assert.equal(sa.paused,true);
scrub('kai-night',500);assert.equal(sa.currentTime,109.5);assert.equal(sa.paused,true);
scrub('luna-dreamy',250);await new Promise(setImmediate);
assert.equal(switching.run('current.variationId'),'luna-dreamy');assert.equal(sa.currentTime,54.75);assert.equal(sa.paused,false);
// A queued old pause event must not reset the new playing track's controls.
sa.events.pause();assert.equal(switching.run('playing'),true);
switching.run('pause()');sa.events.playing();assert.equal(switching.run('playing'),false);
switching.run('PortoWarp.available=()=>true; var preparations=[]; PortoOctober.prepareAudio=()=>new Promise(resolve=>preparations.push(resolve))');
action(switching,'play','reformat-wild-reverse');assert.equal(switching.run('preparingPlayback'),true);
const before=sa.playCalls;
action(switching,'play','reformat-wild-reverse');assert.equal(switching.run('preparingPlayback'),false);
switching.run('preparations.shift()()');await new Promise(setImmediate);assert.equal(sa.playCalls,before);
action(switching,'play','reformat-wild-chopped');
scrub('original',700);assert.equal(switching.run('current.variationId'),'original');
switching.run('preparations.shift()()');await new Promise(setImmediate);assert.equal(sa.playCalls,before);
switching.run('preparations.shift()()');await new Promise(setImmediate);
assert.equal(sa.paused,false);assert(Math.abs(sa.currentTime-153.3)<.001);
console.log('PASS: track switching, paused waveform seeking, waveform auto-selection, stale media events and rapid switching/cancel during preparation.');

const pointer=switching.documentEvents.pointerdown.at(-1);
pointer({button:0,isPrimary:true,clientX:10,target:{closest:()=>({dataset:{waveSeek:'luna-dreamy'},getBoundingClientRect:()=>({left:10,width:100})})}});
assert.equal(switching.run('current.variationId'),'luna-dreamy');assert.equal(sa.currentTime,0);
switching.run('preparations.shift()()');await new Promise(setImmediate);assert.equal(sa.paused,false);
console.log('PASS: touching the zero position selects a different track even without a range value change.');

const stableButtons=session({}, {october:true});
stableButtons.run(`var buttonWrites=0;var buttonMarkup='';var playButton={dataset:{id:'original'},classList:{contains:()=>true},setAttribute(){},get innerHTML(){return buttonMarkup},set innerHTML(value){buttonWrites++;buttonMarkup=value}};document.querySelectorAll=selector=>selector==='[data-oct="play"]'?[playButton]:[];PortoOctober.sync()`);
const initialWrites=stableButtons.run('buttonWrites');
for(let i=0;i<5;i++)stableButtons.elements.get('#audio').events.timeupdate();
assert.equal(stableButtons.run('buttonWrites'),initialWrites);
action(stableButtons,'play','original');await new Promise(setImmediate);
const playingWrites=stableButtons.run('buttonWrites');assert(playingWrites>initialWrites);
for(let i=0;i<5;i++)stableButtons.elements.get('#audio').events.timeupdate();
assert.equal(stableButtons.run('buttonWrites'),playingWrites);
console.log('PASS: playback progress preserves play-button contents and only state changes replace icons.');

// Inactive feed waveforms must not repaint thousands of bars on every audio tick.
const lightProgress=session({}, {october:true});
lightProgress.run(`var inactiveWave={dataset:{wave:'luna-dreamy'},querySelector(){throw Error('Inactive waveform touched')},querySelectorAll(){throw Error('Inactive bars touched')}};document.querySelectorAll=selector=>selector==='[data-wave]'?[inactiveWave]:[]`);
for(let i=0;i<8;i++)lightProgress.elements.get('#audio').events.timeupdate();
console.log('PASS: progress ticks skip inactive waveform controls and bars.');
