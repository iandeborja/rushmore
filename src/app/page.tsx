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
            
            <span className="block mt-2 text-lg font-medium text-gray-800">
              create and vote for daily top 4 lists
            </span>
          </p>
        </div>

        {/* Main Call-to-Action Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-in hover-lift">
          <Link 
            href="/play" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 py-4 text-center font-light hover:from-blue-700 hover:to-blue-800 transition-all duration-200 lowercase tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span className="text-lg">●</span>
            play
          </Link>
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl font-light">●</span>
            </div>
            <h3 className="font-medium lowercase text-gray-800 mb-1">daily</h3>
            <p className="text-sm text-gray-600 lowercase">a new prompt every day</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 text-xl font-light">▲</span>
            </div>
            <h3 className="font-medium lowercase text-gray-800 mb-1">vote</h3>
            <p className="text-sm text-gray-600 lowercase">see how you rank</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 text-xl font-light">◆</span>
            </div>
            <h3 className="font-medium lowercase text-gray-800 mb-1">share</h3>
            <p className="text-sm text-gray-600 lowercase">keep your favorites</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-gray-500 text-sm lowercase animate-fade-in" style={{animationDelay: '0.9s'}}>
        &copy; {new Date().getFullYear()} rushmore • created by{" "}
        <a 
          href="https://twitter.com/iandeborja_" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline"
        >
          ian de borja
        </a>
      </footer>
    </div>
  );
}
