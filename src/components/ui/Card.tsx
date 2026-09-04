import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
  variant?: 'default' | 'glass' | 'minimal';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  glow = false,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm shadow-[rgba(15,23,42,0.08)]',
    glass: 'bg-[var(--bg-overlay)] backdrop-blur-md border border-[var(--border-subtle)] shadow-lg shadow-[rgba(15,23,42,0.08)]',
    minimal: 'bg-transparent border border-[var(--border-subtle)]'
  };

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-300 p-6',
        variants[variant],
        hoverEffect && 'hover:border-[var(--border-accent)] hover:shadow-lg hover:shadow-[var(--accent-primary)]/10 hover:bg-[var(--bg-elevated)]',
        glow && 'border-[var(--border-accent)] shadow-lg shadow-[var(--accent-primary)]/10 bg-[var(--bg-surface)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
