import { PublicNav } from "@/components/PublicNav";

const plans = [
  ["Free", "₺0", "Seçili ücretsiz videolar ve temel rota önizlemesi."],
  ["Plus", "₺199", "Geniş video arşivi, PDF notları ve rota sistemi."],
  ["Pro", "₺349", "Tüm premium içerikler, AI Koç ve Labs erişimi."],
  ["Mentörlük", "Başvuru", "Kişisel takip ve özel çalışma rotası."]
];

export default function PricingPage() {
  return (
    <>
      <PublicNav />
      <main className="container hero">
        <span className="badge">Fiyatlandırma</span>
        <h1>Hedefine uygun planı seç.</h1>
        <div className="grid grid-2">
          {plans.map(([name, price, desc]) => (
            <article className="card" key={name}>
              <h2>{name}</h2>
              <h1 style={{ fontSize: 48 }}>{price}</h1>
              <p className="muted">{desc}</p>
              <a className="btn btn-primary" href={name === "Mentörlük" ? "/mentorship-application" : `/api/payments/create?plan=${name.toLowerCase()}`}>Seç</a>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
