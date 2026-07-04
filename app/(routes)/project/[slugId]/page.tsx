import ChatInterface from '@/components/chat'
import React from 'react'

const Page = async ({ params, searchParams }: {
  params: Promise<{ slugId: string }>
  searchParams: Promise<{ prompt?: string }>
}) => {
  const { slugId } = await params
  const { prompt } = await searchParams
  return (
    <div>
      <ChatInterface
        key={slugId}
        isProjectPage={true}
        slugId={slugId}
        initialPrompt={prompt ?? ''}
      />
    </div>
  )
}

export default Page
