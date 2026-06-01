import { useClassroomStore } from '../store/classroomStore';
import { useTeacherAction } from '../hooks/useTeacherAction';

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.15)',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease',
  fontFamily: 'var(--font-main)',
};

const enabledStyle: React.CSSProperties = {
  ...buttonStyle,
  background: 'var(--color-secondary)',
  color: '#fff',
};

const disabledStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#555',
  color: '#999',
  cursor: 'not-allowed',
};

export function TeacherPanel() {
  const activeInteraction = useClassroomStore((s) => s.activeInteraction);
  const { isTeacherPromptActive, callOnStudent, askQuestion, discipline, groupDiscussion, resumeScript } =
    useTeacherAction();

  const isActive = isTeacherPromptActive();

  // If there's an active interaction, show resume button
  if (activeInteraction) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          fontFamily: 'var(--font-main)',
        }}
      >
        <div style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>
          <strong>教师互动中:</strong> {activeInteraction.prompt}
        </div>
        <button
          onClick={resumeScript}
          style={{
            ...enabledStyle,
            background: 'var(--color-accent-green)',
          }}
        >
          继续课程 ▶
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        fontFamily: 'var(--font-main)',
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={() => isActive && callOnStudent('student-1')}
        disabled={!isActive}
        style={isActive ? enabledStyle : disabledStyle}
        title="选择一位同学回答问题"
      >
        点名
      </button>
      <button
        onClick={() => isActive && askQuestion()}
        disabled={!isActive}
        style={isActive ? enabledStyle : disabledStyle}
        title="向全班提问"
      >
        提问
      </button>
      <button
        onClick={() => isActive && discipline()}
        disabled={!isActive}
        style={isActive ? { ...enabledStyle, background: 'var(--color-accent-coral)' } : disabledStyle}
        title="管理课堂纪律"
      >
        纪律管理
      </button>
      <button
        onClick={() => isActive && groupDiscussion()}
        disabled={!isActive}
        style={isActive ? { ...enabledStyle, background: 'var(--color-primary)' } : disabledStyle}
        title="开始小组讨论"
      >
        小组讨论
      </button>
    </div>
  );
}
