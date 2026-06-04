import type { ClassroomState } from './classroomStore';
import type { StudentSlice, LessonPhase, TeacherPromptNode } from './types';

// ── Phase labels ─────────────────────────────────────────
export const PHASE_LABELS: Record<LessonPhase, string> = {
  intro: '导入',
  teaching: '讲解',
  interaction: '互动',
  summary: '总结',
};

export const PHASE_SUBTITLES: Record<LessonPhase, string> = {
  intro: '走进千古名篇',
  teaching: '品味骈文之美',
  interaction: '师生互动交流',
  summary: '回顾与升华',
};

export const PHASE_COLORS: Record<LessonPhase, string> = {
  intro: 'var(--color-secondary)',
  teaching: 'var(--color-primary)',
  interaction: 'var(--color-accent-green)',
  summary: '#9b59b6',
};

// ── Script selectors ─────────────────────────────────────
export const selectTotalDuration = (s: ClassroomState): number =>
  s.scriptNodes.length > 0
    ? s.scriptNodes[s.scriptNodes.length - 1].timestamp
    : 0;

// ── Mode label (returns primitive — safe for useSyncExternalStore) ──
export const selectModeLabel = (s: ClassroomState): string => {
  if (!s.interaction || s.interaction.mode === 'idle') {
    return s.isPaused ? '已暂停' : '自动脚本';
  }
  switch (s.interaction.mode) {
    case 'teacher-prompt': return '教师决策中';
    case 'selecting-student': return '选择学生';
    case 'teacher-action-running': return '执行中';
    case 'feedback': return '反馈中';
    case 'paused': return '已暂停';
    case 'script-playing': return '自动脚本';
    default: return '自动脚本';
  }
};

// ── Primitive selectors (safe for useSyncExternalStore) ──
export const selectRaisedHandCount = (s: ClassroomState): number =>
  s.students.filter((st) => st.state === 'hand-raised').length;

export const selectSleepingCount = (s: ClassroomState): number =>
  s.students.filter((st) => st.state === 'sleeping').length;

export const selectDistractedCount = (s: ClassroomState): number =>
  s.students.filter((st) => st.state === 'distracted').length;

export const selectAnsweringName = (s: ClassroomState): string | null =>
  s.students.find((st) => st.state === 'answering')?.name ?? null;

// ── Object selectors — ONLY use with useClassroomStore(selector, shallow) ──
export const selectTroublemakers = (s: ClassroomState): StudentSlice[] =>
  s.students.filter((st) => st.state === 'sleeping' || st.state === 'distracted');

export const selectCurrentPromptNode = (s: ClassroomState): TeacherPromptNode | null => {
  const pos = s.scriptPosition;
  for (let i = Math.max(0, pos - 2); i < Math.min(s.scriptNodes.length, pos + 3); i++) {
    if (s.scriptNodes[i]?.type === 'teacherPrompt') return s.scriptNodes[i] as TeacherPromptNode;
  }
  return null;
};
