import { redirect } from 'next/navigation'

// /dashboard now redirects to /today (the primary home page)
export default function DashboardPage() {
  redirect('/today')
}
