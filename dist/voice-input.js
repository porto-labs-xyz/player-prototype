/* User-initiated browser speech recognition. Never restarts or submits a request. */
const PortoVoice = (() => {
  function create({onState, onText, beforeStart}) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition=null, timer=null, status='idle', message='', prefix='', received=false;
    const active = () => ['starting','listening','stopping'].includes(status);
    function update(next, text) { status=next;message=text;onState({status,message}); }
    function clear() { clearTimeout(timer);timer=null; }
    function cancel() {
      const old=recognition;recognition=null;clear();
      if(old)try {old.abort();} catch {}
      if(active())update('idle','Microphone stopped. Your text is ready to edit.');
    }
    function stop() {
      if(!recognition)return;
      if(status==='starting'){cancel();return;}
      update('stopping','Finishing your transcript…');clear();
      try {recognition.stop();timer=setTimeout(cancel,3000);} catch {cancel();}
    }
    function start(text='') {
      if(active()){stop();return;}
      if(!Recognition){update('unavailable','Voice input is unavailable here. Open this page in a browser with speech recognition, such as Chrome or Safari, or type below.');return;}
      cancel();prefix=text.trim();received=false;
      try {
        const r=new Recognition();recognition=r;
        r.lang='en-GB';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
        r.onstart=()=>{if(recognition!==r)return;clear();update('listening','Listening. Tap again to finish.');timer=setTimeout(stop,60000);};
        r.onresult=e=>{
          if(recognition!==r)return;
          // Rebuild from the service's complete result list, replacing interim words.
          const words=Array.from(e.results, result=>result[0].transcript.trim()).filter(Boolean).join(' ');
          if(words){received=true;onText([prefix,words].filter(Boolean).join(' ').slice(0,300));}
        };
        r.onerror=e=>{
          if(recognition!==r)return;
          clear();recognition=null;
          const errors={
            'not-allowed':'Microphone access was denied. Allow it in browser settings, then tap to try again.',
            'service-not-allowed':'This browser cannot use its speech service. Try Chrome or Safari, or type your request.',
            'audio-capture':'No microphone is available. Connect one or type your request.',
            'network':'The speech service could not connect. Check your connection or type your request.',
            'no-speech':'No speech was heard. Tap to try again, or type your request.',
            'aborted':'Microphone stopped. Tap to try again.'
          };
          try {r.abort();} catch {}
          update('error',errors[e.error]||'Voice input could not start. Try again or type your request.');
        };
        r.onend=()=>{if(recognition!==r)return;recognition=null;clear();update('idle',received?'Transcript ready. Edit it, then choose your version.':'No speech was heard. Tap to try again, or type your request.');};
        beforeStart?.();update('starting','Starting microphone. Allow access if your browser asks.');
        timer=setTimeout(()=>{if(recognition===r){cancel();update('error','The speech service did not start. Try Chrome or Safari, or type your request.');}},12000);
        r.start();
      } catch {cancel();update('error','Voice input could not start. Check microphone permissions or type your request.');}
    }
    return {start,stop,cancel,active,get state(){return {status,message};}};
  }
  return {create};
})();
