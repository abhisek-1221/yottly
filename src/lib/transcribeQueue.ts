import { Queue, QueueEvents } from 'bullmq'
import { redis } from './upstash'

const connection = {
  host: process.env.UPSTASH_REDIS_HOST!,
  port: parseInt(process.env.UPSTASH_REDIS_PORT || '6379'),
  password: process.env.UPSTASH_REDIS_PASSWORD!,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      return true
    }
    return false
  },
}

export const transcribeQueue = new Queue('transcribe', { connection })

export const transcribeQueueEvents = new QueueEvents('transcribe', { connection })

export async function isQueueOverloaded() {
  const counts = await transcribeQueue.getJobCounts()
  return (counts.waiting || 0) > 20
}

export async function getPositionInQueue(jobId: string | null | undefined) {
  if (!jobId) return null
  const waiting = await transcribeQueue.getWaiting()
  const position = waiting.findIndex((job) => job.id === jobId)
  return position >= 0 ? position + 1 : null
}
