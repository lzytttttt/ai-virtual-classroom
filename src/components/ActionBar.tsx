import { useClassroomStore } from '../store/classroomStore';
import { useTeacherAction } from '../hooks/useTeacherAction';
import type { TeacherAction } from '../store/types';

const actionLabels: Record<TeacherAction, string> = {
  'call-on': '点名回答',
  'ask-question': '提问',
  'discipline': '纪律管理',
  'group-discussion': '小组讨论',
};

export function ActionBar() {
  const scriptNodes = useClassroomStore((s) => s.scriptNodes);
  const scriptPosition = useClassroomStore((s) => s.scriptPosition);
  const activeInteraction = useClassroomStore((s) => s.activeInteraction);
  const students = useClassroomStore((s) => s.students);
  const { callOnStudent, askQuestion, discipline, groupDiscussion, resumeScript } = useTeacherAction();

  // Find current teacherPrompt node
  const currentNode = (() => {
    // Look backwards from current position to find the active prompt
    for (let i = Math.max(0, scriptPosition - 1); i >= Math.max(0, scriptPosition - 3); i--) {
      if (scriptNodes[i]?.type === 'teacherPrompt') return scriptNodes[i];
    }
    // Look forward
    for (let i = scriptPosition; i < Math.min(scriptNodes.length, scriptPosition + 3); i++) {
      if (scriptNodes[i]?.type === 'teacherPrompt') return scriptNodes[i];
    }
    return null;
  })();

  if (!currentNode || currentNode.type !== 'teacherPrompt') return null;

  const prompt = currentNode;

  // If there's an active interaction, show it
  if (activeInteraction) {
    return (
      <div
        style={{
          padding: '16px',
          background: 'rgba(84, 160, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          color: '#fff',
          fontFamily: 'var(--font-main)',
        }}
      >
        <div style={{ fontSize: '14px', marginBottom: '12px' }}>
          <strong>{actionLabels[activeInteraction.type]}</strong>: {activeInteraction.prompt}
        </div>
        {activeInteraction.targetStudentId && (
          <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '12px' }}>
            目标: {students.find((s) => s.id === activeInteraction.targetStudentId)?.name}
          </div>
        )}
        <button
          onClick={resumeScript}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            background: '#fff',
            color: 'var(--color-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          继续 ▶
        </button>
      </div>
    );
  }

  // Show contextual action options
  const renderOptions = () => {
    switch (prompt.action) {
      case 'call-on':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', marginBottom: '4px' }}>选择回答的同学:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => callOnStudent(s.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '2px solid #fff',
                    background: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    opacity: s.stateSource === 'teacher' ? 0.5 : 1,
                  }}
                  disabled={s.stateSource === 'teacher'}
                >
                  {s.name} ({s.personality})
                </button>
              ))}
            </div>
          </div>
        );

      case 'ask-question':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px' }}>{prompt.prompt}</div>
            <button
              onClick={askQuestion}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: '2px solid #fff',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                alignSelf: 'flex-start',
              }}
            >
              请同学回答
            </button>
          </div>
        );

      case 'discipline': {
        const troublemakers = students.filter((s) => s.state === 'sleeping' || s.state === 'distracted');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', marginBottom: '4px' }}>
              {troublemakers.length > 0 ? '需要管理的同学:' : '当前没有违纪同学'}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {troublemakers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => discipline(s.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '2px solid #fff',
                    background: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {s.name} ({s.state === 'sleeping' ? '睡觉' : '走神'})
                </button>
              ))}
            </div>
            {troublemakers.length === 0 && (
              <button
                onClick={() => discipline()}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: '2px solid #fff',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  alignSelf: 'flex-start',
                }}
              >
                提醒全班
              </button>
            )}
          </div>
        );
      }

      case 'group-discussion':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px' }}>{prompt.prompt}</div>
            <button
              onClick={groupDiscussion}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: '2px solid #fff',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                alignSelf: 'flex-start',
              }}
            >
              开始讨论
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        color: '#fff',
        fontFamily: 'var(--font-main)',
      }}
    >
      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
        教师操作 — {actionLabels[prompt.action]}
      </div>
      {renderOptions()}
    </div>
  );
}
