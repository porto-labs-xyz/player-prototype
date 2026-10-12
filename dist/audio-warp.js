/* Tone.js renders effects before playback. The media element stays native. */
const PortoWarp = (() => {
  const defaults={speed:1,pitch:0,tone:20000,grit:0,echo:0,reverse:0,chop:0,crush:0};
  const limits={speed:[.65,1.4],pitch:[-12,12],tone:[300,20000],grit:[0,.8],echo:[0,.65],reverse:[0,1],chop:[0,1],crush:[0,1]};
  const presets={
    reverse:{speed:.9,pitch:0,tone:12000,grit:.08,echo:.28,reverse:1},
    underwater:{speed:.82,pitch:-5,tone:480,grit:.06,echo:.48},
    chopped:{speed:1.12,pitch:3,tone:9500,grit:.2,echo:.16,chop:1},
    crushed:{speed:1,pitch:-2,tone:7000,grit:.75,echo:.12,crush:.85},
    dreamy:{speed:1,pitch:2,tone:6500,grit:.03,echo:.32},
    night:{speed:.95,pitch:-2,tone:2400,grit:.18,echo:.12},
    slow:{speed:.8,pitch:-4,tone:12000,grit:.05,echo:.08},
    dreamslow:{speed:.8,pitch:3,tone:5000,grit:.08,echo:.4}
  };
  let media,renderQueue=Promise.resolve();
  const available=()=>typeof Tone!=='undefined'||typeof PreparedAudio!=='undefined';
  const prepared=(url,values)=>typeof PreparedAudio==='undefined'?null:PreparedAudio.find(item=>url.endsWith(item.source)&&JSON.stringify(item.settings)===JSON.stringify(values));
  function sanitize(value={}) {
    return Object.fromEntries(Object.entries(limits).map(([key,[min,max]])=>[key,Number.isFinite(value[key])?Math.min(max,Math.max(min,value[key])):defaults[key]]));
  }
  function parseRequest(text,base=defaults){
    let rest=text.toLowerCase().trim().replace(/[.,!?;]/g,' ').replace(/\s+/g,' '),settings=sanitize(base),seen=[];
    const consume=(pattern,apply,name)=>{rest=rest.replace(pattern,(...m)=>{apply(m);seen.push(name);return ' ';});};
    consume(/\b(\d{1,2})\s*(?:%|percent)\s*(slower|faster)\b/g,m=>{settings.speed*=1+(m[2]==='slower'?-1:1)*Number(m[1])/100;},'speed');
    consume(/\bpitch (up|down)(?: by)? (\d{1,2}) semitones?\b/g,m=>{settings.pitch+=(m[1]==='down'?-1:1)*Number(m[2]);},'pitch');
    consume(/\b(?:add more echo|add echo|more echo)\b/g,()=>{settings.echo+=.2;},'echo');
    consume(/\b(?:less echo|remove (?:the )?echo)\b/g,m=>{settings.echo=m[0].startsWith('remove')?0:settings.echo-.2;},'echo');
    consume(/\b(?:add more distortion|add distortion|more distortion)\b/g,()=>{settings.grit+=.2;},'grit');
    consume(/\b(?:less distortion|remove (?:the )?distortion)\b/g,m=>{settings.grit=m[0].startsWith('remove')?0:settings.grit-.2;},'grit');
    consume(/\b(?:reverse (?:it|this)|reverse|backwards)\b/g,()=>{settings.reverse=1;},'reverse');
    consume(/\b(?:under water|underwater|submerged)\b/g,()=>{settings={...settings,...presets.underwater};},'underwater');
    consume(/\b(?:chop (?:it|this) up|chopped up|chopped|stutter|glitchy)\b/g,()=>{settings.chop=1;},'chopped');
    consume(/\b(?:bit crush(?:ed)?|bitcrush(?:ed)?|crunchy|destroy (?:it|this)|crushed|distorted|distortion)\b/g,()=>{settings={...settings,...presets.crushed};},'crushed');
    consume(/\b(?:a )?night drive\b/g,()=>{settings={...settings,...presets.night};},'night');
    consume(/\bdreamy\b/g,()=>{settings={...settings,pitch:2,tone:6500,echo:.32};},'dreamy');
    consume(/\b(?:slow (?:it|this) down|slow drift|slower|slow)\b/g,()=>{settings.speed*=.8;},'slow');
    consume(/\b(?:speed (?:it|this) up|faster)\b/g,()=>{settings.speed*=1.2;},'speed');
    consume(/\b(?:brighter|brighten (?:it|this))\b/g,()=>{settings.tone=16000;},'tone');
    consume(/\b(?:darker|muffle (?:it|this))\b/g,()=>{settings.tone=2400;},'tone');
    rest=rest.replace(/\b(?:please|and|make it|make this|can you)\b/g,'').trim();
    if(!seen.length||rest)return {error:'Try “reverse it”, “underwater”, “chop it up”, “distorted”, “slow it down” or combine them. Instrument changes are not connected yet.'};
    const wild=seen.filter(s=>['reverse','underwater','chopped','crushed'].includes(s));
    const preset=wild.length>1?'custom':wild[0]|| (seen.includes('dreamy')&&seen.includes('slow')?'dreamslow':seen.includes('night')?'night':seen.includes('dreamy')?'dreamy':seen.includes('slow')?'slow':'custom');
    return {settings:sanitize(settings),preset};
  }
  // Keep rendered sources in a small cache; normal transport still uses the media element.
  const rendered=new Map();
  function chopSamples(input,sampleRate){
    const output=new Float32Array(input.length),slice=Math.max(1,Math.round(sampleRate*.18)),fade=Math.max(1,Math.round(sampleRate*.004)),pattern=[0,0,3,1,4,6,6,5];
    for(let i=0;i<input.length;i++){
      const chunk=Math.floor(i/slice),within=i%slice,from=(Math.floor(chunk/8)*8+pattern[chunk%8])*slice+within;
      output[i]=(input[from]||0)*Math.min(1,within/fade,(slice-1-within)/fade);
    }
    return output;
  }
  function wavBytes(buffer){
    const channels=buffer.numberOfChannels,bytes=new ArrayBuffer(44+buffer.length*channels*2),view=new DataView(bytes);
    const word=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};
    word(0,'RIFF');view.setUint32(4,bytes.byteLength-8,true);word(8,'WAVE');word(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,buffer.sampleRate,true);view.setUint32(28,buffer.sampleRate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,bytes.byteLength-44,true);
    const data=Array.from({length:channels},(_,c)=>buffer.getChannelData(c));
    for(let i=0,at=44;i<buffer.length;i++)for(let c=0;c<channels;c++,at+=2){const value=Math.max(-1,Math.min(1,data[c][i]));view.setInt16(at,value*(value<0?32768:32767),true);}
    return bytes;
  }
  function crushSamples(input,amount){
    const output=new Float32Array(input.length),step=1/8;
    for(let i=0;i<input.length;i++)output[i]=input[i]*(1-amount)+Math.round(input[i]/step)*step*amount;
    return output;
  }
  async function renderVersion(url,values,isCurrent){
    if(!isCurrent())return null;
    const decoded=await Tone.ToneAudioBuffer.fromUrl(url),nodes=[];
    let renderedBuffer,offlineContext;
    try{
      if(!isCurrent())return null;
      decoded.reverse=values.reverse>.5;
      const raw=decoded.get();
      for(let c=0;c<raw.numberOfChannels;c++){
        let samples=raw.getChannelData(c);
        if(values.chop>.5)samples=chopSamples(samples,raw.sampleRate);
        if(values.crush)samples=crushSamples(samples,values.crush);
        if(samples!==raw.getChannelData(c))raw.copyToChannel(samples,c);
      }
      // All events are scheduled upfront. Avoid Tone.Offline's per-second timer
      // yields, which background/mobile browsers can throttle into long waits.
      offlineContext=new Tone.OfflineContext(raw.numberOfChannels,raw.duration,raw.sampleRate);
      const context=offlineContext;
      const player=new Tone.Player({context,url:raw,fadeIn:.008,fadeOut:.008});nodes.push(player);
      if(values.pitch)nodes.push(new Tone.PitchShift({context,pitch:values.pitch,windowSize:.1,wet:1}));
      if(values.tone<20000)nodes.push(new Tone.Filter({context,frequency:values.tone,type:'lowpass'}));
      if(values.grit)nodes.push(new Tone.Distortion({context,distortion:values.grit,wet:.65}));
      if(values.chop)nodes.push(new Tone.Tremolo({context,frequency:9,depth:1,type:'sine',wet:values.chop*.45}).start(0));
      if(values.echo)nodes.push(new Tone.FeedbackDelay({context,delayTime:.23,feedback:.25,wet:values.echo}));
      const limiter=new Tone.Limiter({context,threshold:-3});nodes.push(limiter);
      player.chain(...nodes.slice(1));limiter.toDestination();player.start(0).stop(raw.duration);
      renderedBuffer=await context.render(false);
      if(!isCurrent())return null;
      return URL.createObjectURL(new Blob([wavBytes(renderedBuffer.get())],{type:'audio/wav'}));
    }finally{
      nodes.forEach(node=>node.dispose());renderedBuffer?.dispose();decoded.dispose();offlineContext?.dispose();
    }
  }
  async function storedRender(key){
    if(typeof caches==='undefined')return null;
    try{return await (await caches.open('porto-custom-audio-v1')).match(new URL('__porto-render/'+encodeURIComponent(key),location.href).href)}catch{return null}
  }
  async function saveRender(key,url){
    if(typeof caches==='undefined')return;
    try{await (await caches.open('porto-custom-audio-v1')).put(new URL('__porto-render/'+encodeURIComponent(key),location.href).href,await fetch(url))}catch{/* Playback still works without persistent storage. */}
  }
  async function editedSource(url,values,isCurrent){
    const key=url+'|'+JSON.stringify(values);
    if(!isCurrent())return null;
    if(rendered.has(key))return rendered.get(key);
    const job=renderQueue.then(async()=>{
      if(!isCurrent())return null;
      if(rendered.has(key))return rendered.get(key);
      const stored=await storedRender(key);
      if(!isCurrent())return null;
      const result=stored?URL.createObjectURL(await stored.blob()):await renderVersion(url,values,isCurrent);
      if(result&&!stored)await saveRender(key,result);
      if(!result)return null;
      rendered.set(key,result);
      while(rendered.size>2){const oldest=[...rendered.keys()].find(k=>rendered.get(k)!==media?.src&&rendered.get(k)!==result);if(!oldest)break;URL.revokeObjectURL(rendered.get(oldest));rendered.delete(oldest);}
      return result;
    });
    renderQueue=job.catch(()=>{});return job;
  }
  function prepare(element,settings,isCurrent=()=>true) {
    if(!available()||!isCurrent())return false;
    media=element;
    const values=sanitize(settings||defaults),original=element.dataset.originalSource||element.src;
    const key=original+'|'+JSON.stringify(values);
    const install=next=>{
      if(!isCurrent()||!next)return false;
      if(element.src!==next){const position=element.currentTime;element.src=next;element.load();element.currentTime=position;}
      element.dataset.preparedKey=key;
      element.preservesPitch=true;element.playbackRate=values.speed;
      element.dataset.warp=settings?'rendered':'native';
      element.dataset.audioProcessors='';element.dataset.audioPlayback='native';
      element.dataset.warpSettings=JSON.stringify(values);
      element.dataset.preparingAudio='false';
      return true;
    };
    // Ready sources stay synchronous, so play remains part of the user's tap.
    if(element.dataset.preparedKey===key){element.dataset.preparingAudio='false';return true;}
    if(!settings)return install(original);
    const ready=prepared(original,values);
    if(ready)return install(new URL(ready.file,location.href).href);
    if(rendered.has(key))return install(rendered.get(key));
    // Authorize this same media element while still inside the explicit Play
    // gesture. Pause immediately, before any sound, while rendering completes.
    const unlock=element.play();element.pause();unlock?.catch(()=>{});
    element.dataset.preparingAudio='true';
    return Promise.resolve(editedSource(original,values,isCurrent)).then(install)
      .finally(()=>{if(isCurrent())element.dataset.preparingAudio='false';});
  }
  async function warm(entries){for(const entry of entries){const values=sanitize(entry.settings),url=entry.source;if(!prepared(url,values))await editedSource(url,values,()=>true).catch(()=>{});}}
  return {warm,prepared,renderAsset:(url,settings)=>renderVersion(url,sanitize(settings),()=>true),available,chopSamples,crushSamples,wavBytes,sanitize,parseRequest,defaults,presets,prepare};
})();
