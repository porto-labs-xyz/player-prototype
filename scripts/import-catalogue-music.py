"""Import the 20 September demo selection. Run with uv --with mutagen --with imageio-ffmpeg."""
from pathlib import Path
import concurrent.futures, hashlib, json, subprocess, tempfile, urllib.request, urllib.parse, zipfile
from mutagen.mp3 import MP3
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1]
SELECTION={
 'sugar-circuit':['Reformat','Exit the Premises','District Four'],
 'borrowed-sun':['Dream Culture','Fretless','I Feel You'],
 'violet-weather':['Organic Grunge','Broken Reality','Pulse'],
 'loud-enough':['Exhilarate','Twisted','Summon the Rawk'],
 'after-the-blue':['Chill Wave','Funkorama','Dirt Rhodes'],
}
BASE='https://incompetech.com/music/royalty-free/'
CATALOG=json.load(urllib.request.urlopen(BASE+'pieces.json'))
BY_TITLE={p['title']:p for p in CATALOG}
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
CHANGES='Full recording, re-encoded as 128 kbps MP3 with loudness normalization. Fictional packaging; no artist endorsement implied.'
def download(item):
 record,number,title=item
 p=BY_TITLE[title]
 side,index=('a',number+1) if number<2 else ('b',1)
 target=ROOT/'dist/assets'/f'{record}-{side}-{index}.mp3'
 url=BASE+'mp3-royaltyfree/'+urllib.parse.quote(p['filename'])
 with tempfile.TemporaryDirectory(prefix='porto-audio-') as tmp:
  source=Path(tmp)/'source.mp3'
  urllib.request.urlretrieve(url,source)
  original_hash=hashlib.sha256(source.read_bytes()).hexdigest()
  subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y','-i',str(source),'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ar','44100','-ac','2','-b:a','128k','-metadata',f'title={title}','-metadata','artist=Kevin MacLeod','-metadata','copyright=CC BY 4.0 https://creativecommons.org/licenses/by/4.0/',str(target)],check=True)
 duration=round(MP3(target).info.length,3)
 entry={'record':record,'side':side.upper(),'track':index,'title':title,'composer':'Kevin MacLeod','source':BASE+'index.html?isrc='+p['isrc'],'download':url,'license':'CC BY 4.0','licenseUrl':'https://creativecommons.org/licenses/by/4.0/','changes':CHANGES,'duration':duration,'bpm':p['bpm'],'file':target.name,'sourceSha256':original_hash,'fileSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'verifiedDate':'2026-09-20'}
 print(f'{record}: {title}, {duration}s',flush=True)
 return entry
if __name__=='__main__':
 items=[(record,n,title) for record,titles in SELECTION.items() for n,title in enumerate(titles)]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: added=list(pool.map(download,items))
 credits_path=ROOT/'dist/audio-credits.json'
 old=json.loads(credits_path.read_text())
 old=[c for c in old if c['record'] not in SELECTION]
 credits_path.write_text(json.dumps(old+added,indent=2)+'\n')
 (ROOT/'docs/music-provenance/2026-09-20.json').write_text(json.dumps({'catalogue':BASE+'pieces.json','licensing':BASE+'licenses/','verifiedDate':'2026-09-20','tracks':added},indent=2)+'\n')
 for record in SELECTION:
  group=[x for x in added if x['record']==record]
  text='PORTO DEMO MUSIC ATTRIBUTION\n\nThe sleeve identity is fictional. The music is by Kevin MacLeod.\nNo artist endorsement implied. These files remain available under CC BY 4.0 independently of simulated purchases.\n\n'
  for x in group:
   text+=f'"{x["title"]}" Kevin MacLeod (incompetech.com)\nLicensed under Creative Commons: By Attribution 4.0 License\n{x["licenseUrl"]}\nSource: {x["source"]}\nChanges: {CHANGES}\n\n'
  text=text.rstrip()+'\n'
  (ROOT/'dist/assets'/f'{record}-ATTRIBUTION.txt').write_text(text)
  with zipfile.ZipFile(ROOT/'dist/assets'/f'{record}-demo.zip','w',zipfile.ZIP_DEFLATED) as z:
   z.writestr('ATTRIBUTION.txt',text)
   for x in group:z.write(ROOT/'dist/assets'/x['file'],x['file'])
