import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome to Vuno</h1>
        <p className="text-sm text-gray-400">Signed in as {user.email}</p>
      </div>
    </div>
  )
}