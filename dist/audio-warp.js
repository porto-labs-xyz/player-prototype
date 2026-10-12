/* Tone.js effects for the shared media element. Created only after explicit Play. */
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
  let media,source,chain,gate,dry,wet,meter,applied={...defaults},active=false,bypassed=false;
  const available=()=>typeof Tone!=='undefined';
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
  function apply(settings,enabled=true) {
    applied=sanitize(settings);active=enabled;
    if(!chain)return;
    const values=enabled&&!bypassed?applied:defaults;
    media.preservesPitch=true;media.playbackRate=values.speed;
    chain.pitch.pitch=values.pitch;
    chain.pitch.wet.value=values.pitch===0?0:1;
    chain.filter.frequency.rampTo(values.tone,.04);
    chain.grit.distortion=values.grit;chain.grit.wet.value=values.grit?0.65:0;
    chain.echo.wet.rampTo(values.echo,.04);
    chain.crusher.wet.rampTo(values.crush,.04);
    chain.tremolo.wet.rampTo(values.chop*.45,.04);
    dry.gain.value=enabled&&!bypassed?0:1;wet.gain.value=enabled&&!bypassed?1:0;
    media.dataset.warp=enabled&&!bypassed?'live':'bypass';
    media.dataset.warpSettings=JSON.stringify(values);
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
  async function editedSource(url,values){
    const key=url+'|'+Number(values.reverse>.5)+'|'+Number(values.chop>.5);
    if(rendered.has(key))return rendered.get(key);
    const buffer=await Tone.ToneAudioBuffer.fromUrl(url);
    try{
      buffer.reverse=values.reverse>.5;
      const raw=buffer.get();
      if(values.chop>.5)for(let c=0;c<raw.numberOfChannels;c++)raw.copyToChannel(chopSamples(raw.getChannelData(c),raw.sampleRate),c);
      const result=URL.createObjectURL(new Blob([wavBytes(raw)],{type:'audio/wav'}));
      rendered.set(key,result);
      while(rendered.size>2){const oldest=[...rendered.keys()].find(k=>rendered.get(k)!==media?.src&&rendered.get(k)!==result);if(!oldest)break;URL.revokeObjectURL(rendered.get(oldest));rendered.delete(oldest);}
      return result;
    }finally{buffer.dispose();}
  }
  async function prepare(element,settings,isCurrent=()=>true) {
    if(!available())return false;
    // Resume within the user gesture, before awaiting any work.
    const started=Tone.start();
    if(!chain){
      media=element;
      gate=new Tone.Gain(0).toDestination();dry=new Tone.Gain(1);wet=new Tone.Gain(0);
      chain={pitch:new Tone.PitchShift({pitch:0,windowSize:.08,wet:0}),filter:new Tone.Filter(20000,'lowpass'),grit:new Tone.Distortion({distortion:0,wet:0}),crusher:new Tone.BitCrusher({bits:4,wet:0}),tremolo:new Tone.Tremolo({frequency:9,depth:1,type:'square',wet:0}).start(),echo:new Tone.FeedbackDelay({delayTime:.23,feedback:.25,wet:0}),limiter:new Tone.Limiter(-2)};
      meter=new Tone.Meter({normalRange:true});gate.connect(meter);
      media.addEventListener('timeupdate',()=>{media.dataset.outputLevel=String(meter.getValue());});
      dry.connect(gate);wet.chain(chain.pitch,chain.filter,chain.grit,chain.crusher,chain.tremolo,chain.echo,chain.limiter,gate);
      source=Tone.getContext().rawContext.createMediaElementSource(media);
      Tone.connect(source,dry);Tone.connect(source,wet);
      media.addEventListener('playing',()=>{if(!media.paused)gate.gain.rampTo(1,.02);});
      for(const event of ['pause','ended','emptied'])media.addEventListener(event,()=>{if(event!=='pause'||media.paused)gate.gain.value=0;});
    }
    await started;
    if(!isCurrent())return false;
    const values=sanitize(settings||defaults),original=element.dataset.originalSource||element.src;
    const key=original+'|'+Number(values.reverse>.5)+'|'+Number(values.chop>.5);
    if(element.dataset.preparedKey!==key){
      element.dataset.preparingAudio='true';
      try{
        const next=values.reverse>.5||values.chop>.5?await editedSource(original,values):original;
        if(!isCurrent())return false;
        if(element.src!==next){const position=element.currentTime;element.src=next;element.load();element.currentTime=position;}
        element.dataset.preparedKey=key;
      }finally{if(isCurrent())element.dataset.preparingAudio='false';}
    }
    apply(settings||defaults,!!settings);
    return true;
  }
  function bypass(value){bypassed=value;apply(applied,active);}
  function stop(){if(gate)gate.gain.value=0;}
  return {available,chopSamples,wavBytes,sanitize,parseRequest,defaults,presets,prepare,apply,bypass,stop};
})();
