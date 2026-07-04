import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateSlugId } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const prompt = searchParams.get('prompt') ?? ''

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const slugId = generateSlugId()
  const qs = prompt ? `?prompt=${encodeURIComponent(prompt)}` : ''
  return NextResponse.redirect(`${origin}/project/${slugId}${qs}`)
}