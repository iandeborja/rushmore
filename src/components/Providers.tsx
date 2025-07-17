"use client";

import { createContext, useContext, useState } from "react";

const MockSessionContext = createContext(null);

export function MockSessionProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(true);
  const mockSession = loggedIn
    ? {
        user: {
          name: "Test User",
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