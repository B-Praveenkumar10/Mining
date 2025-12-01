import React from 'react';
import clsx from 'clsx';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  bleed?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ title, actions, footer, bleed = false, className, children, ...rest }) => {
  return (
    <section
      className={clsx('rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-subtle flex flex-col', className)}
      {...rest}
    >
      {title && (
        <div className={clsx('px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between', bleed && 'md:px-6')}> 
          <h3 className="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-200">{title}</h3>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={clsx('p-5', bleed && 'md:p-6')}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
          {footer}
        </div>
      )}
    </section>
  );
};

export default Panel;
