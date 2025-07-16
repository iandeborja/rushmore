// Temporarily disabled NextAuth to avoid Vercel deployment issues
// Will re-enable after successful deployment

export async function GET() {
  return new Response("Auth temporarily disabled", { status: 200 });
}

export async function POST() {
  return new Response("Auth temporarily disabled", { status: 200 });
}
