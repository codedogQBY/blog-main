'use client';

import { ProgressProvider } from '@bprogress/next/app';

interface ProgressWrapperProps {
  children: React.ReactNode;
}

export function ProgressWrapper({ children }: ProgressWrapperProps) {
  return (
    <ProgressProvider
      height="4px"
      color="#3b82f6"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}