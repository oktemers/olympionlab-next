# YouTube Rehberlik API kurulumu (OlympionLab)

Hedef: Girişli `/kurslar` -> Fizik -> Rehberlik bölümünün video **sayısı, başlıkları, sırası ve süreleri** doğrudan YouTube playlist'inden gelsin. Var olan 5 örnek Supabase dersi burada gösterilmesin.

- Playlist URL: `https://www.youtube.com/playlist?list=PLNo6NNl7MNAA`
- Playlist ID: `PLNo6NNl7MNAA`
- İlgili kart ve oynatıcı: `/kurslar` ve `/courses/physics-guidance`
- Başka branşlar, public `/video-kutuphanesi` ve site navbarı bu PR ile değiştirilmez.

## 1. Google Cloud API key oluştur

1. https://console.cloud.google.com/apis/library/youtube.googleapis.com aç.
2. OlympionLab'ın Google projesi seçili olsun. **Enable / Etkinleştir** butonuna bas (etkinse bu adımı geç).
3. https://console.cloud.google.com/apis/credentials adresini aç.
4. **Create credentials > API key** seç. Bu, Google girişinde kullandığın OAuth Web Client ID **değil**.
5. Yeni key > Restrict key / Edit API key:
   - **API restrictions**: Restrict key > **YouTube Data API v3** seç.
   - **Application restrictions**: Anahtar Vercel sunucusundan çağrılacağı için **websites/HTTP referrers kısıtlaması uygulama**. Vercel'de sabit outbound IP yoksa IP restriction da çalışmayabilir; sunucu tarafında gizli tutup API restriction kullan.
6. **Save**; anahtarın değerini kopyala. GitHub dosyalarına veya herkese açık ekran görüntüsüne koyma.

## 2. Vercel değişkeni

Vercel -> OlympionLab projesi -> Settings -> Environment Variables -> Add:

| Alan | Değer |
| --- | --- |
| Type | **Secret** |
| Key | `YOUTUBE_API_KEY` |
| Value | Google Cloud'dan aldığın API key |
| Environment | **Production**; Preview'da da test için gerekirse Preview |

İsteğe bağlı ikinci değişken `YOUTUBE_PLAYLIST_REHBERLIK=PLNo6NNl7MNAA` (Config). Bu ID zaten sunucu kodunda varsayılan olarak var, bu nedenle eklemen zorunlu değil.

Google OAuth `NEXT_PUBLIC_GOOGLE_CLIENT_ID` değişkenini değiştirme. YouTube API key `NEXT_PUBLIC_` ile **başlamamalı**, tarayıcıya aktarılmamalı.

## 3. Deploy ve test

1. Production ortamına key eklendikten sonra Vercel -> Deployments -> latest Production -> Redeploy.
2. YouTube playlist'i API key ile okunabilir olmalı. Playlist gizli/Private olduğunda OAuth gerekebilir; Liste Dışı videoların yer aldığı erişilebilir playlist kullanılmalı.
3. `/kurslar` -> `Rehberlik` kartında örnek `5 video` ve hayalî başlıklar yerine YouTube listesindeki gerçek sayıyı, tüm başlıkları ve süreleri gör.
4. Uzun video başlıkları kartta tamamen sarmalı; yeni video eklenince otomatik olarak görünmeli (yaklaşık 10 dakikalık API önbelleği).
5. Ders adına tıklayınca `/courses/physics-guidance?video=<id>` açılmalı.
6. Anahtar yoksa veya API erişimi başarısızsa kart yanlış ders adı göstermemeli, açıklayıcı mesajla `Derse Git` butonunu korumalı.
7. YouTube süreleri `videos.list` API çağrısından alınır; o çağrı kullanılamazsa playlistItems başlığı ve sırası yine listelenir, süre yerine `Video` yazılır.

### Önemli

- `playlistItems.list` ve `videos.list` okumaları düşük kota maliyetlidir; Google Cloud **Quotas** ekranından gerçek limitini kontrol edebilirsin.
- Kod yeni dersler için **Supabase içine satır eklemez**, istemciye API key göndermez.
- YouTube oynatma durumu otomatik tamamlandı/XP olarak **kaydedilmez**. Bunun için ayrı güvenilir ilerleme sistemi gerekir.
- `Liste Dışı` video, bağlantıyı bilen kişilerce görüntülenebilir; ücretli içerik koruması değildir.
- Gerçek playlist içeriği API key olmadan doğrulanamadı; video ID veya başlık uydurulmadı.

## Kod değişiklikleri (V20)

- `app/courses/page.tsx` — yalnızca fizik rehberlik kartı tamamen API playlist verisinden üretilecek; başlıklar tam metin, kart yüksekliği otomatik ve mobil tek sütun.
- `lib/guidance-playlist.ts` — listenin gerçek sırasını kullanır, ek `videos.list` ayrıntıları alınamazsa bile playlist başlıklarını korur, 10 dakika önbellek.
