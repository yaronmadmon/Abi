import { redirect } from 'next/navigation'

// /home now redirects to /today (the primary home page)
export default function HomePage() {
  redirect('/today')
}
