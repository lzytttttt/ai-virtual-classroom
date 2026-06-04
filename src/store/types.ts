// ── Student ──────────────────────────────────────────────
export type StudentState = 'normal' | 'hand-raised' | 'answering' | 'collective-reading' | 'distracted' | 'sleeping';
export type StateSource = 'script' | 'teacher' | 'idle';
export type PersonalityType = '学霸' | '内向' | '调皮' | '努力' | '文艺' | '体育';

export interface StudentSlice {
  id: string;
  name: string;
  personality: PersonalityType;
  state: StudentState;
  stateSource: StateSource;
  teacherCooldownUntil: number;
  seatPosition: { row: number; col: number };
}

// ── Lesson ───────────────────────────────────────────────
export type LessonPhase = 'intro' | 'teaching' | 'interaction' | 'summary';

// ── Script nodes ─────────────────────────────────────────
export interface BaseScriptNode { timestamp: number }

export interface DialogueNode extends BaseScriptNode {
  type: 'dialogue'; studentId: string; text: string; expression?: string;
}
export interface NarrationNode extends BaseScriptNode {
  type: 'narration'; text: string;
}
export interface StateChangeNode extends BaseScriptNode {
  type: 'stateChange'; studentId: string; state: StudentState; duration?: number;
}
export type TeacherAction = TeacherActionType;

export interface TeacherPromptNode extends BaseScriptNode {
  type: 'teacherPrompt'; action: TeacherActionType; prompt: string; targetStudentId?: string;
}
export interface PhaseTransitionNode extends BaseScriptNode {
  type: 'phaseTransition'; phase: LessonPhase; title: string;
}
export interface GroupActivityNode extends BaseScriptNode {
  type: 'groupActivity'; activity: string; studentIds: string[]; duration: number;
}
export interface CollectiveReadingNode extends BaseScriptNode {
  type: 'collectiveReading'; text: string; duration: number;
}

export type ScriptNode =
  | DialogueNode | NarrationNode | StateChangeNode
  | TeacherPromptNode | PhaseTransitionNode
  | GroupActivityNode | CollectiveReadingNode;

// ── Interaction state machine ────────────────────────────
export type InteractionMode =
  | 'idle'
  | 'script-playing'
  | 'teacher-prompt'
  | 'selecting-student'
  | 'teacher-action-running'
  | 'feedback'
  | 'paused';

export type TeacherActionType =
  | 'call-on'
  | 'ask-question'
  | 'discipline'
  | 'group-discussion'
  | 'continue'
  | 'skip';

export interface ActiveInteraction {
  mode: InteractionMode;
  actionType: TeacherActionType | null;
  prompt: string;
  targetStudentId: string | null;
  candidateStudentIds: string[];
  feedbackText: string | null;
  startedAt: number;
  resolvedAt: number | null;
  canContinue: boolean;
  source: 'script' | 'teacher';
}

// ── Activity log ─────────────────────────────────────────
export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  elapsedMs: number;
  actionType: TeacherActionType;
  targetStudentId: string | null;
  targetStudentName: string;
  feedbackText: string;
  effect: string;
}

// ── Personality response data ────────────────────────────
export interface PersonalityProfile {
  personality: PersonalityType;
  description: string;
  answerTendency: string;
  callOnResponse: string;
  disciplineResponse: string;
}
