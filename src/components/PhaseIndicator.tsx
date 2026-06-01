import { useClassroomStore } from '../store/classroomStore';
import type { LessonPhase } from '../store/types';

const phaseLabels: Record<LessonPhase, string> = {
  intro: '导入',
  teaching: '讲解',
  interaction: '互动',
  summary: '总结',
};

const phaseColors: Record<LessonPhase, string> = {
  intro: 'var(--color-secondary)',
  teaching: 'var(--color-primary)',
  interaction: 'var(--color-accent-green)',
  summary: '#9b59b6',
};

export function PhaseIndicator() {
  const lessonPhase = useClassroomStore((s) => s.lessonPhase);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(30,30,30,0.7) 100%)',
        borderRadius: '8px',
        color: '#fff',
        fontFamily: 'var(--font-main)',
        fontSize: '14px',
      }}
    >
      {(['intro', 'teaching', 'interaction', 'summary'] as LessonPhase[]).map((phase) => (
        <div
          key={phase}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: phase === lessonPhase ? 1 : 0.4,
            fontWeight: phase === lessonPhase ? 700 : 400,
            transition: 'all 0.4s ease',
            transform: phase === lessonPhase ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: phaseColors[phase],
              boxShadow: phase === lessonPhase
                ? `0 0 10px ${phaseColors[phase]}, 0 0 20px ${phaseColors[phase]}40`
                : 'none',
              transition: 'all 0.4s ease',
            }}
          />
          <span>{phaseLabels[phase]}</span>
        </div>
      ))}
    </div>
  );
}
