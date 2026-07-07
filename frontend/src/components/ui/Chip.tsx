import type { HTMLAttributes, ReactNode } from 'react';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function Chip({ children, className = '', ...rest }: ChipProps) {
  return (
    <span className={`px-sm py-unit text-label-sm rounded ${className}`} {...rest}>
      {children}
    </span>
  );
}
