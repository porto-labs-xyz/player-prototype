/* Tone.js effects for the shared media element. Created only after explicit Play. */
const PortoWarp = (() => {
  const defaults={speed:1,pitch:0,tone:20000,grit:0,echo:0};
  const limits={speed:[.65,1.4],pitch:[-12,12],tone:[300,20000],grit:[0,.8],echo:[0,.65]};
  const presets={
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
    dry.gain.value=enabled&&!bypassed?0:1;wet.gain.value=enabled&&!bypassed?1:0;
    media.dataset.warp=enabled&&!bypassed?'live':'bypass';
    media.dataset.warpSettings=JSON.stringify(values);
  }
  async function prepare(element,settings) {
    if(!available())return false;
    // Resume within the user gesture, before awaiting any work.
    const started=Tone.start();
    if(!chain){
      media=element;
      gate=new Tone.Gain(0).toDestination();dry=new Tone.Gain(1);wet=new Tone.Gain(0);
      chain={pitch:new Tone.PitchShift({pitch:0,windowSize:.08,wet:0}),filter:new Tone.Filter(20000,'lowpass'),grit:new Tone.Distortion({distortion:0,wet:0}),echo:new Tone.FeedbackDelay({delayTime:.23,feedback:.25,wet:0}),limiter:new Tone.Limiter(-2)};
      meter=new Tone.Meter({normalRange:true});gate.connect(meter);
      media.addEventListener('timeupdate',()=>{media.dataset.outputLevel=String(meter.getValue());});
      dry.connect(gate);wet.chain(chain.pitch,chain.filter,chain.grit,chain.echo,chain.limiter,gate);
      source=Tone.getContext().rawContext.createMediaElementSource(media);
      Tone.connect(source,dry);Tone.connect(source,wet);
      media.addEventListener('playing',()=>gate.gain.rampTo(1,.02));
      for(const event of ['pause','ended','emptied'])media.addEventListener(event,()=>gate.gain.value=0);
    }
    await started;
    apply(settings||defaults,!!settings);
    return true;
  }
  function bypass(value){bypassed=value;apply(applied,active);}
  function stop(){if(gate)gate.gain.value=0;}
  return {available,sanitize,defaults,presets,prepare,apply,bypass,stop};
})();
