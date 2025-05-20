import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

async function test() {
  await redis.set('test-key', 'hello')
  const value = await redis.get('test-key')
  console.log('Redis value:', value)
}

test()
