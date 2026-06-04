import { useClassroomStore } from '../../store/classroomStore';
import { useScriptPlayback } from '../../hooks/useScriptPlayback';
import { PHASE_LABELS, PHASE_COLORS, selectModeLabel } from '../../store/selectors';
import type { LessonPhase } from '../../store/types';

const PHASES: LessonPhase[] = ['intro', 'teaching', 'interaction', 'summary'];

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function HeaderBar() {
  const lessonPhase = useClassroomStore((s) => s.lessonPhase);
  const modeLabel = useClassroomStore(selectModeLabel);
  const { elapsedMs, totalDuration, isPaused, togglePlayPause } = useScriptPlayback();

  const modeClass = (() => {
    if (modeLabel.includes('决策') || modeLabel.includes('选择')) return 'intervention';
    if (modeLabel.includes('反馈')) return 'feedback';
    if (modeLabel.includes('暂停')) return 'paused';
    return 'auto';
  })();

  return (
    <header className="header-bar">
      <div className="header-bar__brand">
        <span className="header-bar__logo">AI 虚拟课堂</span>
        <div className="header-bar__divider" />
        <span className="header-bar__course">《滕王阁序》</span>
      </div>

      <div className="header-bar__center">
        <div className="header-bar__phase-pills">
          {PHASES.map((phase) => (
            <div
              key={phase}
              className={`header-bar__phase-pill${phase === lessonPhase ? ' header-bar__phase-pill--active' : ''}`}
              style={phase === lessonPhase ? { boxShadow: `inset 0 -2px 0 ${PHASE_COLORS[phase]}` } : undefined}
            >
              {PHASE_LABELS[phase]}
            </div>
          ))}
        </div>
      </div>

      <div className="header-bar__right">
        <span className={`header-bar__mode-badge header-bar__mode-badge--${modeClass}`}>
          {modeLabel}
        </span>
        <span className="header-bar__time">
          {formatTime(elapsedMs)} / {formatTime(totalDuration)}
        </span>
        <button className="header-bar__play-btn" onClick={togglePlayPause} title="播放/暂停 (Space)">
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>
    </header>
  );
}
