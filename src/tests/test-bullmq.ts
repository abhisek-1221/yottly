import { Queue, Worker } from 'bullmq'

const connection = {
  host: process.env.UPSTASH_REDIS_HOST!,
  port: parseInt(process.env.UPSTASH_REDIS_PORT!),
  password: process.env.UPSTASH_REDIS_PASSWORD!,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
}

const queue = new Queue('test-queue', { connection })

async function main() {
  const job = await queue.add('test-job', { foo: 'bar' })
  console.log('Job added:', job.id)

  const worker = new Worker(
    'test-queue',
    async (job) => {
      console.log('Processing job:', job.id, job.data)
      return 'done'
    },
    { connection }
  )

  worker.on('completed', (job) => {
    console.log('Job completed:', job.id)
    process.exit(0)
  })
}

main()
