import { PricingPage } from "../../components/olympion-refresh/MarketingPages";
import { HomeChrome } from "../../components/olympion-refresh/HomeChrome";
export const metadata = { title: "Fiyatlandırma | Olympion Lab", description: "Olympion Lab Free, Plus ve Pro planları." };
export default function Page() { return <HomeChrome active="/fiyatlandirma"><PricingPage embedded /></HomeChrome>; }
