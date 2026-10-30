# OlympionLab — Giriş Sonrası Rehberlik Oynatma Listesi

## Hedef

Giriş yapmış öğrenci `/kurslar` açtığında Rehberlik video spotu en üstte görünür.
"İlk videoyu izle" düğmesi `/courses/rehberlik` sayfasını açar.
Oynatıcı **playlist'in kendi sırasındaki ilk videodan** başlar; sonraki videolar YouTube oynatıcısından seçilebilir.

### Kullanıcının gönderdiği oynatma listesi

- Bağlantı: `https://www.youtube.com/playlist?list=PLNo6NNl7MNAA`
- Kimlik: `PLNo6NNl7MNAA`
- **Bağlantı içeriği henüz doğrulanamadı.** YouTube bu kimliğin varlığını/erişimini doğrulamıyorsa, YouTube Studio'dan oynatma listesinin *Paylaş* → *Bağlantıyı kopyala* yoluyla tam URL'sini tekrar al.

## Çalışma biçimi

- Varsayılan kimlik koddaki `PLNo6NNl7MNAA`. Başka listede değiştirmek istersen sunucuda `YOUTUBE_PLAYLIST_REHBERLIK` ortam değişkenini tanımlayabilirsin.
- Oynatma listesinin ilk videosu API erişimi olmasa da `youtube-nocookie.com/embed/videoseries?list=...` üzerinden açılır **(YouTube listenin erişimine izin veriyorsa)**.
- Başlık, süre, ilk video görseli, ilk video sırası ve sağdaki liste için sunucu `playlistItems.list` + `videos.list` kullanır.
- API sonuçları 10 dakikaya kadar önbellekte tutulur; yeni video ekledikten sonra tekrar kod değiştirmeye gerek yok.
- API key/erişim yoksa YouTube playlist iframe'i ve playlist bağlantısı kalır, ama video başlığı ve süreleri otomatik listelenmeyebilir.
- Bu içerikler **ücretsiz Rehberlik** videoları içindir. Liste dışı video, bağlantısını bilen kişilerce izlenebilir; premium ücretli video koruması değildir.
- Mevcut `course_sections` veritabanı ve öğrencinin ilerleme kayıtları değiştirilmedi. Bu playlist videosunu izlemek **otomatik tamamlandı** kaydı oluşturmaz.

## Gerekli Vercel ortam değişkeni

Vercel Project → Settings → Environment Variables:

| Key | Value | Type |
| --- | --- | --- |
| `YOUTUBE_API_KEY` | Google Cloud **YouTube Data API v3** API Key | Secret |
| `YOUTUBE_PLAYLIST_REHBERLIK` | `PLNo6NNl7MNAA` | Config (optional; default is this ID) |

**Google OAuth Client ID bu API anahtarı değildir.** `NEXT_PUBLIC_GOOGLE_CLIENT_ID` yalnızca Google ile giriş içindir. YouTube API anahtarı **NEXT_PUBLIC_ ile başlamamalıdır**.

## Test planı

1. Google Cloud'da YouTube Data API v3 etkin ve API key bu API'ye yetkili olsun.
2. Playlist erişilebilir olsun; ilk video Liste Dışı ise **Özel** olarak bırakılmasın. YouTube oynatma listesi public/erişilebilir olmalı.
3. En son commit'in Vercel build'i Ready olmalı ve oturum açılmış hesapla test edilmeli.
4. `/kurslar` içinde ilk görünen Rehberlik spotunda doğru başlık ve thumbnail var mı?
5. `/courses/rehberlik` içinde liste sırası/oynatıcı doğru mu? İkinci video eklenince otomatik geliyor mu?
6. Ana sayfanın header/footer'u, masaüstü dersler ve mobil navbar değişmedi mi?
7. `/courses/rehberlik` çıkış yapmış kullanıcıyı güvenli girişe gönderiyor mu?
8. Yanlış/ulaşılamayan playlist durumunda diğer ders kartları çalışıyor mu?

## Yayın sırası

Bu PR, henüz canlıya alınmamış **V14 (#13)** dalını temel alır; önce V14'ün Supabase güvenlik migration'ı ve giriş testleri tamamlanmalı. Ardından V17 `main` dalına entegre edilir. `V15 (#14)` herkese açık video kütüphanesine yönelik ayrı bir YouTube senkronizasyon PR'ıdır; onu da sonraki aşamada birleştirebilirsin.
