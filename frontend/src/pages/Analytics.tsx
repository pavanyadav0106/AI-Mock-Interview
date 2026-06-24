import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInterviews } from '../hooks/useInterviews';
import { Button } from '../components/ui/Button';
import type { Interview } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────
const scoreColor = (s: number) =>
  s >= 8 ? '#22c55e' : s >= 6 ? '#8b5cf6' : s >= 4 ? '#f59e0b' : '#ef4444';

const difficultyColor: Record<string, string> = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

const difficultyClass: Record<string, string> = {
  Easy: 'badge-easy',
  Medium: 'badge-medium',
  Hard: 'badge-hard',
};

// ─── Stat Card ───────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
  delay?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accent, delay = '0s' }) => (
  <div
    className="glass-card p-5 flex items-center gap-4 animate-fade-in-up"
    style={{ animationDelay: delay, opacity: 0 }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
      style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
    >
      {icon}
    </div>
    <div>
      <div className="text-2xl font-black text-[rgb(var(--text-primary))]">{value}</div>
      <div className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{label}</div>
    </div>
  </div>
);

// ─── Custom Tooltip ──────────────────────────────────────
const ChartTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number; payload: { role?: string; date?: string; name?: string } }>;
  label?: string;
}> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  const name = data.payload.name || data.payload.role || '';
  return (
    <div className="glass-card px-3 py-2 text-xs border border-[rgb(var(--border))]" style={{ background: 'rgb(13 13 18 / 0.95)' }}>
      {name && (
        <p className="text-[rgb(var(--text-primary))] font-semibold truncate mb-1">
          {name}
        </p>
      )}
      <p className="text-[rgb(var(--text-secondary))] font-medium">
        Score: <span style={{ color: scoreColor(data.value) }} className="font-bold">{data.value.toFixed(1)}/10</span>
      </p>
      {data.payload.date && (
        <p className="text-[rgb(var(--text-muted))] mt-0.5">{data.payload.date}</p>
      )}
    </div>
  );
};

// ─── Component ───────────────────────────────────────────
export const Analytics: React.FC = () => {
  const { getHistory } = useInterviews();
  const [history, setHistory] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getHistory();
        setHistory(data ?? []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completed = history.filter((h) => h.completedAt);

  // ── Stats ──────────────────────────────────────────────
  const totalInterviews = completed.length;
  const avgScore =
    totalInterviews > 0
      ? completed.reduce((sum, h) => sum + (h.totalScore ?? 0), 0) / totalInterviews
      : 0;
  const totalQuestions = completed.reduce((sum, h) => sum + (h.totalQuestions ?? 0), 0);

  // Group by role and calculate averages
  const roleAverages = completed.reduce((acc, h) => {
    if (!acc[h.role]) {
      acc[h.role] = { sum: 0, count: 0 };
    }
    acc[h.role].sum += h.totalScore ?? 0;
    acc[h.role].count += 1;
    return acc;
  }, {} as Record<string, { sum: number; count: number }>);

  let topRole = '—';
  let topRoleScore = 0;
  Object.entries(roleAverages).forEach(([role, data]) => {
    const avg = data.sum / data.count;
    if (avg > topRoleScore) {
      topRoleScore = avg;
      topRole = role;
    }
  });

  // ── Score trend data ───────────────────────────────────
  const trendData = completed
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((h, i) => ({
      index: i + 1,
      score: h.totalScore ?? 0,
      role: h.role,
      date: new Date(h.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));

  // ── Difficulty breakdown ───────────────────────────────
  const diffBreakdown = completed.reduce(
    (acc, h) => {
      const d = h.difficulty || 'Unknown';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const pieData = Object.entries(diffBreakdown).map(([name, value]) => ({
    name,
    value,
    color: difficultyColor[name] || '#8b5cf6',
  }));

  // ── Difficulty performance breakdown ───────────────────
  const diffAverages = completed.reduce((acc, h) => {
    const d = h.difficulty || 'Unknown';
    if (!acc[d]) {
      acc[d] = { sum: 0, count: 0 };
    }
    acc[d].sum += h.totalScore ?? 0;
    acc[d].count += 1;
    return acc;
  }, {} as Record<string, { sum: number; count: number }>);

  const diffBarData = ['Easy', 'Medium', 'Hard']
    .map((d) => {
      const data = diffAverages[d];
      return {
        name: d,
        score: data ? parseFloat((data.sum / data.count).toFixed(1)) : 0,
      };
    })
    .filter((item) => item.score > 0);

  // ── Role performance breakdown ─────────────────────────
  const roleBarData = Object.entries(roleAverages)
    .map(([role, data]) => ({
      name: role,
      score: parseFloat((data.sum / data.count).toFixed(1)),
    }))
    .sort((a, b) => b.score - a.score);

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-[rgb(var(--text-secondary))]">Loading analytics…</p>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────
  if (completed.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
        <div className="text-5xl">📊</div>
        <div className="space-y-1">
          <p className="font-semibold text-[rgb(var(--text-primary))]">No data yet</p>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            Complete your first mock interview to see analytics here
          </p>
        </div>
        <Link to="/create-interview">
          <Button variant="gradient" size="sm">Start First Interview</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[rgb(var(--text-primary))]">Analytics</h1>
          <p className="text-[rgb(var(--text-secondary))] mt-1">
            Track your mock interview performance over time
          </p>
        </div>
        <Link to="/create-interview">
          <Button variant="gradient" size="sm" leftIcon={<span>+</span>}>New Interview</Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Interviews Completed" value={totalInterviews} icon="🎯" accent="#8b5cf6" delay="0.05s" />
        <StatCard label="Overall Avg Score" value={avgScore > 0 ? `${avgScore.toFixed(1)}/10` : '—'} icon="📊" accent="#3b82f6" delay="0.1s" />
        <StatCard label="Questions Answered" value={totalQuestions} icon="💬" accent="#f59e0b" delay="0.15s" />
        <StatCard label="Top Role" value={topRole} icon="🏆" accent="#22c55e" delay="0.2s" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Trend — spans 2 cols */}
        <div
          className="lg:col-span-2 glass-card p-6 space-y-4 animate-fade-in-up"
          style={{ animationDelay: '0.25s', opacity: 0 }}
        >
          <div>
            <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Score Trend</h2>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
              Your overall scores across all interviews
            </p>
          </div>
          {trendData.length >= 2 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(255 255 255 / 0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                    axisLine={{ stroke: 'rgb(255 255 255 / 0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                    axisLine={{ stroke: 'rgb(255 255 255 / 0.1)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#scoreGradient)"
                    dot={{ r: 4, fill: '#8b5cf6', stroke: '#1a1a2e', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#a78bfa', stroke: '#1a1a2e', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-[rgb(var(--text-muted))]">
              Complete at least 2 interviews to see the trend chart
            </div>
          )}
        </div>

        {/* Difficulty Breakdown */}
        <div
          className="glass-card p-6 space-y-4 animate-fade-in-up"
          style={{ animationDelay: '0.3s', opacity: 0 }}
        >
          <div>
            <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Difficulty Mix</h2>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
              Distribution across difficulty levels
            </p>
          </div>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} interviews`, name]}
                  contentStyle={{
                    background: 'rgb(13 13 18 / 0.95)',
                    border: '1px solid rgb(255 255 255 / 0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score by Difficulty */}
        <div
          className="glass-card p-6 space-y-4 animate-fade-in-up"
          style={{ animationDelay: '0.35s', opacity: 0 }}
        >
          <div>
            <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Score by Difficulty</h2>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
              Average performance per difficulty level
            </p>
          </div>
          {diffBarData.length > 0 ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diffBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(255 255 255 / 0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                    axisLine={{ stroke: 'rgb(255 255 255 / 0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                    axisLine={{ stroke: 'rgb(255 255 255 / 0.1)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {diffBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={difficultyColor[entry.name] || '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-[rgb(var(--text-muted))]">
              No data available
            </div>
          )}
        </div>

        {/* Performance by Role */}
        <div
          className="lg:col-span-2 glass-card p-6 space-y-4 animate-fade-in-up"
          style={{ animationDelay: '0.4s', opacity: 0 }}
        >
          <div>
            <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Performance by Role</h2>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
              Average score across different targeted roles
            </p>
          </div>
          {roleBarData.length > 0 ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={roleBarData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(255 255 255 / 0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                    axisLine={{ stroke: 'rgb(255 255 255 / 0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: 'rgb(var(--text-muted))' }}
                    axisLine={{ stroke: 'rgb(255 255 255 / 0.1)' }}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={30}>
                    {roleBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={scoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-[rgb(var(--text-muted))]">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* All Interviews List */}
      <div
        className="glass-card overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '0.45s', opacity: 0 }}
      >
        <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">All Interviews</h2>
          <span className="text-xs text-[rgb(var(--text-muted))]">{history.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <div className="divide-y divide-[rgb(var(--border))] min-w-[550px] md:min-w-0">
            {history.map((interview, i) => (
              <div
                key={interview._id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[rgb(var(--bg-secondary))] transition-colors animate-fade-in-up"
                style={{ animationDelay: `${0.5 + Math.min(i * 0.02, 0.3)}s`, opacity: 0 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, rgb(139 92 246 / 0.2), rgb(59 130 246 / 0.2))',
                      color: '#a78bfa',
                    }}
                  >
                    {interview.role.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[rgb(var(--text-primary))] truncate">
                      {interview.role} Developer
                    </p>
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                      {interview.totalQuestions} questions •{' '}
                      {new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`badge ${difficultyClass[interview.difficulty] ?? 'badge-violet'}`}>
                    {interview.difficulty}
                  </span>

                  {interview.completedAt ? (
                    <div className="text-right">
                      <div
                        className="text-sm font-bold"
                        style={{ color: scoreColor(interview.totalScore ?? 0) }}
                      >
                        {(interview.totalScore ?? 0).toFixed(1)}/10
                      </div>
                      <Link
                        to={`/results/${interview._id}`}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        View →
                      </Link>
                    </div>
                  ) : (
                    <Link to={`/interview/${interview._id}`}>
                      <span className="badge badge-amber">In Progress</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

