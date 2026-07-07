import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm px-md">
      <div className="glass-card !bg-white/95 rounded-xl p-lg w-full max-w-sm relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-md right-md text-on-surface-variant hover:text-primary"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">{title}</h2>
        {children}
      </div>
    </div>
  );
}
