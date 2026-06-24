import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInterviews } from '../hooks/useInterviews';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/ui/ScoreRing';
import type { Interview, Response as InterviewResponse } from '../types';


const scoreColor = (s: number) =>
  s >= 8 ? '#22c55e' : s >= 6 ? '#8b5cf6' : s >= 4 ? '#f59e0b' : '#ef4444';

interface AccordionProps {
  response: InterviewResponse;
  index: number;
}

const QuestionAccordion: React.FC<AccordionProps> = ({ response, index }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-200 ${
        open ? 'border-violet-500/20' : ''
      }`}
    >
      {/* Header */}
      <button
        id={`accordion-q-${index}`}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[rgb(var(--bg-secondary)_/_0.4)] transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
            style={{
              background: `${scoreColor(response.score)}20`,
              color: scoreColor(response.score),
              border: `1px solid ${scoreColor(response.score)}30`,
            }}
          >
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate pr-4">
              {response.question}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="text-sm font-bold"
            style={{ color: scoreColor(response.score) }}
          >
            {response.score.toFixed(1)}/10
          </span>
          <svg
            className={`w-4 h-4 text-[rgb(var(--text-muted))] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" d="M4 6l4 4 4-4" />
          </svg>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-[rgb(var(--border))] pt-4 animate-fade-in">
          {/* Your answer */}
          <div>
            <p className="section-label mb-2">Your Answer</p>
            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed bg-[rgb(var(--bg-secondary))] p-3 rounded-[var(--radius)]">
              {response.answer || <em className="text-[rgb(var(--text-muted))]">No answer provided</em>}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strengths */}
            {response.strengths && response.strengths.length > 0 && (
              <div>
                <p className="section-label mb-2 text-green-500">✓ Strengths</p>
                <ul className="space-y-1.5">
                  {response.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-[rgb(var(--text-secondary))] bg-green-500/5 border border-green-500/15 rounded-[var(--radius)] px-3 py-2"
                    >
                      <span className="text-green-400 mt-0.5 shrink-0">●</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {response.weaknesses && response.weaknesses.length > 0 && (
              <div>
                <p className="section-label mb-2 text-amber-500">⚠ Areas to Improve</p>
                <ul className="space-y-1.5">
                  {response.weaknesses.map((w, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-[rgb(var(--text-secondary))] bg-amber-500/5 border border-amber-500/15 rounded-[var(--radius)] px-3 py-2"
                    >
                      <span className="text-amber-400 mt-0.5 shrink-0">●</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Ideal answer */}
          {response.idealAnswer && (
            <div>
              <p className="section-label mb-2 text-blue-400">💡 Ideal Answer</p>
              <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed bg-blue-500/5 border border-blue-500/15 rounded-[var(--radius)] p-3">
                {response.idealAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getInterviewWithResponses, loading } = useInterviews();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await getInterviewWithResponses(id);
        setInterview(data.interview);
        setResponses(data.responses ?? []);
      } catch (err) {
        console.error('Failed to load results:', err);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-[rgb(var(--text-secondary))]">Loading results…</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-[rgb(var(--text-secondary))]">No results found.</p>
        <Link to="/dashboard">
          <Button variant="gradient">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const overallScore = interview.totalScore ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-[rgb(var(--text-primary))]">Interview Results</h1>
          <p className="text-[rgb(var(--text-secondary))] mt-1">
            {interview.role} · {interview.difficulty} · {interview.totalQuestions} questions
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="outline" size="sm" id="back-dashboard-btn">← Dashboard</Button>
        </Link>
      </div>

      {/* Score overview card */}
      <div
        className="glass-card p-8 flex flex-col sm:flex-row items-center gap-8"
        style={{
          background: 'linear-gradient(135deg, rgb(139 92 246 / 0.1), rgb(59 130 246 / 0.08))',
          borderColor: 'rgb(139 92 246 / 0.25)',
        }}
      >
        <ScoreRing score={overallScore} size={160} strokeWidth={12} />

        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-2xl font-black text-[rgb(var(--text-primary))]">Overall Performance</h2>
            <p className="text-[rgb(var(--text-secondary))] text-sm mt-1">
              Completed on {new Date(interview.completedAt ?? '').toLocaleDateString('en-US', { dateStyle: 'long' })}
            </p>
          </div>

          {/* Per-question mini score pills */}
          <div className="flex flex-wrap gap-2">
            {responses.map((r, i) => (
              <div
                key={i}
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  background: `${scoreColor(r.score)}15`,
                  color: scoreColor(r.score),
                  border: `1px solid ${scoreColor(r.score)}30`,
                }}
              >
                Q{i + 1}: {r.score.toFixed(1)}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/create-interview" id="new-interview-btn">
              <Button variant="gradient" size="sm">New Interview</Button>
            </Link>
            <Link to="/dashboard" id="view-dashboard-btn">
              <Button variant="outline" size="sm">View Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Question breakdown */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
          Question Breakdown
        </h2>
        {responses.length === 0 ? (
          <div className="glass-card p-8 text-center text-[rgb(var(--text-muted))]">
            No responses recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((response, index) => (
              <QuestionAccordion
                key={response._id}
                response={response}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
