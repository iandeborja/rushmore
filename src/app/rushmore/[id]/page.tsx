"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Rushmore {
  id: string;
  item1: string;
  item2: string;
  item3: string;
  item4: string;
  user: {
    name: string;
    email: string;
    username?: string;
  };
  voteCount: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

interface Question {
  id: string;
  prompt: string;
  date: string;
}

export default function RushmorePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [rushmore, setRushmore] = useState<Rushmore | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({});
  const [rushmoreId, setRushmoreId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setRushmoreId(id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (rushmoreId) {
      fetchRushmore();
    }
  }, [rushmoreId]);

  const fetchRushmore = async () => {
    try {
      // Fetch all rushmores and find the specific one
      const rushmoresRes = await fetch("/api/rushmores");
      const rushmoresData = await rushmoresRes.json();
      const foundRushmore = rushmoresData.find((r: Rushmore) => r.id === rushmoreId);
      
      if (!foundRushmore) {
        notFound();
      }
      
      setRushmore(foundRushmore);

      // Fetch today's question from the API
      const questionRes = await fetch("/api/questions/today");
      if (!questionRes.ok) {
        throw new Error(`Failed to fetch question: ${questionRes.status}`);
      }
      const questionData = await questionRes.json();
      
      // Check if the response contains an error
      if (questionData.error) {
        throw new Error(questionData.error);
      }
      
      setQuestion(questionData);
    } catch (error) {
      console.error("Error fetching rushmore:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (rushmoreId: string, value: number) => {
    if (!session) {
      showToast("error", "Please sign in to vote!");
      return;
    }

    setVotingStates(prev => ({ ...prev, [rushmoreId]: true }));

    try {
      const email = session.user?.email;
      if (!email) return;
      const response = await fetch(`/api/votes?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rushmoreId, value }),
      });

      if (response.ok) {
        await fetchRushmore(); // Refresh to get updated vote counts
        showToast("success", value === 1 ? "Upvoted!" : "Downvoted!");
      } else {
        const errorData = await response.json();
        showToast("error", errorData.error || "Vote failed");
      }
    } catch (error) {
      console.error("Error voting:", error);
      showToast("error", "Failed to vote");
    } finally {
      setVotingStates(prev => ({ ...prev, [rushmoreId]: false }));
    }
  };

  const shareRushmore = () => {
    const url = `${window.location.origin}/rushmore/${rushmore?.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${rushmore?.user.name}'s "${question?.prompt}" mt. rushmore`,
        text: `check out this ${question?.prompt} mt. rushmore`,
        url: url
      }).catch(() => {
        navigator.clipboard.writeText(url);
        showToast("success", "Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(url);
      showToast("success", "Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 lowercase">loading rushmore...</p>
        </div>
      </div>
    );
  }

  if (!rushmore) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <Link href="/play" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 lowercase hover:underline flex items-center gap-2">
            <span className="text-lg">←</span> back to play
          </Link>
          <div className="text-right flex flex-col items-end gap-1">
            {session ? (
              <>
                <p className="text-sm text-gray-600 lowercase">welcome, {session.user?.username}</p>
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
                <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 lowercase hover:underline">
                  sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light mb-4 lowercase tracking-wide text-gray-800">today's rushmore</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-4"></div>
          </div>
          <p className="text-2xl text-center italic text-gray-700 lowercase leading-relaxed">"{question?.prompt}"</p>
        </div>

        {/* Rushmore */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-in hover-lift" style={{animationDelay: '0.2s'}}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 lowercase text-lg">@{rushmore.user.username || rushmore.user.name}</span>
                {!rushmore.user.username && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">guest</span>
                )}
              </div>
              <span className="text-xs text-gray-500 lowercase">
                {new Date(rushmore.createdAt).toLocaleDateString()} at {new Date(rushmore.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <button
                  onClick={() => handleVote(rushmore.id, 1)}
                  disabled={votingStates[rushmore.id]}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 lowercase text-sm"
                >
                  ↑ {rushmore.upvotes}
                </button>
                <button
                  onClick={() => handleVote(rushmore.id, -1)}
                  disabled={votingStates[rushmore.id]}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 lowercase text-sm"
                >
                  ↓ {rushmore.downvotes}
                </button>
              </div>
              <button
                onClick={shareRushmore}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 lowercase text-sm"
              >
                share
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border text-sm">1. {rushmore.item1}</div>
            <div className="bg-gray-50 p-4 rounded-xl border text-sm">2. {rushmore.item2}</div>
            <div className="bg-gray-50 p-4 rounded-xl border text-sm">3. {rushmore.item3}</div>
            <div className="bg-gray-50 p-4 rounded-xl border text-sm">4. {rushmore.item4}</div>
          </div>
          
          <div className="text-xs text-gray-500 lowercase">
            total votes: {rushmore.voteCount}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Link 
            href="/play" 
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-light lowercase tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            create your own rushmore
          </Link>
        </div>
      </div>
    </div>
  );
} 