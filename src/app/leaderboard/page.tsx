"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Rushmore {
  id: string;
  item1: string;
  item2: string;
  item3: string;
  item4: string;
  user: {
    name: string;
    email: string;
  };
  voteCount: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rushmores, setRushmores] = useState<Rushmore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/rushmores");
      const data = await response.json();
      
      // Sort by vote count (descending)
      const sortedRushmores = data.sort((a: Rushmore, b: Rushmore) => b.voteCount - a.voteCount);
      setRushmores(sortedRushmores);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-pink-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/play" className="text-blue-600 hover:underline lowercase">
            ← back to game
          </Link>
          <div className="text-right">
            {session ? (
              <>
                <p className="text-sm text-gray-600 lowercase">welcome, {session.user?.name}</p>
                <Link href="/api/auth/signout" className="text-sm text-red-600 hover:underline lowercase">
                  sign out
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline lowercase">
                  sign in
                </Link>
                <span className="text-sm text-gray-500 mx-2">|</span>
                <Link href="/auth/signup" className="text-sm text-blue-600 hover:underline lowercase">
                  sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-light text-center mb-8 lowercase tracking-wide">today's leaderboard</h1>
          
          {rushmores.length === 0 ? (
            <p className="text-gray-500 text-center py-8 lowercase">no rushmores submitted yet.</p>
          ) : (
            <div className="space-y-6">
              {rushmores.map((rushmore, index) => (
                <div key={rushmore.id} className={`border rounded-lg p-6 ${index === 0 ? 'bg-yellow-50 border-yellow-200' : index === 1 ? 'bg-gray-50 border-gray-200' : index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-light text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-500' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <h3 className="font-light text-lg lowercase">{rushmore.user.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-green-600">{rushmore.voteCount}</div>
                      <div className="text-sm text-gray-500 lowercase">
                        ↑{rushmore.upvotes} ↓{rushmore.downvotes}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border shadow-sm">1. {rushmore.item1}</div>
                    <div className="bg-white p-3 rounded border shadow-sm">2. {rushmore.item2}</div>
                    <div className="bg-white p-3 rounded border shadow-sm">3. {rushmore.item3}</div>
                    <div className="bg-white p-3 rounded border shadow-sm">4. {rushmore.item4}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 