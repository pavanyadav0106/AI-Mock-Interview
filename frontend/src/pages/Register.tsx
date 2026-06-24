import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getErrorMessage } from '../utils/helpers';
import { Zap } from 'lucide-react';

const benefits = [
  '✓ AI-generated technical questions',
  '✓ Per-question countdown timer',
  '✓ Instant scoring & feedback',
  '✓ Progress dashboard',
  '✓ 100% free forever',
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
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
          background:
            'linear-gradient(135deg, rgb(236 72 153 / 0.15) 0%, rgb(139 92 246 / 0.2) 50%, rgb(59 130 246 / 0.1) 100%)',
        }}
      >
        <div
          className="absolute bottom-20 left-10 w-64 h-64 rounded-full blur-3xl opacity-25 animate-float"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)', animationDelay: '1s' }}
        />
        <div
          className="absolute top-20 right-10 w-48 h-48 rounded-full blur-3xl opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />
        <div className="relative text-center space-y-6 max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
          >
            <Zap className="w-8 h-8 fill-white" />
          </div>
          <h2 className="text-3xl font-black text-[rgb(var(--text-primary))]">
            Start practicing <span className="gradient-text-pink">today</span>
          </h2>
          <ul className="space-y-2 text-left">
            {benefits.map((b, i) => (
              <li key={i} className="text-sm text-[rgb(var(--text-secondary))] flex items-center gap-2">
                {b}
              </li>
            ))}
          </ul>
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
          </div>

          <div>
            <h1 className="text-3xl font-black text-[rgb(var(--text-primary))]">Create account</h1>
            <p className="mt-1 text-[rgb(var(--text-secondary))] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium" id="signin-link">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-[var(--radius)] text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                <span>⚠</span> {error}
              </div>
            )}
            <Input
              id="reg-name"
              label="Full name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoComplete="name"
            />
            <Input
              id="reg-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              id="reg-password"
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="new-password"
            />
            <Input
              id="reg-confirm-password"
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
            />
            <Button
              id="register-submit"
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
