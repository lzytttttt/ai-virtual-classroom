import { create } from 'zustand';
import type { StudentSlice, StudentState, StateSource, LessonPhase, TeacherAction, ScriptNode } from './types';
import { initialStudents } from '../data/students';

interface ActiveInteraction {
  type: TeacherAction;
  targetStudentId?: string;
  prompt: string;
  startedAt: number;
}

interface ClassroomState {
  students: StudentSlice[];
  lessonPhase: LessonPhase;
  scriptPosition: number;
  scriptNodes: ScriptNode[];
  activeInteraction: ActiveInteraction | null;
  isPaused: boolean;
  elapsedMs: number;
  playbackSpeed: number;

  setStudents: (students: StudentSlice[]) => void;
  updateStudentState: (id: string, state: StudentState, source: StateSource) => void;
  setLessonPhase: (phase: LessonPhase) => void;
  setScriptPosition: (pos: number) => void;
  setScriptNodes: (nodes: ScriptNode[]) => void;
  setActiveInteraction: (interaction: ActiveInteraction | null) => void;
  dispatchTeacherAction: (action: TeacherAction, targetStudentId?: string) => void;
  setPaused: (paused: boolean) => void;
  setElapsedMs: (ms: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  reconcileScriptState: (upToTimestamp: number) => void;
}

export const useClassroomStore = create<ClassroomState>((set, get) => ({
  students: initialStudents,
  lessonPhase: 'intro',
  scriptPosition: 0,
  scriptNodes: [],
  activeInteraction: null,
  isPaused: false,
  elapsedMs: 0,
  playbackSpeed: 1,

  setStudents: (students) => set({ students }),

  updateStudentState: (id, state, source) =>
    set((s) => ({
      students: s.students.map((st) =>
        st.id === id ? { ...st, state, stateSource: source } : st
      ),
    })),

  setLessonPhase: (lessonPhase) => set({ lessonPhase }),

  setScriptPosition: (scriptPosition) => set({ scriptPosition }),

  setScriptNodes: (scriptNodes) => set({ scriptNodes }),

  setActiveInteraction: (activeInteraction) => set({ activeInteraction }),

  dispatchTeacherAction: (action, targetStudentId) => {
    const now = Date.now();
    const cooldownMs = 5000;

    if (action === 'call-on' && targetStudentId) {
      set((s) => ({
        students: s.students.map((st) =>
          st.id === targetStudentId
            ? { ...st, state: 'hand-raised' as StudentState, stateSource: 'teacher' as StateSource, teacherCooldownUntil: now + cooldownMs }
            : st
        ),
        activeInteraction: { type: action, targetStudentId, prompt: '请回答问题', startedAt: now },
      }));
    } else if (action === 'ask-question') {
      set({
        activeInteraction: { type: action, prompt: '请思考这个问题', startedAt: now },
      });
    } else if (action === 'discipline' && targetStudentId) {
      set((s) => ({
        students: s.students.map((st) =>
          st.id === targetStudentId
            ? { ...st, state: 'normal' as StudentState, stateSource: 'teacher' as StateSource, teacherCooldownUntil: now + cooldownMs }
            : st
        ),
        activeInteraction: { type: action, targetStudentId, prompt: '请认真听讲', startedAt: now },
      }));
    } else if (action === 'group-discussion') {
      set({
        activeInteraction: { type: action, prompt: '小组讨论开始', startedAt: now },
      });
    }
  },

  setPaused: (isPaused) => set({ isPaused }),
  setElapsedMs: (elapsedMs) => set({ elapsedMs }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

  reconcileScriptState: (upToTimestamp) => {
    const { scriptNodes, students } = get();
    const newStudents = students.map((s) => ({ ...s }));
    let lessonPhase: LessonPhase = 'intro';

    for (const node of scriptNodes) {
      if (node.timestamp > upToTimestamp) break;

      switch (node.type) {
        case 'stateChange': {
          const idx = newStudents.findIndex((s) => s.id === node.studentId);
          if (idx !== -1) {
            // State authority check: skip if teacher has taken control
            if (newStudents[idx].stateSource === 'teacher') break;
            newStudents[idx].state = node.state;
            newStudents[idx].stateSource = 'script';
          }
          break;
        }
        case 'phaseTransition':
          lessonPhase = node.phase;
          break;
        case 'collectiveReading':
          for (const s of newStudents) {
            if (s.stateSource === 'teacher') continue;
            s.state = 'collective-reading';
            s.stateSource = 'script';
          }
          break;
        default:
          break;
      }
    }

    set({ students: newStudents, lessonPhase });
  },
}));
