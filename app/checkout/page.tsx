import { PublicNav } from "@/components/PublicNav";

export default function CheckoutPage({ searchParams }: { searchParams: { plan?: string } }) {
  return (
    <>
      <PublicNav />
      <main className="container hero">
        <span className="badge">Ödeme Demo</span>
        <h1>{searchParams.plan || "plus"} planı</h1>
        <p className="muted">iyzico entegrasyonu bağlandığında ödeme formu burada açılacak.</p>
        <a className="btn btn-primary" href="/dashboard">Dashboard’a Dön</a>
      </main>
    </>
  );
}
