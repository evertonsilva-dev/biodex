export interface UseSoundAudioPlayerOptions {
  url: string;
  registerPlayer(url: string, player: { pause: () => void } | null): void;
  onPlaybackStart(url: string): void;
}
