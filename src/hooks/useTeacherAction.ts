import { useCallback } from 'react';
import { useClassroomStore } from '../store/classroomStore';
import type { PersonalityType } from '../store/types';

const COOLDOWN_MS = 5000;

const callOnResponses: Record<PersonalityType, string> = {
  '学霸': '这道题我会！应该从文章的写作背景和作者的生平来分析，王勃当时虽然年轻，但已经经历了仕途的挫折。',
  '内向': '嗯……我觉得……可能是想表达……对人生的感慨吧……',
  '调皮': '老师您说的是哪道题来着？哈哈，开玩笑的，我觉得这篇文章写得挺好的！',
  '努力': '老师，我认真预习过了。我认为这篇文章通过描写滕王阁的景色，抒发了作者怀才不遇的情感。',
  '文艺': '这篇文章如诗如画，仿佛让我看到了落霞孤鹜的壮美景象，感受到了千年前文人的心境。',
  '体育': '我觉得王勃这人挺有毅力的，就像运动员一样，遇到困难也不放弃！',
};

export function useTeacherAction() {
  const { students, scriptNodes, scriptPosition, dispatchTeacherAction, updateStudentState, setActiveInteraction } =
    useClassroomStore();

  const getCurrentPrompt = useCallback(() => {
    if (scriptNodes.length === 0) return null;
    // Find the current teacherPrompt node
    for (let i = scriptPosition; i < scriptNodes.length; i++) {
      if (scriptNodes[i].type === 'teacherPrompt') {
        return scriptNodes[i];
      }
    }
    // Check the node just before position
    for (let i = Math.max(0, scriptPosition - 1); i >= 0; i--) {
      if (scriptNodes[i].type === 'teacherPrompt') {
        return scriptNodes[i];
      }
    }
    return null;
  }, [scriptNodes, scriptPosition]);

  const isTeacherPromptActive = useCallback(() => {
    const node = getCurrentPrompt();
    return node !== null && node.type === 'teacherPrompt';
  }, [getCurrentPrompt]);

  // 点名 (call-on): select a student -> state='answering', stateSource='teacher'
  const callOnStudent = useCallback(
    (studentId: string) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return;

      const now = Date.now();
      updateStudentState(studentId, 'answering', 'teacher');

      // Set cooldown
      useClassroomStore.setState((s) => ({
        students: s.students.map((st) =>
          st.id === studentId ? { ...st, teacherCooldownUntil: now + COOLDOWN_MS } : st
        ),
      }));

      // Show personality-appropriate speech bubble
      const response = callOnResponses[student.personality] || '让我想想……';
      setActiveInteraction({
        type: 'call-on',
        targetStudentId: studentId,
        prompt: response,
        startedAt: now,
      });

      dispatchTeacherAction('call-on', studentId);
    },
    [students, updateStudentState, setActiveInteraction, dispatchTeacherAction]
  );

  // 提问 (ask-question): raise hands, teacher picks one
  const askQuestion = useCallback(() => {
    const now = Date.now();
    // 3-4 students raise hands randomly
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const raisers = shuffled.slice(0, 3 + Math.floor(Math.random() * 2));

    raisers.forEach((s) => {
      updateStudentState(s.id, 'hand-raised', 'script');
    });

    setActiveInteraction({
      type: 'ask-question',
      prompt: '同学们，请思考这个问题……谁来回答？',
      startedAt: now,
    });

    dispatchTeacherAction('ask-question');
  }, [students, updateStudentState, setActiveInteraction, dispatchTeacherAction]);

  // 纪律管理 (discipline): find sleeping/distracted -> snap to attention
  const discipline = useCallback(
    (targetStudentId?: string) => {
      const target =
        targetStudentId
          ? students.find((s) => s.id === targetStudentId)
          : students.find((s) => s.state === 'sleeping' || s.state === 'distracted');

      if (!target) return;

      const now = Date.now();
      updateStudentState(target.id, 'normal', 'teacher');

      // Set cooldown
      useClassroomStore.setState((s) => ({
        students: s.students.map((st) =>
          st.id === target.id ? { ...st, teacherCooldownUntil: now + COOLDOWN_MS } : st
        ),
      }));

      setActiveInteraction({
        type: 'discipline',
        targetStudentId: target.id,
        prompt: `${target.name}同学，请认真听讲！`,
        startedAt: now,
      });

      dispatchTeacherAction('discipline', target.id);
    },
    [students, updateStudentState, setActiveInteraction, dispatchTeacherAction]
  );

  // 小组讨论 (group-discussion): students turn to neighbors, speech bubbles in pairs
  const groupDiscussion = useCallback(() => {
    const now = Date.now();

    // Mark all students as in group discussion state
    students.forEach((s) => {
      updateStudentState(s.id, 'hand-raised', 'teacher');
    });

    // Set cooldown for all
    useClassroomStore.setState((s) => ({
      students: s.students.map((st) => ({
        ...st,
        teacherCooldownUntil: now + COOLDOWN_MS,
      })),
    }));

    setActiveInteraction({
      type: 'group-discussion',
      prompt: '小组讨论开始！请前后桌四人一组讨论。',
      startedAt: now,
    });

    dispatchTeacherAction('group-discussion');
  }, [students, updateStudentState, setActiveInteraction, dispatchTeacherAction]);

  // Resume script after teacher action
  const resumeScript = useCallback(() => {
    // Reset all students to normal
    students.forEach((s) => {
      if (s.stateSource === 'teacher') {
        updateStudentState(s.id, 'normal', 'idle');
      }
    });

    setActiveInteraction(null);
    useClassroomStore.setState({ isPaused: false });
  }, [students, updateStudentState, setActiveInteraction]);

  return {
    isTeacherPromptActive,
    getCurrentPrompt,
    callOnStudent,
    askQuestion,
    discipline,
    groupDiscussion,
    resumeScript,
  };
}
