# Rehberlik playlist bağlantısı — V18 düzeltmesi

## Kesin konum

**Giriş yaptıktan sonra → Dersler → Fizik → Rehberlik (slug `physics-guidance`).**

- Dersler sayfası: `/kurslar`
- Mevcut kurs bölümü: `/courses/physics-guidance`
- Playlist: `https://www.youtube.com/playlist?list=PLNo6NNl7MNAA`
- Playlist ID: `PLNo6NNl7MNAA`

**Ayrı `/courses/rehberlik` sayfası ve Dersler ana ekranındaki ekstra Rehberlik kartı kaldırıldı.**
**Herkese açık `/video-kutuphanesi` sayfası değiştirilmedi.**

## Video aktarımı

Bu değişiklik, fizik rehberlik kursunun kendi oynatıcısında şu akışı kullanır:

1. Oturum ve `course_sections.slug = physics-guidance` denetimi.
2. Rehberlik için sunucuda playlist meta verisi çekme (`YOUTUBE_API_KEY` tanımlıysa).
3. İlk video ve playlist sırasıyla diğer videoları mevcut kurs detayında gösterme.
4. Bir videoya basınca aynı `/courses/physics-guidance?video=<youtube-id>` sayfasında oynatma.
5. 10 dakikalık Next.js önbelleğiyle video sırasını ve yeni videoları yenileme.

Sunucu API anahtarı yoksa, video oynatıcı doğrudan `youtube-nocookie.com/embed/videoseries?list=PLNo6NNl7MNAA` adresine bağlanır. Bu, **playlist geçerli ve YouTube embed izni açıksa** ilk videoyu oynatır; meta veri olmadığı için sağdaki özel ders listesi oluşturulamaz.

## Vercel ayarları

| Ad | Değer | Tip |
| --- | --- | --- |
| `YOUTUBE_API_KEY` | YouTube Data API v3 için Google Cloud API key | Secret |
| `YOUTUBE_PLAYLIST_REHBERLIK` | `PLNo6NNl7MNAA` (isteğe bağlı, varsayılan bu) | Config |

**Google OAuth Client ID, YouTube API Key değildir.** YouTube API anahtarını `NEXT_PUBLIC_` ile başlatma.

## Kaynak ve hesap güvenliği

- Bu rota oturum açılmadan erişilemez; fizik dışında başka branş profili varsa `/kurslar` sayfasına geri yönlendirir.
- YouTube'daki **Liste Dışı** videolar yalnızca bağlantı bilenler tarafından da izlenebilir, ücretli ders için koruma değildir.
- Bu düzeltme veritabanındaki `lesson_videos` satırlarını otomatik olarak üretmez veya değiştirmez. **YouTube videolarının tamamlanma/XP kayıtları henüz DB ilerleme akışına otomatik entegre değil.** Ön koşula bağlı sonraki aşamalara geçiş için ayrıca ilerleme eşlemesi gerekir.
- Playlist bağlantısının gerçek videolarını henüz YouTube üzerinden doğrulayamadım; bu sebeple hayalî video ID veya başlık eklemedim.
- Dersler, panel, ortak navbar/header/footer ve herkese açık Video Kütüphanesi etkilenmez.

## Kurulum testi

- [ ] Vercel son commit için **Ready**.
- [ ] Kullanıcı fizikte ve oturum açık; `/kurslar` → mevcut `physics-guidance` kartı → `Derse Git`.
- [ ] İlk oynatma listesi videosu doğru açılıyor.
- [ ] API key tanımlandıysa video adları, kapaklar ve sıralama doğru.
- [ ] Yeni bir video YouTube playlist'e eklenince yaklaşık 10 dakika sonra listede görünüyor.
- [ ] Başka fizik/kimya kursları ve Video Kütüphanesi değişmemiş.
- [ ] Öğrenci çıkış yaptığında korumalı kurs açılmıyor.

## Birleştirme sırası

PR #13 (V14 güvenlik ve ders sistemi) hâlâ `main` dalına alınmamış durumda. V18 düzeltmesi V14'ten dal almıştır. Önce Supabase migration ve V14 doğrulama testleri, sonra bu düzeltme birlikte üretime alınmalı.
