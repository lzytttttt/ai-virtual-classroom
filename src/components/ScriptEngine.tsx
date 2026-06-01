import { useEffect } from 'react';
import { useClassroomStore } from '../store/classroomStore';
import { lessonScript } from '../data/lessonScript';

export function ScriptEngine() {
  const setScriptNodes = useClassroomStore((s) => s.setScriptNodes);

  // Load script on mount
  useEffect(() => {
    setScriptNodes(lessonScript);
  }, [setScriptNodes]);

  return null; // Headless component — logic only
}
