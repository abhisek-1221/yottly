'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Send,
  Globe,
  Video,
  ChartSpline,
  Volleyball,
  Captions,
  HelpCircle,
} from 'lucide-react'
import useDebounce from '../app/hooks/use-debounce'
import { useRouter } from 'next/navigation'

interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  short?: string
  end?: string
  route?: string
}

interface SearchResult {
  actions: Action[]
}

const allActions = [
  {
    id: '1',
    label: 'Analyze Playlist',
    icon: <ChartSpline className="h-4 w-4 text-orange-500" />,
    description: 'v3-api',
    short: '⌘K',
    end: 'Active',
    route: '/analyze',
  },
  {
    id: '2',
    label: 'Summarize AI Workspace',
    icon: <Volleyball className="h-4 w-4 text-blue-500" />,
    description: 'Groq 2.0',
    short: '',
    end: 'Active',
    route: '/summarize',
  },
  {
    id: '3',
    label: 'Transcribe Video',
    icon: <Captions className="h-4 w-4 text-yellow-500" />,
    description: 'Innertube',
    short: '',
    end: 'Active',
    route: '/transcribe',
  },
  {
    id: '4',
    label: 'Channel Stats',
    icon: <Video className="h-4 w-4 text-green-500" />,
    description: 'v3-API',
    short: '',
    end: 'Beta Version',
    route: '/stats',
  },
  {
    id: '5',
    label: 'Compare Videos',
    icon: <Globe className="h-4 w-4 text-purple-500" />,
    description: 'ExaAI',
    short: '',
    end: 'Beta Version',
    route: '/compare',
  },
  {
    id: '6',
    label: 'Quiz Generator',
    icon: <HelpCircle className="h-4 w-4 text-pink-500" />,
    description: 'AI Powered',
    short: '',
    end: 'New',
    route: '/quiz',
  },
]

function FeatureSearchBar({ actions = allActions }: { actions?: Action[] }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [canScroll, setCanScroll] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 200)

  const router = useRouter()

  useEffect(() => {
    if (!isFocused) {
      setResult(null)
      return
    }

    if (!debouncedQuery) {
      setResult({ actions: allActions })
      return
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim()
    const filteredActions = allActions.filter((action) => {
      const searchableText = action.label.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })

    setResult({ actions: filteredActions })
  }, [debouncedQuery, isFocused])

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight } = scrollContainerRef.current
        setCanScroll(scrollHeight > clientHeight)
      }
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [result])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsTyping(true)
  }

  const handleActionClick = (route: string) => {
    router.push(route)
  }

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: 'auto',
      transition: {
        height: {
          duration: 0.4,
        },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
        },
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 10,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Reset selectedAction when focusing the input
  const handleFocus = () => {
    setSelectedAction(null)
    setIsFocused(true)
  }

  return (
    <div className="w-full max-w-xl sm:scale-125">
      <div className="fixed inset-x-0 flex flex-col justify-start items-center">
        <div className="w-full max-w-sm sticky top-0 bg-background z-10 pt-1 pb-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="What's up? Search Features..."
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="pl-3 pr-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
              <AnimatePresence mode="popLayout">
                {query.length > 0 ? (
                  <motion.div
                    key="send"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Send className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <AnimatePresence>
            {isFocused && result && !selectedAction && (
              <motion.div
                className="w-full border rounded-md shadow-sm overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1"
                variants={container}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <div
                  ref={scrollContainerRef}
                  className="max-h-[calc(5*2.75rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 relative"
                >
                  <motion.ul className="py-1">
                    {result.actions.map((action) => (
                      <motion.li
                        key={action.id}
                        className="px-3 py-2.5 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer rounded-md mx-1"
                        variants={item}
                        layout
                        onClick={() => action.route && handleActionClick(action.route)}
                      >
                        <div className="flex items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{action.icon}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {action.label}
                            </span>
                            <span className="text-xs text-gray-400">{action.description}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{action.short}</span>
                          <span className="text-xs text-gray-400 text-right">{action.end}</span>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                  {canScroll && (
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
                  )}
                </div>
                <div className="mt-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Press ⌘K to open commands</span>
                    <span>ESC to cancel</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default FeatureSearchBar
