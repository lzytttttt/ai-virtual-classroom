import React, { useState } from 'react';
import { useClassroomStore } from '../../store/classroomStore';
import type { ActivityLogEntry, TeacherActionType } from '../../store/types';

const ACTION_LABELS: Record<TeacherActionType, string> = {
  'call-on': '点名',
  'ask-question': '提问',
  'discipline': '纪律',
  'group-discussion': '讨论',
  'continue': '继续',
  'skip': '跳过',
};

function formatLogTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export const ReflectionPanel: React.FC = () => {
  const activityLog = useClassroomStore((s) => s.activityLog);
  const [expanded, setExpanded] = useState(false);

  if (activityLog.length === 0) return null;

  return (
    <div className="reflection-panel">
      <div className="reflection-toggle" onClick={() => setExpanded(!expanded)}>
        <span>📋 训练记录 ({activityLog.length})</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="reflection-toggle__count">{activityLog.length}</span>
          <span>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="reflection-list">
          {activityLog.map((entry) => (
            <ReflectionEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};

const ReflectionEntry: React.FC<{ entry: ActivityLogEntry }> = ({ entry }) => {
  const actionLabel = ACTION_LABELS[entry.actionType] ?? entry.actionType;

  return (
    <div className="reflection-entry">
      <span className="reflection-entry__time">{formatLogTime(entry.elapsedMs)}</span>
      <span className="reflection-entry__text">
        <span className="reflection-entry__action">{actionLabel}</span>
        {entry.targetStudentName && (
          <> <span className="reflection-entry__student">{entry.targetStudentName}</span></>
        )}
        {entry.effect && <> — <span className="reflection-entry__effect">{entry.effect}</span></>}
      </span>
    </div>
  );
};

export default ReflectionPanel;
