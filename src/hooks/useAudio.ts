import { useCallback, useEffect, useRef } from 'react';
type AudioEngine = { ctx: AudioContext; master: GainNode; bgm: GainNode; sfx: GainNode; drone: OscillatorNode; nodes: AudioNode[] };
export function useAudio(enabled: boolean, bgmVolume: number, sfxVolume: number, chapter: number) {
  const engine = useRef<AudioEngine | null>(null);
  const settings = useRef({ enabled, bgmVolume, sfxVolume, chapter });
  settings.current = { enabled, bgmVolume, sfxVolume, chapter };
  const start = useCallback(() => {
    if (!settings.current.enabled) return;
    try {
      if (engine.current) { void engine.current.ctx.resume(); return; }
      const ctx = new AudioContext();
      const master = ctx.createGain(), bgm = ctx.createGain(), sfx = ctx.createGain();
      master.gain.value = 0.4; bgm.gain.value = settings.current.bgmVolume; sfx.gain.value = settings.current.sfxVolume;
      bgm.connect(master); sfx.connect(master); master.connect(ctx.destination);
      const drone = ctx.createOscillator(), low = ctx.createGain();
      drone.type = 'sine'; drone.frequency.value = [55, 58.27, 51.91, 49, 61.74, 65.41][settings.current.chapter];
      low.gain.value = 0.2; drone.connect(low); low.connect(bgm); drone.start();
      const second = ctx.createOscillator(), secondGain = ctx.createGain();
      second.frequency.value = 82.4; second.detune.value = -9; secondGain.gain.value = 0.05;
      second.connect(secondGain); secondGain.connect(bgm); second.start();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const data = buffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.12;
      const noise = ctx.createBufferSource(); noise.buffer = buffer; noise.loop = true;
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 450;
      const noiseGain = ctx.createGain(); noiseGain.gain.value = 0.12;
      noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(bgm); noise.start();
      engine.current = { ctx, master, bgm, sfx, drone, nodes: [drone, second, noise, low, secondGain, filter, noiseGain] };
    } catch { /* Audio is optional; play remains available. */ }
  }, []);
  const play = useCallback((kind: 'click' | 'paper' | 'stamp' | 'warning' | 'closed' = 'click') => {
    if (!settings.current.enabled) return;
    start(); const e = engine.current; if (!e) return;
    const notes = kind === 'closed' ? [130.81, 164.81, 196, 261.63] : kind === 'stamp' ? [98, 196] : kind === 'warning' ? [73.42, 77.78] : [kind === 'paper' ? 350 : 650];
    notes.forEach((freq, i) => {
      const osc = e.ctx.createOscillator(), gain = e.ctx.createGain(); const now = e.ctx.currentTime + i * 0.035;
      osc.type = kind === 'click' ? 'triangle' : 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(kind === 'closed' ? 0.22 : 0.15, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'closed' ? 2.8 : 0.18));
      osc.connect(gain); gain.connect(e.sfx); osc.start(now); osc.stop(now + (kind === 'closed' ? 3 : 0.2));
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }, [start]);
  useEffect(() => {
    const e = engine.current; if (!e) return;
    e.master.gain.setTargetAtTime(enabled ? 0.4 : 0, e.ctx.currentTime, 0.15);
    e.bgm.gain.setTargetAtTime(bgmVolume, e.ctx.currentTime, 0.1);
    e.sfx.gain.setTargetAtTime(sfxVolume, e.ctx.currentTime, 0.1);
    e.drone.frequency.setTargetAtTime([55, 58.27, 51.91, 49, 61.74, 65.41][chapter], e.ctx.currentTime, 1);
  }, [enabled, bgmVolume, sfxVolume, chapter]);
  useEffect(() => {
    const visibility = () => { const e = engine.current; if (e) { if (document.hidden) void e.ctx.suspend(); else if (settings.current.enabled) void e.ctx.resume(); } };
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); if (engine.current) { engine.current.nodes.forEach(n => n.disconnect()); void engine.current.ctx.close(); engine.current = null; } };
  }, []);
  return { start, play };
}
