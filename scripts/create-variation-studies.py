"""Compose deterministic preview fixtures, without a model or third-party recording."""
from pathlib import Path
import math
import struct
import wave

ROOT = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
RATE, SECONDS = 16000, 24
PRESETS = {
    'original': (0.5, 0.35, 4.0),
    'dreamy': (0.65, 0.14, 1.2),
    'acoustic': (0.5, 0.48, 6.5),
    'slow': (0.85, 0.30, 3.0),
    'dreamslow': (0.85, 0.0, 1.0),
}

for name, (beat, pluck, decay) in PRESETS.items():
    samples = bytearray()
    for i in range(RATE * SECONDS):
        t = i / RATE
        chord = [0, 5, 9, 7][min(3, int(t / 6))]
        base = 130.8128 * 2 ** (chord / 12)
        pad = sum(math.sin(2 * math.pi * base * 2 ** (n / 12) * t) for n in [0, 7, 12, 16]) * 0.045
        note = [0, 7, 12, 16, 19, 16, 12, 7][int(t / beat) % 8]
        phase = t % beat
        freq = base * 2 ** (note / 12)
        tone = (math.sin(2 * math.pi * freq * phase) + .15 * math.sin(4 * math.pi * freq * phase))
        tone *= pluck * math.exp(-decay * phase) * min(phase / .012, 1)
        fade = min(t / 1.2, 1) * min((SECONDS - t) / 2.5, 1)
        samples.extend(struct.pack('<h', int(max(-.9, min(.9, (pad + tone) * fade)) * 32767)))
    with wave.open(str(ROOT / f'afterlight-{name}.wav'), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(samples)
print('Created five 24-second original synthesized variation-demo studies.')
