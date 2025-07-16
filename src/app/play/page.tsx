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

  useEffect(() => {
    fetchData();
  }, []);

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
    const text = `My Mt. Rushmore for "${question?.prompt}":\n1. ${rushmore.item1}\n2. ${rushmore.item2}\n3. ${rushmore.item3}\n4. ${rushmore.item4}\n\nPlay at Rushmore!`;
    navigator.clipboard.writeText(text);
    alert("Rushmore copied to clipboard!");
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
            <Link href="/leaderboard" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-light lowercase tracking-wide hover:underline">
              🏆 leaderboard
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
        </div>

        {/* Today's Question */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift border border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light mb-4 lowercase tracking-wide text-gray-800">today's question</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-4"></div>
          </div>
          <p className="text-2xl text-center italic text-gray-700 lowercase leading-relaxed">"{question?.prompt}"</p>
        </div>

        {/* Submit Form */}
        {!userRushmore && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift border border-white/20" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-light mb-6 lowercase tracking-wide text-gray-800">submit your rushmore</h2>
            {!session && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6 animate-pulse-slow">
                <p className="text-yellow-800 text-sm lowercase flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <strong>tip:</strong> sign in to save your rushmores and vote on others!
                </p>
              </div>
            )}
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 animate-fade-in hover-lift" style={{animationDelay: '0.4s'}}>
            <h2 className="text-2xl font-light mb-6 text-blue-800 lowercase tracking-wide flex items-center gap-2">
              <span className="text-2xl">👑</span>
              your rushmore
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">1. {userRushmore.item1}</div>
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">2. {userRushmore.item2}</div>
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">3. {userRushmore.item3}</div>
              <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">4. {userRushmore.item4}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <button
                onClick={() => shareRushmore(userRushmore)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 lowercase shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📤 share
              </button>
              <span className="text-sm text-gray-600 lowercase bg-white px-4 py-2 rounded-lg shadow-sm">
                votes: {userRushmore.voteCount} (↑{userRushmore.upvotes} ↓{userRushmore.downvotes})
              </span>
            </div>
          </div>
        )}

        {/* All Rushmores */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <h2 className="text-2xl font-light mb-8 lowercase tracking-wide text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            everyone's rushmores
          </h2>
          {rushmores.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 lowercase text-lg">no rushmores submitted yet. be the first!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {rushmores.map((rushmore, index) => (
                <div key={rushmore.id} className="border border-gray-200 rounded-xl p-6 hover-lift bg-white/50 backdrop-blur-sm transition-all duration-200">
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
                    <div className="bg-gray-50 p-3 rounded-lg border shadow-sm">1. {rushmore.item1}</div>
                    <div className="bg-gray-50 p-3 rounded-lg border shadow-sm">2. {rushmore.item2}</div>
                    <div className="bg-gray-50 p-3 rounded-lg border shadow-sm">3. {rushmore.item3}</div>
                    <div className="bg-gray-50 p-3 rounded-lg border shadow-sm">4. {rushmore.item4}</div>
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