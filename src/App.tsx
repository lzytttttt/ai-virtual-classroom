import { useClassroomStore } from './store/classroomStore'
import { ScriptEngine } from './components/ScriptEngine'
import { HeaderBar } from './components/layout/HeaderBar'
import { TimelineDock } from './components/layout/TimelineDock'
import { ClassroomCanvas } from './components/classroom/ClassroomCanvas'
import { TeacherConsole } from './components/teacher/TeacherConsole'
import { CourseReport } from './components/report/CourseReport'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import './styles/animations.css'
import './styles/layout.css'
import './styles/console.css'
import './styles/report.css'

function App() {
  useKeyboardShortcuts()
  const showReport = useClassroomStore((s) => s.showReport)
  const setShowReport = useClassroomStore((s) => s.setShowReport)

  return (
    <div className="app-shell">
      <ScriptEngine />
      <HeaderBar />
      <ClassroomCanvas />
      <TeacherConsole />
      <TimelineDock />
      {showReport && <CourseReport onClose={() => setShowReport(false)} />}
    </div>
  )
}

export default App
