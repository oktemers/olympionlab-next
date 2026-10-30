import { VideoLibraryPage } from "../../components/olympion-refresh/MarketingPages";
import { HomeChrome } from "../../components/olympion-refresh/HomeChrome";
import { getVideoLibrary } from "@/lib/youtube-playlists";

export const metadata = { title: "Video Kütüphanesi | Olympion Lab", description: "Bilim olimpiyatları video çözümleri ve hazırlık rehberleri." };
export const revalidate = 600; // Changes in YouTube playlists propagate within ~10 minutes.

export default async function Page() {
  const videos = await getVideoLibrary();
  return <HomeChrome active="/video-kutuphanesi"><VideoLibraryPage embedded videos={videos} /></HomeChrome>;
}
