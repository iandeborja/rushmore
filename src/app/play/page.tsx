"use client";

// 🎯 TODAY'S QUESTION: Change this in the API at /api/questions/today/route.ts
// Current question: "best fast food menu items"

import { useState, useEffect, useMemo } from "react";
import { useSession } from "@/components/Providers";
import { useToast } from "@/components/Toast";
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
    username: string;
    email: string;
  };
  voteCount: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  rushmoreId: string;
  user: {
    name: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

export default function PlayPage() {
  const sessionContext = useSession();
  const session = sessionContext?.data;
  const status = sessionContext?.status;
  const { showToast } = useToast();
  const router = useRouter();

  // Redirect to username setup if user is signed in but doesn't have a username
  useEffect(() => {
    if (status === "loading") return;
    // Only redirect if user is authenticated AND doesn't have a username
    if (session?.user && session.user.email && !session.user.username) {
      router.push("/setup-username");
    }
  }, [session, status, router]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [rushmores, setRushmores] = useState<Rushmore[]>([]);
  const [userRushmore, setUserRushmore] = useState<Rushmore | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    item1: "",
    item2: "",
    item3: "",
    item4: "",
    anonymousName: "",
  });
  const [userStats, setUserStats] = useState<any>(null);
  const [showAchievementToast, setShowAchievementToast] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [friends, setFriends] = useState<{ email: string }[]>([]);
  const [sortBy, setSortBy] = useState<'top' | 'bottom' | 'new'>('top');
  const [following, setFollowing] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; type: string } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Check if user has voted today (submitted their rushmore)
  const hasVotedToday = !!userRushmore;

  useEffect(() => {
    fetchData();
    if (session?.user?.email) {
      fetch(`/api/user-stats?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(setUserStats)
        .catch(() => setUserStats(null));
      
      // Fetch friends
      fetch(`/api/friends?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(setFriends)
        .catch(() => setFriends([]));
    } else {
      setUserStats(null);
      setFriends([]);
    }
  }, [session?.user?.email]);

  // Sort rushmores based on current sort option
  const sortedRushmores = useMemo(() => {
    if (!rushmores.length) return [];
    
    const sorted = [...rushmores];
    switch (sortBy) {
      case 'top':
        return sorted.sort((a, b) => b.voteCount - a.voteCount);
      case 'bottom':
        return sorted.sort((a, b) => a.voteCount - b.voteCount);
      case 'new':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return sorted;
    }
  }, [rushmores, sortBy]);

  const fetchData = async () => {
    try {
      // Set today's question (manually updated)
      const questionData = {
        id: "today",
        prompt: "best fast food menu items",
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
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
      showToast("error", "Failed to load today's rushmore");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare submission data - only include anonymousName if user is not logged in
      const submissionData = {
        item1: formData.item1,
        item2: formData.item2,
        item3: formData.item3,
        item4: formData.item4,
        ...(session ? {} : { anonymousName: formData.anonymousName })
      };

      // Add user email to URL for mock sessions
      const url = session?.user?.email 
        ? `/api/rushmores?email=${encodeURIComponent(session.user.email)}`
        : "/api/rushmores";
        
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const newRushmore = await response.json();
        setUserRushmore(newRushmore);
        setRushmores([newRushmore, ...rushmores]);
        setFormData({ item1: "", item2: "", item3: "", item4: "", anonymousName: "" });
        showToast("success", "Rushmore submitted successfully!");
        
        // Handle new achievements
        if (newRushmore.newAchievements && newRushmore.newAchievements.length > 0) {
          setNewAchievements(newRushmore.newAchievements);
          setShowAchievementToast(true);
        }
        
        // Refresh user stats
        if (session?.user?.email) {
          fetch(`/api/user-stats?email=${encodeURIComponent(session.user.email)}`)
            .then(res => res.json())
            .then(setUserStats)
            .catch(() => setUserStats(null));
        }
      } else {
        const error = await response.json();
        if (error.bannedWords) {
          showToast("error", `${error.error} Banned words found: ${error.bannedWords.join(', ')}`);
        } else {
          showToast("error", error.error || "Failed to submit rushmore");
        }
      }
    } catch (error) {
      console.error("Error submitting Rushmore:", error);
      showToast("error", "Failed to submit rushmore");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (rushmoreId: string, value: number) => {
    if (!session) {
      showToast("error", "Please sign in to vote!");
      return;
    }

    // Set loading state for this specific vote
    setVotingStates(prev => ({ ...prev, [rushmoreId]: true }));

    try {
      const email = session.user?.email;
      const response = await fetch(`/api/votes?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rushmoreId, value }),
      });

      if (response.ok) {
        // Refresh data to get updated vote counts
        await fetchData();
        showToast("success", value === 1 ? "Upvoted!" : "Downvoted!");
      } else {
        let errorMessage = "Vote failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || "Vote failed";
        } catch (e) {
          errorMessage = `Vote failed with status ${response.status}`;
        }
        showToast("error", errorMessage);
      }
    } catch (error) {
      console.error("Error voting:", error);
      showToast("error", "Failed to vote");
    } finally {
      setVotingStates(prev => ({ ...prev, [rushmoreId]: false }));
    }
  };

  const shareRushmore = (rushmore: Rushmore) => {
    const url = `${window.location.origin}/rushmore/${rushmore.id}`;
    const title = `@${rushmore.user.username}'s "${question?.prompt}" mt. rushmore`;
    const text = `check out this ${question?.prompt} mt. rushmore`;

    // Try to use native sharing if available
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        showToast("success", "Link copied to clipboard!");
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      showToast("success", "Link copied to clipboard!");
    }
  };

  const handleFollow = async (userEmail: string) => {
    if (!session?.user?.email) {
      showToast("error", "Please sign in to follow users!");
      return;
    }

    try {
      // Add user email to URL for mock sessions
      const url = `/api/friends?email=${encodeURIComponent(session.user.email)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendEmail: userEmail,
        }),
      });

      if (response.ok) {
        setFollowing(prev => ({ ...prev, [userEmail]: true }));
        showToast("success", "User followed successfully!");
      } else {
        const error = await response.json();
        showToast("error", error.error || "Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
      showToast("error", "Failed to follow user");
    }
  };

  const handleUnfollow = async (userEmail: string) => {
    if (!session?.user?.email) {
      showToast("error", "Please sign in to unfollow users!");
      return;
    }

    try {
      // Add user email and friend email to URL for mock sessions
      const url = `/api/friends?email=${encodeURIComponent(session.user.email)}&friendEmail=${encodeURIComponent(userEmail)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setFollowing(prev => ({ ...prev, [userEmail]: false }));
        showToast("success", "User unfollowed successfully!");
      } else {
        const error = await response.json();
        showToast("error", error.error || "Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      showToast("error", "Failed to unfollow user");
    }
  };

  const handleCommentSubmit = async (rushmoreId: string) => {
    if (!session?.user?.email) {
      showToast("error", "Please sign in to comment!");
      return;
    }

    const commentText = commentInputs[rushmoreId]?.trim();
    if (!commentText) {
      showToast("error", "Please enter a comment");
      return;
    }

    try {
      // Add user email to URL for mock sessions
      const url = `/api/comments?email=${encodeURIComponent(session.user.email)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rushmoreId,
          content: commentText,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [...prev, newComment]);
        setCommentInputs(prev => ({ ...prev, [rushmoreId]: "" }));
        showToast("success", "Comment posted successfully!");
      } else {
        const error = await response.json();
        if (error.bannedWords) {
          showToast("error", `${error.error} Banned words found: ${error.bannedWords.join(', ')}`);
        } else {
          showToast("error", error.error || "Failed to post comment");
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      showToast("error", "Failed to post comment");
    }
  };

  const showReportDialog = (id: string, type: string) => {
    setReportTarget({ id, type });
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportTarget || !reportReason) {
      showToast("error", "Please select a reason for the report");
      return;
    }

    try {
      const reportData: any = {
        reason: reportReason,
        description: reportDescription.trim() || undefined,
      };

      if (reportTarget.type === "rushmore") {
        reportData.rushmoreId = reportTarget.id;
      } else if (reportTarget.type === "comment") {
        reportData.commentId = reportTarget.id;
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        showToast("success", "Report submitted successfully");
        setShowReportModal(false);
        setReportTarget(null);
        setReportReason("");
        setReportDescription("");
      } else {
        const error = await response.json();
        showToast("error", error.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      showToast("error", "Failed to submit report");
    }
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
            <Link href="/friends" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-light lowercase tracking-wide hover:underline flex items-center gap-2">
              <span className="text-sm">●</span> friends
            </Link>
            {session?.user?.email === "admin@rushmore.com" && (
              <Link href="/moderation" className="text-red-600 hover:text-red-800 transition-colors duration-200 font-light lowercase tracking-wide hover:underline flex items-center gap-2">
                <span className="text-sm">⚡</span> moderation
              </Link>
            )}
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
        {session && userStats && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div>
                <div className="text-lg font-light text-gray-700 lowercase">your stats</div>
                <div className="flex gap-6 mt-2">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{userStats.totalRushmores}</div>
                    <div className="text-xs text-gray-500">rushmores</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">{userStats.totalVotesCast}</div>
                    <div className="text-xs text-gray-500">votes cast</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-700">{userStats.totalUpvotes}</div>
                    <div className="text-xs text-gray-500">upvotes received</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-700">{userStats.totalDaysPlayed}</div>
                    <div className="text-xs text-gray-500">days played</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">current streak</div>
                <div className="text-2xl font-bold text-red-600">{userStats.currentStreak} 🔥</div>
                <div className="text-xs text-gray-500">
                  longest: {userStats.longestStreak} days
                </div>
                {userStats.lastPlayed && (
                  <div className="text-xs text-gray-400 mt-1">
                    last played: {new Date(userStats.lastPlayed).toLocaleDateString()}
                  </div>
                )}
                {userStats.bestRushmore && (
                  <div className="text-xs text-gray-500 mt-1">
                    best rushmore: {userStats.bestRushmore.upvotes} upvotes
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Today's Question */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light mb-4 lowercase tracking-wide text-gray-800">today's rushmore</h1>
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
                  your username
                </label>
                  <input
                    type="text"
                    value={formData.anonymousName}
                    onChange={(e) => setFormData({ ...formData, anonymousName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent lowercase transition-all duration-200 hover:border-gray-400"
                                          placeholder="enter your username"
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
                    <div className="flex gap-3">
                      <button
                        onClick={() => shareRushmore(userRushmore)}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 lowercase shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        share
                      </button>
                    </div>
                    <span className="text-sm text-gray-600 lowercase bg-gray-50 px-4 py-2 rounded-lg">
                      votes: {userRushmore.voteCount} (↑{userRushmore.upvotes} ↓{userRushmore.downvotes})
                    </span>
                  </div>
          </div>
        )}

        {/* Today's Rushmores */}
        {hasVotedToday && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift" style={{animationDelay: '0.6s'}}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-light text-gray-800 lowercase tracking-wide flex items-center gap-2">
                <span className="text-2xl">●</span>
                today's rushmores
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 lowercase">sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'top' | 'bottom' | 'new')}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm lowercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="top">top</option>
                  <option value="bottom">bottom</option>
                  <option value="new">new</option>
                </select>
              </div>
            </div>
            
            {sortedRushmores.length === 0 ? (
              <div className="text-center py-8 text-gray-500 lowercase">
                no rushmores yet today. be the first!
              </div>
            ) : (
              <div className="space-y-6">
                {sortedRushmores.map((rushmore, index) => (
                  <div key={rushmore.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 lowercase">#{index + 1}</span>
                        <span className="font-medium text-gray-800 lowercase">@{rushmore.user.username}</span>
                        {session && session.user?.email !== rushmore.user.email && (
                          <button
                            onClick={() => following[rushmore.user.email] 
                              ? handleUnfollow(rushmore.user.email)
                              : handleFollow(rushmore.user.email)
                            }
                            className={`px-3 py-1 rounded-lg text-xs lowercase transition-all duration-200 ${
                              following[rushmore.user.email]
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {following[rushmore.user.email] ? 'unfollow' : 'follow'}
                          </button>
                        )}
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
                          onClick={() => shareRushmore(rushmore)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 lowercase text-sm"
                        >
                          share
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg border text-sm">1. {rushmore.item1}</div>
                      <div className="bg-gray-50 p-3 rounded-lg border text-sm">2. {rushmore.item2}</div>
                      <div className="bg-gray-50 p-3 rounded-lg border text-sm">3. {rushmore.item3}</div>
                      <div className="bg-gray-50 p-3 rounded-lg border text-sm">4. {rushmore.item4}</div>
                    </div>
                    <div className="text-xs text-gray-500 lowercase">
                      total votes: {rushmore.voteCount} • {new Date(rushmore.createdAt).toLocaleTimeString()}
                    </div>
                    
                    {/* Comments Section */}
                    <div className="mt-4 border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 lowercase">comments</h4>
                        <button
                          onClick={() => setExpandedComments(prev => ({ ...prev, [rushmore.id]: !prev[rushmore.id] }))}
                          className="text-xs text-blue-600 hover:text-blue-800 lowercase"
                        >
                          {expandedComments[rushmore.id] ? 'hide' : 'show'} comments
                        </button>
                      </div>
                      
                      {expandedComments[rushmore.id] && (
                        <div className="space-y-3">
                          {/* Comment Input */}
                          {session && (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={commentInputs[rushmore.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [rushmore.id]: e.target.value }))}
                                placeholder="add a comment..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm lowercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && commentInputs[rushmore.id]?.trim()) {
                                    handleCommentSubmit(rushmore.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleCommentSubmit(rushmore.id)}
                                disabled={!commentInputs[rushmore.id]?.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm lowercase hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                post
                              </button>
                            </div>
                          )}
                          
                          {/* Comments List */}
                          <div className="space-y-2">
                            {comments.filter(c => c.rushmoreId === rushmore.id).map((comment) => (
                              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-gray-700 lowercase">{comment.user.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800 lowercase">{comment.content}</p>
                              </div>
                            ))}
                            {comments.filter(c => c.rushmoreId === rushmore.id).length === 0 && (
                              <p className="text-xs text-gray-500 lowercase italic">no comments yet</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Achievement Toast */}
        {showAchievementToast && newAchievements.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-xl z-50 animate-slide-in">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="font-bold lowercase">achievement unlocked!</div>
                <div className="text-sm opacity-90">
                  {newAchievements.length === 1 
                    ? newAchievements[0]
                    : `${newAchievements.length} new achievements`
                  }
                </div>
              </div>
              <button
                onClick={() => setShowAchievementToast(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 