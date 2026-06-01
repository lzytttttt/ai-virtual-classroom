import { useScriptPlayback } from '../hooks/useScriptPlayback';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function TimelineControl() {
  const {
    togglePlayPause,
    fastForward,
    seekTo,
    progress,
    totalDuration,
    isPaused,
    elapsedMs,
  } = useScriptPlayback();

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    seekTo(fraction);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        borderRadius: '8px',
        fontFamily: 'var(--font-main)',
        color: '#fff',
        fontSize: '13px',
      }}
    >
      {/* Play/Pause */}
      <button
        onClick={togglePlayPause}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid #fff',
          background: 'transparent',
          color: '#fff',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'transparent'; }}
      >
        {isPaused ? '\u25B6' : '\u275A\u275A'}
      </button>

      {/* Fast Forward */}
      <button
        onClick={fastForward}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid #fff',
          background: 'transparent',
          color: '#fff',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'transparent'; }}
        title="Fast forward to next interaction"
      >
        {'\u23E9'}
      </button>

      {/* Time display */}
      <span style={{ minWidth: '80px', textAlign: 'center' }}>
        {formatTime(elapsedMs)} / {formatTime(totalDuration)}
      </span>

      {/* Progress bar */}
      <div
        onClick={handleBarClick}
        style={{
          flex: 1,
          height: '8px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-secondary) 0%, var(--color-secondary) 50%, var(--color-secondary-light) 100%)',
            borderRadius: '4px',
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  );
}
