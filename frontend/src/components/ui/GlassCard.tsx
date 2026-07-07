import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function GlassCard({ children, className = '', ...rest }: GlassCardProps) {
  return (
    <div className={`glass-card rounded-xl ${className}`} {...rest}>
      {children}
    </div>
  );
}
