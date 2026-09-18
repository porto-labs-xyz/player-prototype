from pathlib import Path
import math, wave, zipfile
import numpy as np
root=Path(__file__).parent/'dist'/'assets'
sr=16000;duration=24;t=np.arange(sr*duration)/sr
for rid,base in [('after-rain',130.81),('soft-architecture',146.83),('blue-hours',110)]:
    for side in ['a','b']:
        for track in range(1,4):
            rootfreq=base*2**(([0,5,7][track-1]+(3 if side=='b' else 0))/12)
            out=np.zeros_like(t)
            for j,interval in enumerate([0,7,12,16]):
                f=rootfreq*2**(interval/12)
                mod=.7+.3*np.sin(2*np.pi*(.065+j*.013)*t+j)
                out+=(np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*f*2.002*t))*.09*mod
            for beat in np.arange(0,24,.75 if rid=='soft-architecture' else 1.5):
                dt=t-beat;active=dt>=0
                f=rootfreq*2**(([0,7,12,16,19,12,7,4][int(beat/1.5)%8])/12)*2
                env=np.exp(-np.maximum(dt,0)*2.8)*active
                out+=.16*np.sin(2*np.pi*f*dt)*env
            out*=np.minimum(t/1.5,1)*np.minimum((24-t)/2,1)
            data=(np.clip(out,-.95,.95)*32767).astype('<i2')
            p=root/f'{rid}-{side}-{track}.wav'
            with wave.open(str(p),'w') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(data.tobytes())
    with zipfile.ZipFile(root/f'{rid}-demo.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(root.glob(f'{rid}-*.wav')):z.write(p,p.name)
        z.writestr('READ-ME.txt','Porto listening prototype\nOriginal synthesized demo audio. Six 24-second sound studies.\nFictional release for interaction design only. No commercial record, payment or licence is represented.\nOpen the WAV files in your audio player to listen offline.\n')
print('Generated and packaged 18 original 24-second demo sound studies.')
