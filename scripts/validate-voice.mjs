import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../dist/voice-input.js',import.meta.url),'utf8');
function session(supported=true) {
  const instances=[],states=[],texts=[],timers=new Map();let pauses=0,id=0;
  class Recognition {
    constructor(){instances.push(this)}
    start(){this.starts=(this.starts||0)+1}
    stop(){this.stops=(this.stops||0)+1}
    abort(){this.aborts=(this.aborts||0)+1;this.onend?.()}
  }
  const context=vm.createContext({window:supported?{webkitSpeechRecognition:Recognition}:{},
    setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:id=>timers.delete(id),
    onState:s=>states.push(s),onText:t=>texts.push(t),beforeStart:()=>pauses++});
  vm.runInContext(source+'\nconst voice=PortoVoice.create({onState,onText,beforeStart});',context);
  return {instances,states,texts,timers,run:s=>vm.runInContext(s,context),get pauses(){return pauses}};
}
const s=session();s.run("voice.start('Make it')");
let r=s.instances[0];
assert.equal(s.states.at(-1).status,'starting');assert.equal(s.pauses,1);
assert.equal(r.interimResults,true);assert.equal(r.continuous,true);
r.onstart();assert.equal(s.states.at(-1).status,'listening');
r.onresult({results:[[{transcript:'dream'}]]});assert.equal(s.texts.at(-1),'Make it dream');
r.onresult({results:[[{transcript:'dreamy'}],[{transcript:'and slow'}]]});
assert.equal(s.texts.at(-1),'Make it dreamy and slow');
r.onresult({results:[[{transcript:'dreamy'}],[{transcript:'and slower'}]]});
assert.equal(s.texts.at(-1),'Make it dreamy and slower');
s.run('voice.start()');assert.equal(r.stops,1);assert.equal(s.states.at(-1).status,'stopping');
r.onend();assert.equal(s.states.at(-1).status,'idle');assert.equal(s.instances.length,1);assert.equal(s.timers.size,0);
// Errors survive the subsequent end event, and a new user gesture can retry.
for(const error of ['not-allowed','service-not-allowed','network','no-speech','audio-capture']) {
  s.run('voice.start()');r=s.instances.at(-1);r.onerror({error});r.onend();
  assert.equal(s.states.at(-1).status,'error');assert.equal(s.timers.size,0);
}
s.run('voice.start()');r=s.instances.at(-1);s.run('voice.cancel()');
const count=s.texts.length;r.onresult({results:[[{transcript:'stale callback'}]]});r.onstart();
assert.equal(s.texts.length,count);assert.equal(s.states.at(-1).status,'idle');assert.equal(s.timers.size,0);
s.run('voice.start()');r=s.instances.at(-1);s.run('voice.start()');
assert.equal(r.aborts,1);assert.equal(s.run('voice.active()'),false);
s.run('voice.start()');[...s.timers.values()][0]();assert.equal(s.states.at(-1).status,'error');assert.equal(s.timers.size,0);
const unsupported=session(false);unsupported.run('voice.start()');
assert.equal(unsupported.states.at(-1).status,'unavailable');assert.equal(unsupported.pauses,0);assert.equal(unsupported.texts.length,0);
console.log('PASS: user-initiated speech, interim replacement, stop, error retention, retry, cancellation, stale callbacks, start timeout and unsupported-browser fallback. Speech service events simulated; no live microphone claim.');
