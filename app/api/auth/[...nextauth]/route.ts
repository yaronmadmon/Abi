// Note: Using Supabase Auth directly instead of NextAuth for simplicity
// This file is kept for future use if needed
export async function GET() {
  return new Response('Auth endpoint - using Supabase Auth directly', { status: 200 })
}

export async function POST() {
  return new Response('Auth endpoint - using Supabase Auth directly', { status: 200 })
}
