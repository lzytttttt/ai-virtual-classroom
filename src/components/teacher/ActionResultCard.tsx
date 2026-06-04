import React from 'react';
import type { ActiveInteraction, StudentSlice } from '../../store/types';

interface ActionResultCardProps {
  interaction: ActiveInteraction;
  targetStudent?: StudentSlice;
  onContinue: () => void;
  onPraise?: () => void;
  onFollowUp?: () => void;
}

export const ActionResultCard: React.FC<ActionResultCardProps> = ({
  interaction,
  targetStudent,
  onContinue,
  onPraise,
  onFollowUp,
}) => {
  const cardClass = (() => {
    if (interaction.actionType === 'discipline') return 'feedback-card--discipline';
    if (interaction.actionType === 'group-discussion') return 'feedback-card--group';
    return 'feedback-card--answer';
  })();

  const title = (() => {
    switch (interaction.actionType) {
      case 'call-on': return `📝 点名回答结果`;
      case 'ask-question': return `❓ 提问结果`;
      case 'discipline': return `⚠️ 纪律提醒结果`;
      case 'group-discussion': return `👥 小组讨论结果`;
      default: return `📋 操作结果`;
    }
  })();

  return (
    <div className={`feedback-card ${cardClass}`}>
      <div className="feedback-card__title">{title}</div>

      {interaction.feedbackText && (
        <div className="feedback-card__text" style={{ whiteSpace: 'pre-line' }}>
          {interaction.feedbackText}
        </div>
      )}

      <div className="feedback-card__effect">
        ✨ 课堂状态已更新
      </div>

      <div className="feedback-card__actions">
        {targetStudent && onPraise && (
          <button className="feedback-card__action-btn feedback-card__action-btn--followup" onClick={onPraise}>
            👍 表扬
          </button>
        )}
        {targetStudent && onFollowUp && (
          <button className="feedback-card__action-btn feedback-card__action-btn--followup" onClick={onFollowUp}>
            🔍 追问
          </button>
        )}
        <button className="feedback-card__action-btn feedback-card__action-btn--continue" onClick={onContinue}>
          ▶ 继续课程
          <span className="kbd" style={{ marginLeft: 6 }}>Enter</span>
        </button>
      </div>
    </div>
  );
};

export default ActionResultCard;
