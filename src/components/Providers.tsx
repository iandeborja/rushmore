"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

interface MockSessionContextType {
  data: any;
  status: string;
  setLoggedIn: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const MockSessionContext = createContext<MockSessionContextType | null>(null);

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(true);
  const mockSession = loggedIn
    ? {
        user: {
          id: "mock-user-id",
          name: "mt. testmore",
          email: "test@example.com",
        },
      }
    : null;

  return (
    <MockSessionContext.Provider value={{ data: mockSession, status: loggedIn ? "authenticated" : "unauthenticated", setLoggedIn }}>
      <div style={{ position: "fixed", top: 8, right: 8, zIndex: 9999 }}>
        <button
          onClick={() => setLoggedIn((v) => !v)}
          style={{
            background: "#eee",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {loggedIn ? "Switch to Logged Out" : "Switch to Logged In"}
        </button>
      </div>
      {children}
    </MockSessionContext.Provider>
  );
}

export function useSession() {
  return useContext(MockSessionContext);
}

export function Providers({ children, session }: { children: ReactNode; session?: any }) {
  const useMockSession = process.env.NEXT_PUBLIC_USE_MOCK_SESSION === "true";
  
  if (useMockSession) {
    return <MockSessionProvider>{children}</MockSessionProvider>;
  }
  
  return <SessionProvider session={session}>{children}</SessionProvider>;
} 