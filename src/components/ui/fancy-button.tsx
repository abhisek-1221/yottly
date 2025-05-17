'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

interface FancyButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  loading?: boolean
  success?: boolean
  label: string
}

export const FancyButton = ({
  onClick,
  loading = false,
  success = false,
  label,
}: FancyButtonProps) => {
  const [animationState, setAnimationState] = useState<
    'idle' | 'loading' | 'filling' | 'circling' | 'complete'
  >('idle')
  const [isHovered, setIsHovered] = useState(false)

  // Handle animation state transitions based on loading and success props
  useEffect(() => {
    if (loading && animationState === 'idle') {
      setAnimationState('loading')
      setTimeout(() => {
        setAnimationState('filling')
      }, 500)
    } else if (success && animationState !== 'complete') {
      setAnimationState('circling')
      setTimeout(() => {
        setAnimationState('complete')
      }, 1500)
    } else if (!loading && !success && animationState !== 'idle') {
      setAnimationState('idle')
    }
  }, [loading, success, animationState])

  return (
    <motion.button
      className="relative overflow-hidden flex items-center justify-center px-6 h-10 rounded-full bg-gradient-to-r from-orange-600 to-red-800 hover:from-orange-500 hover:to-red-500 text-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      animate={{
        scale: isHovered && animationState === 'idle' ? 1.05 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      disabled={loading}
    >
      {/* Label */}
      <AnimatePresence>
        {animationState === 'idle' && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Loading Spinner */}
      <AnimatePresence>
        {animationState === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Water filling effect with wave animation */}
      <AnimatePresence>
        {animationState === 'filling' && (
          <>
            {/* Main water fill */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />

            {/* Wave effect */}
            <motion.div className="absolute inset-0 overflow-hidden">
              {/* First Wave */}
              <motion.div
                className="absolute h-full w-[200%]"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
                  backgroundSize: '50% 100%',
                  backgroundRepeat: 'repeat-x',
                  backgroundPosition: 'center',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{
                  duration: 1.4,
                  ease: 'easeOut',
                }}
              />

              {/* Second Wave */}
              <motion.div
                className="absolute h-full w-[200%]"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
                  backgroundSize: '30% 100%',
                  backgroundRepeat: 'repeat-x',
                  backgroundPosition: 'center',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{
                  duration: 1.6,
                  delay: 0.2,
                  ease: 'easeOut',
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Circular progress */}
      <AnimatePresence>
        {(animationState === 'circling' || animationState === 'complete') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-green-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.4,
                type: 'spring',
                stiffness: 200,
              }}
            >
              <Check className="w-4 h-4" strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
