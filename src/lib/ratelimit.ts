import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './upstash'

export const transcribeRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:transcribe',
})
