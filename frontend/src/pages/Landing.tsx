import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Questions',
    desc: 'Gemini AI generates role-specific technical questions tailored to your chosen difficulty.',
  },
  {
    icon: '📊',
    title: 'Instant Evaluation',
    desc: 'Get scored answers, detailed strengths & weaknesses, and ideal answers after each session.',
  },
  {
    icon: '⏱️',
    title: 'Real Interview Feel',
    desc: 'Per-question countdown timer simulates real interview pressure to build your confidence.',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    desc: 'Dashboard analytics track your average score, best performance, and improvement over time.',
  },
];

const stats = [
  { value: '10K+', label: 'Questions Generated' },
  { value: '5K+', label: 'Interviews Completed' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '95%', label: 'Satisfaction Rate' },
];

const roles = ['Frontend', 'Backend', 'Fullstack', 'DevOps', 'Data Science'];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Background blobs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />
        <div
          className="absolute top-20 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
        />

        <div className="relative container mx-auto max-w-4xl text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge badge-violet animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Powered by Gemini AI
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-black leading-tight animate-fade-in-up"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            Ace Your Next
            <br />
            <span className="gradient-text">Tech Interview</span>
          </h1>

          <p
            className="text-lg md:text-xl text-[rgb(var(--text-secondary))] max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            Practice with AI-generated technical questions, get instant feedback, and track your
            progress — all in one platform.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-wrap gap-3 justify-center animate-fade-in-up"
            style={{ animationDelay: '0.3s', opacity: 0 }}
          >
            <Link to="/register" id="hero-get-started">
              <Button variant="gradient" size="lg" className="px-8">
                Start for Free →
              </Button>
            </Link>
            <Link to="/login" id="hero-sign-in">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Role chips */}
          <div
            className="flex flex-wrap justify-center gap-2 pt-4 animate-fade-in"
            style={{ animationDelay: '0.5s', opacity: 0 }}
          >
            {roles.map((role) => (
              <span key={role} className="badge badge-blue text-xs">
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-b border-[rgb(var(--border))]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl font-black gradient-text">{s.value}</div>
                <div className="text-sm text-[rgb(var(--text-secondary))]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14 space-y-3">
            <div className="section-label">Features</div>
            <h2 className="text-3xl md:text-4xl font-black">
              Everything you need to{' '}
              <span className="gradient-text">prepare better</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feat, i) => (
              <div
                key={i}
                className="glass-card-hover p-6 space-y-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
              >
                <div className="text-3xl">{feat.icon}</div>
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">{feat.title}</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div
            className="glass-card p-10 text-center space-y-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgb(139 92 246 / 0.15), rgb(59 130 246 / 0.15))',
              borderColor: 'rgb(139 92 246 / 0.3)',
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgb(139 92 246 / 0.4), transparent 70%)',
              }}
            />
            <div className="relative space-y-4">
              <h2 className="text-3xl md:text-4xl font-black">
                Ready to land your{' '}
                <span className="gradient-text">dream job?</span>
              </h2>
              <p className="text-[rgb(var(--text-secondary))]">
                Start practicing with AI-powered mock interviews today. Free forever.
              </p>
              <Link to="/register" id="cta-get-started">
                <Button variant="gradient" size="lg" className="px-10">
                  Get Started Free →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
