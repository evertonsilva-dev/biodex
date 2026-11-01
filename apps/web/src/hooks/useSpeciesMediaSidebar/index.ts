import { useCallback, useRef } from 'react';
import type { AudioPlayerControl } from './types';

export function useSpeciesMediaSidebar() {
  const audioPlayers = useRef(new Map<string, AudioPlayerControl>());
  const registerAudioPlayer = useCallback(
    (url: string, player: AudioPlayerControl | null) => {
      if (player) audioPlayers.current.set(url, player);
      else audioPlayers.current.delete(url);
    },
    [],
  );
  const handleAudioPlaybackStart = useCallback((url: string) => {
    audioPlayers.current.forEach((player, playerUrl) => {
      if (playerUrl !== url) player.pause();
    });
  }, []);

  return { registerAudioPlayer, handleAudioPlaybackStart };
}
