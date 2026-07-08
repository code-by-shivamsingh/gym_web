import JoinPage from '@/src/components/organisms/join'
import React, { Suspense } from 'react'

export default function Join() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-bold text-xl animate-pulse">
        Loading...
      </div>
    }>
      <JoinPage/>
    </Suspense>
  )
}
