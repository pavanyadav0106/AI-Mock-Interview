import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styles = {
    danger: {
      icon: 'text-red-400 bg-red-500/10 border-red-500/20',
      btn: 'danger' as const,
    },
    warning: {
      icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      btn: 'primary' as const,
    },
    info: {
      icon: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      btn: 'primary' as const,
    },
  };

  const currentStyle = styles[variant];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with premium blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog container with premium design */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] p-6 text-left shadow-2xl transition-all duration-300 animate-scale-in flex flex-col gap-5"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))] transition-all focus:outline-none"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Section */}
        <div className="flex gap-4 items-start">
          <div className={`p-3 rounded-xl border shrink-0 ${currentStyle.icon}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] leading-snug">
              {title}
            </h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} size="sm">
            {cancelLabel}
          </Button>
          <Button variant={currentStyle.btn} onClick={onConfirm} size="sm" id="confirm-modal-btn">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
