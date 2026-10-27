import { VideoLibraryPage } from "../../components/olympion-refresh/MarketingPages";
import { HomeChrome } from "../../components/olympion-refresh/HomeChrome";
export const metadata = { title: "Video Kütüphanesi | Olympion Lab", description: "Bilim olimpiyatları video çözümleri ve hazırlık rehberleri." };
export default function Page() { return <HomeChrome active="/video-kutuphanesi"><VideoLibraryPage embedded /></HomeChrome>; }
