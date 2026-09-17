import type { ReactNode } from 'react';

import type { CardProps } from '@/types/components';
export function Card({ children, className = '', title, eyebrow, action }: CardProps) {
  return (
    <section className={`surface-card ${className}`}>
      {(title || eyebrow || action) && (
        <div className="card-header">
          <div>
            {eyebrow && <p className="card-eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
