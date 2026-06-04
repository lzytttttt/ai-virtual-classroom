import React from 'react';
import { useClassroomStore } from '../../store/classroomStore';
import { useInteractionEngine } from '../../hooks/useInteractionEngine';
import { PHASE_LABELS, PHASE_SUBTITLES, selectSleepingCount, selectDistractedCount, selectTotalDuration } from '../../store/selectors';
import { ClassStatusSummary } from './ClassStatusSummary';
import { StudentPicker } from './StudentPicker';
import { ActionResultCard } from './ActionResultCard';
import type { TeacherActionType } from '../../store/types';

export const TeacherConsole: React.FC = () => {
  const interaction = useClassroomStore((s) => s.interaction);
  const lessonPhase = useClassroomStore((s) => s.lessonPhase);
  const students = useClassroomStore((s) => s.students);
  const sleepingCount = useClassroomStore(selectSleepingCount);
  const distractedCount = useClassroomStore(selectDistractedCount);
  const elapsedMs = useClassroomStore((s) => s.elapsedMs);
  const setShowReport = useClassroomStore((s) => s.setShowReport);
  const activityLog = useClassroomStore((s) => s.activityLog);

  const {
    callOnStudent, askQuestion, discipline, groupDiscussion,
    continueScript, praiseStudent, followUpQuestion, selectCandidates,
  } = useInteractionEngine();

  const totalDuration = useClassroomStore(selectTotalDuration);
  const isLessonFinished = elapsedMs >= totalDuration && totalDuration > 0;

  const targetStudent = interaction?.targetStudentId
    ? students.find((s) => s.id === interaction.targetStudentId)
    : undefined;

  const candidateStudents = interaction?.candidateStudentIds.length
    ? students.filter((s) => interaction.candidateStudentIds.includes(s.id))
    : [];

  // ── Feedback mode ──
  if (interaction?.mode === 'feedback') {
    return (
      <div className="teacher-console">
        <ConsoleHeader title="操作反馈" subtitle={`${PHASE_LABELS[lessonPhase]} · ${PHASE_SUBTITLES[lessonPhase]}`} />
        <div className="console-body">
          <ActionResultCard
            interaction={interaction}
            targetStudent={targetStudent}
            onContinue={continueScript}
            onPraise={targetStudent ? () => praiseStudent(targetStudent.id) : undefined}
            onFollowUp={targetStudent ? () => followUpQuestion(targetStudent.id) : undefined}
          />
        </div>
      </div>
    );
  }

  // ── Selection / prompt mode ──
  if (interaction?.mode === 'selecting-student' || interaction?.mode === 'teacher-prompt') {
    const candidates = candidateStudents.length > 0
      ? candidateStudents
      : selectCandidates(interaction.actionType as TeacherActionType);

    return (
      <div className="teacher-console">
        <ConsoleHeader title="教师决策" subtitle={`${PHASE_LABELS[lessonPhase]} · ${PHASE_SUBTITLES[lessonPhase]}`} />
        <div className="console-body">
          {interaction.prompt && (
            <div className="prompt-card">
              <div className="prompt-card__question">{interaction.prompt}</div>
              <div className="prompt-card__recommend">
                推荐：{interaction.actionType === 'discipline' ? '优先处理走神/睡觉的学生' : '根据学生状态选择回答'}
              </div>
            </div>
          )}

          <div className="console-section">
            <div className="console-section__title">
              {interaction.actionType === 'group-discussion' ? '全班学生' : '选择学生'}
            </div>
            <StudentPicker
              students={candidates}
              onSelect={(id) => {
                if (interaction.actionType === 'ask-question' || interaction.actionType === 'call-on') {
                  callOnStudent(id);
                } else if (interaction.actionType === 'discipline') {
                  discipline(id);
                }
              }}
              actionLabel={interaction.actionType === 'discipline' ? '提醒' : '选择'}
            />
          </div>

          {interaction.actionType !== 'group-discussion' && (
            <div className="action-grid">
              <button className="action-btn" onClick={() => {
                useClassroomStore.getState().clearInteraction();
                useClassroomStore.getState().setPaused(false);
              }}>
                <span className="action-btn__icon">⏭</span>
                跳过此互动
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Lesson finished ──
  if (isLessonFinished) {
    return (
      <div className="teacher-console">
        <ConsoleHeader title="课程完成" subtitle={`${PHASE_LABELS[lessonPhase]} · ${PHASE_SUBTITLES[lessonPhase]}`} />
        <div className="console-body">
          <div className="prompt-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <div className="prompt-card__question">本次实训课程已完成</div>
            <div className="prompt-card__recommend" style={{ marginTop: 4, marginBottom: 16 }}>
              共 {activityLog.length} 次教师互动 · 6 位虚拟学生参与
            </div>
            <button className="report-trigger-btn" onClick={() => setShowReport(true)}>
              <span className="report-trigger-btn__icon">📊</span>
              查看课程报告
            </button>
          </div>
          <ClassStatusSummary />
        </div>
      </div>
    );
  }

  // ── Normal mode ──
  const hasTrouble = sleepingCount > 0 || distractedCount > 0;

  return (
    <div className="teacher-console">
      <ConsoleHeader title="教师控制台" subtitle={`${PHASE_LABELS[lessonPhase]} · ${PHASE_SUBTITLES[lessonPhase]}`} />
      <div className="console-body">
        <ClassStatusSummary />

        <div className="console-section">
          <div className="console-section__title">教师操作</div>
          <div className="action-grid">
            <button className="action-btn" onClick={() => {
              const c = selectCandidates('call-on');
              if (c.length > 0) callOnStudent(c[0].id);
            }}>
              <span className="action-btn__icon">🙋</span>
              点名回答
            </button>
            <button className="action-btn" onClick={askQuestion}>
              <span className="action-btn__icon">❓</span>
              全班提问
            </button>
            <button className="action-btn" onClick={() => discipline()}>
              <span className="action-btn__icon">⚠️</span>
              纪律提醒
            </button>
            <button className="action-btn" onClick={groupDiscussion}>
              <span className="action-btn__icon">👥</span>
              小组讨论
            </button>
          </div>
        </div>

        {hasTrouble && (
          <div className="console-section">
            <div className="console-section__title">需要关注</div>
            <div className="action-grid">
              {students.filter((s) => s.state === 'sleeping' || s.state === 'distracted').map((s) => (
                <button
                  key={s.id}
                  className="action-btn"
                  onClick={() => discipline(s.id)}
                >
                  <span className="action-btn__icon">{s.state === 'sleeping' ? '💤' : '💭'}</span>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview report button — always visible for demo */}
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <button className="action-btn" style={{ width: '100%', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}
            onClick={() => setShowReport(true)}>
            <span className="action-btn__icon" style={{ fontSize: 14 }}>📊</span>
            预览课程报告
          </button>
        </div>
      </div>
    </div>
  );
};

const ConsoleHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="console-header">
    <div className="console-header__title">{title}</div>
    <div className="console-header__subtitle">{subtitle}</div>
  </div>
);

export default TeacherConsole;
