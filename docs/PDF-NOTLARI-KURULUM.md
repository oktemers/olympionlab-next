# OlympionLab PDF Notları — branşlara özel konu föyleri

## Yeni sistem

- Öğrenci ekranı: `/notlar`. Eski statik `public/notes.html` içindeki örnek kartlar yerine Next.js `app/notes/page.tsx` gösterilir.
- Öğrencinin `profiles.branch` alanı fizik, kimya, biyoloji veya matematik notlarını seçer; yönetici `?brans=chemistry` vb. ile diğer katalogları da inceleyebilir.
- Konu kataloğu: `lib/pdf-notes-catalog.ts` (4 branş x 3 konu = 12 föy).
- PDF üretim şablonu: `lib/pdf-notes-renderer.ts` (kapak + 5 içerik sayfası; gerektiğinde daha fazla).
- Sunucu PDF adresi: `/api/notes/<slug>`. PDF doğrudan `Content-Type: application/pdf` ile önizlenir, `?download=1` eklendiğinde dosya olarak indirilir.
- Notlara sadece oturum açmış öğrenciler erişebilir; farklı branşa ait notlar sunucu tarafında engellenir.
- Her branşın ilk konu föyü ücretsiz; diğer ikisi Plus/Pro/mentor planında. Yönetici de erişebilir. Sayfada üyelik yükseltme penceresi bulunur.
- PDF dosyaları GitHub'ın `public` klasöründe tutulmaz; erişim kontrolü atlanmasın diye sunucu isteğinde üretilir. Böylece içerik veya tasarım güncellemesi yeniden PDF üretmeye gerek bırakmaz.

## Konular

Fizik: Vektörler ve Koordinatlar; Newton Yasaları ve Dinamik; Enerji, Momentum ve Çarpışmalar.

Kimya: Atom Yapısı ve Periyodik Eğilimler; Mol, Stokiyometri ve Gazlar; Kimyasal Denge ve Tepkime Yönü.

Biyoloji: Hücre Biyolojisi ve Zar Taşınımı; Mendel Genetiği ve Olasılık; Enzimler ve Metabolizma.

Matematik: Bölünebilme ve Modüler Aritmetik; Kombinatorik ve Güvercin Yuvası; Benzerlik ve Çember.

Her dosya şu altı bölümden oluşur: giriş ve hedefler, temel kavramlar, bağıntılar ve model, çözümlü örnek, olimpiyat çözüm taktikleri, alıştırmalar ve kontrol cevapları. Örneklerin resmî geçmiş sınav sorusu olduğu iddia edilmez.

## Kurulum ve test

- Vercel Production deployment yeni `pdfmake` bağımlılığını kurmalı. Sürüm 0.2.x'in Node API'si kullanılır.
- Free fizik hesabıyla `/notlar` aç. İlk notun önizlemesini ve indirmesini test et. PDF görüntüleyicide en az 6 sayfa olmalı; Türkçe karakter ve formüller kontrol edilmeli.
- İkinci nota basınca Plus yükseltme penceresi gelmeli; adres `/odeme?plan=plus` olmalı. Aynı notun API bağlantısı doğrudan girildiğinde de erişim denetimi çalışmalı.
- Kimya, biyoloji ve matematik hesabıyla giriş yapıldığında kendi branş notları gelmeli; diğer branş PDF'si API üzerinden açılamamalı.
- PDF açılmıyorsa Vercel Function Logs üzerinden `PDF generation failed` mesajını kontrol et.

## İleride genişletme

Yeni konu eklemek için `NOTES` dizisine yeni nesne eklemek yeterli. Arayüz ve API otomatik alır. İçerik üretimindeki her başlık ve çözüm eğitimsel açıdan incelenmeli. PDF okuma/tamamlama takibi bu sürüme eklenmemiştir; panel yalnızca branşın föy sayısını gösterir.
