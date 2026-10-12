"""Prepare licensed Reformat listening versions and waveform peaks, without ML.

Usage: python3 scripts/prepare-reformat-variations.py --ffmpeg /path/to/ffmpeg
The source recording is already in dist/assets, attributed in audio-credits.json.
"""
import argparse
import array
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'dist/assets'
parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', default='ffmpeg')
args = parser.parse_args()
source = ASSETS / 'sugar-circuit-a-1.mp3'
filters = {
    'dreamy': 'lowpass=f=6500,aecho=0.8:0.6:160|320:0.22|0.12,alimiter=limit=0.9',
    'night': 'highpass=f=100,lowpass=f=2400,atempo=0.95,alimiter=limit=0.9',
    'slow': 'atempo=0.8,alimiter=limit=0.9',
    'dreamslow': 'atempo=0.8,lowpass=f=6500,aecho=0.8:0.6:160|320:0.22|0.12,alimiter=limit=0.9',
}
manifest = {}
for version in ['original', *filters]:
    output = source if version == 'original' else ASSETS / f'reformat-{version}.mp3'
    if version != 'original':
        subprocess.run([args.ffmpeg, '-v', 'error', '-y', '-i', str(source), '-af', filters[version],
                        '-codec:a', 'libmp3lame', '-b:a', '128k', '-map_metadata', '-1', str(output)], check=True)
    pcm = subprocess.check_output([args.ffmpeg, '-v', 'error', '-i', str(output), '-f', 's16le', '-ac', '1', '-ar', '8000', '-'])
    samples = array.array('h', pcm)
    if sys.byteorder != 'little':
        samples.byteswap()
    peaks = [max(abs(s) for s in samples[i*len(samples)//80:(i+1)*len(samples)//80]) for i in range(80)]
    ceiling = max(peaks) or 1
    manifest[version] = {'file': output.name, 'duration': round(len(samples)/8000, 3),
                         'peaks': [round(p/ceiling, 3) for p in peaks],
                         'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
                         'filter': filters.get(version, 'Unchanged catalogue audio')}
(ROOT / 'dist/reformat-audio.js').write_text('/* Reformat by Kevin MacLeod, CC BY 4.0. See credits.html#reformat-versions. */\nconst ReformatAudio = '+json.dumps(manifest, separators=(',', ':'))+';\n')
print(json.dumps({k: {'file': v['file'], 'duration': v['duration']} for k, v in manifest.items()}, indent=2))
