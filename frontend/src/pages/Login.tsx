import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getErrorMessage } from '../utils/helpers';
import { Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgb(139 92 246 / 0.2) 0%, rgb(59 130 246 / 0.15) 50%, rgb(236 72 153 / 0.1) 100%)',
        }}
      >
        {/* Blob decorations */}
        <div
          className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-30 animate-float"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />
        <div
          className="absolute bottom-10 right-10 w-48 h-48 rounded-full blur-3xl opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', animationDelay: '2s' }}
        />
        <div className="relative text-center space-y-6 max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
          >
            <Zap className="w-8 h-8 fill-white" />
          </div>
          <h2 className="text-3xl font-black text-[rgb(var(--text-primary))]">
            Welcome back to <span className="gradient-text">PrepPilot</span>
          </h2>
          <p className="text-[rgb(var(--text-secondary))] leading-relaxed">
            Continue your journey to interview mastery with AI-powered practice sessions.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Frontend', 'Backend', 'Fullstack', 'DevOps'].map((r) => (
              <span key={r} className="badge badge-violet text-xs">{r}</span>
            ))}
          </div>
        </div>
      </div>
 
      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center space-y-2">
            <div
              className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
            >
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <h1 className="text-2xl font-black gradient-text">PrepPilot</h1>
          </div>

          <div>
            <h1 className="text-3xl font-black text-[rgb(var(--text-primary))]">Sign in</h1>
            <p className="mt-1 text-[rgb(var(--text-secondary))] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium" id="signup-link">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-[var(--radius)] text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                <span>⚠</span> {error}
              </div>
            )}
            <Input
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
            />
            <Button
              id="login-submit"
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
