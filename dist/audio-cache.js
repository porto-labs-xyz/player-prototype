/* Download the catalogue in the background. This never starts playback. */
const PortoCache={async start(urls){
 if(!('serviceWorker' in navigator))return;
 try{
  navigator.serviceWorker.addEventListener('message',event=>{
   if(event.data?.type!=='AUDIO_CACHE_PROGRESS')return;
   document.documentElement.dataset.audioCacheReady=event.data.ready;
   document.documentElement.dataset.audioCacheTotal=event.data.total;
   document.documentElement.dataset.audioCacheFailed=event.data.failed;
  });
  await navigator.serviceWorker.register('audio-cache-sw.js');
  const registration=await navigator.serviceWorker.ready;
  registration.active?.postMessage({type:'CACHE_AUDIO',urls:urls.map(url=>new URL(url,location.href).href)});
 }catch{/* Native streaming remains available when browser storage is disabled. */}
}};
