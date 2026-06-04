import React, { useState } from 'react';
import { useReportData } from '../../hooks/useReportData';
import type { StudentReport, PhaseStat, ReportData } from '../../hooks/useReportData';
import type { PersonalityType } from '../../store/types';

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function fmtPct(v: number): string {
  return `${Math.round(v)}%`;
}

const PERSONALITY_COLORS: Record<PersonalityType, string> = {
  '学霸': '#5B7FFF',
  '内向': '#9B6DD7',
  '调皮': '#F5A623',
  '努力': '#4CAF7D',
  '文艺': '#E88DB8',
  '体育': '#E8853D',
};

const ACTION_ICONS: Record<string, string> = {
  'call-on': '🙋',
  'ask-question': '❓',
  'discipline': '⚠️',
  'group-discussion': '👥',
  'continue': '▶',
  'skip': '⏭',
};

// ── Radar Chart ──────────────────────────────────────────
const RadarChart: React.FC<{ scores: { label: string; value: number }[]; size?: number }> = ({ scores, size = 240 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 44;
  const n = scores.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const rr = (value / 100) * r;
    return { x: cx + rr * Math.cos(angle), y: cy + rr * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPath = scores.map((s, i) => {
    const p = getPoint(i, s.value);
    return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
  }).join(' ') + 'Z';

  // Outer polygon path for clipping
  const outerPath = scores.map((_, i) => {
    const p = getPoint(i, 100);
    return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
  }).join(' ') + 'Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B7FFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5B7FFF" stopOpacity="0.05" />
        </radialGradient>
        <clipPath id="radarClip">
          <path d={outerPath} />
        </clipPath>
      </defs>

      {/* Background glow */}
      <circle cx={cx} cy={cy} r={r} fill="url(#radarGlow)" />

      {/* Grid rings */}
      {gridLevels.map((level) => {
        const path = scores.map((_, i) => {
          const p = getPoint(i, level * 100);
          return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
        }).join(' ') + 'Z';
        return (
          <g key={level}>
            <path d={path} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
            <text
              x={cx + 4} y={cy - (level * r) + 3}
              fontSize="8" fill="rgba(0,0,0,0.2)" fontFamily="var(--font-mono)"
            >
              {Math.round(level * 100)}
            </text>
          </g>
        );
      })}

      {/* Axes */}
      {scores.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />;
      })}

      {/* Data area */}
      <path d={dataPath} fill="rgba(91,127,255,0.18)" stroke="#5B7FFF" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Data points with glow */}
      {scores.map((s, i) => {
        const p = getPoint(i, s.value);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="7" fill="rgba(91,127,255,0.2)" />
            <circle cx={p.x} cy={p.y} r="4" fill="#5B7FFF" stroke="#fff" strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Labels */}
      {scores.map((s, i) => {
        const p = getPoint(i, 120);
        const anchor = p.x < cx - 10 ? 'end' : p.x > cx + 10 ? 'start' : 'middle';
        return (
          <g key={`l${i}`}>
            <text x={p.x} y={p.y - 6} textAnchor={anchor} dominantBaseline="middle"
              fontSize="11" fontWeight="600" fill="#444" fontFamily="var(--font-main)">
              {s.label}
            </text>
            <text x={p.x} y={p.y + 8} textAnchor={anchor} dominantBaseline="middle"
              fontSize="13" fontWeight="800" fill="#5B7FFF" fontFamily="var(--font-mono)">
              {s.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Engagement Bar Chart ─────────────────────────────────
const EngagementBars: React.FC<{ students: StudentReport[] }> = ({ students }) => {
  const sorted = [...students].sort((a, b) => b.engagementScore - a.engagementScore);
  const barH = 32;
  const gap = 8;
  const labelW = 72;
  const chartW = 400;
  const totalH = sorted.length * (barH + gap) + 10;

  return (
    <svg width={labelW + chartW + 100} height={totalH} style={{ display: 'block' }}>
      <defs>
        {sorted.map((r) => (
          <linearGradient key={`g-${r.student.id}`} id={`bar-${r.student.id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={PERSONALITY_COLORS[r.student.personality]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={PERSONALITY_COLORS[r.student.personality]} stopOpacity="0.5" />
          </linearGradient>
        ))}
      </defs>
      {sorted.map((r, i) => {
        const y = i * (barH + gap) + 5;
        const barW = (r.engagementScore / 100) * chartW;
        const color = PERSONALITY_COLORS[r.student.personality];
        const rank = i + 1;
        return (
          <g key={r.student.id}>
            {/* Rank */}
            <text x={8} y={y + barH / 2} dominantBaseline="middle"
              fontSize="11" fontWeight="800" fill={rank <= 2 ? color : '#ccc'} fontFamily="var(--font-mono)">
              #{rank}
            </text>
            {/* Name */}
            <text x={labelW - 8} y={y + barH / 2} textAnchor="end" dominantBaseline="middle"
              fontSize="12" fontWeight="600" fill="#333" fontFamily="var(--font-main)">
              {r.student.name}
            </text>
            {/* Bar bg */}
            <rect x={labelW} y={y} width={chartW} height={barH} rx="6" fill="#f5f5f5" />
            {/* Bar fill with gradient */}
            <rect x={labelW} y={y} width={barW} height={barH} rx="6" fill={`url(#bar-${r.student.id})`} />
            {/* Score */}
            <text x={labelW + barW + 10} y={y + barH / 2} dominantBaseline="middle"
              fontSize="13" fontWeight="800" fill={color} fontFamily="var(--font-mono)">
              {r.engagementScore}
            </text>
            {/* Personality */}
            <rect x={labelW + barW + 48} y={y + 6} width={38} height={20} rx="10"
              fill={color} opacity="0.1" />
            <text x={labelW + barW + 67} y={y + barH / 2} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fontWeight="600" fill={color} fontFamily="var(--font-main)">
              {r.student.personality}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Phase Timeline ───────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  intro: '#5B7FFF',
  teaching: '#E8853D',
  interaction: '#4CAF7D',
  summary: '#9B6DD7',
};

const PhaseTimeline: React.FC<{ phases: PhaseStat[]; totalMs: number }> = ({ phases, totalMs }) => {
  const width = 480;
  const barH = 40;

  return (
    <div>
      <svg width={width} height={barH + 8} style={{ display: 'block' }}>
        <defs>
          {phases.map((p) => (
            <linearGradient key={`pg-${p.phase}`} id={`phase-${p.phase}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PHASE_COLORS[p.phase] ?? '#999'} stopOpacity="0.95" />
              <stop offset="100%" stopColor={PHASE_COLORS[p.phase] ?? '#999'} stopOpacity="0.7" />
            </linearGradient>
          ))}
        </defs>
        {phases.map((p, i) => {
          const x = phases.slice(0, i).reduce((s, pp) => s + (pp.durationMs / totalMs) * width, 0);
          const w = Math.max((p.durationMs / totalMs) * width, 1);
          return (
            <g key={p.phase}>
              <rect x={x} y={0} width={w} height={barH} rx={i === 0 ? '6 0 0 6' : i === phases.length - 1 ? '0 6 6 0' : '0'}
                fill={`url(#phase-${p.phase})`} />
              {w > 60 && (
                <>
                  <text x={x + w / 2} y={barH / 2 - 5} textAnchor="middle" dominantBaseline="middle"
                    fontSize="12" fontWeight="700" fill="#fff" fontFamily="var(--font-main)">
                    {p.label}
                  </text>
                  <text x={x + w / 2} y={barH / 2 + 10} textAnchor="middle" dominantBaseline="middle"
                    fontSize="9" fill="rgba(255,255,255,0.75)" fontFamily="var(--font-mono)">
                    {fmtTime(p.durationMs)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      {/* Legend below */}
      <div className="report-phase-legend">
        {phases.map((p) => (
          <div key={p.phase} className="report-phase-legend__item">
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: PHASE_COLORS[p.phase] ?? '#999' }} />
            <span className="report-phase-legend__label">{p.label}</span>
            <span className="report-phase-legend__val">{fmtTime(p.durationMs)}</span>
            <span className="report-phase-legend__val">· {p.interactionCount}次互动</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Score Card ───────────────────────────────────────────
const ScoreCard: React.FC<{
  label: string; value: string | number; sub?: string; color?: string; icon?: string; desc?: string;
}> = ({ label, value, sub, color = 'var(--color-secondary)', icon, desc }) => (
  <div className="report-score-card">
    <div className="report-score-card__icon">{icon}</div>
    <div className="report-score-card__value" style={{ color }}>{value}</div>
    <div className="report-score-card__label">{label}</div>
    {sub && <div className="report-score-card__sub">{sub}</div>}
    {desc && <div className="report-score-card__desc">{desc}</div>}
  </div>
);

// ── Student Detail Card ──────────────────────────────────
const StudentDetailCard: React.FC<{ report: StudentReport; rank: number }> = ({ report, rank }) => {
  const [expanded, setExpanded] = useState(false);
  const { student } = report;
  const color = PERSONALITY_COLORS[student.personality];

  const gradeLabel = report.engagementScore >= 80 ? '优秀' :
                     report.engagementScore >= 60 ? '良好' :
                     report.engagementScore >= 40 ? '一般' : '需关注';
  const gradeColor = report.engagementScore >= 80 ? 'var(--color-success)' :
                     report.engagementScore >= 60 ? 'var(--color-secondary)' :
                     report.engagementScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className="report-student-card" onClick={() => setExpanded(!expanded)}>
      <div className="report-student-card__header">
        <div className="report-student-card__avatar" style={{ background: color }}>
          {student.name.charAt(student.name.length - 1)}
        </div>
        <div className="report-student-card__info">
          <div className="report-student-card__name">
            <span style={{ color: '#bbb', fontSize: 11, fontWeight: 600, marginRight: 4 }}>#{rank}</span>
            {student.name}
          </div>
          <div className="report-student-card__meta">
            <span className="report-student-card__badge" style={{ background: `${color}18`, color }}>
              {student.personality}
            </span>
            <span className="report-student-card__badge" style={{ background: `${gradeColor}18`, color: gradeColor }}>
              {gradeLabel}
            </span>
          </div>
        </div>
        <div className="report-student-card__stats">
          <div className="report-student-card__stat">
            <span className="report-student-card__stat-value">{report.callCount}</span>
            <span className="report-student-card__stat-label">回答</span>
          </div>
          <div className="report-student-card__stat">
            <span className="report-student-card__stat-value" style={{ color: report.disciplineCount > 0 ? 'var(--color-error)' : 'inherit' }}>
              {report.disciplineCount}
            </span>
            <span className="report-student-card__stat-label">提醒</span>
          </div>
          <div className="report-student-card__stat">
            <span className="report-student-card__stat-value" style={{ color }}>{report.engagementScore}</span>
            <span className="report-student-card__stat-label">参与度</span>
          </div>
        </div>
        <span className="report-student-card__toggle">{expanded ? '▲' : '▼'}</span>
      </div>

      <div className="report-student-card__bar-wrap">
        <div className="report-student-card__bar" style={{ width: `${report.engagementScore}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      </div>

      <div className="report-student-card__summary">{report.summary}</div>

      {expanded && report.responses.length > 0 && (
        <div className="report-student-card__responses">
          <div className="report-student-card__responses-title">课堂回答记录 ({report.responses.length}次)</div>
          {report.responses.map((resp, i) => (
            <div key={i} className="report-student-card__response">
              <span className="report-student-card__response-idx">#{i + 1}</span>
              <span className="report-student-card__response-text">"{resp}"</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Activity Timeline ────────────────────────────────────
const ActivityTimeline: React.FC<{ log: ReportData['activityLog'] }> = ({ log }) => (
  <div className="report-timeline">
    {log.map((entry, idx) => (
      <div key={entry.id} className="report-timeline__entry" style={{ animationDelay: `${idx * 0.05}s` }}>
        <div className="report-timeline__time">{fmtTime(entry.elapsedMs)}</div>
        <div className="report-timeline__dot" style={{
          background: entry.actionType === 'discipline' ? 'var(--color-error)' :
                      entry.actionType === 'group-discussion' ? 'var(--color-accent-green)' :
                      'var(--color-secondary)',
        }} />
        <div className="report-timeline__content">
          <span className="report-timeline__icon">{ACTION_ICONS[entry.actionType] ?? '📋'}</span>
          <span className="report-timeline__action">{entry.targetStudentName}</span>
          {entry.effect && <span className="report-timeline__effect"> — {entry.effect}</span>}
        </div>
      </div>
    ))}
  </div>
);

// ── Main Report ──────────────────────────────────────────
interface CourseReportProps {
  onClose: () => void;
}

export const CourseReport: React.FC<CourseReportProps> = ({ onClose }) => {
  const data = useReportData();
  const { overall, students, phases, activityLog, radarScores } = data;

  const sortedStudents = [...students].sort((a, b) => b.engagementScore - a.engagementScore);

  const overallGrade = overall.engagementIndex >= 80 ? 'A' :
                       overall.engagementIndex >= 65 ? 'B+' :
                       overall.engagementIndex >= 50 ? 'B' : 'C';
  const gradeColor = overall.engagementIndex >= 80 ? 'var(--color-success)' :
                     overall.engagementIndex >= 65 ? 'var(--color-secondary)' :
                     overall.engagementIndex >= 50 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div className="report-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div className="report-header__left">
            <div className="report-header__title">
              <span style={{ marginRight: 8 }}>📊</span>课程实训报告
            </div>
            <div className="report-header__subtitle">
              《滕王阁序》· 语文课 · 教学时长 {fmtTime(overall.totalDurationMs)} · {overall.teacherActionCount} 次互动
            </div>
          </div>
          <div className="report-header__right">
            <div className="report-header__grade">
              <div className="report-header__grade-label">综合评分</div>
              <div className="report-header__grade-value" style={{ color: gradeColor }}>
                {overallGrade}
              </div>
            </div>
            <button className="report-close-btn" onClick={onClose} title="关闭 (Esc)">✕</button>
          </div>
        </div>

        <div className="report-body">
          {/* Score cards */}
          <div className="report-scores">
            <ScoreCard icon="⏱" label="课程时长" value={fmtTime(overall.totalDurationMs)}
              desc="完整授课流程" color="var(--color-secondary)" />
            <ScoreCard icon="🎯" label="教师互动" value={overall.teacherActionCount}
              sub="次操作" desc={`点名${overall.callOnCount} 提问${overall.askQuestionCount} 纪律${overall.disciplineCount}`}
              color="var(--color-primary)" />
            <ScoreCard icon="👥" label="课堂覆盖" value={fmtPct(overall.classroomCoverage * 100)}
              sub={`${Math.round(overall.classroomCoverage * students.length)}/${students.length}人`}
              desc="被关注学生比例" color="var(--color-accent-green)" />
            <ScoreCard icon="📊" label="参与指数" value={overall.engagementIndex}
              sub="/100" desc="学生平均参与度" color="var(--color-accent-purple)" />
            <ScoreCard icon="⚡" label="节奏评分" value={overall.paceScore}
              sub="/100" desc="每分钟互动密度" color="var(--color-warning)" />
          </div>

          {/* Radar + Phase */}
          <div className="report-row">
            <div className="report-card">
              <div className="report-card__title">📈 教学能力雷达</div>
              <div className="report-card__body report-card__body--center">
                <RadarChart scores={radarScores} />
              </div>
            </div>
            <div className="report-card">
              <div className="report-card__title">📅 阶段时间分布</div>
              <div className="report-card__body">
                <PhaseTimeline phases={phases} totalMs={overall.totalDurationMs} />
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="report-card">
            <div className="report-card__title">🏆 学生参与度排名</div>
            <div className="report-card__body report-card__body--scroll">
              <EngagementBars students={students} />
            </div>
          </div>

          {/* Student cards */}
          <div className="report-card">
            <div className="report-card__title">👤 学生个体观察 ({students.length}人)</div>
            <div className="report-card__body">
              {sortedStudents.map((r, i) => (
                <StudentDetailCard key={r.student.id} report={r} rank={i + 1} />
              ))}
            </div>
          </div>

          {/* Activity timeline */}
          <div className="report-card">
            <div className="report-card__title">📋 教师操作时间线 ({activityLog.length}次)</div>
            <div className="report-card__body">
              {activityLog.length === 0 ? (
                <div className="report-empty">本次课堂无教师主动干预记录</div>
              ) : (
                <ActivityTimeline log={activityLog} />
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="report-card report-card--summary">
            <div className="report-card__title">📝 综合评语</div>
            <div className="report-card__body">
              <div className="report-summary-text">
                本次《滕王阁序》课堂实训时长 <strong>{fmtTime(overall.totalDurationMs)}</strong>，
                教师共进行 <strong>{overall.teacherActionCount}</strong> 次主动干预，
                其中点名回答 <strong>{overall.callOnCount}</strong> 次、全班提问 <strong>{overall.askQuestionCount}</strong> 次、
                纪律提醒 <strong>{overall.disciplineCount}</strong> 次、小组讨论 <strong>{overall.groupDiscussionCount}</strong> 次。
              </div>
              <div className="report-summary-text">
                课堂覆盖率达到 <strong>{fmtPct(overall.classroomCoverage * 100)}</strong>，
                学生平均参与指数为 <strong>{overall.engagementIndex}/100</strong>。
                {overall.engagementIndex >= 75
                  ? '整体课堂氛围活跃，师生互动良好，教学节奏把控到位，是一次高质量的教学实训。'
                  : overall.engagementIndex >= 50
                  ? '课堂整体表现中等偏上，建议在互动环节增加对后排学生的关注，适当加快教学节奏。'
                  : '课堂参与度有待提升，建议采用更多样的教学策略（如小组竞赛、角色扮演）来调动学生积极性。'}
              </div>
              {sortedStudents.filter((r) => r.disciplineCount > 0).length > 0 && (
                <div className="report-summary-text report-summary-text--warn">
                  ⚠️ 需要关注：{sortedStudents.filter((r) => r.disciplineCount > 0).map((r) => r.student.name).join('、')}
                  在课堂中出现注意力分散情况。建议在未来的教学中增加对这些学生的互动频率，
                  可尝试在讲解阶段穿插更多提问和讨论环节。
                </div>
              )}
              {sortedStudents.filter((r) => r.engagementScore >= 85).length > 0 && (
                <div className="report-summary-text" style={{
                  color: 'var(--color-success)',
                  background: 'rgba(76,175,125,0.06)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--color-success)',
                }}>
                  🌟 表现突出：{sortedStudents.filter((r) => r.engagementScore >= 85).map((r) => r.student.name).join('、')}
                  在本次课堂中展现了出色的参与度和思考深度。
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReport;
