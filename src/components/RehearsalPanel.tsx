import { useClassroomStore } from '../store/classroomStore';
import { useScriptPlayback } from '../hooks/useScriptPlayback';
import type { LessonPhase } from '../store/types';

const PHASE_ORDER: LessonPhase[] = ['intro', 'teaching', 'interaction', 'summary'];
const phaseLabels: Record<LessonPhase, string> = {
  intro: '导入',
  teaching: '讲解',
  interaction: '互动',
  summary: '总结',
};

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function RehearsalPanel() {
  const { playbackSpeed, setPlaybackSpeed, scriptNodes, elapsedMs } = useClassroomStore();
  const { seekTo, totalDuration } = useScriptPlayback();

  const remainingMs = Math.max(0, totalDuration - elapsedMs);

  const skipToPhase = (phase: LessonPhase) => {
    const maxTime = totalDuration || 1;
    const phaseNode = scriptNodes.find((n) => n.type === 'phaseTransition' && n.phase === phase);
    if (phaseNode) {
      seekTo(phaseNode.timestamp / maxTime);
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'rgba(61,61,61,0.9)',
        borderRadius: '10px',
        color: '#fff',
        fontFamily: 'var(--font-main)',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Speed toggle */}
      <button
        onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
        style={{
          padding: '6px 14px',
          borderRadius: '6px',
          border: playbackSpeed === 2 ? '2px solid var(--color-primary)' : '2px solid rgba(255,255,255,0.3)',
          background: playbackSpeed === 2 ? 'rgba(255,159,67,0.2)' : 'transparent',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: playbackSpeed === 2 ? '0 0 12px rgba(255,159,67,0.4)' : 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        title="Toggle 2x speed (T)"
      >
        {playbackSpeed === 2 ? '2x 倍速' : '1x 正常'}
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />

      {/* Phase skip buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {PHASE_ORDER.map((phase, i) => (
          <button
            key={phase}
            onClick={() => skipToPhase(phase)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'transparent'; }}
            title={`Skip to ${phaseLabels[phase]} (${i + 5})`}
          >
            {i + 5}: {phaseLabels[phase]}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />

      {/* Countdown timer */}
      <div
        style={{
          padding: '4px 12px',
          background: 'rgba(255,107,107,0.15)',
          borderRadius: '6px',
          border: '1px solid rgba(255,107,107,0.3)',
          fontWeight: 600,
          color: 'var(--color-accent-coral)',
          fontVariantNumeric: 'tabular-nums',
        }}
        title="Remaining time"
      >
        -{formatTime(remainingMs)}
      </div>
    </div>
  );
}
