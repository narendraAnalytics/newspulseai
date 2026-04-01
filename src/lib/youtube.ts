export interface VideoItem {
  youtubeVideoId: string
  title: string
  description: string
  publishedAt: Date
}

const BASE = 'https://www.googleapis.com/youtube/v3'
const KEY = process.env.YOUTUBE_API_KEY!

export async function resolveChannelId(handle: string): Promise<string> {
  // Strip leading @ if present
  const cleanHandle = handle.replace(/^@/, '')
  const url = `${BASE}/channels?forHandle=${encodeURIComponent(cleanHandle)}&part=id&key=${KEY}`
  const res = await fetch(url)
  const data = await res.json()
  const id = data?.items?.[0]?.id
  if (!id) throw new Error(`YouTube channel not found for handle: @${cleanHandle}`)
  return id
}

export async function fetchNewVideos(channelId: string, publishedAfter: Date): Promise<VideoItem[]> {
  const url =
    `${BASE}/search?channelId=${encodeURIComponent(channelId)}` +
    `&part=id,snippet&type=video&order=date&maxResults=10` +
    `&publishedAfter=${publishedAfter.toISOString()}&key=${KEY}`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.items) return []

  return data.items.map((item: { id: { videoId: string }; snippet: { title: string; description: string; publishedAt: string } }) => ({
    youtubeVideoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description ?? '',
    publishedAt: new Date(item.snippet.publishedAt),
  }))
}
