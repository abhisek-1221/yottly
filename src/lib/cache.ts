import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CACHE_DURATION = 300

export async function setCache(key: string, data: any) {
  try {
    const serialized = JSON.stringify(data)
    await redis.set(key, serialized, {
      ex: CACHE_DURATION,
    })
    return true
  } catch (error) {
    console.error('Error setting cache:', error)
    return false
  }
}

export async function getCache(key: string) {
  try {
    const data = await redis.get(key)
    if (!data) return null

    const parsed = JSON.parse(data as string)
    return parsed
  } catch (error) {
    console.error('Error retrieving from cache:', error)
    return null
  }
}
