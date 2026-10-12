/* October product walkthrough. All accounts, variations and money stay local. */
const PortoOctober = (() => {
  const key = 'porto-reformat-v2';
  const creators = [
    {id:'luna', name:'Luna Vale', handle:'luna.wav'},
    {id:'kai', name:'Kai Moss', handle:'kaiwaves'},
    {id:'milo', name:'Milo Reed', handle:'milo.fm'},
    {id:'sora', name:'Sora Park', handle:'sora.loop'}
  ];
  const presets = {
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
  const empty = () => ({variations:[], follows:[], saved:[], spent:6.4, topup:0});
  let state=empty(), storageOK=true, selected='original', feedFilter='all', prompt='', notice='', searchText='';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const all = () => [...seeds,...state.variations];
  const find = id => all().find(v=>v.id===id);
  const edition = id => String(find(id)?.number||1).padStart(3,'0');
  const title = id => id==='original'?'Reformat':`Reformat/${edition(id)}`;
  const handle = id => {const v=find(id);return v?.creator==='you'?'@you':'@'+(creators.find(c=>c.id===v?.creator)?.handle||'kikistatic');};
  function artStyle(id) {
    const v=find(id);if(!v)return '';
    const palettes={dreamy:['#9380f0','#c697d9',320],night:['#22668d','#203055',260],slow:['#e6a24f','#8b4141',90],dreamslow:['#74c8b1','#3a527b',220]};
    const [tint,shade,hue]=palettes[v.preset],n=v.number;
    return `--art-tint:${tint};--art-shade:${shade};--art-hue:${hue+(n-2)*7}deg;--art-turn:${(n%5-2)*2}deg;--art-scale:${1.12+(n%4)*.08};--art-x:${35+(n*13%36)}%;--art-angle:${n*47%360}deg;--art-orbit:${12+n*17%55}%;`;
  }
  const artEffect = id => ({dreamy:'haze',night:'glitch',slow:'smear',dreamslow:'liquid'}[find(id)?.preset]||'');
  function artwork(id,extra='') {
    const v=find(id);
    return `<span class="oct-artwork ${v?'is-variation oct-effect-'+artEffect(id):''} ${extra}" style="${artStyle(id)}" role="img" aria-label="${esc(v?title(id)+' artwork, stamped '+handle(id):'Sugar Circuit original artwork')}"><img src="assets/sugar-circuit.webp" alt="">${v?`<span class="oct-art-echo" aria-hidden="true"></span><span class="oct-art-slice" aria-hidden="true"></span><span class="oct-art-orbit" aria-hidden="true"></span><span class="oct-art-number" aria-hidden="true">/${edition(id)}</span><span class="oct-art-stamp" aria-hidden="true">${handle(id)}</span>`:''}</span>`;
  }
  const money = n => '£'+n.toFixed(2);
  const capped = () => state.spent >= 10+state.topup;
  function load() {
    try {
      const raw=JSON.parse(localStorage.getItem(key)||'null');
      if(!raw || typeof raw!=='object')return;
      const next=empty(), ids=new Set(seeds.map(v=>v.id).concat('original')), numbers=new Set(seeds.map(v=>v.number));
      for(const v of (Array.isArray(raw.variations)?raw.variations:[]).slice(0,30)) {
        if(!v || typeof v.id!=='string' || !/^you-[a-z0-9-]{1,50}$/.test(v.id) || ids.has(v.id) || !Object.hasOwn(presets,v.preset) || !ids.has(v.parent))continue;
        const number=Number.isSafeInteger(v.number)&&v.number>5&&v.number<100000&&!numbers.has(v.number)?v.number:Math.max(...numbers)+1;
        numbers.add(number);next.variations.push({id:v.id,number,preset:v.preset,parent:v.parent,creator:'you',published:v.published===true});ids.add(v.id);
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
  const sound = id => ReformatAudio[find(id)?.preset||'original'];
  const wave = (small=false,id=selected) => `<span class="oct-wave ${small?'small':''}" ${small?'':`data-wave="${esc(id)}"`} aria-hidden="true">${(small?[.25,.55,.9,.4,.75,1,.55,.8,.3]:sound(id).peaks).map((p,i)=>`<i style="--h:${Math.max(8,Math.round(p*100))}%;--delay:${i*.065}s"></i>`).join('')}</span>`;
  const avatar = id => `<img class="oct-avatar" src="assets/${id==='original'?'sugar-circuit.webp':id==='you'?'creators/you.svg':`creators/${id}.png`}" alt="">`;
  let voice, voiceRoute='';
  function syncVoice() {
    const {status,message}=voice?.state||{status:'idle',message:''};
    document.querySelectorAll('[data-oct="voice"]').forEach(b=>{
      const active=['starting','listening','stopping'].includes(status);
      b.dataset.voiceState=status;b.setAttribute('aria-pressed',String(active));
      b.setAttribute('aria-label',active?'Stop voice input':'Start voice input');
      const label=b.querySelector('.oct-voice-label');if(label)label.textContent=active?(status==='starting'?'Starting…':status==='stopping'?'Finishing…':'Listening…'):'Talk to Porto';
    });
    const output=document.querySelector('#oct-voice-status');if(output)output.textContent=message;
  }
  function composer() {
    return `<form id="oct-prompt-form"><label for="oct-prompt">Make this track yours <span id="oct-source-label">· ${esc(selected==='original'?'Original':title(selected))}</span></label><div class="oct-composer"><textarea id="oct-prompt" rows="2" maxlength="300" placeholder="Slow it down. Make it dreamy.">${esc(prompt)}</textarea><button class="oct-round" type="submit" aria-label="Choose prepared variation">↑</button></div><div class="oct-composer-tools">${btn('voice',wave(true)+'<span class="oct-voice-label">Talk to Porto</span>','','text-button')}<span>Speak or type a request</span></div><p id="oct-voice-status" class="oct-status" role="status"></p><div class="oct-suggestions">${Object.entries(presets).map(([id,p])=>btn('prompt',p.label,id,'oct-chip')).join('')}</div><p id="oct-request-status" class="oct-status" role="status">${esc(notice)}</p><p class="oct-voice-privacy">Speech uses your browser’s recognition service, which may process audio online. Review your text before submitting. Music versions are prepared, with no AI transformation.</p></form>`;
  }
  function trackCard(id) {
    const v=find(id), creator=v?.creator||'original';
    const person=creators.find(c=>c.id===creator);
    return `<article class="oct-track-card" data-track="${id}"><div class="oct-track-art">${artwork(id)}<span class="oct-track-badge">${v?presets[v.preset].label:'Original'}</span><a class="oct-track-person" href="${creator==='original'?'#artist/kiki-static':'#creator/'+creator}" aria-label="${person?.name||(creator==='you'?'Your profile':'Kiki Static profile')}">${avatar(creator)}</a><button class="oct-round" data-oct="play" data-id="${id}" aria-label="Play ${title(id)}">${playIcon}</button></div><a class="oct-track-title" href="${v?'#variation/'+id:'#original'}"><strong>${v?title(id):'Original'}</strong><small>${person?'@'+person.handle:creator==='you'?'Your version':'Kiki Static'}</small></a>${wave(false,id)}</article>`;
  }
  function syncPlayback() {
    const sourceLabel=document.querySelector('#oct-source-label');
    if(sourceLabel)sourceLabel.textContent='· '+(selected==='original'?'Original':title(selected));
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
  function footnote() {return `<p class="oct-note">Audio: Reformat by Kevin MacLeod, CC BY 4.0. Artist profiles and creators are fictional. <a href="credits.html#reformat-versions">Credits & versions ↗</a> · <button class="text-button" data-oct="about">About this app</button></p>`;}
  function followButton(id) {return `<button class="oct-follow" data-oct="follow" data-id="${id}" aria-pressed="${state.follows.includes(id)}" aria-label="${state.follows.includes(id)?'Unfollow':'Follow'} ${creators.find(c=>c.id===id).name}">${state.follows.includes(id)?'Following':'Follow'}</button>`;}
  function variationCard(v) {
    const c=creators.find(c=>c.id===v.creator)||{name:'You',handle:'you'};
    return `<article class="oct-post"><div class="oct-post-person">${avatar(v.creator)}<a href="#creator/${v.creator}"><strong>${c.name}</strong><small>@${c.handle}</small></a>${v.creator==='you'?'<span class="oct-tag">YOUR VERSION</span>':followButton(v.creator)}</div><div class="oct-post-track">${artwork(v.id,'oct-post-art')}<div><span class="oct-kicker">${presets[v.preset].label}</span><h3><a href="#variation/${v.id}">${title(v.id)}</a></h3><a class="oct-attribution" href="#original">From Kiki Static’s original</a></div><button class="oct-round" data-oct="play" data-id="${v.id}" aria-label="Play ${title(v.id)}">${playIcon}</button></div>${wave(false,v.id)}<div class="oct-post-actions">${btn('lineage','View lineage',v.id,'text-button')}${btn('refine','Make your version',v.id,'text-button')}${btn('save',state.saved.includes(v.id)?'Saved':'Save',v.id,'text-button')}</div></article>`;
  }
  function searchResults() {
    const q=searchText.trim().toLowerCase();
    const items=[{label:'Reformat',meta:'Kiki Static · Original',href:'#original',art:'sugar-circuit.webp'},
      ...all().map(v=>({label:title(v.id),meta:presets[v.preset].label+' · '+handle(v.id),href:'#variation/'+v.id,version:v.id})),
      ...records.map(r=>({label:r.title,meta:r.artist+' · '+r.genre,href:'#record/'+r.id,art:r.art,keywords:r.tracks.flat().join(' ')}))].filter(v=>(v.label+' '+v.meta+' '+(v.keywords||'')).toLowerCase().includes(q));
    return items.length?items.map(v=>`<a class="oct-search-result" href="${v.href}">${v.version?artwork(v.version,'oct-search-art'):`<img src="assets/${v.art}" alt="">`}<span><strong>${v.label}</strong><small>${v.meta}</small></span><span aria-hidden="true">↗</span></a>`).join(''):'<div class="oct-empty"><h2>No music found.</h2><p>Try a track, artist, creator or mood.</p></div>';
  }
  function search() {
    return `<div class="oct-section-heading"><div><p class="oct-kicker">FIND YOUR NEXT LISTEN</p><h1>Search your music.</h1></div></div><label class="oct-search-field" for="oct-search">Tracks, artists, creators and versions<input id="oct-search" type="search" value="${esc(searchText)}" placeholder="Try Reformat, dreamy or Kiki Static"></label><div id="oct-search-results" aria-live="polite">${searchResults()}</div>`;
  }
  function studio(id) {
    if(id && (id==='original'||find(id)))selected=id;
    const v=find(selected), isVariation=!!v;
    return `<div class="oct-section-heading"><div><p class="oct-kicker">REFORMAT / KIKI STATIC</p><h1>${isVariation?title(selected):'Original'}</h1>${isVariation?`<span class="oct-tag">${presets[v.preset].label}</span>`:''}</div>${badge()}</div><div class="oct-studio">${isVariation?artwork(selected,'oct-studio-art'):''}<a class="oct-source" href="#record/sugar-circuit">${artwork(selected,'oct-source-art')}<span><strong>${title(selected)}</strong><small>Sugar Circuit · Hyperpop</small></span><span aria-hidden="true">↗</span></a>${wave()}<div class="actions">${btn('play',playIcon+' Play',selected,'primary')}${btn('lineage','View lineage',selected)}${v?.creator==='you'?btn('share',v.published?'Shared to your feed':'Share to feed',selected):''}</div>${composer()}<details class="oct-permissions"><summary>About these versions</summary><p>Four prepared audio edits let you try the listening and sharing flow. Dreamy adds echo, Night drive filters and slows the track, Slow drift lowers the tempo, and Dreamy & slow combines both edits. No model or instrument separation runs here.</p><p>Reformat is by Kevin MacLeod, used under CC BY 4.0. Kiki Static and the creator profiles are fictional. An eventual artist model requires the source artist’s permissions.</p></details></div>${footnote()}`;
  }
  function feed(creator) {
    const person=creators.find(c=>c.id===creator);
    const posts=all().filter(v=>v.published && (!creator||v.creator===creator) && (creator||feedFilter!=='following'||state.follows.includes(v.creator)));
    return `<div class="oct-section-heading"><div><p class="oct-kicker">MUSIC MADE PERSONAL</p><h1>${creator==='you'?'Your space.':person?person.name:'Your feed.'}</h1><p class="oct-subtitle">A track you love. A version that’s yours.</p></div>${person?followButton(person.id):badge()}</div>${!creator?`<section class="oct-feed-feature"><div class="oct-section-heading"><div><p class="oct-kicker">ON REPEAT / HYPERPOP</p><h2>Reformat <span>by Kiki Static</span></h2></div><a href="#record/sugar-circuit">The record ↗</a></div><div class="oct-track-strip" role="region" aria-label="Reformat original and listener versions" tabindex="0">${['original',...all().filter(v=>v.published).map(v=>v.id)].map(trackCard).join('')}</div><div class="oct-feed-composer">${composer()}</div></section>`:''}${!creator?`<div class="oct-tabs" aria-label="Feed filter">${btn('feed-filter','For you','all',feedFilter==='all'?'active':'')}${btn('feed-filter','Following','following',feedFilter==='following'?'active':'')}</div>`:''}<div class="oct-feed-layout"><div class="oct-posts">${creator==='you'&&state.saved.length?`<h2>Saved versions</h2>${state.saved.map(id=>`<a class="oct-draft" href="${id==='original'?'#original':'#variation/'+id}">${title(id)} <span>Open ↗</span></a>`).join('')}`:''}${posts.length?posts.map(variationCard).join(''):`<div class="oct-empty"><h2>${creator==='you'?'Your next version starts here.':'Find your people.'}</h2><p>${creator==='you'?'Create a version, then share it to your local feed.':'Follow a creator to see their variations here.'}</p>${creator==='you'?'<a class="secondary" href="#studio">Make a version</a>':btn('feed-filter','Explore creators','all')}</div>`}${creator==='you'&&state.variations.some(v=>!v.published)?`<h2>Your drafts</h2>${state.variations.filter(v=>!v.published).map(v=>`<a class="oct-draft" href="#variation/${v.id}">${title(v.id)} <span>Refine or share ↗</span></a>`).join('')}`:''}</div><aside class="oct-feed-aside"><span class="oct-kicker">EVERY VERSION HAS A ROOT</span><h2>More ways<br> to be heard.</h2><p>Every User Variation Track stays connected to its original artist.</p><p>Paid listening returns revenue to the source rights holders.</p><a href="#ledger">Explore Porto Ledger ↗</a><small>Creator credit alone does not grant a royalty share. These accounts and posts are fictional.</small></aside></div>${footnote()}`;
  }
  function budget() {
    const limit=10+state.topup, left=Math.max(0,limit-state.spent);
    return `<div class="oct-section-heading"><div><p class="oct-kicker">YOUR LISTENING BUDGET</p><h1>Listen on your terms.</h1><p class="oct-subtitle">Pay for listening. No subscription.</p></div>${badge()}</div><section class="oct-budget-card"><p>Illustrative monthly spend</p><div class="oct-budget-total">${money(state.spent)} <span>/ ${money(limit)}</span></div><meter min="0" max="${limit}" value="${Math.min(state.spent,limit)}" aria-label="Illustrative monthly listening spend"></meter><h2>${capped()?'Originals play on. Variations are paused.':money(left)+' left to explore.'}</h2><p>At your £10 budget, originals keep playing. Top up to continue with variations, or wait for the monthly reset. No automatic extra charges.</p><div class="actions">${btn('topup','Try a £5 demo top-up','','primary coral')}${btn('budget-reset','Preview monthly reset')}</div><details class="oct-permissions"><summary>Try a budget scenario</summary><p>This control changes an example balance only. Audio playback never charges you.</p><div class="actions">${btn('budget-cap','Preview budget reached')}${btn('budget-default','Restore £6.40 example')}</div></details></section><div class="oct-fees"><article><span class="oct-kicker">ORIGINAL SONG</span><strong>90%</strong><h3>to artists / rights holders</h3><p>10% Porto fee</p></article><article><span class="oct-kicker">USER VARIATION TRACK</span><strong>70%</strong><h3>to artists / rights holders</h3><p>30% Porto fee</p></article></div><p class="oct-note">Proposed shares of allocated song revenue. Labels and publishers set their internal rights splits. Listening tariffs and funding originals after the cap require agreement. This is an optional-budget walkthrough, with no payment or real balance.</p>`;
  }
  const ledgerRows=[
    {id:'original',label:'Reformat',type:'Original',revenue:3,pool:2.7,rate:90,status:'Confirmed'},
    {id:'luna-dreamy',label:'Reformat/002',type:'Dreamy · @luna.wav',revenue:4,pool:2.8,rate:70,status:'Sent'},
    {id:'milo-slow',label:'Reformat/004',type:'Slow drift · @milo.fm',revenue:2,pool:1.4,rate:70,status:'Owed'}
  ];
  function ledger() {
    return `<div class="oct-section-heading"><div><p class="oct-kicker">PORTO LEDGER</p><h1>Every royalty connected.</h1><p class="oct-subtitle">Stream. Share. Get paid.</p></div>${badge()}</div><div class="oct-ledger-summary"><article><span>Illustrative listening revenue</span><strong>£9.00</strong></article><article><span>Rights-holder pool</span><strong>£6.90</strong></article><article><span>Daily USDC payouts on Aptos</span><strong class="oct-target">Product target</strong></article></div><div class="oct-ledger-table"><table><caption>Example entries for Kiki Static’s Reformat. These are not your listening-budget transactions.</caption><thead><tr><th scope="col">Track / source</th><th scope="col">Revenue</th><th scope="col">Rights pool</th><th scope="col">Status</th><th scope="col">Record</th></tr></thead><tbody>${ledgerRows.map(r=>`<tr><th scope="row">${r.label}<small>${r.type}</small></th><td>${money(r.revenue)}</td><td>${money(r.pool)}<small>${r.rate}% allocation</small></td><td><span class="oct-tag">${r.status}</span></td><td>${btn('payout','Details',r.id,'text-button')}</td></tr>`).join('')}</tbody></table></div><div class="oct-ledger-explainer"><div><span class="oct-kicker">ACCOUNTABLE. TRACKABLE. VERIFIABLE.</span><h2>Proof behind<br>every payment.</h2></div><p>The proposed payout record connects an amount, recipient, rights version and allocation to a transaction and confirmation. Porto submits accepted usage. Private listening data stays off chain.</p></div><p class="oct-note">All entries and statuses above are illustrative, with no real transaction or wallet. GBP allocation examples are not USDC transfers or exchange-rate quotes. Daily USDC payouts are a product target; Mainnet release remains gated.</p>`;
  }
  function lineage(id) {
    const chain=[], seen=new Set();let v=find(id);
    while(v&&!seen.has(v.id)){seen.add(v.id);chain.unshift(v);v=find(v.parent);}
    modal(`<p class="oct-kicker">TRACK LINEAGE</p><h2>Always linked to the original.</h2><ol class="oct-lineage"><li><strong>Reformat</strong><span>Kevin MacLeod · Original · CC BY 4.0</span></li>${chain.map(v=>`<li><strong>${title(v.id)}</strong><span>${presets[v.preset].label}</span><span>Creator: ${v.creator==='you'?'You':'@'+creators.find(c=>c.id===v.creator).handle}</span></li>`).join('')}</ol><p>Original rights stay with the source rights holders. Artist permissions apply to every branch. Creator credit alone does not confer a royalty share.</p><p class="oct-note">Fictional lineage, saved only in this browser.</p>`);
  }
  function share(id) {
    const v=state.variations.find(v=>v.id===id);if(!v)return;
    if(v.published){toast('This version is already on your local feed.');return;}
    modal(`<p class="oct-kicker">SHARE YOUR VERSION</p><h2>${title(id)}</h2>${artwork(id,'oct-share-art')}<p><span class="oct-tag">${presets[v.preset].label}</span></p><p>Created by you, from Reformat by Kevin MacLeod, shown in the fictional Kiki Static catalogue. Source credit and lineage stay attached.</p><div class="oct-share-permission"><strong>Prepared audio · CC BY 4.0</strong><p>This edit retains Kevin MacLeod’s source attribution. Reuse follows the recording’s licence; fictional profile artwork has separate terms. <a href="credits.html#reformat-versions">Read the credits</a>.</p></div><p>This publishes to your browser’s demo feed only. Nothing is sent to other people.</p>${btn('publish','Share to my demo feed',id,'primary coral')}`);
  }
  function payout(id) {
    const r=ledgerRows.find(r=>r.id===id);if(!r)return;
    modal(`<p class="oct-kicker">ILLUSTRATIVE PAYOUT RECORD</p><h2>${r.label}</h2><dl class="oct-payout"><dt>What</dt><dd>${money(r.pool)} rights-holder obligation. USDC payment amount not set in this demo.</dd><dt>Who</dt><dd>Kiki Static source rights holders. Recipient wallet: not connected. Example rights version: v1.</dd><dt>How</dt><dd>${money(r.revenue)} × ${r.rate}% = ${money(r.pool)}. Individual recipients follow agreed splits.</dd><dt>When</dt><dd>Example status: ${r.status}. No actual payment timestamp.</dd><dt>Transaction</dt><dd>No transaction submitted. No hash or on-chain proof.</dd></dl><p>Daily USDC settlement on Aptos is the proposed product. This record illustrates the fields, not a live payout.</p>`);
  }
  function demoRecord(id) {
    const v=find(id), file=v?presets[v.preset].file:'original';
    const clip=ReformatAudio[file];
    return {id:'reformat',concept:true,variationId:id,title:'Reformat',artist:'Kiki Static',year:'2026',art:'sugar-circuit.webp',tracks:[[title(id)],[]],duration:[[clip.duration],[]],audioFiles:[[`assets/${clip.file}`]],audioExt:'mp3'};
  }
  function canPlay(r) {
    if(r.concept&&r.variationId!=='original'&&capped()){
      modal(`<p class="oct-kicker">BUDGET REACHED · DEMO</p><h2>Originals play on.</h2><p>Your example listening budget is used. Try a top-up or monthly reset to resume variations. Nothing will be charged.</p><a class="primary" href="#budget">Manage demo budget</a>`);return false;
    }return true;
  }
  function play(id) {
    if(id!=='original'&&!find(id))return;
    voice?.cancel();const r=demoRecord(id);if(!canPlay(r))return;
    selected=id;if(current.concept&&current.variationId===id){toggle();return;}
    pause();current=r;side=0;track=0;source();resume();selected=id;
  }
  function createVariation(text) {
    const s=text.trim().toLowerCase().replace(/[.,!?]/g,'').replace(/\s+/g,' ').replace(/^please /,'');
    if(!s)return {error:'Describe a change, or choose a suggestion.'};
    const directions=/(?:make (?:it|this) (?:a night drive|dreamy)|slow (?:it|this) down|night drive|slow drift|slower|dreamy|slow)/g;
    const hasDirection=directions.test(s);directions.lastIndex=0;
    const remainder=s.replace(directions,'').replace(/\band\b/g,'').trim();
    if(!hasDirection||remainder)return {error:'Choose a prepared dreamy, night drive, slower or dreamy + slow version. Other transformations are not connected yet.'};
    if(state.variations.length>=30)return {error:'Your demo has 30 saved versions. Open About this demo to reset the walkthrough.'};
    const preset=(/dream/.test(s)&&/slow/.test(s))?'dreamslow':/night/.test(s)?'night':/slow/.test(s)?'slow':'dreamy';
    const v={id:'you-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),number:Math.max(...all().map(v=>v.number))+1,preset,parent:selected,creator:'you',published:false};
    state.variations.push(v);persist();selected=v.id;return {variation:v};
  }
  function about() {
    voice?.cancel();modal(`<p class="oct-kicker">PORTO / INTERACTIVE PROTOTYPE</p><h2>Listen. Make a version. Share.</h2><p>Reformat by Kevin MacLeod is the starting track. Four prepared edits add echo, filtering or tempo changes. These are real playable audio files, with no AI music generation.</p><p>Talk to Porto uses browser speech recognition after you tap it. Your browser may send audio to its recognition service. Text stays editable and is never automatically submitted. Voice support depends on your browser, microphone permission and speech service availability.</p><p>Kiki Static and all creator profiles are fictional. No account service, payment or live ledger is connected. Posts, follows and budget examples stay in this browser. ${storageOK?'':'Storage is unavailable for this visit.'}</p><a href="credits.html#reformat-versions">Music credits & downloads ↗</a><div class="actions">${btn('reset','Reset Reformat demo')}</div><p class="oct-note">Reset clears Reformat versions, follows, saves and example budget. Your record collection, purchases and earlier Afterlight walkthrough data are preserved.</p>`);
  }
  function sync() {
    const library=document.querySelector('#oct-library');
    if(library)library.innerHTML=`<p class="oct-kicker">YOUR LIBRARY</p><a class="oct-library-track" href="#original"><img src="assets/sugar-circuit.webp" alt=""><span><strong>Reformat</strong><small>Kiki Static</small></span></a>${records.filter(r=>saved.includes(r.id)||owned.includes(r.id)).slice(0,3).map(r=>`<a class="oct-library-track" href="#record/${r.id}"><img src="${asset(r)}" alt=""><span><strong>${r.title}</strong><small>${r.artist}</small></span></a>`).join('')}<a class="oct-library-all" href="#shelf">Your collection <span>${new Set([...saved,...owned]).size} ↗</span></a>`;
    const budgetLink=document.querySelector('#oct-budget-label');if(budgetLink)budgetLink.textContent=`${money(state.spent)} / ${money(10+state.topup)}`;
    if(current.concept){
      const b=document.querySelector('#player-collection');b.dataset.action='';b.dataset.oct='save';b.dataset.id=current.variationId;b.disabled=false;b.setAttribute('aria-label','Save '+title(current.variationId));b.setAttribute('aria-pressed',String(state.saved.includes(current.variationId)));b.innerHTML=state.saved.includes(current.variationId)?'✓ Saved':'＋ Save';
      document.querySelector('#mini-artist').textContent='Audio: Kevin MacLeod · CC BY 4.0';
      document.querySelector('#player-mode').textContent=current.variationId==='original'?'ORIGINAL':'VARIATION';
      document.querySelector('#play').setAttribute('aria-label',playing?'Pause playback':'Play demo preview');
    } else {delete document.querySelector('#player-collection').dataset.oct;document.querySelector('#player-collection').dataset.action='save';}
    const mini=document.querySelector('#oct-mini-art'),stamp=document.querySelector('#oct-mini-stamp');
    const id=current.concept?current.variationId:'original',v=find(id);
    if(mini){mini.className='oct-artwork oct-mini-art'+(v?' is-variation oct-effect-'+artEffect(id):'');mini.style.cssText=artStyle(id);}
    if(stamp){stamp.textContent=v?handle(id):'';stamp.hidden=!v;}
    syncVoice();syncPlayback();
  }
  function view(route) {
    const [name,id]=route.split('/');
    if(name==='home')return artistProfile('kiki-static');
    if(name==='original')return studio('original');
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
    voice=PortoVoice.create({beforeStart:()=>pause(),onText:text=>{prompt=text;const input=document.querySelector('#oct-prompt');if(input)input.value=text;},onState:syncVoice});
    current=demoRecord('original');updatePlayer();
    audio.addEventListener('timeupdate',syncPlayback);
    window.addEventListener('hashchange',()=>{if(location.hash!==voiceRoute)voice.cancel();});
    window.addEventListener('pagehide',()=>voice.cancel());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)voice.cancel();});
    document.addEventListener('submit',e=>{
      if(e.target.id!=='oct-prompt-form')return;e.preventDefault();
      voice.cancel();prompt=document.querySelector('#oct-prompt').value;
      if(/^play (kiki static[’']s )?(reformat|original)[.! ]*$/i.test(prompt.trim())){play('original');notice='Playing Reformat.';prompt='';render();return;}
      const result=createVariation(prompt);
      if(result.error){document.querySelector('#oct-request-status').textContent=result.error;return;}
      notice='Your prepared version is ready. Play, refine or share it.';prompt='';location.hash='variation/'+result.variation.id;render();main.focus({preventScroll:true});
    });
    document.addEventListener('input',e=>{if(e.target.id==='oct-prompt'){voice.cancel();prompt=e.target.value;}if(e.target.id==='oct-search'){searchText=e.target.value;document.querySelector('#oct-search-results').innerHTML=searchResults();}});
    document.addEventListener('click',e=>{
      const link=e.target.closest('a[href^="#"]');
      if(link&&document.querySelector('#dialog').contains(link))document.querySelector('#dialog').close();
      const b=e.target.closest('[data-oct]');if(!b)return;
      const {oct:a,id}=b.dataset;
      if(a!=='voice')voice?.cancel();
      if(a==='play')play(id);
      if(a==='about')about();
      if(a==='lineage')lineage(id);
      if(a==='share')share(id);
      if(a==='payout')payout(id);
      if(a==='refine'){selected=id;prompt='';notice='Refining this version keeps its original and parent linked.';location.hash='studio';render();}
      if(a==='voice'){
        if(!document.querySelector('#oct-prompt')){location.hash='studio';render();}
        voiceRoute=location.hash;voice.start(prompt);syncVoice();
      }
      if(a==='prompt'){
        voice.cancel();prompt=presets[id].prompt;
        const input=document.querySelector('#oct-prompt');input.value=prompt;input.focus();
        document.querySelector('#oct-request-status').textContent='';
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
      if(a==='reset'){voice.cancel();state=empty();selected='original';prompt='';notice='';feedFilter='all';if(current.concept){pause();current=demoRecord('original');source();}persist();document.querySelector('#dialog').close();location.hash='feed';render();}
    });
    window.addEventListener('storage',e=>{if(e.key===key||e.key===null){state=empty();load();if(!find(selected))selected='original';if(current.concept&&current.variationId!=='original'&&(capped()||!find(current.variationId)))pause();render();}});
    sync();
  }
  return {view,init,sync,canPlay,about,createVariation,title,artwork,stopVoice:()=>voice?.cancel()};
})();
