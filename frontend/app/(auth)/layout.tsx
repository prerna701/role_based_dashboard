import React from 'react';
import styles from './auth.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Role-Based Dashboard',
  description: 'Sign in to access your dashboard.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={styles.layout}>
      <div className={styles.container}>
        {children}
      </div>
    </main>
  );
}
