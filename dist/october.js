/* October product walkthrough. All accounts, variations and money stay local. */
const PortoOctober = (() => {
  const key = 'porto-october-v1';
  const creators = [
    {id:'luna', name:'Luna Vale', handle:'luna.wav'},
    {id:'kai', name:'Kai Moss', handle:'kaiwaves'},
    {id:'milo', name:'Milo Reed', handle:'milo.fm'},
    {id:'sora', name:'Sora Park', handle:'sora.loop'}
  ];
  const presets = {
    dreamy:{label:'Dreamy', prompt:'Make it dreamy.', file:'dreamy'},
    acoustic:{label:'Acoustic', prompt:'Make it acoustic.', file:'acoustic'},
    slow:{label:'Slow drift', prompt:'Slow it down.', file:'slow'},
    dreamslow:{label:'Dreamy, slower, no guitar', prompt:'Remove the guitar. Slow it down. Make it dreamy.', file:'dreamslow'}
  };
  const seeds = [
    {id:'luna-dreamy', preset:'dreamy', creator:'luna', parent:'original', published:true},
    {id:'kai-acoustic', preset:'acoustic', creator:'kai', parent:'original', published:true},
    {id:'milo-slow', preset:'slow', creator:'milo', parent:'original', published:true},
    {id:'sora-dreamslow', preset:'dreamslow', creator:'sora', parent:'luna-dreamy', published:true}
  ];
  const empty = () => ({variations:[], follows:[], saved:[], spent:6.4, topup:0});
  let state=empty(), storageOK=true, selected='original', feedFilter='all', prompt='', notice='', searchText='';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const all = () => [...seeds,...state.variations];
  const find = id => all().find(v=>v.id===id);
  const title = id => id==='original'?'Afterlight':`Afterlight / ${presets[find(id)?.preset]?.label||'Variation'}`;
  const money = n => '£'+n.toFixed(2);
  const capped = () => state.spent >= 10+state.topup;
  function load() {
    try {
      const raw=JSON.parse(localStorage.getItem(key)||'null');
      if(!raw || typeof raw!=='object')return;
      const next=empty(), ids=new Set(seeds.map(v=>v.id).concat('original'));
      for(const v of (Array.isArray(raw.variations)?raw.variations:[]).slice(0,30)) {
        if(!v || typeof v.id!=='string' || !/^you-[a-z0-9-]{1,50}$/.test(v.id) || ids.has(v.id) || !Object.hasOwn(presets,v.preset) || !ids.has(v.parent))continue;
        next.variations.push({id:v.id,preset:v.preset,parent:v.parent,creator:'you',published:v.published===true});ids.add(v.id);
      }
      next.follows=[...new Set((Array.isArray(raw.follows)?raw.follows:[]).filter(id=>creators.some(c=>c.id===id)))];
      next.saved=[...new Set((Array.isArray(raw.saved)?raw.saved:[]).filter(id=>ids.has(id)))];
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
  const wave = (small=false) => `<span class="oct-wave ${small?'small':''}" aria-hidden="true">${Array.from({length:small?9:49},(_,i)=>`<i style="--h:${18+Math.round(Math.sin(i*1.71)**2*60+Math.sin(i*.31)**2*22)}%;--delay:${i*.035}s"></i>`).join('')}</span>`;
  const avatar = id => id==='you'?'<span class="oct-avatar you-avatar" aria-hidden="true">Y</span>':`<img class="oct-avatar" src="assets/creators/${id}.png" alt="">`;
  const btn = (action,label,id='',cls='secondary') => `<button type="button" class="${cls}" data-oct="${action}" data-id="${esc(id)}">${label}</button>`;
  function badge() {return '<span class="oct-demo">INTERACTIVE DEMO</span>';}
  function footnote() {return `<p class="oct-note">Fictional tracks and creators. Preview audio is a composed demo sound study, not AI generation. <button class="text-button" data-oct="about">About this demo ↗</button></p>`;}
  function followButton(id) {return `<button class="oct-follow" data-oct="follow" data-id="${id}" aria-pressed="${state.follows.includes(id)}" aria-label="${state.follows.includes(id)?'Unfollow':'Follow'} ${creators.find(c=>c.id===id).name}">${state.follows.includes(id)?'Following':'Follow'}</button>`;}
  function variationCard(v) {
    const c=creators.find(c=>c.id===v.creator)||{name:'You',handle:'you'};
    return `<article class="oct-post"><div class="oct-post-person">${avatar(v.creator)}<a href="#creator/${v.creator}"><strong>${c.name}</strong><small>@${c.handle}</small></a>${v.creator==='you'?'<span class="oct-tag">YOUR VERSION</span>':followButton(v.creator)}</div><div class="oct-post-track"><img src="assets/borrowed-sun.webp" alt="Afterlight concept artwork"><div><span class="oct-kicker">USER VARIATION TRACK</span><h3><a href="#variation/${v.id}">${title(v.id)}</a></h3><a class="oct-attribution" href="#home">From June Arcade’s original</a></div><button class="oct-round" data-oct="play" data-id="${v.id}" aria-label="Play ${title(v.id)}">${playIcon}</button></div><div class="oct-post-actions">${btn('lineage','View lineage',v.id,'text-button')}${btn('refine','Make your version',v.id,'text-button')}${btn('save',state.saved.includes(v.id)?'Saved':'Save',v.id,'text-button')}</div></article>`;
  }
  function searchResults() {
    const q=searchText.trim().toLowerCase();
    const items=[{label:'Afterlight',meta:'June Arcade · original concept',href:'#home',art:'borrowed-sun.webp'},
      ...all().map(v=>({label:title(v.id),meta:'June Arcade · '+(v.creator==='you'?'Your version':'@'+creators.find(c=>c.id===v.creator).handle),href:'#variation/'+v.id,art:'borrowed-sun.webp'})),
      ...records.map(r=>({label:r.title,meta:r.artist+' · '+r.genre,href:'#record/'+r.id,art:r.art,keywords:r.tracks.flat().join(' ')}))].filter(v=>(v.label+' '+v.meta+' '+(v.keywords||'')).toLowerCase().includes(q));
    return items.length?items.map(v=>`<a class="oct-search-result" href="${v.href}"><img src="assets/${v.art}" alt=""><span><strong>${v.label}</strong><small>${v.meta}</small></span><span aria-hidden="true">↗</span></a>`).join(''):'<div class="oct-empty"><h2>No music found.</h2><p>Try a track, artist, creator or mood.</p></div>';
  }
  function search() {
    return `<div class="oct-section-heading"><div><p class="oct-kicker">FIND YOUR NEXT LISTEN</p><h1>Search your music.</h1></div></div><label class="oct-search-field" for="oct-search">Tracks, artists, creators and versions<input id="oct-search" type="search" value="${esc(searchText)}" placeholder="Try Afterlight, dreamy or June Arcade"></label><div id="oct-search-results" aria-live="polite">${searchResults()}</div>`;
  }
  function home() {
    return `<section class="oct-welcome"><div><p class="oct-kicker">YOUR MUSIC, YOUR WAY</p><h1>Press play.<br>Make it yours.</h1><p>Originals you love. Versions only you would imagine.</p></div>${badge()}</section><section class="oct-feature"><img class="oct-feature-art" src="assets/borrowed-sun.webp" alt="June Arcade concept artwork"><div class="oct-feature-copy"><span class="oct-kicker">FEATURED ORIGINAL · CONCEPT TRACK</span><h2>Afterlight</h2><a class="oct-artist" href="#artist/june-arcade">June Arcade ↗</a><p>A little softer. A little slower.<br>Find your way into the same song.</p><div class="actions">${btn('play',playIcon+' Play demo','original','primary coral')}${btn('save',state.saved.includes('original')?'Saved':'Save original','original')}</div><a class="oct-voice-link" href="#studio">${wave(true)}<span>Talk to Porto <small>Try a voice or text request</small></span><span aria-hidden="true">↗</span></a></div></section><div class="oct-section-heading"><div><p class="oct-kicker">ONE TRACK. SO MANY POSSIBILITIES.</p><h2>Find your version.</h2></div><a href="#feed">Explore the feed ↗</a></div><div class="oct-version-grid">${seeds.slice(0,3).map(v=>`<a class="oct-version" href="#variation/${v.id}">${wave()}<span class="oct-kicker">AFTERLIGHT / JUNE ARCADE</span><h3>${presets[v.preset].label}</h3><span>by @${creators.find(c=>c.id===v.creator).handle} <b aria-hidden="true">↗</b></span></a>`).join('')}</div><div class="oct-section-heading"><h2>Your records are still here.</h2><a href="#discover">Browse all records ↗</a></div><div class="oct-records">${records.slice(0,4).map(r=>`<a href="#record/${r.id}"><img src="${asset(r)}" alt=""><strong>${r.title}</strong><small>${r.artist}</small></a>`).join('')}</div>${footnote()}`;
  }
  function studio(id) {
    if(id && (id==='original'||find(id)))selected=id;
    const v=find(selected), isVariation=!!v;
    return `<div class="oct-section-heading"><div><p class="oct-kicker">TALK TO PORTO</p><h1>Same song.<br>Your version.</h1></div>${badge()}</div><div class="oct-studio"><a class="oct-source" href="#home"><img src="assets/borrowed-sun.webp" alt=""><span><strong>${title(selected)}</strong><small>${isVariation?'Linked to Afterlight by June Arcade':'Afterlight by June Arcade · original concept'}</small></span><span aria-hidden="true">↗</span></a>${wave()}<h2>${isVariation?presets[v.preset].label:'What would you change?'}</h2><p class="oct-studio-intro">Keep the original. Find something new in it.</p>${isVariation?`<div class="actions">${btn('play',playIcon+' Preview demo',selected,'primary')}${btn('lineage','View lineage',selected)}${v.creator==='you'?btn('share',v.published?'Shared to your feed':'Share to feed',selected,'secondary'):''}</div>`:''}<form id="oct-prompt-form"><label for="oct-prompt">Describe your version</label><div class="oct-composer"><textarea id="oct-prompt" rows="2" maxlength="300" placeholder="Remove the guitar. Slow it down. Make it dreamy.">${esc(prompt)}</textarea><button class="oct-round" type="submit" aria-label="Create demo variation">↑</button></div><div class="oct-composer-tools">${btn('voice',wave(true)+' Try voice demo','','text-button')}<span>Text works too. No microphone used.</span></div><div class="oct-suggestions">${Object.entries(presets).map(([id,p])=>btn('prompt',p.label,id,'oct-chip')).join('')}</div><p class="oct-status" role="status">${esc(notice)}</p></form><details class="oct-permissions"><summary>Artist permissions & demo limits</summary><p>This fictional example allows the four shown variation directions, refinement and sharing inside Porto. Original credit must stay attached. A real artist sets these permissions before generation or publishing.</p><p>Each artist’s model is artist-controlled. This walkthrough chooses prepared sound studies; it does not train a model or generate music. Generation price and timing are not set.</p></details></div>${footnote()}`;
  }
  function feed(creator) {
    const person=creators.find(c=>c.id===creator);
    const posts=all().filter(v=>v.published && (!creator||v.creator===creator) && (creator||feedFilter!=='following'||state.follows.includes(v.creator)));
    return `<div class="oct-section-heading"><div><p class="oct-kicker">MUSIC MADE PERSONAL</p><h1>${creator==='you'?'Your space.':person?person.name:'Made by listeners.'}</h1><p class="oct-subtitle">Listen. Follow. Share.</p></div>${person?followButton(person.id):badge()}</div><div class="oct-people">${creators.map(c=>`<a href="#creator/${c.id}">${avatar(c.id)}<span>@${c.handle}</span></a>`).join('')}</div>${!creator?`<div class="oct-tabs" aria-label="Feed filter">${btn('feed-filter','For you','all',feedFilter==='all'?'active':'')}${btn('feed-filter','Following','following',feedFilter==='following'?'active':'')}</div>`:''}<div class="oct-feed-layout"><div class="oct-posts">${creator==='you'&&state.saved.length?`<h2>Saved versions</h2>${state.saved.map(id=>`<a class="oct-draft" href="${id==='original'?'#home':'#variation/'+id}">${title(id)} <span>Open ↗</span></a>`).join('')}`:''}${posts.length?posts.map(variationCard).join(''):`<div class="oct-empty"><h2>${creator==='you'?'Your next version starts here.':'Find your people.'}</h2><p>${creator==='you'?'Create a version, then share it to your local feed.':'Follow a creator to see their variations here.'}</p>${creator==='you'?'<a class="secondary" href="#studio">Make a version</a>':btn('feed-filter','Explore creators','all')}</div>`}${creator==='you'&&state.variations.some(v=>!v.published)?`<h2>Your drafts</h2>${state.variations.filter(v=>!v.published).map(v=>`<a class="oct-draft" href="#variation/${v.id}">${title(v.id)} <span>Refine or share ↗</span></a>`).join('')}`:''}</div><aside class="oct-feed-aside"><span class="oct-kicker">EVERY VERSION HAS A ROOT</span><h2>More ways<br> to be heard.</h2><p>Every User Variation Track stays connected to its original artist.</p><p>Paid listening returns revenue to the source rights holders.</p><a href="#ledger">Explore Porto Ledger ↗</a><small>Creator credit alone does not grant a royalty share. These accounts and posts are fictional.</small></aside></div>${footnote()}`;
  }
  function budget() {
    const limit=10+state.topup, left=Math.max(0,limit-state.spent);
    return `<div class="oct-section-heading"><div><p class="oct-kicker">YOUR LISTENING BUDGET</p><h1>Listen on your terms.</h1><p class="oct-subtitle">Pay for listening. No subscription.</p></div>${badge()}</div><section class="oct-budget-card"><p>Illustrative monthly spend</p><div class="oct-budget-total">${money(state.spent)} <span>/ ${money(limit)}</span></div><meter min="0" max="${limit}" value="${Math.min(state.spent,limit)}" aria-label="Illustrative monthly listening spend"></meter><h2>${capped()?'Originals play on. Variations are paused.':money(left)+' left to explore.'}</h2><p>At your £10 budget, originals keep playing. Top up to continue with variations, or wait for the monthly reset. No automatic extra charges.</p><div class="actions">${btn('topup','Try a £5 demo top-up','','primary coral')}${btn('budget-reset','Preview monthly reset')}</div><details class="oct-permissions"><summary>Try a budget scenario</summary><p>This control changes an example balance only. Audio playback never charges you.</p><div class="actions">${btn('budget-cap','Preview budget reached')}${btn('budget-default','Restore £6.40 example')}</div></details></section><div class="oct-fees"><article><span class="oct-kicker">ORIGINAL SONG</span><strong>90%</strong><h3>to artists / rights holders</h3><p>10% Porto fee</p></article><article><span class="oct-kicker">USER VARIATION TRACK</span><strong>70%</strong><h3>to artists / rights holders</h3><p>30% Porto fee</p></article></div><p class="oct-note">Proposed shares of allocated song revenue. Labels and publishers set their internal rights splits. Listening tariffs and funding originals after the cap require agreement. This is an optional-budget walkthrough, with no payment or real balance.</p>`;
  }
  const ledgerRows=[
    {id:'original',label:'Afterlight',type:'Original',revenue:3,pool:2.7,rate:90,status:'Confirmed'},
    {id:'luna-dreamy',label:'Afterlight / Dreamy',type:'User Variation Track · @luna.wav',revenue:4,pool:2.8,rate:70,status:'Sent'},
    {id:'milo-slow',label:'Afterlight / Slow drift',type:'User Variation Track · @milo.fm',revenue:2,pool:1.4,rate:70,status:'Owed'}
  ];
  function ledger() {
    return `<div class="oct-section-heading"><div><p class="oct-kicker">PORTO LEDGER</p><h1>Every royalty connected.</h1><p class="oct-subtitle">Stream. Share. Get paid.</p></div>${badge()}</div><div class="oct-ledger-summary"><article><span>Illustrative listening revenue</span><strong>£9.00</strong></article><article><span>Rights-holder pool</span><strong>£6.90</strong></article><article><span>Daily USDC payouts on Aptos</span><strong class="oct-target">Product target</strong></article></div><div class="oct-ledger-table"><table><caption>Example entries for June Arcade’s Afterlight. These are not your listening-budget transactions.</caption><thead><tr><th scope="col">Track / source</th><th scope="col">Revenue</th><th scope="col">Rights pool</th><th scope="col">Status</th><th scope="col">Record</th></tr></thead><tbody>${ledgerRows.map(r=>`<tr><th scope="row">${r.label}<small>${r.type}</small></th><td>${money(r.revenue)}</td><td>${money(r.pool)}<small>${r.rate}% allocation</small></td><td><span class="oct-tag">${r.status}</span></td><td>${btn('payout','Details',r.id,'text-button')}</td></tr>`).join('')}</tbody></table></div><div class="oct-ledger-explainer"><div><span class="oct-kicker">ACCOUNTABLE. TRACKABLE. VERIFIABLE.</span><h2>Proof behind<br>every payment.</h2></div><p>The proposed payout record connects an amount, recipient, rights version and allocation to a transaction and confirmation. Porto submits accepted usage. Private listening data stays off chain.</p></div><p class="oct-note">All entries and statuses above are illustrative, with no real transaction or wallet. GBP allocation examples are not USDC transfers or exchange-rate quotes. Daily USDC payouts are a product target; Mainnet release remains gated.</p>`;
  }
  function lineage(id) {
    const chain=[], seen=new Set();let v=find(id);
    while(v&&!seen.has(v.id)){seen.add(v.id);chain.unshift(v);v=find(v.parent);}
    modal(`<p class="oct-kicker">TRACK LINEAGE</p><h2>Always linked to the original.</h2><ol class="oct-lineage"><li><strong>Afterlight</strong><span>June Arcade · original concept</span></li>${chain.map(v=>`<li><strong>${presets[v.preset].label}</strong><span>Creator: ${v.creator==='you'?'You':'@'+creators.find(c=>c.id===v.creator).handle}</span></li>`).join('')}</ol><p>Original rights stay with the source rights holders. Artist permissions apply to every branch. Creator credit alone does not confer a royalty share.</p><p class="oct-note">Fictional lineage, saved only in this browser.</p>`);
  }
  function share(id) {
    const v=state.variations.find(v=>v.id===id);if(!v)return;
    if(v.published){toast('This version is already on your local feed.');return;}
    modal(`<p class="oct-kicker">SHARE YOUR VERSION</p><h2>${title(id)}</h2><p>Created by you, from Afterlight by June Arcade. Source credit and lineage stay attached.</p><div class="oct-share-permission"><strong>Demo artist permissions</strong><p>Sharing inside Porto is allowed in this fictional example. External release and commercial use are not granted.</p></div><p>This publishes to your browser’s demo feed only. Nothing is sent to other people.</p>${btn('publish','Share to my demo feed',id,'primary coral')}`);
  }
  function payout(id) {
    const r=ledgerRows.find(r=>r.id===id);if(!r)return;
    modal(`<p class="oct-kicker">ILLUSTRATIVE PAYOUT RECORD</p><h2>${r.label}</h2><dl class="oct-payout"><dt>What</dt><dd>${money(r.pool)} rights-holder obligation. USDC payment amount not set in this demo.</dd><dt>Who</dt><dd>June Arcade source rights holders. Recipient wallet: not connected. Example rights version: v1.</dd><dt>How</dt><dd>${money(r.revenue)} × ${r.rate}% = ${money(r.pool)}. Individual recipients follow agreed splits.</dd><dt>When</dt><dd>Example status: ${r.status}. No actual payment timestamp.</dd><dt>Transaction</dt><dd>No transaction submitted. No hash or on-chain proof.</dd></dl><p>Daily USDC settlement on Aptos is the proposed product. This record illustrates the fields, not a live payout.</p>`);
  }
  function demoRecord(id) {
    const v=find(id), file=v?presets[v.preset].file:'original';
    return {id:'afterlight',concept:true,variationId:id,title:'Afterlight',artist:'June Arcade',year:'2026',art:'borrowed-sun.webp',tracks:[[title(id)],[]],duration:[[24],[]],audioFiles:[[`assets/afterlight-${file}.wav`]],audioExt:'wav'};
  }
  function canPlay(r) {
    if(r.concept&&r.variationId!=='original'&&capped()){
      modal(`<p class="oct-kicker">BUDGET REACHED · DEMO</p><h2>Originals play on.</h2><p>Your example listening budget is used. Try a top-up or monthly reset to resume variations. Nothing will be charged.</p><a class="primary" href="#budget">Manage demo budget</a>`);return false;
    }return true;
  }
  function play(id) {
    if(id!=='original'&&!find(id))return;
    const r=demoRecord(id);if(!canPlay(r))return;
    if(current.concept&&current.variationId===id){toggle();return;}
    pause();current=r;side=0;track=0;source();resume();selected=id;
  }
  function createVariation(text) {
    const s=text.trim().toLowerCase();
    if(!s)return {error:'Describe a change, or choose a suggestion.'};
    const supported=Object.values(presets).some(p=>p.prompt.toLowerCase()===s)||/^(make (it|this) (dreamy|acoustic)|slow (it|this) down|dreamy|acoustic|slower|slow drift|remove the guitar|no guitar)[.! ]*$/.test(s);
    if(!supported)return {error:'This demo supports dreamy, acoustic, slower and no-guitar requests. Try one of the suggestions.'};
    if(state.variations.length>=30)return {error:'Your demo has 30 saved versions. Open About this demo to reset the walkthrough.'};
    const preset=/guitar/.test(s)||(/dream/.test(s)&&/slow/.test(s))?'dreamslow':/acoustic/.test(s)?'acoustic':/slow/.test(s)?'slow':'dreamy';
    const v={id:'you-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),preset,parent:selected,creator:'you',published:false};
    state.variations.push(v);persist();selected=v.id;return {variation:v};
  }
  function about() {
    modal(`<p class="oct-kicker">PORTO / OCTOBER PROTOTYPE</p><h2>Listen. Make a version. Share.</h2><p>Explore voice-script and text requests, prepared variation previews, creator following, local sharing, lineage, a listening budget and Porto Ledger.</p><p>Afterlight and all creators are fictional. Its five 24-second sound studies are composed with a local synthesizer for this prototype. They are not AI-generated music or recordings by June Arcade. Existing catalogue recordings keep their actual composer credits.</p><p>No microphone, model, account service, payment or live ledger is connected. Posts, follows and the budget are saved in this browser only. ${storageOK?'':'Storage is unavailable for this visit.'}</p><a href="credits.html">Music credits & downloads ↗</a><div class="actions">${btn('reset','Reset October demo')}</div><p class="oct-note">Reset clears demo versions, follows, saved concept tracks and example budget. Your existing record collection and purchases stay as they are.</p>`);
  }
  function sync() {
    const library=document.querySelector('#oct-library');
    if(library)library.innerHTML=`<p class="oct-kicker">YOUR LIBRARY</p><a class="oct-library-track" href="#home"><img src="assets/borrowed-sun.webp" alt=""><span><strong>Afterlight</strong><small>June Arcade</small></span></a>${records.filter(r=>saved.includes(r.id)||owned.includes(r.id)).slice(0,3).map(r=>`<a class="oct-library-track" href="#record/${r.id}"><img src="${asset(r)}" alt=""><span><strong>${r.title}</strong><small>${r.artist}</small></span></a>`).join('')}<a class="oct-library-all" href="#shelf">Your collection <span>${new Set([...saved,...owned]).size} ↗</span></a>`;
    const budgetLink=document.querySelector('#oct-budget-label');if(budgetLink)budgetLink.textContent=`${money(state.spent)} / ${money(10+state.topup)}`;
    if(current.concept){
      const b=document.querySelector('#player-collection');b.dataset.action='';b.dataset.oct='save';b.dataset.id=current.variationId;b.disabled=false;b.setAttribute('aria-label','Save '+title(current.variationId));b.setAttribute('aria-pressed',String(state.saved.includes(current.variationId)));b.innerHTML=state.saved.includes(current.variationId)?'✓ Saved':'＋ Save';
      document.querySelector('#mini-artist').textContent='June Arcade · demo sound study';
      document.querySelector('#play').setAttribute('aria-label',playing?'Pause playback':'Play demo preview');
    } else {delete document.querySelector('#player-collection').dataset.oct;document.querySelector('#player-collection').dataset.action='save';}
  }
  function view(route) {
    const [name,id]=route.split('/');
    if(name==='home')return home();
    if(name==='search')return search();
    if(name==='studio')return studio();
    if(name==='variation')return find(id)?studio(id):'<div class="oct-empty"><h1>Version not found.</h1><p>This version may belong to another browser or have been reset.</p><a href="#feed">Explore the feed ↗</a></div>';
    if(name==='feed')return feed();
    if(name==='creator')return creators.some(c=>c.id===id)||id==='you'?feed(id):'<h1>Creator not found.</h1>';
    if(name==='you')return feed('you');
    if(name==='budget'||name==='support')return budget();
    if(name==='ledger')return ledger();
    if(name==='listening'&&current.concept)return studio(current.variationId);
    return null;
  }
  function init() {
    current=demoRecord('original');updatePlayer();
    document.addEventListener('submit',e=>{
      if(e.target.id!=='oct-prompt-form')return;e.preventDefault();
      prompt=document.querySelector('#oct-prompt').value;
      if(/^play (june arcade[’']s )?afterlight[.! ]*$/i.test(prompt.trim())){play('original');notice='Playing the Afterlight demo sound study.';prompt='';render();return;}
      const result=createVariation(prompt);
      if(result.error){document.querySelector('.oct-status').textContent=result.error;return;}
      notice='Your demo version is ready. Preview, refine or share it.';prompt='';location.hash='variation/'+result.variation.id;render();main.focus({preventScroll:true});
    });
    document.addEventListener('input',e=>{if(e.target.id==='oct-prompt')prompt=e.target.value;if(e.target.id==='oct-search'){searchText=e.target.value;document.querySelector('#oct-search-results').innerHTML=searchResults();}});
    document.addEventListener('click',e=>{
      const link=e.target.closest('a[href^="#"]');
      if(link&&document.querySelector('#dialog').contains(link))document.querySelector('#dialog').close();
      const b=e.target.closest('[data-oct]');if(!b)return;
      const {oct:a,id}=b.dataset;
      if(a==='play')play(id);
      if(a==='about')about();
      if(a==='lineage')lineage(id);
      if(a==='share')share(id);
      if(a==='payout')payout(id);
      if(a==='refine'){selected=id;prompt='';notice='Refining this version keeps its original and parent linked.';location.hash='studio';render();}
      if(a==='prompt'||a==='voice'){
        prompt=a==='voice'?presets.dreamslow.prompt:presets[id].prompt;
        const input=document.querySelector('#oct-prompt');input.value=prompt;input.focus();
        document.querySelector('.oct-status').textContent=a==='voice'?'Example voice transcript added. Edit it, then create your demo version. No microphone is recording.':'';
      }
      if(a==='follow'){
        state.follows=state.follows.includes(id)?state.follows.filter(x=>x!==id):[...state.follows,id];persist();render();document.querySelector(`[data-oct="follow"][data-id="${id}"]`)?.focus();
      }
      if(a==='save'){
        state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];const ok=persist();render();if(ok)toast(state.saved.includes(id)?'Saved to your local demo.':'Removed from your saved versions.');
      }
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
        persist();if(capped()&&current.concept&&current.variationId!=='original')pause();document.querySelector('#dialog').close();render();
      }
      if(a==='reset'){state=empty();selected='original';prompt='';notice='';feedFilter='all';if(current.concept){pause();current=demoRecord('original');source();}persist();document.querySelector('#dialog').close();location.hash='home';render();}
    });
    window.addEventListener('storage',e=>{if(e.key===key||e.key===null){state=empty();load();if(!find(selected))selected='original';if(current.concept&&current.variationId!=='original'&&(capped()||!find(current.variationId)))pause();render();}});
    sync();
  }
  return {view,init,sync,canPlay,about,createVariation};
})();
