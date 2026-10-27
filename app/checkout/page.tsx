import { CheckoutPage } from "../../components/olympion-refresh/MarketingPages";
import { HomeChrome } from "../../components/olympion-refresh/HomeChrome";
export const metadata = { title: "Plan Önizlemesi | Olympion Lab", description: "Plan özeti ve ödeme durumu." };
type Search = { plan?: string; trial?: string };
export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  return <HomeChrome active="/fiyatlandirma"><CheckoutPage embedded plan={search?.plan === "pro" ? "pro" : "plus"} trial={search?.trial === "7"} /></HomeChrome>;
}
