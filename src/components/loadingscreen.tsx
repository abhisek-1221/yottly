import React from 'react'
import { motion } from 'framer-motion'

const LoadingScreen = () => {
  // Variants for container animation
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Variants for dots animation
  const dotVariants = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  // Variants for the text reveal
  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: [0, 1, 0],
      y: 0,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  // Variants for the pulsing circle
  const pulseVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 opacity-50" />

      {/* Main content container */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Pulsing circle background */}
        <motion.div
          className="absolute inset-0 bg-blue-200 rounded-full -z-10 blur-xl"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />

        {/* Loading dots */}
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-blue-500 rounded-full"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <motion.div
          className="text-2xl font-semibold text-blue-700"
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          Loading...
        </motion.div>

        {/* Additional animated elements */}
        <motion.div
          className="absolute -z-10"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="w-48 h-48 border-4 border-blue-200 rounded-full" />
          <div
            className="absolute top-0 w-48 h-48 border-4 border-blue-300 rounded-full"
            style={{ transform: 'rotate(45deg)' }}
          />
          <div
            className="absolute top-0 w-48 h-48 border-4 border-blue-400 rounded-full"
            style={{ transform: 'rotate(90deg)' }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
