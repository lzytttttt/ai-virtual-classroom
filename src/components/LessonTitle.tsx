import { useClassroomStore } from '../store/classroomStore';
import type { LessonPhase } from '../store/types';

const phaseLabels: Record<LessonPhase, string> = {
  intro: '导入',
  teaching: '讲解',
  interaction: '互动',
  summary: '总结',
};

const phaseSubtitles: Record<LessonPhase, string> = {
  intro: '走进千古名篇',
  teaching: '品味骈文之美',
  interaction: '师生互动交流',
  summary: '回顾与升华',
};

export function LessonTitle() {
  const lessonPhase = useClassroomStore((s) => s.lessonPhase);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-primary) 100%)',
        backgroundSize: '200% 200%',
        animation: 'shimmer 3s ease-in-out infinite',
        borderRadius: '12px',
        color: '#fff',
        fontFamily: 'var(--font-main)',
        boxShadow: '0 4px 12px rgba(255, 159, 67, 0.3)',
      }}
    >
      <div>
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '3px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
          AI 虚拟课堂 — 《滕王阁序》
        </div>
        <div style={{ fontSize: '13px', opacity: 0.85, marginTop: 2, letterSpacing: '1px' }}>
          {phaseSubtitles[lessonPhase]}
        </div>
      </div>
      <div
        style={{
          padding: '8px 20px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '1px',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {phaseLabels[lessonPhase]}
      </div>
    </div>
  );
}
