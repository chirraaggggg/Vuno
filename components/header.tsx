"use client"
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "./logo"
import { DarkModeToggle } from "./dark-mode-toggle"

const Header = () => {
  const pathname = usePathname()
  const isProjectPage = pathname.startsWith('/project/')

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="w-full">
      <div className={cn(`w-full flex py-3.5 px-8
         items-center justify-between
         `,
        isProjectPage && "absolute top-0 z-50 px-2 py-1 right-0 w-auto"
      )}>

        <div>
          {!isProjectPage && <Logo />}
        </div>

        <div className="flex items-center justify-end gap-3">
          <DarkModeToggle />

          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden md:block">{user.email}</span>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">Log in</Link>
              <Link href="/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
