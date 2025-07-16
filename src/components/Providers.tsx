"use client";

import { createContext, useContext, ReactNode } from "react";

// Temporarily disabled NextAuth to avoid Vercel deployment issues
// Will re-enable after successful deployment

// Mock session context
interface MockSession {
  data: {
    user: {
      name: string;
      email: string;
    } | null;
  } | null;
  status: "unauthenticated";
}

const MockSessionContext = createContext<MockSession>({
  data: null,
  status: "unauthenticated",
});

export const useSession = () => {
  return useContext(MockSessionContext);
};

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MockSessionContext.Provider value={{ data: null, status: "unauthenticated" }}>
      {children}
    </MockSessionContext.Provider>
  );
} 