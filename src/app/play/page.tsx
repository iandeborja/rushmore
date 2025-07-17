"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/Providers";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
  id: string;
  prompt: string;
  date: string;
}

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

export default function PlayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [rushmores, setRushmores] = useState<Rushmore[]>([]);
  const [userRushmore, setUserRushmore] = useState<Rushmore | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item1: "",
    item2: "",
    item3: "",
    item4: "",
    anonymousName: "",
  });
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    fetchData();
    if (session?.user?.email) {
      fetch(`/api/user-stats?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(setUserStats)
        .catch(() => setUserStats(null));
    } else {
      setUserStats(null);
    }
  }, [session?.user?.email]);

  const fetchData = async () => {
    try {
      // Fetch today's question
      const questionRes = await fetch("/api/questions/today");
      const questionData = await questionRes.json();
      setQuestion(questionData);

      // Fetch all Rushmores for today
      const rushmoresRes = await fetch("/api/rushmores");
      const rushmoresData = await rushmoresRes.json();
      setRushmores(rushmoresData);

      // Find user's Rushmore if logged in
      if (session?.user?.email) {
        const userRushmore = rushmoresData.find(
          (r: Rushmore) => r.user.email === session.user?.email
        );
        setUserRushmore(userRushmore);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/rushmores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newRushmore = await response.json();
        setUserRushmore(newRushmore);
        setRushmores([newRushmore, ...rushmores]);
        setFormData({ item1: "", item2: "", item3: "", item4: "", anonymousName: "" });
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error("Error submitting Rushmore:", error);
      alert("Failed to submit Rushmore");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (rushmoreId: string, value: number) => {
    if (!session) {
      alert("Please sign in to vote!");
      return;
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rushmoreId, value }),
      });

      if (response.ok) {
        // Refresh data to get updated vote counts
        fetchData();
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const shareRushmore = (rushmore: Rushmore) => {
    const prompt = (question?.prompt ?? "").replace(/\s+/g, " ").trim().toLowerCase();
    const shareText = `my ${prompt} mt. rushmore:\n1. ${rushmore.item1.toLowerCase()}\n2. ${rushmore.item2.toLowerCase()}\n3. ${rushmore.item3.toLowerCase()}\n4. ${rushmore.item4.toLowerCase()}\n\nplay at rushmore.vercel.app`;

    // Try to use native sharing if available
    if (navigator.share) {
      navigator.share({
        text: shareText
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        showShareSuccess();
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      showShareSuccess();
    }
  };

  const showShareSuccess = () => {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in';
    successDiv.textContent = 'rushmore copied to clipboard!';
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 lowercase">loading today's rushmore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 lowercase hover:underline flex items-center gap-2">
            <span className="text-lg">←</span> back to home
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/leaderboard" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-light lowercase tracking-wide hover:underline flex items-center gap-2">
              <span className="text-sm">▲</span> leaderboard
            </Link>
            <div className="text-right flex flex-col items-end gap-1">
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
        </div>

        {/* User Stats */}
        {session && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div>
                <div className="text-lg font-light text-gray-700 lowercase">your stats</div>
                <div className="flex gap-6 mt-2">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">45</div>
                    <div className="text-xs text-gray-500">rushmores</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">267</div>
                    <div className="text-xs text-gray-500">votes cast</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-700">832</div>
                    <div className="text-xs text-gray-500">upvotes received</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-700">45</div>
                    <div className="text-xs text-gray-500">days played</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">last played</div>
                <div className="text-lg text-gray-700">July 16, 2025</div>
                <div className="mt-2 text-xs text-gray-500">
                  best rushmore upvotes: 200
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Question */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light mb-4 lowercase tracking-wide text-gray-800">today's question</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-4"></div>
          </div>
          <p className="text-2xl text-center italic text-gray-700 lowercase leading-relaxed">"{question?.prompt}"</p>
        </div>

        {/* Submit Form */}
        {!userRushmore && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-light mb-6 lowercase tracking-wide text-gray-800">what's on your "{question?.prompt}" mt. rushmore?</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!session && (
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 lowercase">
                    your name
                  </label>
                  <input
                    type="text"
                    value={formData.anonymousName}
                    onChange={(e) => setFormData({ ...formData, anonymousName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lowercase transition-all duration-200 hover:border-gray-400"
                    placeholder="enter your name"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 lowercase">
                    #1
                  </label>
                  <input
                    type="text"
                    value={formData.item1}
                    onChange={(e) => setFormData({ ...formData, item1: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lowercase transition-all duration-200 hover:border-gray-400"
                    placeholder="your first pick"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 lowercase">
                    #2
                  </label>
                  <input
                    type="text"
                    value={formData.item2}
                    onChange={(e) => setFormData({ ...formData, item2: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lowercase transition-all duration-200 hover:border-gray-400"
                    placeholder="your second pick"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 lowercase">
                    #3
                  </label>
                  <input
                    type="text"
                    value={formData.item3}
                    onChange={(e) => setFormData({ ...formData, item3: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lowercase transition-all duration-200 hover:border-gray-400"
                    placeholder="your third pick"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2 lowercase">
                    #4
                  </label>
                  <input
                    type="text"
                    value={formData.item4}
                    onChange={(e) => setFormData({ ...formData, item4: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lowercase transition-all duration-200 hover:border-gray-400"
                    placeholder="your fourth pick"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-light lowercase tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    submitting...
                  </span>
                ) : (
                  "submit my rushmore"
                )}
              </button>
            </form>
          </div>
        )}

        {/* User's Rushmore */}
        {userRushmore && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-fade-in hover-lift" style={{animationDelay: '0.4s'}}>
            <h2 className="text-2xl font-light mb-6 text-gray-800 lowercase tracking-wide flex items-center gap-2">
              <span className="text-2xl">◆</span>
              my "{question?.prompt}" mt. rushmore
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl border">1. {userRushmore.item1}</div>
              <div className="bg-gray-50 p-4 rounded-xl border">2. {userRushmore.item2}</div>
              <div className="bg-gray-50 p-4 rounded-xl border">3. {userRushmore.item3}</div>
              <div className="bg-gray-50 p-4 rounded-xl border">4. {userRushmore.item4}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <button
                onClick={() => shareRushmore(userRushmore)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 lowercase shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                share
              </button>
              <span className="text-sm text-gray-600 lowercase bg-gray-50 px-4 py-2 rounded-lg">
                votes: {userRushmore.voteCount} (↑{userRushmore.upvotes} ↓{userRushmore.downvotes})
              </span>
            </div>
          </div>
        )}

        {/* All Rushmores */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-light mb-8 lowercase tracking-wide text-gray-800 flex items-center gap-2">
            <span className="text-2xl">●</span>
            today's rushmores
          </h2>
          {rushmores.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">●</span>
              </div>
              <p className="text-gray-500 lowercase text-lg">no rushmores submitted yet. be the first!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {rushmores.map((rushmore, index) => (
                <div key={rushmore.id} className="border border-gray-200 rounded-xl p-6 hover-lift bg-gray-50 transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-light text-gray-800 lowercase text-lg">{rushmore.user.name}</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVote(rushmore.id, 1)}
                        className="text-green-600 hover:text-green-800 transition-colors duration-200 text-xl hover:scale-110 transform"
                        title={!session ? "sign in to vote" : "upvote"}
                      >
                        ↑
                      </button>
                      <span className="font-light text-lg min-w-[2rem] text-center">{rushmore.voteCount}</span>
                      <button
                        onClick={() => handleVote(rushmore.id, -1)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200 text-xl hover:scale-110 transform"
                        title={!session ? "sign in to vote" : "downvote"}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border shadow-sm">1. {rushmore.item1}</div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">2. {rushmore.item2}</div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">3. {rushmore.item3}</div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">4. {rushmore.item4}</div>
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