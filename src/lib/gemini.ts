import { GoogleGenerativeAI, type Part } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

const BATCH_SIZE = 10 // Gemini 2.5+ supports up to 10 videos per request

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

    const parts: Part[] = batch.map((v) => ({
      fileData: {
        fileUri: `https://www.youtube.com/watch?v=${v.youtubeVideoId}`,
      },
    } as Part))

    parts.push({
      text: `You are given ${batch.length} YouTube video(s) in order. For each video, write a 3-4 sentence summary for a morning news digest.

Videos (in order):
${batch.map((v, idx) => `${idx + 1}. "${v.title}"`).join('\n')}

Return ONLY a valid JSON array of strings — one summary per video, in the same order.
Example: ["Summary of video 1...", "Summary of video 2..."]
Write in third person, factual tone. Focus on key points. Do not mention subscribing or the channel name.`,
    })

    const result = await model.generateContent(parts)
    const text = result.response.text().trim()

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try {
        const summaries: string[] = JSON.parse(jsonMatch[0])
        batch.forEach((v, idx) => {
          results[v.youtubeVideoId] = summaries[idx]?.trim() ?? ''
        })
      } catch {
        // Fallback: assign raw text to each video in batch
        batch.forEach((v) => {
          results[v.youtubeVideoId] = text
        })
      }
    } else {
      batch.forEach((v) => {
        results[v.youtubeVideoId] = text
      })
    }
  }

  return results
}
