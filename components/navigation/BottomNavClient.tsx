'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Home, UtensilsCrossed, Wallet, Users, Folder, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMobilePreview } from '@/contexts/MobilePreviewContext'

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: '/today', label: 'Today', Icon: Calendar },
  { href: '/kitchen', label: 'Kitchen', Icon: UtensilsCrossed },
  { href: '/finance', label: 'Finance', Icon: Wallet },
  { href: '/people', label: 'People', Icon: Users },
  { href: '/office', label: 'Office', Icon: Folder },
  { href: '/settings', label: 'Settings', Icon: Settings },
]

export default function BottomNavClient() {
  const pathname = usePathname()
  const { isMobilePreview } = useMobilePreview()

  // In mobile preview, use absolute positioning relative to phone container
  // In desktop, use fixed positioning relative to viewport
  // Both use centered pill shape with left-1/2 -translate-x-1/2
  const positionType = isMobilePreview ? 'absolute' : 'fixed'

  return (
    <nav 
      className={`${positionType} bottom-4 left-1/2 -translate-x-1/2 glass-floating-bar z-50 transition-all duration-250`}
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        width: isMobilePreview ? 'calc(100% - 2rem)' : 'auto',
        maxWidth: isMobilePreview ? '100%' : '32rem',
      }}
    >
      <div className="flex items-center justify-around h-14 px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/today')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-250 ${
                isActive
                  ? 'scale-105'
                  : 'hover:opacity-80 active:scale-95'
              }`}
            >
              <item.Icon 
                className="w-5 h-5 mb-0.5 transition-colors duration-250"
                style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span 
                className="text-[10px] transition-colors duration-250"
                style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
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
