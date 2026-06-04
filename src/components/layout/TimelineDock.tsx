import { useClassroomStore } from '../../store/classroomStore';
import { useScriptPlayback } from '../../hooks/useScriptPlayback';
import { PHASE_LABELS } from '../../store/selectors';
import type { LessonPhase } from '../../store/types';

const PHASES: LessonPhase[] = ['intro', 'teaching', 'interaction', 'summary'];

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function TimelineDock() {
  const scriptNodes = useClassroomStore((s) => s.scriptNodes);
  const {
    elapsedMs, totalDuration, progress, isPaused, playbackSpeed,
    togglePlayPause, fastForward, seekTo, skipToPhase,
  } = useScriptPlayback();
  const setPlaybackSpeed = useClassroomStore((s) => s.setPlaybackSpeed);

  const remainingMs = Math.max(0, totalDuration - elapsedMs);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  };

  return (
    <div className="timeline-dock">
      <button className="timeline-dock__play-btn" onClick={togglePlayPause} title="播放/暂停 (Space)">
        {isPaused ? '▶' : '⏸'}
      </button>

      <button className="timeline-dock__fast-forward" onClick={fastForward} title="快进到下一个互动点 (→)">
        ⏭
      </button>

      <span className="timeline-dock__time">
        {formatTime(elapsedMs)} / {formatTime(totalDuration)}
      </span>

      <div className="timeline-dock__bar-wrapper" onClick={handleBarClick}>
        <div className="timeline-dock__bar-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="timeline-dock__divider" />

      <button
        className={`timeline-dock__speed-btn${playbackSpeed !== 1 ? ' timeline-dock__speed-btn--active' : ''}`}
        onClick={() => setPlaybackSpeed(playbackSpeed === 0.5 ? 1 : playbackSpeed === 1 ? 2 : 0.5)}
        title="倍速切换 (T)"
      >
        {playbackSpeed}x
      </button>

      <div className="timeline-dock__divider" />

      <div className="timeline-dock__phases">
        {PHASES.map((phase) => (
          <button
            key={phase}
            className="timeline-dock__phase-btn"
            onClick={() => skipToPhase(scriptNodes.find((n) => n.type === 'phaseTransition' && n.phase === phase))}
            title={`跳转到${PHASE_LABELS[phase]}阶段 (${5 + PHASES.indexOf(phase)})`}
          >
            {PHASE_LABELS[phase]}
          </button>
        ))}
      </div>

      <div className="timeline-dock__divider" />

      <span className="timeline-dock__remaining">
        剩余 {formatTime(remainingMs)}
      </span>

      <span className="kbd" title="Space: 播放/暂停, →: 快进, T: 倍速, 5-8: 跳转阶段">快捷键</span>
    </div>
  );
}
