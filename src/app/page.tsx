import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gradient-to-br from-yellow-100 to-pink-100">
      <h1 className="text-4xl font-light mb-2 text-center lowercase tracking-wide">rushmore</h1>
      <p className="text-lg text-center max-w-xl mb-4 lowercase">what's your mt. rushmore? every day, answer a new question by picking your top 4. play instantly or sign up to vote and save your rushmores!</p>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-xl font-light lowercase tracking-wide">today's question</h2>
        <p className="text-lg italic lowercase">the best things to bring to a bbq</p>
        <Link href="/play" className="mt-4 bg-blue-600 text-white rounded px-4 py-2 text-center font-light hover:bg-blue-700 transition lowercase tracking-wide">play today's rushmore</Link>
        <Link href="/leaderboard" className="bg-green-600 text-white rounded px-4 py-2 text-center font-light hover:bg-green-700 transition lowercase tracking-wide">view leaderboard</Link>
      </div>
      <div className="flex gap-4 mt-6 items-center">
        <Link href="/auth/signin" className="text-blue-700 hover:underline lowercase">sign in</Link>
        <span>|</span>
        <Link href="/auth/signup" className="text-blue-700 hover:underline lowercase">sign up</Link>
        <span className="text-gray-500 text-sm lowercase">(optional - for voting & saving)</span>
      </div>
      <footer className="mt-12 text-gray-500 text-xs lowercase">&copy; {new Date().getFullYear()} rushmore</footer>
    </div>
  );
}
