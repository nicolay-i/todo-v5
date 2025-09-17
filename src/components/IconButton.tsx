import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: 'ghost' | 'primary';
}

export function IconButton({ icon, label, className, variant = 'ghost', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 focus-visible:ring-offset-2',
        variant === 'primary'
          ? 'border-slate-900 bg-slate-900 text-white hover:border-slate-700 hover:bg-slate-700'
          : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
