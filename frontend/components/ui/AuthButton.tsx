import React, { ButtonHTMLAttributes } from 'react';
import styles from '../../app/(auth)/auth.module.css';

import type { AuthButtonProps } from '@/types/components';
export const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  loading,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${className || ''}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true"></span>
      ) : null}
      <span className={loading ? styles.hiddenText : ''}>{children}</span>
    </button>
  );
};
