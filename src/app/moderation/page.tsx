"use client";

import Link from "next/link";

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 lowercase hover:underline flex items-center gap-2">
            <span className="text-lg">←</span> back to home
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-light text-gray-800 lowercase tracking-wide">moderation dashboard</h1>
            <p className="text-sm text-gray-600 lowercase">temporarily disabled</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">⚡</span>
          </div>
          <h2 className="text-2xl font-light mb-4 text-gray-800 lowercase">moderation features</h2>
          <p className="text-gray-600 lowercase mb-6">the moderation system is temporarily disabled while we fix the database schema.</p>
          <p className="text-sm text-gray-500 lowercase">check back soon for full moderation capabilities!</p>
        </div>
      </div>
    </div>
  );
} 