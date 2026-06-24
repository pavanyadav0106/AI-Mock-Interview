import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviews } from '../hooks/useInterviews';
import { Button } from '../components/ui/Button';
import { Timer } from '../components/ui/Timer';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInterview, submitAnswers } = useInterviews();

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState('');

  // Custom Confirmation Modal states
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = useState(false);

  // Ref to bypass guards when programmatically navigating away (e.g. on submission or exit confirmation)
  const isNavigatingAwayRef = useRef(false);

  // Load questions: sessionStorage first, then API fallback
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      // 1. Try sessionStorage (set by CreateInterview)
      const cached = sessionStorage.getItem(`questions_${id}`);
      const savedTimer = sessionStorage.getItem(`timer_${id}`);

      if (cached) {
        try {
          const parsed = JSON.parse(cached) as string[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed);
            if (savedTimer) setTimerSeconds(Number(savedTimer));
            setLoadingQuestions(false);
            return;
          }
        } catch {
          // fall through to API
        }
      }

      // 2. API fallback
      try {
        const data = await getInterview(id);
        
        // If interview is already completed, redirect to results page immediately
        if (data.completedAt) {
          isNavigatingAwayRef.current = true;
          navigate(`/results/${id}`, { replace: true });
          return;
        }

        const qs: string[] = data.questions ?? [];
        if (qs.length > 0) {
          setQuestions(qs);
        } else {
          setError('No questions found for this interview.');
        }
      } catch {
        setError('Failed to load interview questions.');
      } finally {
        setLoadingQuestions(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion((p) => p + 1);
  };

  const executeSubmit = useCallback(
    async (answerList: { question: string; answer: string }[]) => {
      if (!id) return;
      setIsSubmitting(true);
      try {
        await submitAnswers(id, { answers: answerList });
        sessionStorage.removeItem(`questions_${id}`);
        sessionStorage.removeItem(`timer_${id}`);
        isNavigatingAwayRef.current = true;
        navigate(`/results/${id}`, { replace: true });
      } catch {
        setError('Failed to submit. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, submitAnswers, navigate]
  );

  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!id) return;

      const answerList = questions.map((question, idx) => ({
        question,
        answer: answers[idx] || '',
      }));

      if (!isAutoSubmit) {
        const unanswered = answerList.filter((a) => !a.answer.trim());
        if (unanswered.length > 0) {
          setShowUnansweredConfirm(true);
          return;
        }
      }

      await executeSubmit(answerList);
    },
    [id, questions, answers, executeSubmit],
  );

  // Auto-advance on time up or submit if last question
  const handleTimeUp = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((p) => p + 1);
    } else {
      handleSubmit(true);
    }
  }, [currentQuestion, questions.length, handleSubmit]);

  // ── Navigation Guards ─────────────────────────────────────────────
  useEffect(() => {
    // 1. Browser tab reload/closure guard
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isNavigatingAwayRef.current) return;
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your interview progress will be lost.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 2. Browser back button guard
    // Push dummy state to the history stack so a back navigation pops the dummy state instead of leaving
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (isNavigatingAwayRef.current) return;
      setShowBackConfirm(true);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleConfirmBack = () => {
    setShowBackConfirm(false);
    isNavigatingAwayRef.current = true;
    window.history.go(-1);
  };

  const handleCancelBack = () => {
    setShowBackConfirm(false);
    window.history.pushState(null, '', window.location.href);
  };

  const handleConfirmUnansweredSubmit = () => {
    setShowUnansweredConfirm(false);
    const answerList = questions.map((question, idx) => ({
      question,
      answer: answers[idx] || '',
    }));
    executeSubmit(answerList);
  };

  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // ── Loading ────────────────────────────────────────────────────────
  if (loadingQuestions) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-[rgb(var(--text-secondary))]">Generating AI questions…</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-red-400 font-semibold">{error}</p>
        <Button variant="outline" onClick={() => navigate('/create-interview')}>
          Try Again
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQuestion] ?? '';
  const isLast = currentQuestion === questions.length - 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[rgb(var(--text-primary))]">Interview Session</h1>
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
            Answer each question within the time limit
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Timer
            durationSeconds={timerSeconds}
            questionIndex={currentQuestion}
            onTimeUp={handleTimeUp}
            paused={isSubmitting}
          />
          <Button
            id="submit-all-btn"
            variant="gradient"
            size="sm"
            onClick={() => handleSubmit(false)}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit All
          </Button>
        </div>
      </div>

      {/* Overall progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[rgb(var(--text-muted))]">
          <span>{answeredCount} of {questions.length} answered</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-[rgb(var(--bg-secondary))] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
            }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px,1fr] gap-6">
        {/* Question list sidebar */}
        <aside className="glass-card p-4 space-y-2 h-fit lg:sticky lg:top-24">
          <p className="section-label mb-3">Questions</p>
          {questions.map((q, idx) => {
            const isCurrent = idx === currentQuestion;
            const isCompleted = idx < currentQuestion;
            const isLocked = idx > currentQuestion;
            return (
              <button
                key={idx}
                id={`question-nav-${idx}`}
                disabled={idx !== currentQuestion}
                className={`w-full flex items-center gap-3 p-2.5 rounded-[var(--radius)] text-left transition-all duration-150 text-sm ${
                  isCurrent
                    ? 'bg-violet-500/15 border border-violet-500/40 text-violet-300'
                    : isCompleted
                    ? 'opacity-85 text-[rgb(var(--text-secondary))]'
                    : 'opacity-50 cursor-not-allowed text-[rgb(var(--text-muted))]'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : isCurrent
                      ? 'bg-violet-500/30 text-violet-300'
                      : 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))]'
                  }`}
                >
                  {isCompleted ? '✓' : isLocked ? '🔒' : idx + 1}
                </span>
                <span className="truncate leading-snug">{q.length > 40 ? `${q.slice(0, 40)}…` : q}</span>
              </button>
            );
          })}
        </aside>

        {/* Main question area */}
        <div className="space-y-4 animate-slide-in-right" key={currentQuestion}>
          {/* Question card */}
          <div className="glass-card p-6 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[rgb(var(--border))] pb-2">
              <span className="section-label">Question {currentQuestion + 1} / {questions.length}</span>
            </div>
            <p className="text-[rgb(var(--text-primary))] text-lg font-semibold leading-relaxed pt-1">
              {currentQ}
            </p>
          </div>

          {/* Answer textarea */}
          <div className="glass-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`answer-${currentQuestion}`}
                className="section-label"
              >
                Your Answer
              </label>
            </div>
            <textarea
              id={`answer-${currentQuestion}`}
              className="premium-input min-h-[200px] resize-y leading-relaxed"
              placeholder="Type your answer here… Be specific and use examples where possible."
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center text-xs text-[rgb(var(--text-muted))]">
              <span>
                {currentAnswer.length > 0 ? (
                  `${currentAnswer.length} characters`
                ) : (
                  'Start typing…'
                )}
              </span>
              {currentAnswer.trim() && (
                <span className="text-green-400 font-medium">✓ Answered</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-end items-center">
            {!isLast ? (
              <Button
                id="next-question"
                variant="gradient"
                onClick={handleNext}
              >
                Next Question →
              </Button>
            ) : (
              <Button
                id="finish-interview"
                variant="gradient"
                onClick={() => handleSubmit(false)}
                isLoading={isSubmitting}
              >
                Finish & Submit →
              </Button>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showBackConfirm}
        onClose={handleCancelBack}
        onConfirm={handleConfirmBack}
        title="Leave Active Interview?"
        message="Are you sure you want to leave the active interview? Your progress will be lost."
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="warning"
      />

      <ConfirmationModal
        isOpen={showUnansweredConfirm}
        onClose={() => setShowUnansweredConfirm(false)}
        onConfirm={handleConfirmUnansweredSubmit}
        title="Submit Unanswered?"
        message="You have unanswered questions. Are you sure you want to submit the interview anyway?"
        confirmLabel="Submit Anyway"
        cancelLabel="Cancel"
        variant="warning"
      />
    </div>
  );
};
