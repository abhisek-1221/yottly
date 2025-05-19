import { Worker } from 'bullmq'
import { Innertube } from 'youtubei.js/web'

const connection = {
  host: process.env.UPSTASH_REDIS_HOST!,
  port: parseInt(process.env.UPSTASH_REDIS_PORT || '6379'),
  password: process.env.UPSTASH_REDIS_PASSWORD!,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
}

// Helper functions
function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

async function fetchTranscript(youtube: any, videoId: string) {
  try {
    const info = await youtube.getInfo(videoId)
    const transcriptData = await info.getTranscript()

    const segments = transcriptData.transcript.content.body.initial_segments.map(
      (segment: any) => ({
        text: segment.snippet.text,
        startTime: formatTimestamp(parseInt(segment.start_ms)),
        endTime: formatTimestamp(parseInt(segment.end_ms)),
      })
    )

    const fullTranscript: string = segments
      .map((segment: { text: string }) => segment.text)
      .join(' ')
      .trim()

    return {
      segments,
      fullTranscript,
    }
  } catch (error) {
    console.error('Error fetching transcript:', error)
    throw error
  }
}

function extractVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export const transcribeWorker = new Worker(
  'transcribe',
  async (job) => {
    console.log(`Processing job ${job.id}: ${job.data.videoUrl}`)

    const { videoUrl } = job.data
    const videoId = extractVideoId(videoUrl)

    if (!videoId) {
      throw new Error('Invalid YouTube URL')
    }

    const youtube = await Innertube.create({
      lang: 'en',
      location: 'IN',
      retrieve_player: false,
    })

    return await fetchTranscript(youtube, videoId)
  },
  {
    connection,
    concurrency: 2,
  }
)

transcribeWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`)
})

transcribeWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`)
})

console.log('Transcribe worker started successfully')
