import React, { InputHTMLAttributes, forwardRef } from 'react';
import styles from '../../app/(auth)/auth.module.css';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;

    return (
      <div className={styles.inputGroup}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
