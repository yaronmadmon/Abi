'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Home, UtensilsCrossed, Wallet, Users, Folder } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: '/today', label: 'Today', Icon: Calendar },
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/kitchen', label: 'Kitchen', Icon: UtensilsCrossed },
  { href: '/finance', label: 'Finance', Icon: Wallet },
  { href: '/people', label: 'People', Icon: Users },
  { href: '/office', label: 'Office', Icon: Folder },
]

export default function BottomNavClient() {
  const pathname = usePathname()

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl shadow-soft-lg z-50 transition-colors" 
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/today')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                isActive
                  ? 'scale-105'
                  : 'hover:opacity-80 active:scale-95'
              }`}
            >
              <item.Icon 
                className="w-6 h-6 mb-1 transition-colors duration-200"
                style={{
                  color: isActive ? '#2563eb' : 'var(--icon-color)',
                }}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span 
                className="text-xs font-medium transition-colors duration-200"
                style={{
                  color: isActive ? '#2563eb' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
