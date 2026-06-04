import React from 'react';
import type { StudentSlice, PersonalityType, StudentState } from '../../store/types';

const STATE_LABELS: Record<StudentState, string> = {
  'normal': '听讲中',
  'hand-raised': '举手',
  'answering': '回答中',
  'collective-reading': '朗读中',
  'distracted': '走神',
  'sleeping': '睡觉',
};

const STATE_STYLE_CLASS: Record<StudentState, string> = {
  'normal': '',
  'hand-raised': '',
  'answering': '',
  'collective-reading': '',
  'distracted': '--warning',
  'sleeping': '--error',
};

const PERSONALITY_TENDENCIES: Record<PersonalityType, string> = {
  '学霸': '积极深入',
  '内向': '害羞简短',
  '调皮': '可能偏题',
  '努力': '认真踏实',
  '文艺': '感性表达',
  '体育': '活力类比',
};

interface StudentHoverCardProps {
  student: StudentSlice;
  x: number;
  y: number;
}

export const StudentHoverCard: React.FC<StudentHoverCardProps> = ({ student, x, y }) => {
  // Position the card to the right and above the cursor, clamped to viewport
  const cardX = Math.min(x + 16, window.innerWidth - 200);
  const cardY = Math.max(y - 80, 10);

  return (
    <div
      className="student-hover-card"
      style={{ left: cardX, top: cardY }}
    >
      <div className="student-hover-card__name">{student.name}</div>
      <div className="student-hover-card__row">
        <span className="student-hover-card__badge student-hover-card__badge--personality">
          {student.personality}
        </span>
        <span className="student-hover-card__badge student-hover-card__badge--state">
          {PERSONALITY_TENDENCIES[student.personality]}
        </span>
      </div>
      <div className="student-hover-card__row">
        <span className={`student-hover-card__badge student-hover-card__badge--state${STATE_STYLE_CLASS[student.state]}`}>
          {STATE_LABELS[student.state]}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          来源: {student.stateSource === 'teacher' ? '教师' : student.stateSource === 'script' ? '脚本' : '初始'}
        </span>
      </div>
    </div>
  );
};

export default StudentHoverCard;
