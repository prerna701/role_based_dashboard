import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import type { ButtonProps } from '@/types/components';
export function Button({
  children,
  className = '',
  href,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const classes = `button button-${variant} ${className}`.trim();

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
