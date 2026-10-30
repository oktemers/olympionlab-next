import { VIDEOS, type VideoItem } from "@/components/olympion-refresh/video-data";

// YouTube credentials and playlist IDs are read only on the server.
// Configure an accessible playlist for each FREE library category.
// Paid/private Plus video IDs must never be imported into this public catalogue.
const SOURCES = [
  { branch: "rehberlik", id: process.env.YOUTUBE_PLAYLIST_REHBERLIK },
  { branch: "fizik", id: process.env.YOUTUBE_PLAYLIST_FIZIK },
  { branch: "kimya", id: process.env.YOUTUBE_PLAYLIST_KIMYA },
  { branch: "matematik", id: process.env.YOUTUBE_PLAYLIST_MATEMATIK },
  { branch: "biyoloji", id: process.env.YOUTUBE_PLAYLIST_BIYOLOJI },
  { branch: "proje", id: process.env.YOUTUBE_PLAYLIST_PROJE }
] as const;

type PlaylistItem = {
  snippet?: {
    title?: string;
    position?: number;
    resourceId?: { videoId?: string };
  };
  contentDetails?: { videoId?: string };
  status?: { privacyStatus?: string };
};
type ListResponse = {
  items?: PlaylistItem[];
  nextPageToken?: string;
  error?: { code?: number; message?: string };
};
type VideoDetail = {
  id?: string;
  contentDetails?: { duration?: string };
  status?: { privacyStatus?: string; embeddable?: boolean };
};
type DetailResponse = { items?: VideoDetail[] };

const isVideoId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{11}$/.test(value);

const isPlaylistId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{10,120}$/.test(value);

/** ISO 8601 YouTube duration -> a readable video length, e.g. PT10M2S -> 10:02. */
export function formatYouTubeDuration(value: unknown): string {
  if (typeof value !== "string") return "Video";
  const match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value);
  if (!match) return "Video";
  const days = Number(match[1] || 0);
  const hours = days * 24 + Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  const seconds = Number(match[4] || 0);
  if (hours > 0) return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  return minutes + ":" + String(seconds).padStart(2, "0");
}

async function youtubeJSON<T>(endpoint: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const url = new URL("https://www.googleapis.com/youtube/v3/" + endpoint);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("key", apiKey);
  const response = await fetch(url.toString(), {
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error("YouTube API HTTP " + response.status);
  return await response.json() as T;
}

async function getPlaylistVideos(playlistId: string, branch: string, apiKey: string): Promise<VideoItem[]> {
  const collected: PlaylistItem[] = [];
  let token: string | undefined;
  // 4 pages x 50 videos = 200 per subject, protecting the API quota.
  for (let page = 0; page < 4; page++) {
    const result = await youtubeJSON<ListResponse>("playlistItems", {
      part: "snippet,contentDetails,status",
      playlistId,
      maxResults: "50",
      ...(token ? { pageToken: token } : {})
    }, apiKey);
    collected.push(...(result.items || []));
    token = result.nextPageToken;
    if (!token) break;
  }

  const unique = new Map<string, { id: string; title: string; order: number }>();
  for (const item of collected) {
    const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
    const title = item.snippet?.title?.trim();
    if (!isVideoId(id) || !title || ["Private video", "Deleted video"].includes(title)) continue;
    if (item.status?.privacyStatus === "private") continue;
    if (!unique.has(id)) unique.set(id, { id, title: title.slice(0, 180), order: item.snippet?.position || 0 });
  }
  const items = [...unique.values()].sort((a, b) => a.order - b.order);
  if (!items.length) return [];

  const details = new Map<string, VideoDetail>();
  for (let index = 0; index < items.length; index += 50) {
    const batch = items.slice(index, index + 50);
    const response = await youtubeJSON<DetailResponse>("videos", {
      part: "contentDetails,status",
      id: batch.map(item => item.id).join(","),
      maxResults: "50"
    }, apiKey);
    for (const item of response.items || []) {
      if (isVideoId(item.id)) details.set(item.id, item);
    }
  }

  return items.flatMap(item => {
    const detail = details.get(item.id);
    // Only include existing, playable public/unlisted videos. Never list private ones.
    if (!detail || detail.status?.privacyStatus === "private" || detail.status?.embeddable === false) return [];
    return [{
      id: item.id,
      title: item.title,
      branch,
      duration: formatYouTubeDuration(detail.contentDetails?.duration),
      premium: false,
      status: "published" as const
    }];
  });
}

/** Returns automatic playlist videos first, then the existing published/planned fallback catalogue. */
export async function getVideoLibrary(): Promise<VideoItem[]> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  const configured = SOURCES.filter(
    (source): source is { branch: typeof source.branch; id: string } => isPlaylistId(source.id)
  );
  if (!key || !configured.length) return VIDEOS;

  const results = await Promise.allSettled(
    configured.map(source => getPlaylistVideos(source.id, source.branch, key))
  );
  const fromYoutube: VideoItem[] = [];
  for (const [index, result] of results.entries()) {
    if (result.status === "fulfilled") fromYoutube.push(...result.value);
    else console.warn("Olympion YouTube playlist could not be read (" + configured[index].branch + "):", String(result.reason));
  }

  const ids = new Set<string>();
  const merged: VideoItem[] = [];
  for (const item of [...fromYoutube, ...VIDEOS]) {
    if (item.id && ids.has(item.id)) continue;
    if (item.id) ids.add(item.id);
    merged.push(item);
  }
  return merged;
}
