import { useClassroomStore } from '../store/classroomStore';
import { selectTotalDuration } from '../store/selectors';
import type { ActivityLogEntry, StudentSlice, PersonalityType } from '../store/types';

// ── Report types ─────────────────────────────────────────
export interface StudentReport {
  student: StudentSlice;
  callCount: number;
  disciplineCount: number;
  totalInteractions: number;
  engagementScore: number;
  responses: string[];
  summary: string;
}

export interface PhaseStat {
  phase: string;
  label: string;
  durationMs: number;
  interactionCount: number;
  nodeCount: number;
}

export interface OverallStats {
  totalDurationMs: number;
  teacherActionCount: number;
  callOnCount: number;
  askQuestionCount: number;
  disciplineCount: number;
  groupDiscussionCount: number;
  studentParticipationRate: number;
  avgResponseQuality: number;
  classroomCoverage: number;
  engagementIndex: number;
  paceScore: number;
}

export interface ReportData {
  overall: OverallStats;
  students: StudentReport[];
  phases: PhaseStat[];
  activityLog: ActivityLogEntry[];
  radarScores: { label: string; value: number }[];
}

const PHASE_LABELS: Record<string, string> = {
  intro: '导入',
  teaching: '讲解',
  interaction: '互动',
  summary: '总结',
};

const PERSONALITY_ENGAGEMENT_BASE: Record<PersonalityType, number> = {
  '学霸': 90,
  '内向': 60,
  '调皮': 50,
  '努力': 80,
  '文艺': 75,
  '体育': 65,
};

const PERSONALITY_TENDENCIES: Record<PersonalityType, string> = {
  '学霸': '积极深入',
  '内向': '害羞简短',
  '调皮': '可能偏题',
  '努力': '认真踏实',
  '文艺': '感性表达',
  '体育': '活力类比',
};

function generateStudentSummary(student: StudentSlice, callCount: number, disciplineCount: number): string {
  const { personality, name } = student;
  const tendency = PERSONALITY_TENDENCIES[personality];

  if (callCount === 0 && disciplineCount === 0) {
    return `${name}（${personality}·${tendency}）在本次课堂中表现平稳，未被直接点名，但整体参与了课堂活动。`;
  }
  if (disciplineCount > 0 && callCount === 0) {
    return `${name}（${personality}·${tendency}）在课堂中注意力有所分散，需要加强课堂纪律引导。建议增加互动频率以提升关注度。`;
  }
  if (callCount >= 2) {
    return `${name}（${personality}·${tendency}）在本次课堂中表现积极，多次参与回答，展现了较好的理解力和表达能力。`;
  }
  return `${name}（${personality}·${tendency}）在课堂中积极参与，回答质量${callCount > 0 ? '良好' : '待提升'}，整体表现稳定。`;
}

// ── Demo log: realistic teacher interactions covering all phases ──
function generateDemoLog(students: StudentSlice[]): ActivityLogEntry[] {
  const find = (name: string) => students.find((s) => s.name === name);

  return [
    // Phase 1: Intro — warm up
    {
      id: 'demo-1', timestamp: Date.now(), elapsedMs: 13000,
      actionType: 'call-on', targetStudentId: find('小雪')?.id ?? null, targetStudentName: '小雪',
      feedbackText: '老师，我读过王勃的诗！"海内存知己，天涯若比邻"！',
      effect: '小雪主动发言，课堂氛围活跃',
      dialogueText: '老师：请小雪回答\n小雪："老师，我读过王勃的诗！"海内存知己，天涯若比邻"！"',
    },
    // Phase 2: Teaching — academic exchange
    {
      id: 'demo-2', timestamp: Date.now(), elapsedMs: 49000,
      actionType: 'call-on', targetStudentId: find('小明')?.id ?? null, targetStudentName: '小明',
      feedbackText: '老师，这句话用了对仗的手法，"落霞"对"秋水"，"孤鹜"对"长天"，非常工整！',
      effect: '小明深入分析对仗手法，课堂理解加深',
      dialogueText: '老师：请小明分析对仗手法\n小明："老师，这句话用了对仗的手法，"落霞"对"秋水"，"孤鹜"对"长天"，非常工整！"',
    },
    {
      id: 'demo-3', timestamp: Date.now(), elapsedMs: 67000,
      actionType: 'discipline', targetStudentId: find('小刚')?.id ?? null, targetStudentName: '小刚',
      feedbackText: '（小声）窗外有只猫……',
      effect: '小刚从走神恢复注意力',
      dialogueText: '老师：请小刚认真听讲\n小刚："（小声）窗外有只猫……"',
    },
    {
      id: 'demo-4', timestamp: Date.now(), elapsedMs: 87000,
      actionType: 'call-on', targetStudentId: find('小丽')?.id ?? null, targetStudentName: '小丽',
      feedbackText: '老师，我觉得王勃真的很了不起，年纪轻轻就有这样的胸襟。',
      effect: '小丽积极回应，展现共情能力',
      dialogueText: '老师：请小丽回答\n小丽："老师，我觉得王勃真的很了不起，年纪轻轻就有这样的胸襟。"',
    },
    // Phase 3: Interaction — core training
    {
      id: 'demo-5', timestamp: Date.now(), elapsedMs: 94000,
      actionType: 'call-on', targetStudentId: find('小明')?.id ?? null, targetStudentName: '小明',
      feedbackText: '文章通过描写滕王阁的壮丽景色，抒发了作者怀才不遇的愤懑，同时也表达了穷且益坚的志向。',
      effect: '小明给出全面深入的回答',
      dialogueText: '老师：请小明回答\n小明："文章通过描写滕王阁的壮丽景色，抒发了作者怀才不遇的愤懑，同时也表达了穷且益坚的志向。"',
    },
    {
      id: 'demo-6', timestamp: Date.now(), elapsedMs: 107000,
      actionType: 'call-on', targetStudentId: find('小红')?.id ?? null, targetStudentName: '小红',
      feedbackText: '（小声）我……我喜欢"落霞与孤鹜齐飞"那句……因为画面很美……',
      effect: '小红在鼓励下完成回答',
      dialogueText: '老师：请小红回答\n小红："（小声）我……我喜欢"落霞与孤鹜齐飞"那句……因为画面很美……"',
    },
    {
      id: 'demo-7', timestamp: Date.now(), elapsedMs: 120000,
      actionType: 'discipline', targetStudentId: find('小刚')?.id ?? null, targetStudentName: '小刚',
      feedbackText: '啊？老师！我在……我在思考人生！',
      effect: '小刚被提醒后恢复认真听讲',
      dialogueText: '老师：请小刚认真听讲\n小刚："啊？老师！我在……我在思考人生！"',
    },
    {
      id: 'demo-8', timestamp: Date.now(), elapsedMs: 133000,
      actionType: 'group-discussion', targetStudentId: null, targetStudentName: '全班',
      feedbackText: '小组讨论：王勃在文章中表达了哪些情感？',
      effect: '全班分为3组进行讨论，课堂参与度提升',
      dialogueText: '老师：小组讨论——王勃在文章中表达了哪些情感？\n小雪和小丽：讨论了文章的意境与写作手法\n小明和小强：分析了"穷且益坚"的精神内涵\n小红和小刚：交流了对落霞意象的感受',
    },
    {
      id: 'demo-9', timestamp: Date.now(), elapsedMs: 155000,
      actionType: 'ask-question', targetStudentId: find('小强')?.id ?? null, targetStudentName: '小强',
      feedbackText: '我觉得最重要的是那种不服输的精神！就算处境不好也要坚持！',
      effect: '全班提问，6人参与回答',
      dialogueText: '老师：全班提问\n小强："我觉得最重要的是那种不服输的精神！就算处境不好也要坚持！"',
    },
    // Phase 4: Summary — wrap-up
    {
      id: 'demo-10', timestamp: Date.now(), elapsedMs: 198000,
      actionType: 'call-on', targetStudentId: find('小丽')?.id ?? null, targetStudentName: '小丽',
      feedbackText: '老师，我以后遇到困难也要像王勃一样坚强！',
      effect: '小丽表达感悟，情感共鸣',
      dialogueText: '老师：请小丽分享感悟\n小丽："老师，我以后遇到困难也要像王勃一样坚强！"',
    },
    {
      id: 'demo-11', timestamp: Date.now(), elapsedMs: 201000,
      actionType: 'call-on', targetStudentId: find('小雪')?.id ?? null, targetStudentName: '小雪',
      feedbackText: '这篇文章真的太美了，我要把它背下来。',
      effect: '小雪被文章打动，主动背诵',
      dialogueText: '老师：请小雪回答\n小雪："这篇文章真的太美了，我要把它背下来。"',
    },
  ];
}

// ── Merge real + demo: real entries win if close in time ──
function mergeLogs(real: ActivityLogEntry[], demo: ActivityLogEntry[]): ActivityLogEntry[] {
  const realTimestamps = new Set(real.map((r) => Math.round(r.elapsedMs / 5000))); // 5s buckets
  const filteredDemo = demo.filter((d) => !realTimestamps.has(Math.round(d.elapsedMs / 5000)));
  const merged = [...real, ...filteredDemo];
  merged.sort((a, b) => a.elapsedMs - b.elapsedMs);
  return merged;
}

// ── Main hook ────────────────────────────────────────────
export function useReportData(): ReportData {
  const state = useClassroomStore.getState();
  const { students, activityLog: realLog, scriptNodes, elapsedMs } = state;
  const totalDuration = selectTotalDuration(state);

  // Build enriched log: real entries + demo backfill
  const demoLog = generateDemoLog(students);
  const activityLog = mergeLogs(realLog, demoLog);

  // ── Per-student stats ──
  const studentReports: StudentReport[] = students.map((student) => {
    const callLogs = activityLog.filter(
      (l) => l.targetStudentId === student.id && (l.actionType === 'call-on' || l.actionType === 'ask-question'),
    );
    const disciplineLogs = activityLog.filter(
      (l) => l.targetStudentId === student.id && l.actionType === 'discipline',
    );
    const callCount = callLogs.length;
    const disciplineCount = disciplineLogs.length;
    const totalInteractions = callCount + disciplineCount;
    const responses = callLogs.map((l) => l.feedbackText);

    let engagement = PERSONALITY_ENGAGEMENT_BASE[student.personality];
    engagement += callCount * 8;
    engagement -= disciplineCount * 12;
    if (student.stateSource === 'teacher') engagement += 5;
    engagement = Math.max(10, Math.min(100, engagement));

    return {
      student,
      callCount,
      disciplineCount,
      totalInteractions,
      engagementScore: engagement,
      responses,
      summary: generateStudentSummary(student, callCount, disciplineCount),
    };
  });

  // ── Phase stats ──
  const phaseTimestamps: { phase: string; start: number; end: number }[] = [];
  let currentPhase = 'intro';
  let phaseStart = 0;
  for (const node of scriptNodes) {
    if (node.type === 'phaseTransition') {
      if (phaseStart < node.timestamp) {
        phaseTimestamps.push({ phase: currentPhase, start: phaseStart, end: node.timestamp });
      }
      currentPhase = node.phase;
      phaseStart = node.timestamp;
    }
  }
  phaseTimestamps.push({ phase: currentPhase, start: phaseStart, end: Math.max(elapsedMs, totalDuration) });

  const effectiveDuration = Math.max(elapsedMs, totalDuration);

  const phases: PhaseStat[] = phaseTimestamps.map((pt) => {
    const nodeCount = scriptNodes.filter((n) => n.timestamp >= pt.start && n.timestamp < pt.end).length;
    const interactionCount = activityLog.filter((l) => l.elapsedMs >= pt.start && l.elapsedMs < pt.end).length;
    return {
      phase: pt.phase,
      label: PHASE_LABELS[pt.phase] ?? pt.phase,
      durationMs: pt.end - pt.start,
      interactionCount,
      nodeCount,
    };
  });

  // ── Overall stats ──
  const callOnCount = activityLog.filter((l) => l.actionType === 'call-on').length;
  const askQuestionCount = activityLog.filter((l) => l.actionType === 'ask-question').length;
  const disciplineCount = activityLog.filter((l) => l.actionType === 'discipline').length;
  const groupDiscussionCount = activityLog.filter((l) => l.actionType === 'group-discussion').length;
  const teacherActionCount = activityLog.length;

  const distinctStudentsInteracted = new Set(
    activityLog.filter((l) => l.targetStudentId).map((l) => l.targetStudentId),
  ).size;
  const classroomCoverage = students.length > 0 ? distinctStudentsInteracted / students.length : 0;
  const avgEngagement = studentReports.length > 0
    ? studentReports.reduce((sum, r) => sum + r.engagementScore, 0) / studentReports.length
    : 0;
  const totalDiscipline = studentReports.reduce((sum, r) => sum + r.disciplineCount, 0);
  const totalCalls = studentReports.reduce((sum, r) => sum + r.callCount, 0);

  const interactionDensity = effectiveDuration > 0 ? (teacherActionCount / (effectiveDuration / 60000)) : 0;
  const paceScore = Math.min(100, Math.round(interactionDensity * 25));

  const avgResponseQuality = totalCalls > 0
    ? Math.min(100, Math.round(70 + totalCalls * 5 - totalDiscipline * 8))
    : 50;

  const engagementIndex = Math.round(avgEngagement);

  const overall: OverallStats = {
    totalDurationMs: effectiveDuration,
    teacherActionCount,
    callOnCount,
    askQuestionCount,
    disciplineCount,
    groupDiscussionCount,
    studentParticipationRate: classroomCoverage,
    avgResponseQuality,
    classroomCoverage,
    engagementIndex,
    paceScore,
  };

  const radarScores = [
    { label: '课堂覆盖', value: Math.round(classroomCoverage * 100) },
    { label: '互动质量', value: Math.round(avgResponseQuality) },
    { label: '学生参与', value: engagementIndex },
    { label: '纪律管理', value: Math.max(20, 100 - totalDiscipline * 15) },
    { label: '节奏把控', value: paceScore },
  ];

  return { overall, students: studentReports, phases, activityLog, radarScores };
}
