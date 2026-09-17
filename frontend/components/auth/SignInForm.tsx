'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthInput } from '../ui/AuthInput';
import { AuthButton } from '../ui/AuthButton';
import { loginWithEmail, persistAuthSession } from '@/lib/analytics-api';
import styles from '../../app/(auth)/auth.module.css';

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInValues = z.infer<typeof signInSchema>;

export const SignInForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInValues) => {
    setLoading(true);
    setError('');

    try {
      const payload = await loginWithEmail(data.email, data.password);
      persistAuthSession(payload);
      router.replace('/');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authSurface}>
      <section className={styles.visualPanel} aria-label="Dashboard overview">
        <div className={styles.brandMark} aria-hidden="true">
          <span>RB</span>
        </div>
        <div className={styles.visualCopy}>
          <p className={styles.eyebrow}>Role-based intelligence</p>
          <h1 className={styles.visualTitle}>Every learner, clearly in view.</h1>
          <p className={styles.visualDescription}>
            Bring students, progress, and revenue into one focused workspace.
          </p>
        </div>
        <div className={styles.signal} aria-hidden="true">
          <div className={styles.signalHeader}>
            <span>Learning pulse</span>
            <strong>84%</strong>
          </div>
          <div className={styles.signalTrack}>
            <span />
          </div>
          <div className={styles.signalMeta}>
            <span>Across your regions</span>
            <span>+12.8%</span>
          </div>
        </div>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.header}>
            <p className={styles.formEyebrow}>Secure workspace</p>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Sign in to continue to your dashboard.</p>
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
            {...register('email')}
            error={errors.email?.message}
            autoComplete="email"
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            error={errors.password?.message}
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
            Don&apos;t have an account?{' '}
            <span className={styles.link}>Contact your admin for an invite</span>
          </p>
        </form>
      </section>
    </div>
  );
};
