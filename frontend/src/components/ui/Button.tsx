import React from 'react';
import { cn } from '../../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-primary))] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] select-none';

  const variants = {
    primary: 'bg-violet-500 hover:bg-violet-600 text-white shadow-sm',
    gradient:
      'gradient-btn text-white shadow-glow overflow-hidden',
    secondary:
      'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))] hover:border-violet-500/50 hover:bg-[rgb(var(--bg-card))]',
    outline:
      'border border-[rgb(var(--border))] bg-transparent text-[rgb(var(--text-secondary))] hover:border-violet-500/50 hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))]',
    ghost:
      'bg-transparent text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-card))] hover:text-[rgb(var(--text-primary))]',
    danger:
      'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading…</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
        </>
      )}
    </button>
  );
};