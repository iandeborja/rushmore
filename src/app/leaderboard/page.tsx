"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/Providers";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 lowercase">loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <Link href="/play" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 lowercase hover:underline flex items-center gap-2">
            <span className="text-lg">←</span> back to game
          </Link>
          <div className="text-right">
            {session ? (
              <>
                <p className="text-sm text-gray-600 lowercase">welcome, {session.user?.name}</p>
                <Link href="/api/auth/signout" className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200 lowercase hover:underline">
                  sign out
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 lowercase hover:underline">
                  sign in
                </Link>
                <span className="text-sm text-gray-500 mx-2">|</span>
                <Link href="/auth/signup" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 lowercase hover:underline">
                  sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-slide-in hover-lift border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light mb-4 lowercase tracking-wide text-gray-800">today's leaderboard</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 mx-auto rounded-full"></div>
          </div>
          
          {rushmores.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-500 lowercase text-lg">no rushmores submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {rushmores.map((rushmore, index) => (
                <div 
                  key={rushmore.id} 
                  className={`border rounded-2xl p-6 transition-all duration-300 hover-lift ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-md' : 
                    index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 shadow-md' : 
                    'bg-white/50 backdrop-blur-sm border-gray-200'
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-light text-white text-lg shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-500 to-slate-500' : 
                        index === 2 ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 
                        'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div>
                        <h3 className="font-light text-xl lowercase text-gray-800">{rushmore.user.name}</h3>
                        <p className="text-sm text-gray-500 lowercase">
                          {index === 0 ? 'champion' : index === 1 ? 'runner-up' : index === 2 ? 'bronze' : 'contender'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-light text-green-600 mb-1">{rushmore.voteCount}</div>
                      <div className="text-sm text-gray-500 lowercase">
                        ↑{rushmore.upvotes} ↓{rushmore.downvotes}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
                      <span className="text-sm text-gray-500 lowercase">1.</span> {rushmore.item1}
                    </div>
                    <div className="bg-white/80 p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
                      <span className="text-sm text-gray-500 lowercase">2.</span> {rushmore.item2}
                    </div>
                    <div className="bg-white/80 p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
                      <span className="text-sm text-gray-500 lowercase">3.</span> {rushmore.item3}
                    </div>
                    <div className="bg-white/80 p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
                      <span className="text-sm text-gray-500 lowercase">4.</span> {rushmore.item4}
                    </div>
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