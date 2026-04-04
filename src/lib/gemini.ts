import { GoogleGenerativeAI, type Part } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })

const BATCH_SIZE = 1 // Gemini supports only 1 YouTube URL per request

export interface VideoInput {
  youtubeVideoId: string
  title: string
}

/**
 * Summarize multiple YouTube videos in a single Gemini API call.
 * Gemini "watches" each video via its public URL — no transcript download needed.
 * Returns a map of youtubeVideoId → summary string.
 */
export async function summarizeVideos(
  videos: VideoInput[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {}

  // Process in batches of up to 10
  for (let i = 0; i < videos.length; i += BATCH_SIZE) {
    const batch = videos.slice(i, i + BATCH_SIZE)

    const video = batch[0]
    const parts: Part[] = [
      {
        fileData: {
          fileUri: `https://www.youtube.com/watch?v=${video.youtubeVideoId}`,
        },
      } as Part,
      {
        text: `You are summarizing this YouTube video for a morning news digest.
Video title: "${video.title}"
Write a 3-4 sentence summary in third person, factual tone. Focus on key points. Do not mention subscribing or the channel name.
Return ONLY the summary text — no JSON, no formatting.`,
      },
    ]

    const result = await model.generateContent(parts)
    const text = result.response.text().trim()
    results[video.youtubeVideoId] = text
  }

  return results
}
