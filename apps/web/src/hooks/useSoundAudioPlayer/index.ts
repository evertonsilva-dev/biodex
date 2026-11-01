import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { UseSoundAudioPlayerOptions } from './types';

export function useSoundAudioPlayer({
  url,
  registerPlayer,
  onPlaybackStart,
}: UseSoundAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progress = duration > 0 ? currentTime / duration : 0;
  const waveformBars = Array.from({ length: 48 }, (_, index) => {
    let seed = 0;
    for (const character of `${url}:${index}`) {
      seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
    }
    return 8 + (seed % 33);
  });

  const setAudioElement = useCallback((audio: HTMLAudioElement | null) => {
    audioRef.current = audio;
    registerPlayer(url, audio ? { pause: () => audio.pause() } : null);
  }, [registerPlayer, url]);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      setPlaybackError(false);
      onPlaybackStart(url);
      if (audio.ended) audio.currentTime = 0;
      void audio.play().catch(() => setPlaybackError(true));
    } else {
      audio.pause();
    }
  };

  const seekToPosition = (clientX: number, element: HTMLElement) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;

    const bounds = element.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    const time = fraction * audio.duration;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleWaveformClick = (event: MouseEvent<HTMLDivElement>) => {
    seekToPosition(event.clientX, event.currentTarget);
  };

  const handleWaveformKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!duration) return;
    const audio = audioRef.current;
    if (!audio) return;

    let time: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') time = currentTime - 5;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') time = currentTime + 5;
    else if (event.key === 'Home') time = 0;
    else if (event.key === 'End') time = duration;

    if (time !== null) {
      event.preventDefault();
      audio.currentTime = Math.max(0, Math.min(duration, time));
      setCurrentTime(audio.currentTime);
    }
  };

  return {
    isPlaying,
    playbackError,
    duration,
    currentTime,
    progress,
    waveformBars,
    setAudioElement,
    handlePlay,
    handleWaveformClick,
    handleWaveformKeyDown,
    setDuration,
    setCurrentTime,
    setIsPlaying,
    setPlaybackError,
  };
}
