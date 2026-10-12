"""Render the seeded catalogue with the app's Tone.js renderer, then encode MP3.
Run with --ffmpeg PATH, open localhost:8071/__render and press Render catalogue.
The loopback-only server accepts only known catalogue IDs and writes public audio.
"""
import argparse, hashlib, json, subprocess, tempfile, threading
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--ffmpeg',default='ffmpeg');p.add_argument('--resume',action='store_true');args=p.parse_args()
script="""const fs=require('fs'),vm=require('vm');let c=vm.createContext({localStorage:{getItem:()=>null}});for(let f of ['artist-editions','reformat-audio','feed-audio','audio-warp','october'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);console.log(JSON.stringify(vm.runInContext('PortoOctober.catalogue()',c)));"""
jobs=json.loads(subprocess.check_output(['node','-e',script],cwd=ROOT,text=True))
by_id={j['id']:j for j in jobs};results={};lock=threading.Lock();out=ROOT/'dist/assets/versions';out.mkdir(exist_ok=True)
if args.resume and (ROOT/'dist/prepared-audio.js').exists():
 saved=json.loads((ROOT/'dist/prepared-audio.js').read_text().split('const PreparedAudio = ',1)[1].rstrip(';\n'))
 for item in saved:
  f=ROOT/'dist'/item['file']
  if item['id'] in by_id and item['settings']==by_id[item['id']]['settings'] and f.exists() and hashlib.sha256(f.read_bytes()).hexdigest()==item['sha256']:results[item['id']]=item
html='''<!doctype html><meta charset="utf-8"><title>Prepare catalogue audio</title><button id="render">Render catalogue</button><pre id="status">Ready</pre><script src="/vendor/tone-15.1.22.js"></script><script src="/audio-warp.js"></script><script>
document.querySelector('#render').onclick=async()=>{const status=document.querySelector('#status');document.querySelector('#render').disabled=true;try{const jobs=await(await fetch('/__jobs')).json();let next=0,done=0;async function worker(){while(next<jobs.length){let j=jobs[next++];status.textContent=`Completed ${done}/${jobs.length}; rendering ${j.id}`;const url=await PortoWarp.renderAsset(j.source,j.settings);const blob=await(await fetch(url)).blob();URL.revokeObjectURL(url);const r=await fetch('/__result/'+j.id,{method:'POST',body:blob});if(!r.ok)throw Error(await r.text());done++;}}await Promise.all([worker(),worker()]);status.textContent='Complete: '+jobs.length+' versions';}catch(e){status.textContent='ERROR: '+e.message;document.querySelector('#render').disabled=false;}};</script>'''
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**k):super().__init__(*a,directory=str(ROOT/'dist'),**k)
 def do_GET(self):
  if self.path=='/__render':data=html.encode();kind='text/html'
  elif self.path=='/__jobs':data=json.dumps([j for j in jobs if j['id'] not in results]).encode();kind='application/json'
  else:return super().do_GET()
  self.send_response(200);self.send_header('Content-Type',kind);self.send_header('Content-Length',len(data));self.end_headers();self.wfile.write(data)
 def do_POST(self):
  if self.headers.get('Origin')!='http://localhost:8071':self.send_error(403);return
  id=self.path.removeprefix('/__result/');length=int(self.headers.get('Content-Length','0'))
  if id not in by_id or not 44<length<150_000_000:self.send_error(400);return
  data=self.rfile.read(length)
  if data[:4]!=b'RIFF':self.send_error(400);return
  try:
   with tempfile.TemporaryDirectory(prefix='porto-catalogue-') as temp:
    wav=Path(temp)/'input.wav';mp3=Path(temp)/'output.mp3';wav.write_bytes(data)
    subprocess.run([args.ffmpeg,'-v','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k','-map_metadata','-1',str(mp3)],check=True)
    content=mp3.read_bytes();sha=hashlib.sha256(content).hexdigest();file=id+'-'+sha[:10]+'.mp3';(out/file).write_bytes(content)
   with lock:
    results[id]={**by_id[id],'file':'assets/versions/'+file,'sha256':sha,'bytes':len(content)}
    manifest='/* Tone.js rendered edits of Kevin MacLeod recordings. CC BY 4.0. See credits.html. */\nconst PreparedAudio = '+json.dumps(list(results.values()),separators=(',',':'))+';\n'
    (ROOT/'dist/prepared-audio.js').write_text(manifest)
   print('Saved',len(results),'/',len(jobs),id,flush=True)
   self.send_response(200);self.end_headers();self.wfile.write(b'OK')
  except Exception as e:self.send_error(500,str(e))
 def log_message(self,*a):pass
print('Open http://localhost:8071/__render',flush=True)
ThreadingHTTPServer(('127.0.0.1',8071),Handler).serve_forever()
