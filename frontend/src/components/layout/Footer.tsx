import React from 'react';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="border-t border-[rgb(var(--border))] mt-auto py-6">
    <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[rgb(var(--text-muted))]">
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
        >
          <Zap className="w-2.5 h-2.5 fill-white text-white" />
        </div>
        <span>PrepPilot</span>
      </div>
      <span>Powered by Gemini AI · Built for interview success</span>
    </div>
  </footer>
);