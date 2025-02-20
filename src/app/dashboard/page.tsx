import { AnimatedGridPatternDemo } from '@/components/gp'
import React, { Suspense } from 'react'

const Dashboard = () => {
  return (
    <main className="flex justify-center items-center h-screen inset-0">
        <Suspense fallback={<div>Loading playlist analyzer...</div>}>
        <AnimatedGridPatternDemo />
        </Suspense>
    </main> 
    )
}

export default Dashboard