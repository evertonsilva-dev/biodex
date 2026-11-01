export interface SoundAudioPlayerProps {
  url: string;
  label: string;
  registerPlayer(url: string, player: { pause: () => void } | null): void;
  onPlaybackStart(url: string): void;
}
