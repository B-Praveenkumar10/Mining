import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger';
  soft?: boolean;
}

const toneStyles: Record<string, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger'
};

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', soft = false, className, children, ...rest }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1',
      soft ? toneStyles[tone] : '',
      !soft && tone === 'neutral' && 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100',
      !soft && tone === 'brand' && 'bg-brand-600 text-white',
      !soft && tone === 'accent' && 'bg-accent-600 text-white',
      !soft && tone === 'success' && 'bg-success text-white',
      !soft && tone === 'warning' && 'bg-warning text-white',
      !soft && tone === 'danger' && 'bg-danger text-white',
      className
    )}
    {...rest}
  >
    {children}
  </span>
);

export default Badge;
