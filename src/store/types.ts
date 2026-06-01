export type StudentState = 'normal' | 'hand-raised' | 'answering' | 'collective-reading' | 'distracted' | 'sleeping';

export type StateSource = 'script' | 'teacher' | 'idle';

export type PersonalityType = '学霸' | '内向' | '调皮' | '努力' | '文艺' | '体育';

export type LessonPhase = 'intro' | 'teaching' | 'interaction' | 'summary';

export type TeacherAction = 'call-on' | 'ask-question' | 'discipline' | 'group-discussion';

export interface BaseScriptNode {
  timestamp: number;
}

export interface DialogueNode extends BaseScriptNode {
  type: 'dialogue';
  studentId: string;
  text: string;
  expression?: string;
}

export interface NarrationNode extends BaseScriptNode {
  type: 'narration';
  text: string;
}

export interface StateChangeNode extends BaseScriptNode {
  type: 'stateChange';
  studentId: string;
  state: StudentState;
  duration?: number;
}

export interface TeacherPromptNode extends BaseScriptNode {
  type: 'teacherPrompt';
  action: TeacherAction;
  prompt: string;
  targetStudentId?: string;
}

export interface PhaseTransitionNode extends BaseScriptNode {
  type: 'phaseTransition';
  phase: LessonPhase;
  title: string;
}

export interface GroupActivityNode extends BaseScriptNode {
  type: 'groupActivity';
  activity: string;
  studentIds: string[];
  duration: number;
}

export interface CollectiveReadingNode extends BaseScriptNode {
  type: 'collectiveReading';
  text: string;
  duration: number;
}

export type ScriptNode =
  | DialogueNode
  | NarrationNode
  | StateChangeNode
  | TeacherPromptNode
  | PhaseTransitionNode
  | GroupActivityNode
  | CollectiveReadingNode;

export interface StudentSlice {
  id: string;
  name: string;
  personality: PersonalityType;
  state: StudentState;
  stateSource: StateSource;
  teacherCooldownUntil: number;
  seatPosition: { row: number; col: number };
}
