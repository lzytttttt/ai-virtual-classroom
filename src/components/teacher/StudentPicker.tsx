import React from 'react';
import type { StudentSlice, PersonalityType, StudentState } from '../../store/types';

const PERSONALITY_TENDENCIES: Record<PersonalityType, string> = {
  '学霸': '积极深入',
  '内向': '害羞简短',
  '调皮': '可能偏题',
  '努力': '认真踏实',
  '文艺': '感性表达',
  '体育': '活力类比',
};

const STATE_LABELS: Record<StudentState, string> = {
  'normal': '听讲中',
  'hand-raised': '举手',
  'answering': '回答中',
  'collective-reading': '朗读中',
  'distracted': '走神',
  'sleeping': '睡觉',
};

const AVATAR_COLORS: Record<PersonalityType, string> = {
  '学霸': 'var(--color-secondary)',
  '内向': 'var(--color-accent-purple)',
  '调皮': 'var(--color-warning)',
  '努力': 'var(--color-accent-green)',
  '文艺': '#E88DB8',
  '体育': 'var(--color-primary)',
};

interface StudentPickerProps {
  students: StudentSlice[];
  onSelect: (studentId: string) => void;
  actionLabel?: string;
}

export const StudentPicker: React.FC<StudentPickerProps> = ({ students, onSelect, actionLabel = '选择' }) => {
  if (students.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '8px 0' }}>暂无可选学生</div>;
  }

  return (
    <div className="student-picker">
      {students.map((student) => (
        <div
          key={student.id}
          className="student-card"
          onClick={() => onSelect(student.id)}
        >
          <div
            className="student-card__avatar"
            style={{ background: AVATAR_COLORS[student.personality] }}
          >
            {student.name.charAt(student.name.length - 1)}
          </div>
          <div className="student-card__info">
            <div className="student-card__name">{student.name}</div>
            <div className="student-card__meta">
              <span className="student-card__personality">{student.personality}</span>
              <span className="student-card__state">{STATE_LABELS[student.state]}</span>
              <span className="student-card__tendency">{PERSONALITY_TENDENCIES[student.personality]}</span>
            </div>
          </div>
          <button className="student-card__action" onClick={(e) => { e.stopPropagation(); onSelect(student.id); }}>
            {actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
};

export default StudentPicker;
