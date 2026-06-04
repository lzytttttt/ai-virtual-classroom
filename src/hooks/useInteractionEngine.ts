import { useCallback } from 'react';
import { useClassroomStore } from '../store/classroomStore';
import type { PersonalityType, TeacherActionType, StudentSlice } from '../store/types';

const CALL_ON_RESPONSES: Record<PersonalityType, string> = {
  '学霸': '这道题我会！应该从文章的写作背景和作者的生平来分析。王勃当时虽然年轻，但已经历了仕途的挫折，所以文中"穷且益坚，不坠青云之志"体现了他对理想的执着追求。',
  '内向': '嗯……我觉得……"落霞与孤鹜齐飞"可能不只是写景，还表达了……一种孤独但美好的感觉……',
  '调皮': '老师您说的是哪道题来着？哈哈开玩笑的！我觉得王勃这文章写得确实挺有气势的，尤其是描写景色那几句。',
  '努力': '老师，我认真预习过了。我认为这篇文章通过描写滕王阁的壮丽景色，抒发了作者怀才不遇的情感，同时也表达了积极向上的人生态度。',
  '文艺': '这篇文章如诗如画，仿佛让我看到了落霞与孤鹜齐飞的壮美景象。千年前文人的心境穿越时空，仍然能触动我们的心灵。',
  '体育': '我觉得王勃这人挺有毅力的！就像运动员一样，遇到困难也不放弃。"穷且益坚"这话放到球场上也一样管用！',
};

const DISCIPLINE_RESPONSES: Record<PersonalityType, string> = {
  '学霸': '好的老师，我继续认真听讲。',
  '内向': '对不起老师……我不走神了……',
  '调皮': '嘿嘿，老师对不起，我下次注意！',
  '努力': '抱歉老师，我会更加集中注意力的。',
  '文艺': '老师对不起，我刚刚在想这篇文章的意境……',
  '体育': '哦！好的老师！我精神了！',
};

const PERSONALITY_TENDENCIES: Record<PersonalityType, string> = {
  '学霸': '积极深入',
  '内向': '害羞简短',
  '调皮': '可能偏题',
  '努力': '认真踏实',
  '文艺': '感性表达',
  '体育': '活力类比',
};

const STATE_LABELS: Record<string, string> = {
  'normal': '听讲中',
  'hand-raised': '举手',
  'answering': '回答中',
  'collective-reading': '朗读中',
  'distracted': '走神',
  'sleeping': '睡觉',
};

export function useInteractionEngine() {
  const store = useClassroomStore;

  const selectCandidates = useCallback((actionType: TeacherActionType): StudentSlice[] => {
    const students = store.getState().students;
    switch (actionType) {
      case 'call-on':
      case 'ask-question':
        return students.filter((s) => s.state === 'normal' || s.state === 'hand-raised');
      case 'discipline':
        return students.filter((s) => s.state === 'sleeping' || s.state === 'distracted');
      case 'group-discussion':
        return students;
      default:
        return students;
    }
  }, []);

  const callOnStudent = useCallback((studentId: string) => {
    const s = store.getState();
    const student = s.students.find((st) => st.id === studentId);
    if (!student) return;

    const response = CALL_ON_RESPONSES[student.personality];
    const tendency = PERSONALITY_TENDENCIES[student.personality];

    s.updateStudentState(studentId, 'answering', 'teacher');

    s.resolveInteraction(
      `${student.name}（${student.personality}·${tendency}）：\n"${response}"`,
      true,
    );

    s.addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      elapsedMs: s.elapsedMs,
      actionType: 'call-on',
      targetStudentId: studentId,
      targetStudentName: student.name,
      feedbackText: response,
      effect: `${student.name}给出回答，课堂参与度提升`,
      dialogueText: `老师：请${student.name}回答\n${student.name}："${response}"`,
    });
  }, []);

  const askQuestion = useCallback(() => {
    const s = store.getState();
    const candidates = s.students.filter((st) => st.state === 'normal' || st.state === 'hand-raised');

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const raisers = shuffled.slice(0, Math.min(4, shuffled.length));
    const raiserIds = raisers.map((r) => r.id);

    for (const r of raisers) {
      s.updateStudentState(r.id, 'hand-raised', 'teacher');
    }

    s.beginInteraction('selecting-student', {
      actionType: 'ask-question',
      prompt: '全班提问：请选择一位举手的学生回答',
      candidateStudentIds: raiserIds,
      source: 'teacher',
    });
    s.addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      elapsedMs: s.elapsedMs,
      actionType: 'ask-question',
      targetStudentId: null,
      targetStudentName: '全班',
      feedbackText: '提出全班问题',
      effect: `${raisers.length}名学生举手`,
      dialogueText: `老师：全班提问\n（${raisers.map(r => r.name).join('、')}举手回答）`,
    });
  }, []);

  const discipline = useCallback((targetStudentId?: string) => {
    const s = store.getState();
    let target: StudentSlice | undefined;

    if (targetStudentId) {
      target = s.students.find((st) => st.id === targetStudentId);
    } else {
      target = s.students.find((st) => st.state === 'sleeping') ??
               s.students.find((st) => st.state === 'distracted');
    }

    if (!target) return;

    const response = DISCIPLINE_RESPONSES[target.personality];
    const prevState = STATE_LABELS[target.state] ?? target.state;

    s.updateStudentState(target.id, 'normal', 'teacher');
    s.resolveInteraction(
      `提醒${target.name}（${prevState}→认真听讲）\n${target.name}："${response}"`,
      true,
    );
    s.addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      elapsedMs: s.elapsedMs,
      actionType: 'discipline',
      targetStudentId: target.id,
      targetStudentName: target.name,
      feedbackText: response,
      effect: `${target.name}从${prevState}恢复为认真听讲`,
      dialogueText: `老师：请${target.name}认真听讲\n${target.name}："${response}"`,
    });
  }, []);

  const groupDiscussion = useCallback(() => {
    const s = store.getState();

    for (const st of s.students) {
      s.updateStudentState(st.id, 'collective-reading', 'teacher');
    }

    const pairs = [
      [s.students[0], s.students[3]],
      [s.students[1], s.students[4]],
      [s.students[2], s.students[5]],
    ];

    const summaries = pairs.map((pair) =>
      `${pair[0].name}和${pair[1].name}：讨论了文章的意境与写作手法`,
    );

    s.resolveInteraction(
      `小组讨论开始（3组）\n\n${summaries.join('\n')}`,
      true,
    );
    s.addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      elapsedMs: s.elapsedMs,
      actionType: 'group-discussion',
      targetStudentId: null,
      targetStudentName: '全班',
      feedbackText: '小组讨论',
      effect: '全班分为3组进行讨论，课堂参与度提升',
      dialogueText: `老师：小组讨论\n${summaries.join('\n')}`,
    });
  }, []);

  const continueScript = useCallback(() => {
    const s = store.getState();
    const answering = s.students.find((st) => st.state === 'answering');
    if (answering) {
      s.updateStudentState(answering.id, 'normal', 'teacher');
    }
    for (const st of s.students) {
      if (st.state === 'hand-raised') {
        s.updateStudentState(st.id, 'normal', 'teacher');
      }
    }
    s.clearInteraction();
    s.setPaused(false);
  }, []);

  const praiseStudent = useCallback((studentId: string) => {
    const s = store.getState();
    const student = s.students.find((st) => st.id === studentId);
    if (!student) return;

    s.resolveInteraction(
      `老师表扬了${student.name}的回答。\n${student.name}露出了开心的笑容，其他同学也受到鼓舞。`,
      true,
    );

    s.addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      elapsedMs: s.elapsedMs,
      actionType: 'continue',
      targetStudentId: studentId,
      targetStudentName: student.name,
      feedbackText: '表扬',
      effect: `${student.name}受到表扬，全班积极性提升`,
      dialogueText: `老师：${student.name}回答得很好！\n${student.name}：（露出开心的笑容）`,
    });
  }, []);

  const followUpQuestion = useCallback((studentId: string) => {
    const s = store.getState();
    const student = s.students.find((st) => st.id === studentId);
    if (!student) return;

    const followUp: Record<PersonalityType, string> = {
      '学霸': '你能进一步分析一下"落霞与孤鹜齐飞"的对仗手法吗？——好的老师，这里用了"落霞"对"秋水"，"孤鹜"对"长天"，非常工整。',
      '内向': '你觉得这段话有什么深层含义吗？——嗯……我觉得……可能是想表达人生的无常和美好吧……',
      '调皮': '那你能不能用自己的话总结一下？——就是说景色很美，但人生苦短，要珍惜当下！大概这个意思。',
      '努力': '你能举一个类似的例子吗？——老师，我觉得范仲淹的"先天下之忧而忧"也有类似的积极人生态度。',
      '文艺': '如果你来写，你会怎么描绘这样的景色？——我可能会写"晚霞如绸缎般铺展，孤鸟的身影融入天际的金色"。',
      '体育': '你能用一个生活中的例子来说明吗？——就像比赛最后一秒的绝杀球，虽然孤注一掷，但那种拼搏精神是最美的！',
    };

    s.updateStudentState(studentId, 'answering', 'teacher');
    s.resolveInteraction(
      `追问${student.name}：\n${student.name}："${followUp[student.personality]}"`,
      true,
    );
    s.addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      elapsedMs: s.elapsedMs,
      actionType: 'continue',
      targetStudentId: studentId,
      targetStudentName: student.name,
      feedbackText: '追问',
      effect: `${student.name}深入回答，思维拓展`,
      dialogueText: `老师追问${student.name}：${followUp[student.personality].split('——')[0]}\n${student.name}："${followUp[student.personality].split('——')[1]}"`,
    });
  }, []);

  return {
    callOnStudent,
    askQuestion,
    discipline,
    groupDiscussion,
    continueScript,
    praiseStudent,
    followUpQuestion,
    selectCandidates,
  };
}
