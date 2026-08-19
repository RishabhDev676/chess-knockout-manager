import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pending' | 'complete' | 'winner' | 'eliminated' | 'bye' | 'active' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  className = '',
}) => {
  const variantStyles = {
    pending: 'bg-amber-950/60 text-amber-300 border border-amber-800/50',
    complete: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50',
    winner: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold',
    eliminated: 'bg-rose-950/60 text-rose-400 border border-rose-900/50 line-through opacity-75',
    bye: 'bg-blue-950/60 text-blue-300 border border-blue-800/50',
    active: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40',
    info: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
