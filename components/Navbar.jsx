'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar({ userEmail }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/leads', label: 'Leads' },
  ]

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
                <span className="text-sm font-black text-gray-950">L</span>
              </div>
              <span className="font-bold text-white text-sm tracking-wide">
                LeadFlow
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    pathname === item.href
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
