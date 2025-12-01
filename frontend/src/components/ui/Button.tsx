import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center font-medium rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed';
const sizes: Record<string, string> = {
  sm: 'text-xs px-2.5 h-8 gap-1.5',
  md: 'text-sm px-3.5 h-10 gap-2',
  lg: 'text-base px-5 h-12 gap-2.5'
};
const variants: Record<string, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-500 shadow-soft',
  secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
  outline: 'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700',
  ghost: 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
  danger: 'bg-danger text-white hover:bg-danger/90'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth,
  className,
  children,
  ...rest
}) => {
  return (
    <button
      className={clsx(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
      )}
      {!loading && iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
};

export default Button;
