"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
          <Link href="/" className="text-blue-600 hover:underline lowercase">
            ← back to home
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/leaderboard" className="text-blue-600 hover:underline font-light lowercase tracking-wide">
              leaderboard
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
        </div>

        {/* Today's Question */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-light text-center mb-4 lowercase tracking-wide">today's question</h1>
          <p className="text-xl text-center italic text-gray-700 lowercase">{question?.prompt}</p>
        </div>

        {/* Submit Form */}
        {!userRushmore && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-light mb-4 lowercase tracking-wide">submit your rushmore</h2>
            {!session && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm lowercase">
                  💡 <strong>tip:</strong> sign in to save your rushmores and vote on others!
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!session && (
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-1 lowercase">
                    your name
                  </label>
                  <input
                    type="text"
                    value={formData.anonymousName}
                    onChange={(e) => setFormData({ ...formData, anonymousName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lowercase"
                    placeholder="enter your name"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-1 lowercase">
                    #1
                  </label>
                  <input
                    type="text"
                    value={formData.item1}
                    onChange={(e) => setFormData({ ...formData, item1: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lowercase"
                    placeholder="your first pick"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-1 lowercase">
                    #2
                  </label>
                  <input
                    type="text"
                    value={formData.item2}
                    onChange={(e) => setFormData({ ...formData, item2: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lowercase"
                    placeholder="your second pick"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-1 lowercase">
                    #3
                  </label>
                  <input
                    type="text"
                    value={formData.item3}
                    onChange={(e) => setFormData({ ...formData, item3: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lowercase"
                    placeholder="your third pick"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-1 lowercase">
                    #4
                  </label>
                  <input
                    type="text"
                    value={formData.item4}
                    onChange={(e) => setFormData({ ...formData, item4: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 lowercase"
                    placeholder="your fourth pick"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-light lowercase tracking-wide"
              >
                {submitting ? "submitting..." : "submit my rushmore"}
              </button>
            </form>
          </div>
        )}

        {/* User's Rushmore */}
        {userRushmore && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-light mb-4 text-blue-800 lowercase tracking-wide">your rushmore</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded border">1. {userRushmore.item1}</div>
              <div className="bg-white p-3 rounded border">2. {userRushmore.item2}</div>
              <div className="bg-white p-3 rounded border">3. {userRushmore.item3}</div>
              <div className="bg-white p-3 rounded border">4. {userRushmore.item4}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => shareRushmore(userRushmore)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 lowercase"
              >
                share
              </button>
              <span className="text-sm text-gray-600 self-center lowercase">
                votes: {userRushmore.voteCount} (↑{userRushmore.upvotes} ↓{userRushmore.downvotes})
              </span>
            </div>
          </div>
        )}

        {/* All Rushmores */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-light mb-6 lowercase tracking-wide">everyone's rushmores</h2>
          {rushmores.length === 0 ? (
            <p className="text-gray-500 text-center py-8 lowercase">no rushmores submitted yet. be the first!</p>
          ) : (
            <div className="space-y-6">
              {rushmores.map((rushmore) => (
                <div key={rushmore.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-light text-gray-800 lowercase">{rushmore.user.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(rushmore.id, 1)}
                        className="text-green-600 hover:text-green-800"
                        title={!session ? "sign in to vote" : "upvote"}
                      >
                        ↑
                      </button>
                      <span className="font-light">{rushmore.voteCount}</span>
                      <button
                        onClick={() => handleVote(rushmore.id, -1)}
                        className="text-red-600 hover:text-red-800"
                        title={!session ? "sign in to vote" : "downvote"}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded">1. {rushmore.item1}</div>
                    <div className="bg-gray-50 p-2 rounded">2. {rushmore.item2}</div>
                    <div className="bg-gray-50 p-2 rounded">3. {rushmore.item3}</div>
                    <div className="bg-gray-50 p-2 rounded">4. {rushmore.item4}</div>
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