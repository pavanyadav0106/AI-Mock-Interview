import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Menu, X, Sun, Moon, Zap } from 'lucide-react';
import { ConfirmationModal } from '../ui/ConfirmationModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingNavTarget, setPendingNavTarget] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      return 'light';
    } else {
      document.documentElement.classList.remove('light');
      return 'dark';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname.startsWith('/interview/')) {
      e.preventDefault();
      const targetHref = e.currentTarget.getAttribute('href') || '/dashboard';
      setPendingNavTarget(targetHref);
    } else {
      closeMenu();
    }
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    if (pathname.startsWith('/interview/')) {
      e.preventDefault();
      setShowLogoutConfirm(true);
    } else {
      closeMenu();
      logout();
    }
  };

  const confirmNavigation = () => {
    if (pendingNavTarget) {
      const target = pendingNavTarget;
      setPendingNavTarget(null);
      closeMenu();
      navigate(target);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    closeMenu();
    logout();
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/create-interview', label: 'New Interview' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/resume-evaluator', label: 'Resume Review' },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-[rgb(var(--border))]"
      style={{
        background: 'rgb(var(--bg-secondary) / 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group" onClick={handleNavClick}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
          >
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-[rgb(var(--text-primary))] group-hover:text-violet-400 transition-colors">
            InterviewAI
          </span>
        </Link>

        {/* Nav links (desktop) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={handleNavClick}
                className={`px-3 py-1.5 rounded-[var(--radius)] text-sm font-medium transition-all duration-150 ${
                  pathname === link.to
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))] transition-all focus:outline-none cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-[rgb(var(--text-secondary))]">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogoutClick} id="logout-btn">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" id="login-link">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" size="sm" id="register-link">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls (mobile only) */}
        <div className="flex md:hidden items-center gap-1">
          {/* Mobile Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))] transition-all focus:outline-none cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Hamburger Menu button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] p-2 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                {/* Navigation links for logged in user */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={handleNavClick}
                      className={`block px-3 py-2 rounded-[var(--radius)] text-base font-medium transition-colors ${
                        pathname === link.to
                          ? 'bg-violet-500/10 text-violet-400'
                          : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Profile and sign out in mobile menu */}
                <div className="pt-4 border-t border-[rgb(var(--border))] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{user.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogoutClick}
                    id="logout-btn-mobile"
                  >
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              // Navigation links for guest
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={closeMenu} className="w-full">
                  <Button variant="ghost" className="w-full" size="sm">Sign in</Button>
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full">
                  <Button variant="gradient" className="w-full" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={pendingNavTarget !== null}
        onClose={() => setPendingNavTarget(null)}
        onConfirm={confirmNavigation}
        title="Leave Active Interview?"
        message="Are you sure you want to leave the active interview? Your progress will be lost."
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="warning"
      />

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Sign Out of Active Interview?"
        message="Are you sure you want to sign out and leave the active interview? Your progress will be lost."
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        variant="danger"
      />
    </header>
  );
};