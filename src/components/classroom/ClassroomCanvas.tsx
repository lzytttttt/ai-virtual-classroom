import { useState, useCallback } from 'react';
import { useClassroomStore } from '../../store/classroomStore';
import { useScriptPlayback } from '../../hooks/useScriptPlayback';
import { ClassroomScene } from './ClassroomScene';
import { StudentSprite } from '../student/StudentSprite';
import { StudentHoverCard } from '../student/StudentHoverCard';
import { NarratorOverlay } from '../NarratorOverlay';
import type { StudentSlice } from '../../store/types';

export function ClassroomCanvas() {
  const students = useClassroomStore((s) => s.students);
  const scriptNodes = useClassroomStore((s) => s.scriptNodes);
  const interaction = useClassroomStore((s) => s.interaction);
  const { elapsedMs } = useScriptPlayback();
  const [hoveredStudent, setHoveredStudent] = useState<StudentSlice | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const getStudentBubble = useCallback((studentId: string): string | undefined => {
    for (let i = scriptNodes.length - 1; i >= 0; i--) {
      const node = scriptNodes[i];
      if (node.type === 'dialogue' && node.studentId === studentId) {
        if (Math.abs(node.timestamp - elapsedMs) < 4000 && node.timestamp <= elapsedMs) {
          return node.text;
        }
      }
    }
    return undefined;
  }, [scriptNodes, elapsedMs]);

  const selectedStudentId = interaction?.targetStudentId;

  const handleStudentHover = useCallback((student: StudentSlice, e: React.MouseEvent) => {
    setHoveredStudent(student);
    const rect = (e.currentTarget as HTMLElement).closest('.classroom-canvas')?.getBoundingClientRect();
    if (rect) {
      setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  const handleStudentLeave = useCallback(() => {
    setHoveredStudent(null);
  }, []);

  return (
    <div className="classroom-canvas">
      <ClassroomScene>
        {students.map((student) => (
          <StudentSprite
            key={student.id}
            student={student}
            bubbleText={getStudentBubble(student.id)}
            isSelected={student.id === selectedStudentId}
            onMouseEnter={(e) => handleStudentHover(student, e)}
            onMouseLeave={handleStudentLeave}
          />
        ))}
      </ClassroomScene>

      <NarratorOverlay />

      {hoveredStudent && (
        <StudentHoverCard student={hoveredStudent} x={hoverPos.x} y={hoverPos.y} />
      )}
    </div>
  );
}
