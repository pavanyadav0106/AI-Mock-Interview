import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInterviews } from '../hooks/useInterviews';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import type { Interview } from '../types';

const difficultyClass: Record<string, string> = {
  Easy: 'badge-easy',
  Medium: 'badge-medium',
  Hard: 'badge-hard',
};

const scoreColor = (s: number) =>
  s >= 8 ? '#22c55e' : s >= 6 ? '#8b5cf6' : s >= 4 ? '#f59e0b' : '#ef4444';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
  delay?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, accent, delay = '0s' }) => (
  <div
    className="glass-card p-6 flex items-center gap-4 animate-fade-in-up"
    style={{ animationDelay: delay, opacity: 0 }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getHistory } = useInterviews();
  const [history, setHistory] = useState<Interview[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getHistory();
        setHistory(data ?? []);
      } catch {
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completed = history.filter((h) => h.completedAt);
  const totalInterviews = completed.length;
  const avgScore =
    totalInterviews > 0
      ? (completed.reduce((sum, h) => sum + (h.totalScore ?? 0), 0) / totalInterviews).toFixed(1)
      : '—';
  const bestScore =
    totalInterviews > 0
      ? Math.max(...completed.map((h) => h.totalScore ?? 0)).toFixed(1)
      : '—';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[rgb(var(--text-primary))]">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[rgb(var(--text-secondary))] mt-1">
            Ready for your next interview session?
          </p>
        </div>
        <Link to="/create-interview" id="start-interview-btn">
          <Button variant="gradient" size="lg" leftIcon={<span>+</span>}>
            New Interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Interviews Completed" value={totalInterviews} icon="🎯" accent="#8b5cf6" delay="0.05s" />
        <StatCard label="Average Score" value={avgScore !== '—' ? `${avgScore}/10` : '—'} icon="📊" accent="#3b82f6" delay="0.1s" />
        <StatCard label="Best Score" value={bestScore !== '—' ? `${bestScore}/10` : '—'} icon="🏆" accent="#22c55e" delay="0.15s" />
      </div>

      {/* Recent interviews */}
      <div
        className="glass-card overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '0.2s', opacity: 0 }}
      >
        <div className="p-6 border-b border-[rgb(var(--border))] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Recent Interviews</h2>
          {history.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[rgb(var(--text-muted))]">{history.length} total</span>
              {history.length > 3 && (
                <Link to="/analytics" className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  View All →
                </Link>
              )}
            </div>
          )}
        </div>

        {loadingHistory ? (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-sm text-[rgb(var(--text-muted))]">Loading history…</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="text-5xl">🎙️</div>
            <div className="space-y-1">
              <p className="font-semibold text-[rgb(var(--text-primary))]">No interviews yet</p>
              <p className="text-sm text-[rgb(var(--text-muted))]">Start your first mock interview to see results here</p>
            </div>
            <Link to="/create-interview">
              <Button variant="gradient" size="sm">Start First Interview</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="divide-y divide-[rgb(var(--border))] min-w-[550px] md:min-w-0">
              {history.slice(0, 3).map((interview, i) => (
                <div
                  key={interview._id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[rgb(var(--bg-secondary))] transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${0.25 + i * 0.05}s`, opacity: 0 }}
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
                          id={`view-result-${interview._id}`}
                        >
                          View →
                        </Link>
                      </div>
                    ) : (
                      <Link to={`/interview/${interview._id}`} id={`resume-interview-${interview._id}`}>
                        <span className="badge badge-amber">In Progress</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
