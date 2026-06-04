import React from 'react';
import { useClassroomStore } from '../../store/classroomStore';
import { selectRaisedHandCount, selectSleepingCount, selectDistractedCount, selectAnsweringName } from '../../store/selectors';

export const ClassStatusSummary: React.FC = () => {
  const raisedHands = useClassroomStore(selectRaisedHandCount);
  const sleeping = useClassroomStore(selectSleepingCount);
  const distracted = useClassroomStore(selectDistractedCount);
  const answeringName = useClassroomStore(selectAnsweringName);

  return (
    <div className="class-status">
      <div className="class-status__item class-status__item--info">
        <div className="class-status__value">{raisedHands}</div>
        <div className="class-status__label">举手</div>
      </div>
      <div className="class-status__item class-status__item--warning">
        <div className="class-status__value">{distracted}</div>
        <div className="class-status__label">走神</div>
      </div>
      <div className="class-status__item class-status__item--error">
        <div className="class-status__value">{sleeping}</div>
        <div className="class-status__label">睡觉</div>
      </div>
      {answeringName && (
        <div className="class-status__item class-status__item--success" style={{ gridColumn: '1 / -1' }}>
          <div className="class-status__value" style={{ fontSize: 14 }}>{answeringName}</div>
          <div className="class-status__label">正在回答</div>
        </div>
      )}
    </div>
  );
};

export default ClassStatusSummary;
