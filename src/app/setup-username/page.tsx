"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SetupUsername() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    
    // If user already has a username, redirect to play
    if (session.user?.username) {
      router.push("/play");
      return;
    }
  }, [session, status, router]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) return;
    
    setChecking(true);
    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(usernameToCheck)}`);
      const data = await response.json();
      
      if (!data.available) {
        setError("Username is already taken");
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Error checking username:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    setError("");
    
    // Debounce username check
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    
    if (username.length > 20) {
      setError("Username must be 20 characters or less");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/setup-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        // Refresh session to get updated user data
        window.location.href = "/play";
      } else {
        const data = await response.json();
        setError(data.error || "Failed to set username");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 lowercase">loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-pink-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-light mb-2 lowercase tracking-wide">choose your username</h1>
          <p className="text-gray-600 text-sm lowercase">
            this is how others will see you on rushmore
          </p>
        </div>

        {session?.user?.image && (
          <div className="flex justify-center mb-6">
            <img 
              src={session.user.image} 
              alt="Profile" 
              className="w-16 h-16 rounded-full"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-light text-gray-700 mb-2 lowercase">
              username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">@</span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                required
                minLength={3}
                maxLength={20}
                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lowercase"
                placeholder="your_username"
              />
              {checking && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 lowercase">{error}</p>
            )}
            <p className="mt-2 text-xs text-gray-500 lowercase">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || checking || error !== "" || username.length < 3}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-light lowercase tracking-wide transition-colors duration-200"
          >
            {loading ? "setting up..." : "continue to rushmore"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 lowercase">
            you can change this later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
} 