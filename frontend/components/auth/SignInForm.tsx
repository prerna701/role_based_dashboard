'use client';

import React, { useState } from 'react';
import { AuthInput } from '../ui/AuthInput';
import { AuthButton } from '../ui/AuthButton';
import styles from '../../app/(auth)/auth.module.css';

export const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate login request
    setTimeout(() => {
      setLoading(false);
      // Mock validation
      if (email === 'demo@example.com' && password === 'password') {
        window.location.href = '/'; // redirect to dashboard on success
      } else {
        setError('Invalid email or password. Try demo@example.com / password.');
      }
    }, 1000);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Welcome back! Please enter your details.</p>
      </div>

      {error && (
        <div className={styles.formError} role="alert">
          {error}
        </div>
      )}

      <AuthInput
        label="Email address"
        type="email"
        placeholder="name@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <AuthInput
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <div className={styles.formActions}>
        <div className={styles.rememberMe}>
          <input type="checkbox" id="remember" className={styles.checkbox} />
          <label htmlFor="remember">Remember for 30 days</label>
        </div>
        <a href="#" className={styles.forgotPassword}>
          Forgot password?
        </a>
      </div>

      <AuthButton type="submit" loading={loading}>
        Sign In
      </AuthButton>

      <p className={styles.footerText}>
        Don't have an account?{' '}
        {/* Placeholder for invite page link */}
        <span className={styles.link}>Contact your admin for an invite</span>
      </p>
    </form>
  );
};
