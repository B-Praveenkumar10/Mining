import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  shadow?: 'none' | 'subtle' | 'soft' | 'elevated';
}

const padMap = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7'
};

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  interactive = false,
  shadow = 'subtle',
  className,
  children,
  ...rest
}) => (
  <div
    className={clsx(
      'rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
      padMap[padding],
      shadow !== 'none' && shadow === 'subtle' && 'shadow-subtle',
      shadow === 'soft' && 'shadow-soft',
      shadow === 'elevated' && 'shadow-elevated',
      interactive && 'transition hover:shadow-soft hover:border-neutral-300 dark:hover:border-neutral-700',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
