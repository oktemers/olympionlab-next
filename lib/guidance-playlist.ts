/** Server-only free guidance playlist; no Google credentials are exposed to the browser. */
export const GUIDANCE_PLAYLIST_ID = process.env.YOUTUBE_PLAYLIST_REHBERLIK?.trim() || "PLNo6NNl7MNAA";

export type GuidanceVideo = {
  youtubeId: string;
  title: string;
  duration: string | null;
  position: number;
};

export type GuidancePlaylist = {
  id: string;
  videos: GuidanceVideo[];
  state: "ready" | "api_key_missing" | "unavailable" | "invalid_id";
};

type PlaylistEntry = {
  snippet?: { position?: number; title?: string; resourceId?: { videoId?: string } };
  contentDetails?: { videoId?: string };
};
type ItemResponse = { items?: PlaylistEntry[]; nextPageToken?: string };
type VideoDetails = {
  id?: string;
  snippet?: { title?: string };
  contentDetails?: { duration?: string };
  status?: { privacyStatus?: string; embeddable?: boolean };
};
type DetailsResponse = { items?: VideoDetails[] };

const idOK = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id);
const playlistOK = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{10,120}$/.test(id);

function durationLabel(iso: string | undefined): string | null {
  if (!iso) return null;
  const match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return null;
  const hours = Number(match[1] || 0) * 24 + Number(match[2] || 0);
  const minutes = Number(match[3] || 0), seconds = Number(match[4] || 0);
  return hours ? hours + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
    : minutes + ":" + String(seconds).padStart(2, "0");
}

async function getYouTube<T>(resource: string, params: Record<string,string>, key: string): Promise<T> {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/" + resource);
  for (const [k,v] of Object.entries(params)) endpoint.searchParams.set(k,v);
  endpoint.searchParams.set("key",key);
  const response = await fetch(endpoint.toString(),{
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error("YouTube API HTTP " + response.status);
  return await response.json() as T;
}

/**
 * The playable iframe works even without the API key if YouTube makes the
 * playlist accessible. The API only supplies ordered video titles/IDs.
 */
export async function getGuidancePlaylist(): Promise<GuidancePlaylist> {
  const id = GUIDANCE_PLAYLIST_ID;
  if (!playlistOK(id)) return {id, videos:[],state:"invalid_id"};
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return {id,videos:[],state:"api_key_missing"};
  try {
    const items: PlaylistEntry[] = [];
    let pageToken: string | undefined;
    for (let page=0;page<4;page++) {
      const response = await getYouTube<ItemResponse>("playlistItems",{
        part:"snippet,contentDetails", playlistId:id,maxResults:"50",
        ...(pageToken?{pageToken}:{})
      },key);
      items.push(...(response.items||[]));
      pageToken=response.nextPageToken;
      if (!pageToken) break;
    }
    const ordered = new Map<string,{ title:string; position:number }>();
    for (const [index,item] of items.entries()) {
      const youtubeId=item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      const title=item.snippet?.title?.trim();
      if (!idOK(youtubeId) || !title || /^(Private|Deleted) video$/i.test(title)) continue;
      if (!ordered.has(youtubeId)) ordered.set(youtubeId,{title:title.slice(0,180),position:item.snippet?.position??index});
    }
    const ids=[...ordered.keys()];
    const detailMap=new Map<string,VideoDetails>();
    for(let i=0;i<ids.length;i+=50){
      const details=await getYouTube<DetailsResponse>("videos",{
        part:"snippet,contentDetails,status",id:ids.slice(i,i+50).join(",")
      },key);
      for(const video of details.items||[]) if(idOK(video.id)) detailMap.set(video.id,video);
    }
    const videos:GuidanceVideo[]=[];
    for(const [youtubeId,listing] of ordered){
      const details=detailMap.get(youtubeId);
      if(!details || details.status?.privacyStatus==="private" || details.status?.embeddable===false)continue;
      videos.push({
        youtubeId, title:(details.snippet?.title?.trim()||listing.title).slice(0,180),
        duration:durationLabel(details.contentDetails?.duration),position:listing.position
      });
    }
    videos.sort((a,b)=>a.position-b.position);
    return {id,videos,state:"ready"};
  } catch (error) {
    console.warn("Guidance playlist sync unavailable:",error instanceof Error?error.message:"unknown failure");
    return {id,videos:[],state:"unavailable"};
  }
}
