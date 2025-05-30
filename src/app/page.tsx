import { Suspense } from 'react'
import LandingPage from '@/components/LandingPage/lpg'

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <LandingPage />
      </Suspense>
    </main>
  )
}
