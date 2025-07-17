"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/components/Providers";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function FriendsPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [friends, setFriends] = useState<{ email: string, name: string }[]>([]);
  const [rushmores, setRushmores] = useState<any[]>([]);
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/friends?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(setFriends)
        .catch(() => setFriends([]));
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetch("/api/rushmores")
      .then(res => res.json())
      .then(setRushmores)
      .catch(() => setRushmores([]));
  }, []);

  const handleVote = async (rushmoreId: string, value: number) => {
    if (!session) {
      showToast("error", "Please sign in to vote!");
      return;
    }
    setVotingStates(prev => ({ ...prev, [rushmoreId]: true }));
    try {
      const email = session.user?.email;
      const response = await fetch(`/api/votes?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rushmoreId, value }),
      });
      if (response.ok) {
        // Refresh data
        fetch("/api/rushmores").then(res => res.json()).then(setRushmores);
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
      showToast("error", "Failed to vote");
    } finally {
      setVotingStates(prev => ({ ...prev, [rushmoreId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/play" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 lowercase hover:underline flex items-center gap-2">
            <span className="text-lg">←</span> back to play
          </Link>
          <h1 className="text-2xl font-light lowercase tracking-wide text-gray-800">friends' rushmores</h1>
        </div>
        {friends.length === 0 && (
          <div className="text-center text-gray-500">You are not following anyone yet.</div>
        )}
        <div className="space-y-8">
          {friends.map(friend => {
            const friendRushmore = rushmores.find(r => r.user.email === friend.email);
            if (!friendRushmore) return null;
            return (
              <div key={friendRushmore.id} className="border border-gray-200 rounded-xl p-6 hover-lift bg-gray-50 transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-light text-gray-800 lowercase text-lg">{friendRushmore.user.name}</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVote(friendRushmore.id, 1)}
                      disabled={votingStates[friendRushmore.id]}
                      className="text-green-600 hover:text-green-800 transition-colors duration-200 text-xl hover:scale-110 transform disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!session ? "sign in to vote" : "upvote"}
                    >
                      {votingStates[friendRushmore.id] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "↑"
                      )}
                    </button>
                    <span className="font-light text-lg min-w-[2rem] text-center">{friendRushmore.voteCount}</span>
                    <button
                      onClick={() => handleVote(friendRushmore.id, -1)}
                      disabled={votingStates[friendRushmore.id]}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200 text-xl hover:scale-110 transform disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!session ? "sign in to vote" : "downvote"}
                    >
                      {votingStates[friendRushmore.id] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "↓"
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border shadow-sm">1. {friendRushmore.item1}</div>
                  <div className="bg-white p-3 rounded-lg border shadow-sm">2. {friendRushmore.item2}</div>
                  <div className="bg-white p-3 rounded-lg border shadow-sm">3. {friendRushmore.item3}</div>
                  <div className="bg-white p-3 rounded-lg border shadow-sm">4. {friendRushmore.item4}</div>
                </div>
                {/* Comments and follow/unfollow can be added here as needed */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 