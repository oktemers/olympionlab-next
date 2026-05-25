import { PublicNav } from "@/components/PublicNav";

export default function MentorshipApplicationPage() {
  return (
    <>
      <PublicNav />
      <main className="container hero">
        <span className="badge">Mentörlük Başvurusu</span>
        <h1>Kişisel rota için başvur.</h1>
        <form className="card form">
          <label>Ad Soyad<input name="full_name" required /></label>
          <label>E-posta<input name="email" type="email" required /></label>
          <label>Telefon<input name="phone" required /></label>
          <label>Sınıf<input name="grade" placeholder="Örn. 9. sınıf" /></label>
          <label>Okul türü<select name="school_type"><option>Fen Lisesi</option><option>Anadolu Lisesi</option><option>Meslek Lisesi</option><option>Diğer</option></select></label>
          <label>Hedef<select name="goal"><option>TÜBİTAK 1. Aşama</option><option>TÜBİTAK 2. Aşama</option><option>Uluslararası</option><option>Kavram öğrenmek</option></select></label>
          <label>Not<textarea name="note" /></label>
          <button className="btn btn-primary" type="button">Başvuruyu Gönder</button>
        </form>
      </main>
    </>
  );
}
