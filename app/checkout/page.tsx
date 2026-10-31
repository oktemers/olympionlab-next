import { redirect } from "next/navigation";
import { CheckoutPage } from "../../components/olympion-refresh/MarketingPages";
import { HomeChrome } from "../../components/olympion-refresh/HomeChrome";
export const metadata = { title: "Shopier ile Üyelik Ödemesi | Olympion Lab", description: "Olympion Lab üyelik planlarını incele ve hesabını oluştur." };
type Search = { plan?: string };
export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;
  if (search?.plan === "mentor") redirect("/mentorluk-basvurusu");
  const plan = search?.plan === "free" ? "free" : search?.plan === "pro" ? "pro" : "plus";
  return <HomeChrome active="/fiyatlandirma"><CheckoutPage embedded plan={plan} /></HomeChrome>;
}
