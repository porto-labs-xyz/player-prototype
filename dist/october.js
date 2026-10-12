/* October product walkthrough. All accounts, variations and money stay local. */
const PortoOctober = (() => {
  const key = 'porto-reformat-v2';
  const creators = [
    {id:'luna', name:'Luna Vale', handle:'luna.wav'},
    {id:'kai', name:'Kai Moss', handle:'kaiwaves'},
    {id:'milo', name:'Milo Reed', handle:'milo.fm'},
    {id:'sora', name:'Sora Park', handle:'sora.loop'},
    {id:'noor', name:'Noor Ellis', handle:'noor.afterdark'},
    {id:'ezra', name:'Ezra Bell', handle:'ezra.mp3'},
    {id:'inez', name:'Inez Cruz', handle:'inez.echo'},
    {id:'theo', name:'Theo Lane', handle:'theo.tapes'},
    {id:'aya', name:'Aya Bloom', handle:'aya.moon'},
    {id:'ren', name:'Ren Brooks', handle:'ren.radio'},
    {id:'cleo', name:'Cleo West', handle:'cleo.wav'},
    {id:'nico', name:'Nico Vale', handle:'nico.low'}
  ];
  const presets = {
    custom:{label:'Custom', prompt:'Pitch up 3 semitones.', file:'original'},
    dreamy:{label:'Dreamy', prompt:'Make it dreamy.', file:'dreamy'},
    night:{label:'Night drive', prompt:'Make it a night drive.', file:'night'},
    slow:{label:'Slow drift', prompt:'Slow it down.', file:'slow'},
    dreamslow:{label:'Dreamy & slow', prompt:'Slow it down. Make it dreamy.', file:'dreamslow'}
  };
  const seeds = [
    {id:'luna-dreamy', number:2, preset:'dreamy', creator:'luna', parent:'original', published:true},
    {id:'kai-night', number:3, preset:'night', creator:'kai', parent:'original', published:true},
    {id:'milo-slow', number:4, preset:'slow', creator:'milo', parent:'original', published:true},
    {id:'sora-dreamslow', number:5, preset:'dreamslow', creator:'sora', parent:'luna-dreamy', published:true}
  ];
  const sources = [
    ['reformat','sugar-circuit',0,0],
    ['dream-culture','borrowed-sun',0,0],
    ['organic-grunge','violet-weather',0,0],
    ['exhilarate','loud-enough',0,0],
    ['chill-wave','after-the-blue',0,0],
    ['exit-the-premises','sugar-circuit',0,1],
    ['fretless','borrowed-sun',0,1],
    ['dirt-rhodes','after-the-blue',1,0]
  ].map(([id,record,side,track])=>{
    const r=artistEditions.find(r=>r.id===record);
    return {id,record,title:r.tracks[side][track],artist:r.artist,art:r.art,genre:r.genre,album:r.title,
      artistId:r.artist.toLowerCase().replaceAll(' ','-'),handle:r.artist.toLowerCase().replace(/[^a-z0-9]/g,''),
      audio:id==='reformat'?ReformatAudio:FeedAudio[id]};
  });
  const originalId = source => source==='reformat'?'original':'original-'+source;
  seeds.forEach(v=>v.source='reformat');
  const captions=[
    'For the long way home.', 'A little softer around the edges.',
    'Headphones on. Everything else off.', 'This groove needed more room.',
    'One for the late train.', 'Let the last note hang.',
    'Same song, a different kind of night.', 'Found a new pocket in this one.',
    'Keeping this on repeat.', 'A slower start to the day.',
    'Turn the lights down for this.', 'Somewhere between awake and dreaming.'
  ];
  sources.slice(1).forEach((source,i)=>{
    ['dreamy','night','slow'].forEach((preset,j)=>{
      const id=source.id+'-'+preset, creator=creators[(4+i*3+j)%creators.length].id;
      seeds.push({id,source:source.id,number:j+2,preset:j===2&&i%2?'dreamslow':preset,creator,
        parent:j===2?source.id+'-dreamy':originalId(source.id),published:true,caption:captions[(i*3+j)%captions.length]});
    });
  });
  const seedTitles=['Velvet Afterhours','Neon Detour','Half Speed Heart','Clouds Below Us','Window Seat','Last Train Glow','Sunday Static','Soft Concrete','Midnight Bloom','Rooms Without Walls','Paper Satellites','Blue Hour Riot','Burn Slow','Warm Water','City Hush','Under the Surface','Electric Daydream','Streets Like Silver','Leave the Lights On','Golden Dust','Moonroom','Floating Home','Honey in the Wires','Low Orbit','Still Here'];
  seeds.forEach((v,i)=>v.userTitle=seedTitles[i]);
  const cleanTitle = value => typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,64):'';
  const empty = () => ({variations:[], follows:[], saved:[], spent:6.4, topup:0, plays:{}});
  let state=empty(), storageOK=true, selected='original', feedFilter='all', prompt='', notice='', searchText='', genreFilter='all';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const all = () => [...seeds,...state.variations];
  const find = id => all().find(v=>v.id===id);
  const edition = id => String(find(id)?.number||1).padStart(3,'0');
  const sourceFor = id => sources.find(s=>s.id===(find(id)?.source||(id==='original'?'reformat':id.replace(/^original-/,''))))||sources[0];
  const isOriginal = id => sources.some(s=>originalId(s.id)===id);
  const valid = id => isOriginal(id)||!!find(id);
  const routeFor = id => isOriginal(id)?'#original/'+sourceFor(id).id:'#variation/'+id;
  const chosenTitle = id => find(id)?.userTitle||`Untitled ${edition(id)}`;
  const title = id => find(id)?`${handle(id)} / ${chosenTitle(id)}`:sourceFor(id).title;
  const handle = id => {const v=find(id);return v?.creator==='you'?'@you':'@'+(creators.find(c=>c.id===v?.creator)?.handle||sourceFor(id).handle);};
  function artStyle(id) {
    const v=find(id),image=`--art-image:url('assets/${sourceFor(id).art}');`;if(!v)return image;
    const palettes={custom:['#8abbb0','#534275',180],dreamy:['#9380f0','#c697d9',320],night:['#22668d','#203055',260],slow:['#e6a24f','#8b4141',90],dreamslow:['#74c8b1','#3a527b',220]};
    const [tint,shade,hue]=palettes[v.preset],n=v.number;
    return image+`--art-tint:${tint};--art-shade:${shade};--art-hue:${hue+(n-2)*7}deg;--art-turn:${(n%5-2)*2}deg;--art-scale:${1.12+(n%4)*.08};--art-x:${35+(n*13%36)}%;--art-angle:${n*47%360}deg;--art-orbit:${12+n*17%55}%;`;
  }
  const artEffect = id => ({custom:'glitch',dreamy:'haze',night:'glitch',slow:'smear',dreamslow:'liquid'}[find(id)?.preset]||'');
  function artwork(id,extra='') {
    const v=find(id);
    return `<span class="oct-artwork ${v?'is-variation oct-effect-'+artEffect(id):''} ${extra}" style="${artStyle(id)}" role="img" aria-label="${esc(v?title(id)+' artwork, stamped '+handle(id):sourceFor(id).title+' original artwork')}"><img src="assets/${sourceFor(id).art}" alt="" loading="lazy">${v?`<span class="oct-art-echo" aria-hidden="true"></span><span class="oct-art-slice" aria-hidden="true"></span><span class="oct-art-orbit" aria-hidden="true"></span><span class="oct-art-number" aria-hidden="true">/${edition(id)}</span><span class="oct-art-stamp" aria-hidden="true">${handle(id)}</span>`:''}</span>`;
  }
  const settingsFor = id => typeof PortoWarp==='undefined'?null:PortoWarp.sanitize(find(id)?.settings||PortoWarp.presets[find(id)?.preset]||PortoWarp.defaults);
  const examplePlays = id => {if(find(id)?.creator==='you')return 0;let hash=17;for(const c of id)hash=(hash*31+c.charCodeAt(0))%100000;return isOriginal(id)?18000+hash:120+hash%18000;};
  const demoRoyalty = id => {if(find(id)?.creator==='you')return 0;let hash=41;for(const c of id)hash=(hash*37+c.charCodeAt(0))%100000;return (isOriginal(id)?40000+hash:2000+hash%28000)/100;};
  const playTotal = id => examplePlays(id)+(state.plays[id]||0);
  const countLabel = id => `<span data-play-count="${esc(id)}">${playTotal(id).toLocaleString('en-GB')} plays</span>`;
  let playSession={id:'',seconds:0,last:0,counted:false};
  function observePlay(){
    if(!current.concept)return;
    const id=current.variationId,t=audio.currentTime||0;
    if(playSession.id!==id)playSession={id,seconds:0,last:t,counted:false};
    const delta=t-playSession.last;playSession.last=t;
    if(!audio.paused&&!audio.seeking&&delta>0&&delta<2.5)playSession.seconds+=delta/(audio.playbackRate||1);
    const threshold=Math.min(30,(audio.duration||sourceFor(id).audio.original.duration)/2);
    if(!playSession.counted&&playSession.seconds>=threshold){
      playSession.counted=true;state.plays[id]=Math.min(1000000,(state.plays[id]||0)+1);persist();
      document.querySelectorAll('[data-play-count]').forEach(el=>{el.textContent=playTotal(el.dataset.playCount).toLocaleString('en-GB')+' plays';});
      const note=document.querySelector('#oct-local-plays');if(note)note.textContent=(state.plays[selected]||0)+' in this browser';
    }
  }
  const money = n => '£'+n.toFixed(2);
  const capped = () => state.spent >= 10+state.topup;
  function load() {
    try {
      const raw=JSON.parse(localStorage.getItem(key)||'null');
      if(!raw || typeof raw!=='object')return;
      const next=empty(), ids=new Set([...seeds.map(v=>v.id),...sources.map(s=>originalId(s.id))]);
      for(const v of (Array.isArray(raw.variations)?raw.variations:[]).slice(0,30)) {
        if(!v || typeof v.id!=='string' || !/^you-[a-z0-9-]{1,50}$/.test(v.id) || ids.has(v.id) || !Object.hasOwn(presets,v.preset) || !ids.has(v.parent))continue;
        const parent=[...seeds,...next.variations].find(p=>p.id===v.parent);
        const source=parent?.source||sourceFor(v.parent).id;
        const numbers=new Set([1,...seeds,...next.variations].map(x=>typeof x==='number'?x:x.source===source?x.number:1));
        const number=Number.isSafeInteger(v.number)&&v.number>1&&v.number<100000&&!numbers.has(v.number)?v.number:Math.max(...numbers)+1;
        next.variations.push({id:v.id,source,number,userTitle:cleanTitle(v.userTitle),preset:v.preset,parent:v.parent,creator:'you',published:v.published===true,...(v.settings&&typeof PortoWarp!=='undefined'?{settings:PortoWarp.sanitize(v.settings)}:{})});ids.add(v.id);
      }
      next.follows=[...new Set((Array.isArray(raw.follows)?raw.follows:[]).filter(id=>creators.some(c=>c.id===id)))];
      next.saved=[...new Set((Array.isArray(raw.saved)?raw.saved:[]).filter(id=>ids.has(id)))];
      for(const [id,n] of Object.entries(raw.plays&&typeof raw.plays==='object'?raw.plays:{}))if(ids.has(id)&&Number.isSafeInteger(n)&&n>=0)next.plays[id]=Math.min(n,1000000);
      next.spent=Number.isFinite(raw.spent)?Math.max(0,Math.min(100,raw.spent)):6.4;
      next.topup=Number.isFinite(raw.topup)?Math.max(0,Math.min(90,raw.topup)):0;
      state=next;
    } catch { storageOK=false; }
  }
  load();
  function persist() {
    try {localStorage.setItem(key,JSON.stringify(state));storageOK=true;return true;}
    catch {storageOK=false;toast('Updated for this visit only. Browser storage is unavailable.');return false;}
  }
  const sound = id => sourceFor(id).audio[typeof PortoWarp!=='undefined'&&PortoWarp.available()?'original':presets[find(id)?.preset]?.file||'original'];
  const wave = (small=false,id=selected) => `<span class="oct-wave ${small?'small':''}" ${small?'':`data-wave="${esc(id)}"`} aria-hidden="true">${(small?[.25,.55,.9,.4,.75,1,.55,.8,.3]:sound(id).peaks).map((p,i)=>`<i style="--h:${Math.max(8,Math.round(p*100))}%;--delay:${i*.065}s"></i>`).join('')}</span>`;
  const avatarSrc = id => `assets/${isOriginal(id)?sourceFor(id).art:id==='you'?'creators/you.svg':`creators/${id}${['luna','kai','milo','sora'].includes(id)?'':'-v2'}.${['luna','kai','milo','sora'].includes(id)?'png':'webp'}`}`;
  const avatar = id => `<img class="oct-avatar" loading="lazy" src="${avatarSrc(id)}" alt="">`;
  let voice, voiceRoute='', sheetTrigger=null;
  function syncVoice() {
    const {status,message}=voice?.state||{status:'idle',message:''};
    document.querySelectorAll('[data-oct="voice"]').forEach(b=>{
      const active=['starting','listening','stopping'].includes(status);
      b.dataset.voiceState=status;b.setAttribute('aria-pressed',String(active));
      b.setAttribute('aria-label',active?'Stop voice input':'Start voice input');
      const label=b.querySelector('.oct-voice-label');if(label)label.textContent=active?(status==='starting'?'Starting…':status==='stopping'?'Finishing…':'Listening…'):'Voice command';
    });
    const output=document.querySelector('#oct-voice-status');if(output)output.textContent=message;
  }
  function composer() {
    return `<form id="oct-prompt-form"><div class="oct-composer"><textarea id="oct-prompt" aria-label="Your request" rows="2" maxlength="300">${esc(prompt)}</textarea><button class="oct-round" type="submit" aria-label="Create a version">↑</button></div><div class="oct-composer-tools">${btn('voice',wave(true)+'<span class="oct-voice-label">Voice command</span>','','text-button')}</div><p id="oct-voice-status" class="oct-status" role="status"></p><p id="oct-request-status" class="oct-status" role="status">${esc(notice)}</p><p class="oct-voice-privacy">Speech may be processed online by your browser’s recognition service.</p></form>`;
  }
  function closeSheet(){
    voice?.cancel();const sheet=document.querySelector('#oct-voice-sheet');if(sheet?.open)sheet.close();
    document.querySelectorAll('[aria-controls="oct-voice-sheet"]').forEach(b=>b.setAttribute('aria-expanded','false'));
  }
  function openSheet(record=false,trigger=null){
    const sheet=document.querySelector('#oct-voice-sheet');sheetTrigger=trigger||sheetTrigger;
    if(!sheet.open){
      if(notice.startsWith('Your version is ready'))notice='';
      sheet.innerHTML=`<div class="oct-sheet-heading"><div><strong class="oct-co-create" id="oct-co-create">Co-create with ${esc(sourceFor(selected).artist)}</strong><span id="oct-source-label">${esc(title(selected)+(isOriginal(selected)?' · Original':''))}</span></div><button type="button" class="icon-button" data-oct="close-sheet" aria-label="Close voice input">×</button></div>${composer()}`;
      sheet.showModal();document.querySelectorAll('[aria-controls="oct-voice-sheet"]').forEach(b=>b.setAttribute('aria-expanded','true'));
    }
    if(record){voiceRoute=location.hash;voice.start(prompt);syncVoice();sheet.querySelector('[data-oct="voice"]')?.focus();}
    else document.querySelector('#oct-prompt')?.focus();
  }
  function trackCard(id) {
    const v=find(id), source=sourceFor(id), creator=v?.creator||id;
    const person=creators.find(c=>c.id===creator);
    return `<article class="oct-track-card" data-track="${id}"><div class="oct-track-art"><a class="oct-art-link" href="${routeFor(id)}" aria-label="Explore ${esc(title(id))} genealogy">${artwork(id)}</a><span class="oct-track-badge">${v?presets[v.preset].label:'Original'}</span><a class="oct-track-person" href="${v?'#creator/'+creator:'#artist/'+source.artistId}" aria-label="${person?.name||(creator==='you'?'Your profile':source.artist+' profile')}">${avatar(creator)}</a><button class="oct-round" data-oct="play" data-id="${id}" aria-label="Play ${esc(title(id))}">${playIcon}</button></div><a class="oct-track-title" href="${routeFor(id)}"><strong>${esc(title(id))}</strong><small>${source.artist}${v?' · '+source.title:''}</small></a>${wave(false,id)}</article>`;
  }
  function syncPlayback() {
    const coCreator=document.querySelector('#oct-co-create');if(coCreator)coCreator.textContent='Co-create with '+sourceFor(selected).artist;
    const sourceLabel=document.querySelector('#oct-source-label');
    if(sourceLabel)sourceLabel.textContent=(title(selected)+(isOriginal(selected)?' · Original':''));
    document.querySelectorAll('[data-oct="play"]').forEach(b=>{
      const active=current.concept&&current.variationId===b.dataset.id;
      b.innerHTML=(active&&playing?pauseIcon:playIcon)+(b.classList.contains('oct-round')?'':active&&playing?' Pause':' Play');
      b.setAttribute('aria-label',`${active&&playing?'Pause':'Play'} ${title(b.dataset.id)}`);
      b.setAttribute('aria-pressed',String(active&&playing));
    });
    document.querySelectorAll('[data-track]').forEach(el=>el.classList.toggle('is-current',current.concept&&current.variationId===el.dataset.track));
    document.querySelectorAll('[data-wave]').forEach(el=>{
      const active=current.concept&&current.variationId===el.dataset.wave;
      const progress=active?audio.currentTime/(audio.duration||sound(el.dataset.wave).duration):0;
      el.querySelectorAll('i').forEach((bar,i,bars)=>bar.classList.toggle('heard',i/bars.length<progress));
    });
  }
  const btn = (action,label,id='',cls='secondary') => `<button type="button" class="${cls}" data-oct="${action}" data-id="${esc(id)}">${label}</button>`;
  function badge() {return '<span class="oct-demo">INTERACTIVE DEMO</span>';}
  function footnote() {return `<p class="oct-note">Audio by Kevin MacLeod, CC BY 4.0. Artist profiles and creators are fictional. <a href="credits.html#feed-versions">Credits & versions ↗</a> · <button class="text-button" data-oct="about">About this app</button></p>`;}
  function followButton(id) {return `<button class="oct-follow" data-oct="follow" data-id="${id}" aria-pressed="${state.follows.includes(id)}" aria-label="${state.follows.includes(id)?'Unfollow':'Follow'} ${creators.find(c=>c.id===id).name}">${state.follows.includes(id)?'Following':'Follow'}</button>`;}
  function variationCard(v) {
    const c=creators.find(c=>c.id===v.creator)||{name:'You',handle:'you'}, source=sourceFor(v.id);
    return `<article class="oct-post"><div class="oct-post-person">${avatar(v.creator)}<a href="#creator/${v.creator}"><strong>${c.name}</strong><small>@${c.handle}</small></a>${v.creator==='you'?'<span class="oct-tag">YOUR VERSION</span>':followButton(v.creator)}</div>${v.caption?`<p class="oct-post-caption">${esc(v.caption)}</p>`:''}<div class="oct-post-track"><a href="${routeFor(v.id)}" aria-label="Explore ${esc(title(v.id))} genealogy">${artwork(v.id,'oct-post-art')}</a><div><span class="oct-kicker">${presets[v.preset].label}</span><h3><a href="#variation/${v.id}">${esc(title(v.id))}</a></h3><a class="oct-attribution" href="${routeFor(originalId(source.id))}">${source.artist} · ${source.title}</a></div><button class="oct-round" data-oct="play" data-id="${v.id}" aria-label="Play ${esc(title(v.id))}">${playIcon}</button></div>${wave(false,v.id)}<div class="oct-post-actions">${btn('lineage','Genealogy',v.id,'text-button')}${btn('refine','Make your version',v.id,'text-button')}${btn('save',state.saved.includes(v.id)?'Saved':'Save',v.id,'text-button')}</div></article>`;
  }
  function searchResults() {
    const q=searchText.trim().toLowerCase();
    const items=[...sources.map(s=>({label:s.title,meta:s.artist+' · Original · '+s.genre,href:routeFor(originalId(s.id)),art:s.art})),
      ...all().map(v=>({label:title(v.id),keywords:sourceFor(v.id).title,meta:sourceFor(v.id).artist+' · '+presets[v.preset].label+' · '+handle(v.id),href:'#variation/'+v.id,version:v.id})),
      ...records.map(r=>({label:r.title,meta:r.artist+' · '+r.genre,href:'#record/'+r.id,art:r.art,keywords:r.tracks.flat().join(' ')}))].filter(v=>(v.label+' '+v.meta+' '+(v.keywords||'')).toLowerCase().includes(q));
    return items.length?items.map(v=>`<a class="oct-search-result" href="${v.href}">${v.version?artwork(v.version,'oct-search-art'):`<img src="assets/${v.art}" alt="">`}<span><strong>${esc(v.label)}</strong><small>${esc(v.meta)}</small></span><span aria-hidden="true">↗</span></a>`).join(''):'<div class="oct-empty"><h2>No music found.</h2><p>Try a track, artist, creator or mood.</p></div>';
  }
  function search() {
    return `<div class="oct-section-heading"><div><p class="oct-kicker">FIND YOUR NEXT LISTEN</p><h1>Search your music.</h1></div></div><label class="oct-search-field" for="oct-search">Tracks, artists, creators and versions<input id="oct-search" type="search" value="${esc(searchText)}" placeholder="Try Reformat, dreamy or Kiki Static"></label><div id="oct-search-results" aria-live="polite">${searchResults()}</div>`;
  }
  function studio(id) {
    if(id && valid(id))selected=id;
    const v=find(selected), isVariation=!!v, source=sourceFor(selected);
    return `<div class="oct-section-heading"><div><p class="oct-kicker">${source.title.toUpperCase()} / ${source.artist.toUpperCase()}</p><h1>${esc(isVariation?title(selected):'Original')}</h1>${isVariation?`<span class="oct-tag">${presets[v.preset].label}</span>`:''}</div>${badge()}</div><div class="oct-studio">${isVariation?artwork(selected,'oct-studio-art'):''}<a class="oct-source" href="#record/${source.record}">${artwork(selected,'oct-source-art')}<span><strong>${esc(title(selected))}</strong><small>${source.album} · ${source.genre}</small></span><span aria-hidden="true">↗</span></a>${wave()}<div class="actions">${btn('play',playIcon+' Play',selected,'primary')}${btn('lineage','Genealogy',selected)}${v?.creator==='you'?btn('share',v.published?'Shared to your feed':'Share to feed',selected):''}</div>${btn('voice','Voice command','','primary')}${btn('prompt-open','Type a request')}<details class="oct-permissions"><summary>About these versions</summary><p>Sound changes run live in your browser: speed, pitch, tone, distortion and echo. Describe what you want by voice or text to create a new branch in the song’s genealogy. No music model or instrument separation runs here.</p><p>${source.title} is by Kevin MacLeod, used under CC BY 4.0. Artist and creator profiles are fictional. An eventual artist model requires the source artist’s permissions.</p></details></div>${footnote()}`;
  }
  function feed(creator) {
    const person=creators.find(c=>c.id===creator);
    const visibleSources=sources.filter(s=>genreFilter==='all'||s.genre===genreFilter);
    // Interleave sources so the first screen is a mix, while local posts stay first.
    const mixed=Array.from({length:4},(_,i)=>sources.flatMap(s=>seeds.filter(v=>v.source===s.id).slice(i,i+1))).flat();
    const posts=[...state.variations].reverse().concat(mixed).filter(v=>v.published && (!creator||v.creator===creator) && (creator||visibleSources.some(s=>s.id===v.source)) && (creator||feedFilter!=='following'||state.follows.includes(v.creator)));
    const leading=visibleSources.map((s,i)=>i===0?originalId(s.id):seeds.filter(v=>v.source===s.id)[i%3].id);
    const rotation=[...new Set([...leading,...visibleSources.map(s=>originalId(s.id)),...all().filter(v=>v.published&&visibleSources.some(s=>s.id===v.source)).map(v=>v.id)])];
    return `${creator?`<div class="oct-section-heading oct-feed-heading"><div><p class="oct-kicker">MADE TO BE LISTENED TO</p><h1>${creator==='you'?'Your space.':person?person.name:'Your feed.'}</h1><p class="oct-subtitle">${creator?'The music you make your own.':'New sounds. Familiar faces. Unexpected versions.'}</p></div>${person?followButton(person.id):badge()}</div>`:'<h1 class="visually-hidden">Music</h1>'}${!creator?`
      <div class="oct-genre-filters" role="group" aria-label="Filter music by genre">${['all',...new Set(sources.map(s=>s.genre))].map(g=>`<button class="oct-chip ${genreFilter===g?'active':''}" data-oct="genre" data-id="${g}" aria-pressed="${genreFilter===g}">${g==='all'?'All sounds':g}</button>`).join('')}</div>
      <section class="oct-feed-feature"><div class="oct-section-heading"><h2>In your rotation</h2><a href="#search">Find a track ↗</a></div><div class="oct-track-strip" role="region" aria-label="Original tracks and listener versions" tabindex="0">${rotation.map(trackCard).join('')}</div></section>
      <section class="oct-artist-section"><div class="oct-section-heading"><h2>Meet the artists</h2><a href="#artists">All artists ↗</a></div><div class="oct-artist-strip">${allArtists().sort((a,b)=>Number(sources.some(s=>s.artist===b.name))-Number(sources.some(s=>s.artist===a.name))).map(a=>`<a href="#artist/${a.id}"><img loading="lazy" src="${a.art}" alt=""><span><strong>${a.name}</strong><small>${a.genre}</small></span></a>`).join('')}</div></section>
      <div class="oct-section-heading oct-community-heading"><h2>From the community</h2><div class="oct-tabs" aria-label="Feed filter">${btn('feed-filter','For you','all',feedFilter==='all'?'active':'')}${btn('feed-filter','Following','following',feedFilter==='following'?'active':'')}</div></div>`:''}
      <div class="oct-feed-layout"><div class="oct-posts">${creator==='you'&&state.saved.length?`<section class="oct-saved-list"><h2>Saved versions</h2>${state.saved.map(id=>`<a class="oct-draft" href="${routeFor(id)}">${esc(title(id))} <span>Open ↗</span></a>`).join('')}</section>`:''}${posts.length?posts.map(variationCard).join(''):`<div class="oct-empty"><h2>${creator==='you'?'Your next version starts here.':'Find your people.'}</h2><p>${creator==='you'?'Create a version, then share it to your local feed.':'Follow a creator to see their variations here.'}</p>${creator==='you'?'<a class="secondary" href="#studio">Make a version</a>':btn('feed-filter','Explore creators','all')}</div>`}${creator==='you'&&state.variations.some(v=>!v.published)?`<section class="oct-drafts"><h2>Your drafts</h2>${state.variations.filter(v=>!v.published).map(v=>`<a class="oct-draft" href="#variation/${v.id}">${esc(title(v.id))} <span>Refine or share ↗</span></a>`).join('')}</section>`:''}</div>
      <aside class="oct-feed-aside"><div class="oct-sidebar-create"><p class="oct-kicker">YOUR NEXT VERSION</p><h2>Hear it your way.</h2><p>Describe the version you want.</p>${btn('prompt-open','Make a version')}</div><h3>Find your people</h3><div class="oct-creator-list">${creators.map(c=>`<div>${avatar(c.id)}<a href="#creator/${c.id}"><strong>${c.name}</strong><small>@${c.handle}</small></a>${followButton(c.id)}</div>`).join('')}</div><small>Demo artists, creators and posts. Your follows and shared versions stay in this browser.</small><a href="#ledger">Every version has a root ↗</a></aside></div>${footnote()}`;
  }
  function budget() {
    const limit=10+state.topup, left=Math.max(0,limit-state.spent);
    return `<div class="oct-section-heading"><div><p class="oct-kicker">YOUR LISTENING BUDGET</p><h1>Listen on your terms.</h1><p class="oct-subtitle">Pay for listening. No subscription.</p></div>${badge()}</div><section class="oct-budget-card"><p>Illustrative monthly spend</p><div class="oct-budget-total">${money(state.spent)} <span>/ ${money(limit)}</span></div><meter min="0" max="${limit}" value="${Math.min(state.spent,limit)}" aria-label="Illustrative monthly listening spend"></meter><h2>${capped()?'Originals play on. Variations are paused.':money(left)+' left to explore.'}</h2><p>At your £10 budget, originals keep playing. Top up to continue with variations, or wait for the monthly reset. No automatic extra charges.</p><div class="actions">${btn('topup','Try a £5 demo top-up','','primary coral')}${btn('budget-reset','Preview monthly reset')}</div><details class="oct-permissions"><summary>Try a budget scenario</summary><p>This control changes an example balance only. Audio playback never charges you.</p><div class="actions">${btn('budget-cap','Preview budget reached')}${btn('budget-default','Restore £6.40 example')}</div></details></section><div class="oct-fees"><article><span class="oct-kicker">ORIGINAL SONG</span><strong>90%</strong><h3>to artists / rights holders</h3><p>10% Porto fee</p></article><article><span class="oct-kicker">USER VARIATION TRACK</span><strong>70%</strong><h3>to artists / rights holders</h3><p>30% Porto fee</p></article></div><p class="oct-note">Proposed shares of allocated song revenue. Labels and publishers set their internal rights splits. Listening tariffs and funding originals after the cap require agreement. This is an optional-budget walkthrough, with no payment or real balance.</p>`;
  }
  const ledgerRows=[
    {id:'original',label:'Reformat',type:'Original',revenue:3,pool:2.7,rate:90,status:'Confirmed'},
    {id:'luna-dreamy',label:title('luna-dreamy'),type:'Dreamy · @luna.wav',revenue:4,pool:2.8,rate:70,status:'Sent'},
    {id:'milo-slow',label:title('milo-slow'),type:'Slow drift · @milo.fm',revenue:2,pool:1.4,rate:70,status:'Owed'}
  ];
  function ledger() {
    return `<div class="oct-section-heading"><div><p class="oct-kicker">PORTO LEDGER</p><h1>Every royalty connected.</h1><p class="oct-subtitle">Stream. Share. Get paid.</p></div>${badge()}</div><div class="oct-ledger-summary"><article><span>Illustrative listening revenue</span><strong>£9.00</strong></article><article><span>Rights-holder pool</span><strong>£6.90</strong></article><article><span>Daily USDC payouts on Aptos</span><strong class="oct-target">Product target</strong></article></div><div class="oct-ledger-table"><table><caption>Example entries for Kiki Static’s Reformat. These are not your listening-budget transactions.</caption><thead><tr><th scope="col">Track / source</th><th scope="col">Revenue</th><th scope="col">Rights pool</th><th scope="col">Status</th><th scope="col">Record</th></tr></thead><tbody>${ledgerRows.map(r=>`<tr><th scope="row">${r.label}<small>${r.type}</small></th><td>${money(r.revenue)}</td><td>${money(r.pool)}<small>${r.rate}% allocation</small></td><td><span class="oct-tag">${r.status}</span></td><td>${btn('payout','Details',r.id,'text-button')}</td></tr>`).join('')}</tbody></table></div><div class="oct-ledger-explainer"><div><span class="oct-kicker">ACCOUNTABLE. TRACKABLE. VERIFIABLE.</span><h2>Proof behind<br>every payment.</h2></div><p>The proposed payout record connects an amount, recipient, rights version and allocation to a transaction and confirmation. Porto submits accepted usage. Private listening data stays off chain.</p></div><p class="oct-note">All entries and statuses above are illustrative, with no real transaction or wallet. GBP allocation examples are not USDC transfers or exchange-rate quotes. Daily USDC payouts are a product target; Mainnet release remains gated.</p>`;
  }
  function genealogy(id) {
    selected=id;const source=sourceFor(id),root=originalId(source.id),versions=all().filter(v=>v.source===source.id);
    const familyIds=[root,...versions.map(v=>v.id)];
    const familyRoyalty=familyIds.reduce((sum,nodeId)=>sum+demoRoyalty(nodeId),0);
    const graph=PortoGeneGraph.markup(familyIds.map(nodeId=>({id:nodeId,parent:find(nodeId)?.parent,href:routeFor(nodeId),title:title(nodeId),shortTitle:find(nodeId)?chosenTitle(nodeId):'Original',artwork:artwork(nodeId,'oct-orbit-cover'),avatarUrl:avatarSrc(find(nodeId)?.creator||nodeId),number:edition(nodeId),handle:handle(nodeId),plays:playTotal(nodeId).toLocaleString('en-GB'),royalty:money(demoRoyalty(nodeId))})),id);
    const ancestors=new Set([id]);let parent=find(id);while(parent){ancestors.add(parent.parent);parent=find(parent.parent);}
    const node=(nodeId)=>{
      const v=find(nodeId),children=versions.filter(v=>v.parent===nodeId);
      return `<li class="${ancestors.has(nodeId)?'on-path':''}"><article class="oct-gene-node ${nodeId===id?'selected':''}" data-track="${nodeId}"><a href="${routeFor(nodeId)}" aria-label="Explore ${esc(title(nodeId))} genealogy">${artwork(nodeId,'oct-gene-art')}</a><a class="oct-gene-name" href="${routeFor(nodeId)}" ${nodeId===id?'aria-current="page"':''}><small>${v?presets[v.preset].label:'Original'}${v&&!v.published?' · Your draft':''}</small><strong>${esc(title(nodeId))}</strong><span>${handle(nodeId)}</span>${countLabel(nodeId)}<span class="oct-node-royalty">${money(demoRoyalty(nodeId))} royalties · Demo</span></a><button class="oct-round" data-oct="play" data-id="${nodeId}" aria-label="Play ${esc(title(nodeId))}">${playIcon}</button></article>${children.length?`<ul>${children.map(v=>node(v.id)).join('')}</ul>`:''}</li>`;
    };
    const v=find(id),creator=v?.creator||id,creatorRoute=v?'#creator/'+v.creator:'#artist/'+source.artistId;
    return `<a class="back" href="#feed">← Back to music</a><article class="oct-deep-track" aria-label="Track details">${artwork(id,'oct-deep-cover')}<div class="oct-deep-info"><p class="oct-kicker">${esc(source.artist)} · ${esc(source.title)}</p><h1>${esc(title(id))}</h1><div class="oct-deep-creator"><a href="${creatorRoute}">${avatar(creator)}<span>${esc(handle(id))}</span></a><span class="oct-tag">${v?presets[v.preset].label:'Original'}</span></div><div class="oct-deep-stats"><span>${countLabel(id)} <small>Demo total · <span id="oct-local-plays">${state.plays[id]||0} in this browser</span></small></span><span><strong>${money(demoRoyalty(id))}</strong> royalties <small>Demo</small></span></div>${v?`<p class="oct-detail-parent">From <a href="${routeFor(v.parent)}">${esc(title(v.parent))} ↗</a></p>`:''}<div class="actions">${btn('play',playIcon+' Play',id,'primary')}${btn('refine','Co-create',id)}${v?.creator==='you'?btn('rename','Rename',id)+btn('share',v.published?'Shared to feed':'Share to feed',id):''}</div><p class="oct-note">Audio: Kevin MacLeod · CC BY 4.0</p></div>${wave(false,id)}</article>
      <div class="oct-dna-workspace"><section class="oct-genealogy oct-genealogy-first" aria-label="Complete song genealogy"><div class="oct-section-heading"><h2>Lineage</h2><span>${versions.length} versions + original</span></div>${graph}<details class="oct-gene-list"><summary>All versions · plays & royalties</summary><p class="oct-note">Play totals include demo counts and browser-local listens. Royalty figures are separate illustrative examples, not calculated from plays.</p><ul class="oct-gene-tree">${node(root)}</ul></details></section></div>
      <div class="oct-royalty-summary"><div><span>Royalties generated <b>DEMO</b></span><strong>${money(familyRoyalty)}</strong><small>Across the original and all versions</small></div><div><span>This ${isOriginal(id)?'original':'version'} <b>DEMO</b></span><strong>${money(demoRoyalty(id))}</strong><small>${esc(title(id))}</small></div><p>Illustrative amounts, not earned or paid. No live royalty ledger is connected.</p></div>${footnote()}`;
  }
  function trackDetails(id) {
    if(!valid(id))return;
    lineage(id);window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
  }
  function renameVersion(id) {
    const v=state.variations.find(v=>v.id===id);if(!v)return;
    modal(`<form id="oct-name-form" data-id="${id}"><p class="oct-kicker">@you</p><label for="oct-version-title">Title</label><input id="oct-version-title" type="text" maxlength="64" required value="${esc(v.userTitle||'')}" autocomplete="off"><p id="oct-name-error" role="status"></p><button type="submit" class="primary">Save title</button></form>`);
    document.querySelector('#oct-version-title').focus();
  }
  function lineage(id){location.hash=routeFor(id).slice(1);render();}
  function share(id) {
    const v=state.variations.find(v=>v.id===id);if(!v)return;
    if(v.published){toast('This version is already on your local feed.');return;}
    modal(`<p class="oct-kicker">SHARE YOUR VERSION</p><h2>${esc(title(id))}</h2>${artwork(id,'oct-share-art')}<p><span class="oct-tag">${presets[v.preset].label}</span></p><p>Created by you, from ${sourceFor(id).title} by Kevin MacLeod, shown in the fictional ${sourceFor(id).artist} catalogue. Source credit and lineage stay attached.</p><div class="oct-share-permission"><strong>Browser audio effects · CC BY 4.0</strong><p>This edit retains Kevin MacLeod’s source attribution. Reuse follows the recording’s licence; fictional profile artwork has separate terms. <a href="credits.html#feed-versions">Read the credits</a>.</p></div><p>This publishes to your browser’s demo feed only. Nothing is sent to other people.</p>${btn('publish','Share to my demo feed',id,'primary coral')}`);
  }
  function payout(id) {
    const r=ledgerRows.find(r=>r.id===id);if(!r)return;
    modal(`<p class="oct-kicker">ILLUSTRATIVE PAYOUT RECORD</p><h2>${r.label}</h2><dl class="oct-payout"><dt>What</dt><dd>${money(r.pool)} rights-holder obligation. USDC payment amount not set in this demo.</dd><dt>Who</dt><dd>Kiki Static source rights holders. Recipient wallet: not connected. Example rights version: v1.</dd><dt>How</dt><dd>${money(r.revenue)} × ${r.rate}% = ${money(r.pool)}. Individual recipients follow agreed splits.</dd><dt>When</dt><dd>Example status: ${r.status}. No actual payment timestamp.</dd><dt>Transaction</dt><dd>No transaction submitted. No hash or on-chain proof.</dd></dl><p>Daily USDC settlement on Aptos is the proposed product. This record illustrates the fields, not a live payout.</p>`);
  }
  function demoRecord(id) {
    const source=sourceFor(id),clip=typeof PortoWarp!=='undefined'&&PortoWarp.available()?source.audio.original:sound(id);
    return {id:source.id,concept:true,variationId:id,title:source.title,artist:source.artist,year:'2026',art:source.art,tracks:[[title(id)],[]],duration:[[clip.duration],[]],audioFiles:[[`assets/${clip.file}`]],audioExt:'mp3'};
  }
  function canPlay(r) {
    if(r.concept&&!isOriginal(r.variationId)&&capped()){
      modal(`<p class="oct-kicker">BUDGET REACHED · DEMO</p><h2>Originals play on.</h2><p>Your example listening budget is used. Try a top-up or monthly reset to resume variations. Nothing will be charged.</p><a class="primary" href="#budget">Manage demo budget</a>`);return false;
    }return true;
  }
  function play(id) {
    if(!valid(id))return;
    voice?.cancel();const r=demoRecord(id);if(!canPlay(r))return;
    selected=id;if(current.concept&&current.variationId===id){toggle();return;}
    pause();current=r;side=0;track=0;source();resume();selected=id;
  }
  function createVariation(text) {
    if(!text.trim())return {error:'Add a request first.'};
    const request=PortoWarp.parseRequest(text,settingsFor(selected));
    if(request.error)return request;
    if(state.variations.length>=30)return {error:'Your demo has 30 saved versions. Open About this demo to reset the walkthrough.'};
    const preset=request.preset||find(selected)?.preset||'dreamy';
    const v={id:'you-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),source:sourceFor(selected).id,number:Math.max(1,...all().filter(v=>v.source===sourceFor(selected).id).map(v=>v.number))+1,preset,settings:request.settings,parent:selected,creator:'you',published:false};
    state.variations.push(v);persist();selected=v.id;return {variation:v};
  }
  function about() {
    voice?.cancel();modal(`<p class="oct-kicker">PORTO / INTERACTIVE PROTOTYPE</p><h2>Listen. Make a version. Share.</h2><p>Reformat by Kevin MacLeod is the starting track. Eight source tracks across five fictional artists support live speed, pitch, filter, distortion and echo changes through Tone.js. Genealogy shows every seeded and locally saved version, with a playable branch for each. Play totals combine illustrative demo counts and listens made in this browser. No AI music generation runs.</p><p>Talk to Porto uses browser speech recognition after you tap it. Your browser may send audio to its recognition service. Text stays editable and is never automatically submitted. Voice support depends on your browser, microphone permission and speech service availability.</p><p>Kiki Static and all creator profiles are fictional. No account service, payment or live ledger is connected. Posts, follows and budget examples stay in this browser. ${storageOK?'':'Storage is unavailable for this visit.'}</p><a href="credits.html#feed-versions">Music credits & downloads ↗</a><div class="actions">${btn('reset','Reset listening demo')}</div><p class="oct-note">Reset clears local versions, follows, saves and example budget. Your record collection, purchases and earlier Afterlight walkthrough data are preserved.</p>`);
  }
  function sync() {
    const library=document.querySelector('#oct-library');
    if(library)library.innerHTML=`<p class="oct-kicker">YOUR LIBRARY</p><a class="oct-library-track" href="#original"><img src="assets/sugar-circuit.webp" alt=""><span><strong>Reformat</strong><small>Kiki Static</small></span></a>${records.filter(r=>saved.includes(r.id)||owned.includes(r.id)).slice(0,3).map(r=>`<a class="oct-library-track" href="#record/${r.id}"><img src="${asset(r)}" alt=""><span><strong>${r.title}</strong><small>${r.artist}</small></span></a>`).join('')}<a class="oct-library-all" href="#shelf">Your collection <span>${new Set([...saved,...owned]).size} ↗</span></a>`;
    const budgetLink=document.querySelector('#oct-budget-label');if(budgetLink)budgetLink.textContent=`${money(state.spent)} / ${money(10+state.topup)}`;
    if(current.concept){
      const b=document.querySelector('#player-collection');b.dataset.action='';b.dataset.oct='save';b.dataset.id=current.variationId;b.disabled=false;b.setAttribute('aria-label','Save '+title(current.variationId));b.setAttribute('aria-pressed',String(state.saved.includes(current.variationId)));b.innerHTML=state.saved.includes(current.variationId)?'✓ Saved':'＋ Save';
      document.querySelector('#mini-artist').textContent='Audio: Kevin MacLeod · CC BY 4.0';
      document.querySelector('#player-mode').textContent=isOriginal(current.variationId)?'ORIGINAL':'VARIATION';
      document.querySelector('#play').setAttribute('aria-label',playing?'Pause playback':'Play demo preview');
    } else {delete document.querySelector('#player-collection').dataset.oct;document.querySelector('#player-collection').dataset.action='save';}
    const mini=document.querySelector('#oct-mini-art'),stamp=document.querySelector('#oct-mini-stamp');
    const id=current.concept?current.variationId:'original',v=find(id);
    if(mini){mini.className='oct-artwork oct-mini-art'+(v?' is-variation oct-effect-'+artEffect(id):'');mini.style.cssText=artStyle(id);}
    if(stamp){stamp.textContent=v?handle(id):'';stamp.hidden=!v;}
    syncVoice();syncPlayback();PortoGeneGraph.mount();
  }
  function view(route) {
    const [name,id]=route.split('/');
    if(name==='home')return feed();
    if(name==='original')return !id||sources.some(s=>s.id===id)?genealogy(originalId(id||'reformat')):'<h1>Track not found.</h1>';
    if(name==='search')return search();
    if(name==='studio')return studio();
    if(name==='variation')return find(id)?genealogy(id):'<div class="oct-empty"><h1>Version not found.</h1><p>This version may belong to another browser or have been reset.</p><a href="#feed">Explore the feed ↗</a></div>';
    if(name==='feed')return feed();
    if(name==='creator')return creators.some(c=>c.id===id)||id==='you'?feed(id):'<h1>Creator not found.</h1>';
    if(name==='you')return feed('you');
    if(name==='budget'||name==='support')return budget();
    if(name==='ledger')return ledger();
    if(name==='listening'&&current.concept)return genealogy(current.variationId);
    return null;
  }
  function init() {
    voice=PortoVoice.create({beforeStart:()=>pause(),onText:text=>{prompt=text;const input=document.querySelector('#oct-prompt');if(input)input.value=text;},onState:syncVoice});
    current=demoRecord('original');updatePlayer();
    audio.addEventListener('timeupdate',syncPlayback);
    audio.addEventListener('timeupdate',observePlay);
    audio.addEventListener('emptied',()=>{playSession={id:current.concept?current.variationId:'',seconds:0,last:0,counted:false};});
    window.addEventListener('hashchange',()=>{if(location.hash!==voiceRoute)closeSheet();});
    const sheet=document.querySelector('#oct-voice-sheet');
    sheet.addEventListener('close',()=>{voice.cancel();document.querySelectorAll('[aria-controls="oct-voice-sheet"]').forEach(b=>b.setAttribute('aria-expanded','false'));sheetTrigger?.focus();});
    sheet.addEventListener('click',e=>{if(e.target===sheet){const r=sheet.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeSheet();}});
    window.addEventListener('pagehide',()=>voice.cancel());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)voice.cancel();});
    document.addEventListener('submit',e=>{
      if(e.target.id==='oct-name-form'){
        e.preventDefault();const v=state.variations.find(v=>v.id===e.target.dataset.id);if(!v)return;
        const name=cleanTitle(document.querySelector('#oct-version-title').value);
        if(!name){document.querySelector('#oct-name-error').textContent='Add a title.';return;}
        v.userTitle=name;persist();
        if(current.concept&&current.variationId===v.id)current.tracks[0][0]=title(v.id);
        document.querySelector('#dialog').close();location.hash=routeFor(v.id).slice(1);render();return;
      }
      if(e.target.id!=='oct-prompt-form')return;e.preventDefault();
      voice.cancel();prompt=document.querySelector('#oct-prompt').value;
      if(/^play (kiki static[’']s )?(reformat|original)[.! ]*$/i.test(prompt.trim())){const target=/reformat/i.test(prompt)?'original':originalId(sourceFor(selected).id);play(target);notice='Playing '+title(target)+'.';prompt='';closeSheet();render();return;}
      const result=createVariation(prompt);
      if(result.error){document.querySelector('#oct-request-status').textContent=result.error;return;}
      notice='Your version is ready. Play, refine or share it.';prompt='';closeSheet();renameVersion(result.variation.id);
    });
    document.addEventListener('input',e=>{if(e.target.id==='oct-prompt'){voice.cancel();prompt=e.target.value;}if(e.target.id==='oct-search'){searchText=e.target.value;document.querySelector('#oct-search-results').innerHTML=searchResults();}});
    document.addEventListener('click',e=>{
      const link=e.target.closest('a[href^="#"]');
      if(link?.getAttribute('href')==='#studio'){e.preventDefault();openSheet(false,link);return;}
      if(link&&document.querySelector('#dialog').contains(link))document.querySelector('#dialog').close();
      const b=e.target.closest('[data-oct]');if(!b)return;
      const {oct:a,id}=b.dataset;
      if(a!=='voice')voice?.cancel();
      if(a==='track-details'){e.preventDefault();trackDetails(id);return;}
      if((a==='play'||a==='refine')&&document.querySelector('#dialog').open)document.querySelector('#dialog').close();
      if(a==='play'){if(/^(#original|#variation|#listening)/.test(location.hash)&&selected!==id){location.hash=routeFor(id).slice(1);genealogy(id);render();}play(id);}
      if(a==='rename')renameVersion(id);
      if(a==='about')about();
      if(a==='lineage')lineage(id);
      if(a==='share')share(id);
      if(a==='payout')payout(id);
      if(a==='refine'){selected=id;prompt='';notice='';openSheet(false,b);}
      if(a==='voice')openSheet(true,b);
      if(a==='prompt-open')openSheet(false,b);
      if(a==='close-sheet')closeSheet();
      if(a==='prompt'||a==='example'){
        voice.cancel();prompt=a==='prompt'?presets[id].prompt:id;
        const input=document.querySelector('#oct-prompt');input.value=prompt;input.focus();
        document.querySelector('#oct-request-status').textContent='';
      }
      if(a==='follow'){
        state.follows=state.follows.includes(id)?state.follows.filter(x=>x!==id):[...state.follows,id];persist();render();document.querySelector(`[data-oct="follow"][data-id="${id}"]`)?.focus();
      }
      if(a==='save'){
        state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];const ok=persist();render();if(ok)toast(state.saved.includes(id)?'Saved to your local demo.':'Removed from your saved versions.');
      }
      if(a==='genre'){genreFilter=id;if(id!=='all'&&sourceFor(selected).genre!==id)selected=originalId(sources.find(s=>s.genre===id).id);render();document.querySelector(`[data-oct="genre"][data-id="${id}"]`)?.focus();}
      if(a==='feed-filter'){feedFilter=id;render();document.querySelector(`[data-oct="feed-filter"][data-id="${id}"]`)?.focus();}
      if(a==='publish'){
        const v=state.variations.find(v=>v.id===id);if(!v)return;v.published=true;const ok=persist();document.querySelector('#dialog').close();feedFilter='all';location.hash='you';render();if(ok)toast('Shared to your local demo feed.');
      }
      if(a==='topup')modal(`<p class="oct-kicker">DEMO TOP-UP</p><h2>Add £5 of example budget?</h2><p>Your demo limit will become ${money(Math.min(100,15+state.topup))}. No payment is taken. Real pricing and checkout are not connected.</p>${btn('confirm-topup','Confirm demo top-up','','primary coral')}`);
      if(['confirm-topup','budget-reset','budget-cap','budget-default'].includes(a)){
        if(a==='confirm-topup')state.topup=Math.min(90,state.topup+5);
        if(a==='budget-reset'){state.spent=0;state.topup=0;}
        if(a==='budget-cap')state.spent=10+state.topup;
        if(a==='budget-default'){state.spent=6.4;state.topup=0;}
        persist();if(capped()&&current.concept&&!isOriginal(current.variationId))pause();document.querySelector('#dialog').close();render();
      }
      if(a==='reset'){closeSheet();state=empty();selected='original';prompt='';notice='';feedFilter='all';genreFilter='all';if(current.concept){pause();current=demoRecord('original');source();}persist();document.querySelector('#dialog').close();location.hash='feed';render();}
    });
    window.addEventListener('storage',e=>{if(e.key===key||e.key===null){state=empty();load();if(!valid(selected))selected='original';if(current.concept&&!isOriginal(current.variationId)&&(capped()||!find(current.variationId)))pause();render();}});
    sync();
  }
  return {view,init,sync,canPlay,about,createVariation,title,artwork,prepareAudio:()=>typeof PortoWarp==='undefined'?null:PortoWarp.prepare(audio,current.concept&&find(current.variationId)?settingsFor(current.variationId):null),stopVoice:()=>voice?.cancel()};
})();
