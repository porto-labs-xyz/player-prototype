"""Build full-length prepared edits and measured waveforms from licensed catalogue audio.

Usage: python3 scripts/prepare-feed-audio.py --ffmpeg /path/to/ffmpeg
Original credits stay in audio-credits.json; filters and output hashes are recorded.
"""
import argparse, array, hashlib, json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'dist/assets'
p = argparse.ArgumentParser()
p.add_argument('--ffmpeg', default='ffmpeg')
args = p.parse_args()
filters = {
    'dreamy': 'lowpass=f=6500,aecho=0.8:0.6:160|320:0.22|0.12,alimiter=limit=0.9',
    'night': 'highpass=f=100,lowpass=f=2400,atempo=0.95,alimiter=limit=0.9',
    'slow': 'atempo=0.8,alimiter=limit=0.9',
    'dreamslow': 'atempo=0.8,lowpass=f=6500,aecho=0.8:0.6:160|320:0.22|0.12,alimiter=limit=0.9',
}
sources = [
 ('dream-culture','borrowed-sun-a-1.mp3'),
 ('organic-grunge','violet-weather-a-1.mp3'),
 ('exhilarate','loud-enough-a-1.mp3'),
 ('chill-wave','after-the-blue-a-1.mp3'),
 ('exit-the-premises','sugar-circuit-a-2.mp3'),
 ('fretless','borrowed-sun-a-2.mp3'),
 ('dirt-rhodes','after-the-blue-b-1.mp3'),
]
manifest = {}
for key, filename in sources:
    manifest[key] = {}
    for version in ['original', *filters]:
        output = ASSETS / (filename if version == 'original' else f'feed-{key}-{version}.mp3')
        if version != 'original':
            subprocess.run([args.ffmpeg,'-v','error','-y','-i',str(ASSETS/filename),'-af',filters[version],'-codec:a','libmp3lame','-b:a','128k','-map_metadata','-1',str(output)],check=True)
        pcm = subprocess.check_output([args.ffmpeg,'-v','error','-i',str(output),'-f','s16le','-ac','1','-ar','8000','-'])
        samples = array.array('h',pcm)
        if sys.byteorder != 'little': samples.byteswap()
        peaks = [max(abs(s) for s in samples[i*len(samples)//80:(i+1)*len(samples)//80]) for i in range(80)]
        ceiling = max(peaks) or 1
        manifest[key][version] = dict(file=output.name,duration=round(len(samples)/8000,3),peaks=[round(v/ceiling,3) for v in peaks],sha256=hashlib.sha256(output.read_bytes()).hexdigest(),filter=filters.get(version,'Unchanged catalogue audio'))
    print(key, flush=True)
(ROOT/'dist/feed-audio.js').write_text('/* Audio by Kevin MacLeod, CC BY 4.0. See credits.html#feed-versions. */\nconst FeedAudio = '+json.dumps(manifest,separators=(',',':'))+';\n')
