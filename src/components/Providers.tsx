"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export function MockSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

export { useSession } from "next-auth/react";

export function Providers({ children }: { children: ReactNode }) {
  // In production, always use real sessions
  // In development, check for mock session flag
  const isProduction = process.env.NODE_ENV === 'production';
  const useMockSession = isProduction ? false : process.env.NEXT_PUBLIC_USE_MOCK_SESSION === "true";
  
  if (useMockSession) {
    return <MockSessionProvider>{children}</MockSessionProvider>;
  }
  
  return <SessionProvider>{children}</SessionProvider>;
} 