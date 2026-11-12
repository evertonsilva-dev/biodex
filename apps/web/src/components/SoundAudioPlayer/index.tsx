import { useSoundAudioPlayer } from '../../hooks/useSoundAudioPlayer';
import type { SoundAudioPlayerProps } from './types';
import { FallbackAudio, Waveform, WavePlayButton, WavePlayerLayout, WavePlayerTrack, WaveTime } from './styles';

function formatAudioTime(value: number): string {
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function SoundAudioPlayer({
  url,
  label,
  registerPlayer,
  onPlaybackStart,
}: SoundAudioPlayerProps) {
  const {
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
  } = useSoundAudioPlayer({ url, registerPlayer, onPlaybackStart });

  return (
    <WavePlayerLayout>
      <WavePlayButton
        type="button"
        aria-label={isPlaying ? `Pausar ${label}` : `Reproduzir ${label}`}
        aria-pressed={isPlaying}
        onClick={handlePlay}
      >
        {isPlaying ? (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 3h3v10H4zm5 0h3v10H9z" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 2.7v10.6L13 8z" />
          </svg>
        )}
      </WavePlayButton>
      <WavePlayerTrack>
        {/* Native controls keep browsers from hiding this audio element. */}
        <FallbackAudio
          ref={setAudioElement}
          aria-hidden="true"
          controls
          preload="none"
          src={url}
          onLoadedMetadata={(event) =>
            setDuration(event.currentTarget.duration || 0)
          }
          onDurationChange={(event) =>
            setDuration(event.currentTarget.duration || 0)
          }
          onTimeUpdate={(event) => {
            const audio = event.currentTarget;
            setCurrentTime(audio.currentTime);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => setPlaybackError(true)}
        />
        <Waveform
          role="slider"
          tabIndex={0}
          aria-label={`Posição da reprodução: ${label}`}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={Math.min(currentTime, duration)}
          aria-valuetext={duration > 0
            ? `${formatAudioTime(currentTime)} de ${formatAudioTime(duration)}`
            : 'Duração ainda não carregada'}
          onClick={handleWaveformClick}
          onKeyDown={handleWaveformKeyDown}
        >
          {waveformBars.map((height, index) => (
            <span
              key={`${index}-${height}`}
              style={{
                height: `${height}px`,
                opacity: index / waveformBars.length < progress ? 1 : 0.4,
              }}
            />
          ))}
        </Waveform>
        <WaveTime aria-live="off">
          {duration > 0
            ? `${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}`
            : '--:-- / --:--'}
        </WaveTime>
        {playbackError && (
          <span role="status" style={{ fontSize: "0.75rem" }}>
            Este navegador não conseguiu reproduzir esta gravação. Tente o link
            da fonte.
          </span>
        )}
      </WavePlayerTrack>
    </WavePlayerLayout>
  );
}
