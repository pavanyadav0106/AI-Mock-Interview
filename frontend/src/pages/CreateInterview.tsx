import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviews } from '../hooks/useInterviews';
import { Button } from '../components/ui/Button';

// ─── Role definitions ────────────────────────────────────
const roles = [
  { id: 'Frontend', label: 'Frontend', icon: '🖥️', desc: 'React, Vue, HTML/CSS, JS' },
  { id: 'Backend', label: 'Backend', icon: '⚙️', desc: 'Node.js, Python, APIs, DBs' },
  { id: 'Fullstack', label: 'Fullstack', icon: '🚀', desc: 'End-to-end development' },
  { id: 'DevOps', label: 'DevOps', icon: '🔧', desc: 'CI/CD, Docker, Cloud' },
  { id: 'Data Science', label: 'Data Science', icon: '📊', desc: 'ML, Python, Analytics' },
  { id: 'Custom', label: 'Custom Role', icon: '📋', desc: 'Paste your job description' },
];

interface Difficulty {
  id: string;
  label: string;
  desc: string;
  badgeClass: string;
}

const difficulties: Difficulty[] = [
  { id: 'Easy', label: 'Easy', desc: 'Basic concepts, warm-up', badgeClass: 'badge-easy' },
  { id: 'Medium', label: 'Medium', desc: 'Practical & situational', badgeClass: 'badge-medium' },
  { id: 'Hard', label: 'Hard', desc: 'Deep expertise required', badgeClass: 'badge-hard' },
];

const questionCounts = [3, 5, 7, 10];

// ─── Timer per question options (seconds) ────────────────
const timerOptions = [
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
];

export const CreateInterview: React.FC = () => {
  const navigate = useNavigate();
  const { createInterview, loading, error } = useInterviews();

  const [selectedRole, setSelectedRole] = useState('Fullstack');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [jobDescription, setJobDescription] = useState('');

  const isCustomRole = selectedRole === 'Custom';
  const canSubmit = !isCustomRole || jobDescription.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const result = await createInterview({
        role: selectedRole,
        difficulty: selectedDifficulty,
        totalQuestions: questionCount,
        ...(isCustomRole && jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
      });
      // Persist questions & timer for the session page
      sessionStorage.setItem(`questions_${result.interviewId}`, JSON.stringify(result.questions));
      sessionStorage.setItem(`timer_${result.interviewId}`, String(timerSeconds));
      navigate(`/interview/${result.interviewId}`);
    } catch (err) {
      console.error('Failed to create interview:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-[rgb(var(--text-primary))]">New Interview</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-1">
          Configure your session — AI will generate tailored questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" id="create-interview-form">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[var(--radius)] text-sm text-red-400 flex items-start gap-3 animate-fade-in">
            <span className="text-lg">⚠️</span>
            <div className="text-left">
              <p className="font-bold">Failed to generate interview</p>
              <p className="text-xs text-red-400/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1 — Role */}
        <div className="space-y-3">
          <div className="section-label">1 · Select Role</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {roles.map((role, i) => (
              <button
                key={role.id}
                type="button"
                id={`role-${role.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedRole(role.id)}
                disabled={loading}
                className={`glass-card p-4 text-left transition-all duration-200 cursor-pointer animate-fade-in-up ${
                  selectedRole === role.id
                    ? role.id === 'Custom'
                      ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgb(16_185_129_/_0.15)]'
                      : 'border-violet-500/60 bg-violet-500/10 shadow-glow'
                    : 'hover:border-[rgb(var(--accent-1)_/_0.3)] hover:bg-[rgb(var(--bg-card)_/_0.5)]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div className="text-2xl mb-2">{role.icon}</div>
                <div className={`font-semibold text-sm ${
                  selectedRole === role.id && role.id === 'Custom'
                    ? 'text-emerald-400'
                    : 'text-[rgb(var(--text-primary))]'
                }`}>{role.label}</div>
                <div className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{role.desc}</div>
                {selectedRole === role.id && (
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                    role.id === 'Custom' ? 'bg-emerald-400' : 'bg-violet-400'
                  }`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1.5 — Job Description (Custom role only) */}
        {isCustomRole && (
          <div className="space-y-3 animate-fade-in">
            <div className="section-label flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">✦</span>
              Paste Your Job Description
            </div>
            <div className="glass-card p-5 space-y-3" style={{ borderColor: jobDescription.trim() ? 'rgb(16 185 129 / 0.3)' : undefined }}>
              <p className="text-xs text-[rgb(var(--text-muted))]">
                Paste the job description from the position you've applied to. The AI will analyze it and generate questions specific to that role's requirements.
              </p>
              <textarea
                id="job-description-input"
                className="premium-input min-h-[180px] resize-y leading-relaxed text-sm"
                placeholder={"Paste the full job description here…\n\nExample:\n• Role: Senior Frontend Engineer\n• Requirements: 5+ years React, TypeScript, GraphQL\n• Responsibilities: Lead frontend architecture…"}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
              />
              <div className="flex justify-between items-center text-xs text-[rgb(var(--text-muted))]">
                <span>
                  {jobDescription.trim().length > 0
                    ? `${jobDescription.trim().split(/\s+/).length} words`
                    : 'Waiting for job description…'}
                </span>
                {jobDescription.trim().length > 0 && (
                  <span className="text-emerald-400 font-medium">✓ Ready to generate</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Difficulty */}
        <div className="space-y-3">
          <div className="section-label">{isCustomRole ? '3' : '2'} · Difficulty Level</div>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((diff, i) => (
              <button
                key={diff.id}
                type="button"
                id={`difficulty-${diff.id.toLowerCase()}`}
                onClick={() => setSelectedDifficulty(diff.id)}
                disabled={loading}
                className={`glass-card p-4 text-left transition-all duration-200 cursor-pointer animate-fade-in-up ${
                  selectedDifficulty === diff.id
                    ? 'border-violet-500/60 bg-violet-500/10'
                    : 'hover:border-[rgb(var(--accent-1)_/_0.3)]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ animationDelay: `${0.3 + i * 0.05}s`, opacity: 0 }}
              >
                <span className={`badge ${diff.badgeClass} mb-2`}>{diff.label}</span>
                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">{diff.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 — Question Count */}
        <div className="space-y-3">
          <div className="section-label">{isCustomRole ? '4' : '3'} · Number of Questions</div>
          <div className="flex gap-3">
            {questionCounts.map((count) => (
              <button
                key={count}
                type="button"
                id={`count-${count}`}
                onClick={() => setQuestionCount(count)}
                disabled={loading}
                className={`flex-1 py-3 rounded-[var(--radius)] border font-bold text-sm transition-all duration-200 ${
                  questionCount === count
                    ? 'border-violet-500/60 bg-violet-500/10 text-violet-400'
                    : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-violet-500/30'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4 — Timer */}
        <div className="space-y-3">
          <div className="section-label">{isCustomRole ? '5' : '4'} · Timer Per Question</div>
          <div className="flex gap-3">
            {timerOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                id={`timer-${opt.value}`}
                onClick={() => setTimerSeconds(opt.value)}
                disabled={loading}
                className={`flex-1 py-3 rounded-[var(--radius)] border font-semibold text-sm transition-all duration-200 ${
                  timerSeconds === opt.value
                    ? 'border-violet-500/60 bg-violet-500/10 text-violet-400'
                    : 'border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-secondary))] hover:border-violet-500/30'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary & Submit */}
        <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-[rgb(var(--text-secondary))] space-y-1">
            <p>
              <span className="text-[rgb(var(--text-muted))]">Role:</span>{' '}
              <span className={`font-semibold ${isCustomRole ? 'text-emerald-400' : 'text-violet-400'}`}>
                {isCustomRole ? 'Custom (Job Description)' : selectedRole}
              </span>
            </p>
            <p>
              <span className="text-[rgb(var(--text-muted))]">Difficulty:</span>{' '}
              <span className="font-semibold text-[rgb(var(--text-primary))]">{selectedDifficulty}</span>
            </p>
            <p>
              <span className="text-[rgb(var(--text-muted))]">Questions:</span>{' '}
              <span className="font-semibold text-[rgb(var(--text-primary))]">{questionCount}</span>
            </p>
            <p>
              <span className="text-[rgb(var(--text-muted))]">Timer:</span>{' '}
              <span className="font-semibold text-[rgb(var(--text-primary))]">
                {timerOptions.find((t) => t.value === timerSeconds)?.label} / question
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Button
              id="start-interview-submit"
              type="submit"
              variant="gradient"
              size="lg"
              isLoading={loading}
              disabled={!canSubmit || loading}
              className="shrink-0 px-8"
            >
              {loading ? 'Generating Questions…' : 'Start Interview →'}
            </Button>
            {isCustomRole && !jobDescription.trim() && (
              <p className="text-xs text-amber-400">↑ Paste a job description first</p>
            )}
          </div>
        </div>
      </form>

      {/* Loading overlay to prevent other options/navbar from being clicked */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md text-center p-6 animate-fade-in pointer-events-auto">
          <div className="max-w-md space-y-6 animate-scale-in">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Generating AI Interview</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Gemini is tailoring custom questions for <span className="text-violet-400 font-semibold">{isCustomRole ? 'your custom role' : selectedRole}</span> ({selectedDifficulty} difficulty).
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-violet-400 font-medium bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full w-fit mx-auto animate-pulse">
              <span>✨</span>
              <span>Curating {questionCount} specialized questions...</span>
            </div>
            
            <p className="text-xs text-slate-500 italic">Please do not refresh or navigate away.</p>
          </div>
        </div>
      )}
    </div>
  );
};
