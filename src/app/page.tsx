import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full opacity-20 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-light mb-4 text-center lowercase tracking-wide bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            rushmore
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed lowercase">
            what's your mt. rushmore? every day, answer a new question by picking your top 4. 
            <span className="block mt-2 text-lg font-medium text-gray-800">
              play instantly or sign up to vote and save your rushmores!
            </span>
          </p>
        </div>

        {/* Today's Question Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-light lowercase tracking-wide text-gray-800 mb-2">today's question</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          <p className="text-2xl italic lowercase text-gray-700 text-center mb-8 leading-relaxed">
            "the best things to bring to a bbq"
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/play" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 py-4 text-center font-light hover:from-blue-700 hover:to-blue-800 transition-all duration-200 lowercase tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎯 play today's rushmore
            </Link>
            <Link 
              href="/leaderboard" 
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl px-6 py-4 text-center font-light hover:from-green-700 hover:to-green-800 transition-all duration-200 lowercase tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🏆 view leaderboard
            </Link>
          </div>
        </div>

        {/* Auth Links */}
        <div className="text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link 
              href="/auth/signin" 
              className="text-blue-700 hover:text-blue-800 font-medium lowercase transition-colors duration-200 hover:underline"
            >
              sign in
            </Link>
            <span className="text-gray-400 hidden sm:block">|</span>
            <Link 
              href="/auth/signup" 
              className="text-blue-700 hover:text-blue-800 font-medium lowercase transition-colors duration-200 hover:underline"
            >
              sign up
            </Link>
          </div>
          <p className="text-gray-500 text-sm lowercase italic">
            (optional - for voting & saving your rushmores)
          </p>
        </div>

        {/* Features preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-medium lowercase text-gray-800 mb-1">daily questions</h3>
            <p className="text-sm text-gray-600 lowercase">fresh challenges every day</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-medium lowercase text-gray-800 mb-1">vote & compete</h3>
            <p className="text-sm text-gray-600 lowercase">see how you rank</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">💾</div>
            <h3 className="font-medium lowercase text-gray-800 mb-1">save & share</h3>
            <p className="text-sm text-gray-600 lowercase">keep your favorites</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-gray-500 text-sm lowercase animate-fade-in" style={{animationDelay: '0.9s'}}>
        &copy; {new Date().getFullYear()} rushmore
      </footer>
    </div>
  );
}
