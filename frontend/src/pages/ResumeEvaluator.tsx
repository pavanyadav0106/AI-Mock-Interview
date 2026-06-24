import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { ScoreRing } from '../components/ui/ScoreRing';
import { resumeApi, type ResumeEvaluationResult } from '../api/resume';
import { getErrorMessage } from '../utils/helpers';

// ─── Rating helpers ──────────────────────────────────────
const ratingColor = (rating: string) => {
  switch (rating) {
    case 'Excellent': return '#22c55e';
    case 'Good': return '#8b5cf6';
    case 'Fair': return '#f59e0b';
    default: return '#ef4444';
  }
};

const ratingBg = (rating: string) => {
  switch (rating) {
    case 'Excellent': return 'bg-green-500/10 border-green-500/20 text-green-400';
    case 'Good': return 'bg-violet-500/10 border-violet-500/20 text-violet-400';
    case 'Fair': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    default: return 'bg-red-500/10 border-red-500/20 text-red-400';
  }
};

// ─── Component ───────────────────────────────────────────
export const ResumeEvaluator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [showJd, setShowJd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ResumeEvaluationResult | null>(null);

  const canSubmit = !!file && !loading;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError('');
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    setFile(file);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
  };

  const handleButtonClick = () => {
    document.getElementById('resume-file-input')?.click();
  };

  const handleEvaluate = async () => {
    if (!canSubmit || !file) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await resumeApi.evaluate({
        file: file,
        ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
        ...(targetRole.trim() ? { targetRole: targetRole.trim() } : {}),
      });
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to evaluate resume. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setError('');
  };

  // ── Results view ────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-[rgb(var(--text-primary))]">Resume Analysis</h1>
            <p className="text-[rgb(var(--text-secondary))] mt-1">
              AI-powered evaluation of your resume
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} id="back-to-editor-btn">
            ← Edit Resume
          </Button>
        </div>

        {/* Score overview */}
        <div
          className="glass-card p-8 flex flex-col sm:flex-row items-center gap-8"
          style={{
            background: 'linear-gradient(135deg, rgb(139 92 246 / 0.1), rgb(59 130 246 / 0.08))',
            borderColor: 'rgb(139 92 246 / 0.25)',
          }}
        >
          <div className="flex gap-6 items-center">
            <ScoreRing score={result.overallScore} size={140} strokeWidth={10} label="Overall" />
            <ScoreRing score={result.atsScore} size={120} strokeWidth={8} label="ATS Score" />
          </div>

          <div className="space-y-3 flex-1">
            <h2 className="text-xl font-black text-[rgb(var(--text-primary))]">Summary</h2>
            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
              {result.summary}
            </p>
            <Button variant="gradient" size="sm" onClick={handleReset} id="evaluate-another-btn">
              Evaluate Another Resume
            </Button>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid sm:grid-cols-2 gap-4">
          {result.strengths.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="section-label text-green-500">✓ Strengths</h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[rgb(var(--text-secondary))] bg-green-500/5 border border-green-500/15 rounded-[var(--radius)] px-3 py-2"
                  >
                    <span className="text-green-400 mt-0.5 shrink-0">●</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.weaknesses.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="section-label text-amber-500">⚠ Weaknesses</h3>
              <ul className="space-y-2">
                {result.weaknesses.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-[rgb(var(--text-secondary))] bg-amber-500/5 border border-amber-500/15 rounded-[var(--radius)] px-3 py-2"
                  >
                    <span className="text-amber-400 mt-0.5 shrink-0">●</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <div className="glass-card p-5 space-y-3">
            <h3 className="section-label text-blue-400">💡 Suggestions for Improvement</h3>
            <ul className="space-y-2">
              {result.suggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[rgb(var(--text-secondary))] bg-blue-500/5 border border-blue-500/15 rounded-[var(--radius)] px-3 py-2.5"
                >
                  <span className="text-blue-400 font-bold shrink-0 w-5 text-center">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        <div className="grid sm:grid-cols-2 gap-4">
          {result.skillsFound.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="section-label text-violet-400">🎯 Skills Found</h3>
              <div className="flex flex-wrap gap-2">
                {result.skillsFound.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missingSkills.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="section-label text-red-400">🔍 Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/20"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section Feedback */}
        {result.sectionFeedback.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Section-by-Section Feedback</h2>
            <div className="space-y-3">
              {result.sectionFeedback.map((sf, i) => (
                <div key={i} className="glass-card p-5 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h4 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{sf.section}</h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${ratingBg(sf.rating)}`}
                    >
                      {sf.rating}
                    </span>
                  </div>
                  <div
                    className="w-full h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgb(255 255 255 / 0.05)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: sf.rating === 'Excellent' ? '100%' : sf.rating === 'Good' ? '75%' : sf.rating === 'Fair' ? '50%' : '25%',
                        background: ratingColor(sf.rating),
                      }}
                    />
                  </div>
                  <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{sf.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Input form view ─────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-[rgb(var(--text-primary))]">Resume Evaluator</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-1">
          Get AI-powered feedback on your resume — ATS compatibility, skills analysis, and actionable suggestions.
        </p>
      </div>

      <div className="space-y-6">
        {/* Resume input */}
        <div className="space-y-3">
          <div className="section-label">1 · Upload Your Resume (PDF)</div>
          <div className="glass-card p-5 space-y-4">
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-[var(--radius)] p-8 text-center transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? 'border-violet-500 bg-violet-500/5'
                    : 'border-[rgb(var(--text-muted))]/20 hover:border-violet-500/50 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleButtonClick}
              >
                <input
                  type="file"
                  id="resume-file-input"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleChange}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-violet-500/10 rounded-full text-violet-400">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                      Drag & drop your resume PDF here
                    </p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                      or click to browse from your device
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[rgb(var(--text-muted))]">
                    PDF only (Max 5MB)
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[var(--radius)] animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-violet-500/10 rounded text-violet-400 shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 hover:bg-red-500/10 rounded transition-colors"
                  id="remove-file-btn"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Optional: Target Role */}
        <div className="space-y-3">
          <div className="section-label">2 · Target Role <span className="text-[rgb(var(--text-muted))] font-normal">(optional)</span></div>
          <input
            id="target-role-input"
            type="text"
            className="premium-input"
            placeholder="e.g. Senior Frontend Engineer, Data Scientist, Product Manager…"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>

        {/* Optional: Job Description */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-label">
              3 · Job Description <span className="text-[rgb(var(--text-muted))] font-normal">(optional)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowJd(!showJd)}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
              id="toggle-jd-btn"
            >
              {showJd ? '− Hide' : '+ Compare against a JD'}
            </button>
          </div>
          {showJd && (
            <div className="glass-card p-5 space-y-3 animate-fade-in" style={{ borderColor: jobDescription.trim() ? 'rgb(16 185 129 / 0.3)' : undefined }}>
              <p className="text-xs text-[rgb(var(--text-muted))]">
                Paste a job description to get a skills gap analysis — the AI will identify what the JD requires that your resume is missing.
              </p>
              <textarea
                id="resume-jd-input"
                className="premium-input min-h-[160px] resize-y leading-relaxed text-sm"
                placeholder="Paste the job description here to compare your resume against it…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              {jobDescription.trim() && (
                <div className="text-xs text-emerald-400 font-medium">✓ JD loaded — will perform skills gap analysis</div>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-[rgb(var(--text-secondary))] space-y-1">
            <p>
              <span className="text-[rgb(var(--text-muted))]">Resume:</span>{' '}
              <span className={`font-semibold ${file ? 'text-green-400' : 'text-[rgb(var(--text-muted))]'}`}>
                {file ? file.name : 'Not provided'}
              </span>
            </p>
            {targetRole.trim() && (
              <p>
                <span className="text-[rgb(var(--text-muted))]">Target:</span>{' '}
                <span className="font-semibold text-violet-400">{targetRole}</span>
              </p>
            )}
            {jobDescription.trim() && (
              <p>
                <span className="text-[rgb(var(--text-muted))]">JD:</span>{' '}
                <span className="font-semibold text-emerald-400">Provided</span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Button
              id="evaluate-resume-submit"
              variant="gradient"
              size="lg"
              onClick={handleEvaluate}
              isLoading={loading}
              disabled={!canSubmit || loading}
              className="shrink-0 px-8"
            >
              {loading ? 'Analyzing Resume…' : 'Evaluate Resume →'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="glass-card p-4 border-red-500/30 bg-red-500/5">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
