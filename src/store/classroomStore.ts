import { create } from 'zustand';
import type {
  StudentSlice, StudentState, StateSource, LessonPhase,
  ScriptNode, ActiveInteraction, InteractionMode,
  ActivityLogEntry,
} from './types';
import { initialStudents } from '../data/students';

export interface ClassroomState {
  students: StudentSlice[];
  lessonPhase: LessonPhase;
  scriptPosition: number;
  scriptNodes: ScriptNode[];
  isPaused: boolean;
  elapsedMs: number;
  playbackSpeed: number;
  interaction: ActiveInteraction | null;
  activityLog: ActivityLogEntry[];
  showReport: boolean;

  setStudents: (students: StudentSlice[]) => void;
  updateStudentState: (id: string, state: StudentState, source: StateSource) => void;
  setLessonPhase: (phase: LessonPhase) => void;
  setScriptPosition: (pos: number) => void;
  setScriptNodes: (nodes: ScriptNode[]) => void;
  setPaused: (paused: boolean) => void;
  setElapsedMs: (ms: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setInteraction: (interaction: ActiveInteraction | null) => void;
  setShowReport: (show: boolean) => void;
  beginInteraction: (mode: InteractionMode, opts?: Partial<ActiveInteraction>) => void;
  resolveInteraction: (feedbackText: string, canContinue: boolean) => void;
  clearInteraction: () => void;
  addActivityLog: (entry: ActivityLogEntry) => void;
  reconcileScriptState: (upToTimestamp: number) => void;
}

const COOLDOWN_MS = 8000;

export const useClassroomStore = create<ClassroomState>((set, get) => ({
  students: initialStudents,
  lessonPhase: 'intro',
  scriptPosition: 0,
  scriptNodes: [],
  isPaused: false,
  elapsedMs: 0,
  playbackSpeed: 1,
  interaction: null,
  activityLog: [],
  showReport: false,

  setStudents: (students) => set({ students }),

  updateStudentState: (id, state, source) =>
    set((s) => ({
      students: s.students.map((st) =>
        st.id === id
          ? {
              ...st,
              state,
              stateSource: source,
              teacherCooldownUntil: source === 'teacher' ? Date.now() + COOLDOWN_MS : st.teacherCooldownUntil,
            }
          : st,
      ),
    })),

  setLessonPhase: (lessonPhase) => set({ lessonPhase }),
  setScriptPosition: (scriptPosition) => set({ scriptPosition }),
  setScriptNodes: (scriptNodes) => set({ scriptNodes }),
  setPaused: (isPaused) => set({ isPaused }),
  setElapsedMs: (elapsedMs) => set({ elapsedMs }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setInteraction: (interaction) => set({ interaction }),
  setShowReport: (showReport) => set({ showReport }),

  beginInteraction: (mode, opts) => {
    set({
      interaction: {
        mode,
        actionType: opts?.actionType ?? null,
        prompt: opts?.prompt ?? '',
        targetStudentId: opts?.targetStudentId ?? null,
        candidateStudentIds: opts?.candidateStudentIds ?? [],
        feedbackText: null,
        startedAt: Date.now(),
        resolvedAt: null,
        canContinue: false,
        source: opts?.source ?? 'teacher',
      },
    });
  },

  resolveInteraction: (feedbackText, canContinue) => {
    set((s) => ({
      interaction: s.interaction
        ? {
            ...s.interaction,
            mode: 'feedback' as InteractionMode,
            feedbackText,
            resolvedAt: Date.now(),
            canContinue,
          }
        : null,
    }));
  },

  clearInteraction: () => set({ interaction: null }),

  addActivityLog: (entry) => set((s) => ({ activityLog: [...s.activityLog, entry] })),

  reconcileScriptState: (upToTimestamp) => {
    const { scriptNodes, students, lessonPhase: currentPhase } = get();
    const now = Date.now();
    let changed = false;
    let lessonPhase: LessonPhase = currentPhase;

    let newStudents: StudentSlice[] | null = null;

    for (const node of scriptNodes) {
      if (node.timestamp > upToTimestamp) break;

      switch (node.type) {
        case 'stateChange': {
          const idx = students.findIndex((s) => s.id === node.studentId);
          if (idx !== -1) {
            if (students[idx].stateSource === 'teacher' && students[idx].teacherCooldownUntil > now) break;
            if (students[idx].state !== node.state || students[idx].stateSource !== 'script') {
              if (!newStudents) newStudents = students.map((st) => ({ ...st }));
              newStudents[idx].state = node.state;
              newStudents[idx].stateSource = 'script';
              changed = true;
            }
          }
          break;
        }
        case 'phaseTransition':
          if (node.phase !== lessonPhase) {
            lessonPhase = node.phase;
            changed = true;
          }
          break;
        case 'collectiveReading':
          for (let i = 0; i < students.length; i++) {
            if (students[i].stateSource === 'teacher' && students[i].teacherCooldownUntil > now) continue;
            if (students[i].state !== 'collective-reading' || students[i].stateSource !== 'script') {
              if (!newStudents) newStudents = students.map((st) => ({ ...st }));
              newStudents[i].state = 'collective-reading';
              newStudents[i].stateSource = 'script';
              changed = true;
            }
          }
          break;
        default:
          break;
      }
    }

    if (changed) {
      const update: Partial<ClassroomState> = { lessonPhase };
      if (newStudents) update.students = newStudents;
      set(update);
    }
  },
}));
