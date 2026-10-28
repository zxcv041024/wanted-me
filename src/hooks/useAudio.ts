import { useCallback, useEffect, useRef, useState } from 'react';

type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error';
type Effects = { ctx: AudioContext; gain: GainNode };
const soundtrack = `${import.meta.env.BASE_URL}assets/audio/case-001-ambient.wav`;

export function useAudio(enabled: boolean, bgmVolume: number, sfxVolume: number, chapter: number) {
  const music = useRef<HTMLAudioElement | null>(null);
  const effects = useRef<Effects | null>(null);
  const wanted = useRef(false);
  const mounted = useRef(true);
  const pending = useRef(false);
  const request = useRef(0);
  const settings = useRef({ enabled, bgmVolume, sfxVolume, chapter });
  settings.current = { enabled, bgmVolume, sfxVolume, chapter };
  const [status, setStatus] = useState<AudioStatus>('idle');
  const report = useCallback((value: AudioStatus) => { if (mounted.current) setStatus(value); }, []);

  // Play inside the gesture; delayed effects can lose browser user activation.
  const start = useCallback((force = false) => {
    if ((!settings.current.enabled && !force) || document.hidden) return;
    wanted.current = true;
    if (pending.current) return;
    try {
      if (!music.current) {
        const audio = new Audio(soundtrack);
        audio.loop = true;
        audio.preload = 'auto';
        audio.addEventListener('error', () => { pending.current = false; if (wanted.current) report('error'); });
        audio.addEventListener('playing', () => { if (wanted.current) report('playing'); });
        music.current = audio;
      }
      const audio = music.current;
      audio.volume = settings.current.bgmVolume;
      if (!audio.paused) { report('playing'); return; }
      pending.current = true;
      const attempt = ++request.current;
      report('loading');
      const playback = audio.play();
      void Promise.resolve(playback).then(() => {
        if (attempt !== request.current) return;
        pending.current = false;
        if (!wanted.current || document.hidden) { audio.pause(); report('paused'); }
        else report('playing');
      }).catch((error: unknown) => {
        if (attempt !== request.current) return;
        pending.current = false;
        if (!wanted.current) return;
        report(error instanceof Error && error.name === 'NotAllowedError' ? 'blocked' : 'error');
      });
    } catch { pending.current = false; report('error'); }
  }, [report]);

  const play = useCallback((kind: 'click' | 'paper' | 'stamp' | 'warning' | 'closed' = 'click') => {
    if (!settings.current.enabled) return;
    start();
    // Unsupported Web Audio for effects cannot silence soundtrack playback.
    try {
      let e = effects.current;
      if (!e || e.ctx.state === 'closed') {
        const AudioContextClass = globalThis.AudioContext || (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const gain = ctx.createGain(); gain.gain.value = settings.current.sfxVolume * 0.4; gain.connect(ctx.destination);
        e = { ctx, gain }; effects.current = e;
      }
      if (e.ctx.state === 'suspended') void e.ctx.resume().catch(() => {});
      const notes = kind === 'closed' ? [130.81, 164.81, 196, 261.63] : kind === 'stamp' ? [98, 196] : kind === 'warning' ? [73.42, 77.78] : [kind === 'paper' ? 350 : 650];
      notes.forEach((freq, i) => {
        const osc = e.ctx.createOscillator(), gain = e.ctx.createGain(); const now = e.ctx.currentTime + i * 0.035;
        osc.type = kind === 'click' ? 'triangle' : 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(kind === 'closed' ? 0.22 : 0.15, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'closed' ? 2.8 : 0.18));
        osc.connect(gain); gain.connect(e.gain); osc.start(now); osc.stop(now + (kind === 'closed' ? 3 : 0.2));
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      });
    } catch { /* Effects are optional; soundtrack playback is independent. */ }
  }, [start]);

  useEffect(() => {
    if (music.current) music.current.volume = bgmVolume;
    const e = effects.current;
    if (e) e.gain.gain.setTargetAtTime(enabled ? sfxVolume * 0.4 : 0, e.ctx.currentTime, 0.1);
    if (!enabled) {
      wanted.current = false; pending.current = false; request.current++;
      music.current?.pause(); if (music.current) report('paused');
    }
  }, [enabled, bgmVolume, sfxVolume, report]);

  useEffect(() => {
    mounted.current = true;
    const unlock = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-audio-control]')) return;
      if (event instanceof KeyboardEvent && (event.repeat || !['Enter', ' ', 'Spacebar'].includes(event.key))) return;
      if (settings.current.enabled && (!music.current || music.current.paused)) start();
    };
    const visibility = () => {
      if (document.hidden) {
        pending.current = false; request.current++;
        music.current?.pause(); if (music.current) report('paused');
        const ctx = effects.current?.ctx; if (ctx?.state === 'running') void ctx.suspend().catch(() => {});
      } else if (wanted.current && settings.current.enabled) start();
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      mounted.current = false; wanted.current = false; request.current++; pending.current = false;
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('visibilitychange', visibility);
      const audio = music.current;
      if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); music.current = null; }
      const e = effects.current;
      if (e) { e.gain.disconnect(); void e.ctx.close().catch(() => {}); effects.current = null; }
    };
  }, [start, report]);

  return { start, play, status };
}
