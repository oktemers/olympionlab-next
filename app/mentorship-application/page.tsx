import { HomeChrome } from "@/components/olympion-refresh/HomeChrome";
import styles from "./mentorship.module.css";

export const metadata = {
  title: "Mentörlük Başvurusu | Olympion",
  description: "Bilim olimpiyatları için kişisel çalışma planı ve mentörlük başvurusu.",
};

const input = (name: string, type: string, placeholder: string, required = false) =>
  <input name={name} type={type} placeholder={placeholder} required={required} />;

export default function MentorshipApplicationPage() {
  return <HomeChrome active="">
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}><span className={styles.kickerDot}/> BİRE BİR MENTÖRLÜK</span>
          <h1>Olimpiyat hedefin için <span>birlikte yol çizelim.</span></h1>
          <p>Hangi seviyede olursan ol, çalışmanı daha planlı hâle getirmek mümkün. Hedeflerini paylaş; sana uygun bir hazırlık yaklaşımını birlikte değerlendirelim.</p>
          <div className={styles.highlights}><span>Hedef analizi</span><span>Çalışma planı</span><span>Geri bildirim</span></div>
        </div>
        <div className={styles.heroArt}>
          <img src="/images/olympion-mentorluk.svg" alt="Hedef, plan, pratik ve gelişim aşamalarını gösteren bilimsel yol haritası illüstrasyonu" />
          <span className={styles.artBadge}>Her ilerleme bir adımla başlar.</span>
        </div>
      </section>
      <section className={styles.formSection} aria-labelledby="mentor-form-title">
        <div className={styles.formHeading}>
          <div><span className={styles.eyebrow}>BAŞVURU FORMU</span><h2 id="mentor-form-title">Seni biraz tanıyalım.</h2><p>Birkaç kısa bilgi, hedeflerine uygun bir başlangıç yapmamıza yardımcı olacak.</p></div>
          <div className={styles.formHint}>Yaklaşık 2 dakika <span aria-hidden="true">↗</span></div>
        </div>
        <form className={styles.form} action="https://formsubmit.co/oktemerozan@gmail.com" method="POST">
          <input type="hidden" name="_subject" value="Yeni Olympion Mentörlük Başvurusu" />
          <input type="hidden" name="_template" value="box" />
          <input type="hidden" name="_next" value="https://www.olympionlab.com/tesekkurler" />
          <input type="text" name="_honey" className={styles.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <fieldset className={styles.fieldset}>
            <legend><span>01</span> Seni tanıyalım</legend>
            <div className={styles.fields}>
              <label>Ad Soyad {input("Ad Soyad","text","Adın ve soyadın",true)}</label>
              <label>E-posta {input("E-posta","email","ornek@mail.com",true)}</label>
              <label>Telefon {input("Telefon","tel","05xx xxx xx xx",true)}</label>
              <label>Sınıf
                <select name="Sınıf" required defaultValue=""><option value="" disabled>Sınıfını seç</option><option>Hazırlık</option><option>9. sınıf</option><option>10. sınıf</option><option>11. sınıf</option><option>12. sınıf</option><option>Mezun</option><option>Üniversite</option></select>
              </label>
            </div>
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend><span>02</span> Hedeflerini öğrenelim</legend>
            <div className={styles.fields}>
              <label>Okul türü
                <select name="Okul Türü" required defaultValue=""><option value="" disabled>Okul türünü seç</option><option>Fen Lisesi</option><option>Anadolu Lisesi</option><option>Özel Lise</option><option>Meslek Lisesi</option><option>Üniversite</option><option>Diğer</option></select>
              </label>
              <label>Hedef branş
                <select name="Hedef Branş" required defaultValue=""><option value="" disabled>Branşını seç</option><option>Fizik Olimpiyatı</option><option>Kimya Olimpiyatı</option><option>Matematik Olimpiyatı</option><option>Biyoloji Olimpiyatı</option><option>TÜBİTAK Projesi</option><option>Diğer</option></select>
              </label>
              <label>Hazırlık seviyesi
                <select name="Hazırlık Seviyesi" required defaultValue=""><option value="" disabled>Seviyeni seç</option><option>Yeni başlıyorum</option><option>Temel konuları biliyorum</option><option>1. aşamaya hazırlanıyorum</option><option>2. aşamaya hazırlanıyorum</option><option>İleri seviye</option></select>
              </label>
              <label>Okul adı (isteğe bağlı) {input("Okul Adı","text","Okulunun adı")}</label>
            </div>
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend><span>03</span> Kendinden bahset</legend>
            <label>Hedefin ve en çok destek istediğin konu
              <textarea name="Hedef ve Mesaj" required rows={5} placeholder="Hangi olimpiyata hazırlanıyorsun? Ne kadar süren var, hangi konularda gelişmek istiyorsun?" />
            </label>
          </fieldset>
          <div className={styles.formBottom}>
            <p>Başvurun, FormSubmit aracılığıyla Olympion iletişim adresine iletilir. Göndererek bilgilerinle ilgili iletişime geçilmesini kabul edersin.</p>
            <button type="submit">Başvurumu gönder <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>
    </main>
  </HomeChrome>;
}