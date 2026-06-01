import { useClassroomStore } from './store/classroomStore'
import { ScriptEngine } from './components/ScriptEngine'
import { ClassroomScene } from './components/classroom'
import { StudentSprite } from './components/student'
import { LessonTitle } from './components/LessonTitle'
import { NarratorOverlay } from './components/NarratorOverlay'
import { PhaseIndicator } from './components/PhaseIndicator'
import { TimelineControl } from './components/TimelineControl'
import { TeacherPanel } from './components/TeacherPanel'
import { ActionBar } from './components/ActionBar'
import { RehearsalPanel } from './components/RehearsalPanel'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useScriptPlayback } from './hooks/useScriptPlayback'
import './styles/animations.css'

function App() {
  useKeyboardShortcuts()
  const students = useClassroomStore((s) => s.students)
  const scriptNodes = useClassroomStore((s) => s.scriptNodes)
  const { elapsedMs } = useScriptPlayback()

  // Find active dialogue/speech for each student
  const getStudentBubble = (studentId: string) => {
    // Search script nodes near current time for dialogue
    for (let i = scriptNodes.length - 1; i >= 0; i--) {
      const node = scriptNodes[i]
      if (node.type === 'dialogue' && node.studentId === studentId) {
        // Show if within 4 seconds of current time
        if (Math.abs(node.timestamp - elapsedMs) < 4000 && node.timestamp <= elapsedMs) {
          return node.text
        }
      }
    }
    return undefined
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, var(--color-cream) 0%, #F0E8D8 100%)',
        fontFamily: 'var(--font-main)',
        overflow: 'hidden',
      }}
    >
      <ScriptEngine />

      {/* Lesson Title Header */}
      <div style={{ padding: '12px 16px 0 16px' }}>
        <LessonTitle />
      </div>

      {/* Main Classroom Scene */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <ClassroomScene>
          {students.map((student) => (
            <StudentSprite
              key={student.id}
              student={student}
              bubbleText={getStudentBubble(student.id)}
            />
          ))}
        </ClassroomScene>
        <NarratorOverlay />
      </div>

      {/* Bottom Controls */}
      <div
        style={{
          padding: '10px 16px 14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px 12px 0 0',
        }}
      >
        {/* Phase + Timeline row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PhaseIndicator />
          <div style={{ flex: 1 }}>
            <TimelineControl />
          </div>
        </div>

        {/* Teacher actions + Rehearsal panel row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <ActionBar />
            <TeacherPanel />
          </div>
          <RehearsalPanel />
        </div>
      </div>
    </div>
  )
}

export default App
