# OlympionLab — Otomatik YouTube Playlist Entegrasyonu

Bu entegrasyon **ücretsiz / herkese açık** video kütüphanesine yöneliktir.
Plus/Pro içeriklerini sadece YouTube `Liste Dışı` yaparak korumak mümkün değildir.

## 1. YouTube'da nasıl kullanılır?

1. YouTube Studio'da **Olimpiyat Rehberliği** adlı bir playlist oluştur.
2. Videonu yükle, Görünürlük: **Liste Dışı** seç. `Özel` videolar API anahtarıyla okunamaz.
3. Videoyu doğru playlist'e ekle. Playlist sırası sitedeki video sırasını belirler.
4. Playlist adresini kopyala: `https://www.youtube.com/playlist?list=PL...` ve `list=` sonrasındaki kimliği kullan.
5. Google Cloud Console'da bir proje oluştur, **YouTube Data API v3** etkinleştir ve bir API key oluştur.
6. API anahtarını proje ortam değişkenlerine gir; `NEXT_PUBLIC_` ile başlamamalı.
7. Vercel → Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 sunucu API anahtarı |
| `YOUTUBE_PLAYLIST_REHBERLIK` | `PL...` (Rehberlik oynatma listesinin kimliği) |

**İsteğe bağlı diğer ücretsiz listeler:**

- `YOUTUBE_PLAYLIST_FIZIK`
- `YOUTUBE_PLAYLIST_KIMYA`
- `YOUTUBE_PLAYLIST_MATEMATIK`
- `YOUTUBE_PLAYLIST_BIYOLOJI`
- `YOUTUBE_PLAYLIST_PROJE`

Bu değişkenleri Vercel Preview + Production ortamına gerektiği şekilde ekle, ardından deploy'u yenile.

## 2. Nasıl çalışıyor?

- Sunucu `playlistItems.list` ile playlist'teki videoları (başlık, YouTube ID, sıra) getirir.
- `videos.list` ile süre ve video durumunu kontrol eder.
- Silinmiş, özel veya embed edilemeyen videolar atlanır.
- Her 50 videoda bir sonraki sayfaya geçer; playlist başına en fazla 200 video.
- 10 dakikalık önbellek / Next.js revalidation ile yenilenir; bu **anlık webhook** değildir. Güncelleme daha erken görünebilir veya cache yenilenince gelebilir.
- Aynı video hem eski katalogda hem playlist'teyse yalnızca bir tane gösterilir.
- API anahtarı, playlist kimliği veya YouTube erişimi yoksa mevcut videolar otomatik olarak korunur.
- Ücretsiz video kategorileri: Rehberlik, Fizik, Kimya, Matematik, Biyoloji, Proje.
- Site ziyaretçilerine API anahtarı gönderilmez.

## 3. Önemli gizlilik ve ücretli içerik uyarısı

- **Liste Dışı = şifreli/özel video değildir.** Linki alan kişi başkasına gönderebilir.
- Bir liste dışı video herkese açık playlist'e eklenirse YouTube aramasında görünme riski taşır.
- Genel API anahtarı, erişimi kısıtlı/özel playlist'i okuyamayabilir. `playlistItemsNotAccessible` dönüyorsa önce playlist görünürlüğünü kontrol et.
- Liste dışı **playlist** için API key erişimini varsayma; bazı gizli listeleri okumak için OAuth yetkilendirmesi gerekir.
- Başlangıç için **ücretsiz içerik playlist'i** ile çalış. Plus dersleri için uygulama tarafında ayrı yetkilendirme ve gerçek içerik koruması gerekir; YouTube liste dışı bağlantısı buna yetmez.

## 4. Kontrol listesi

- [ ] `YOUTUBE_API_KEY` etkin ve API yetkisi YouTube Data API v3 için izinli.
- [ ] `YOUTUBE_PLAYLIST_REHBERLIK` doğru `list=` kimliğini içeriyor.
- [ ] Playlist API anahtarı ile erişilebilir.
- [ ] Test videoları `Liste Dışı` ve playlist'e ekli; `Özel` değil.
- [ ] Production/Preview ortam değişkenleri tanımlandı ve yeniden deploy edildi.
- [ ] Sitede `/video-kutuphanesi` → `Rehberlik` filtresi yeni videoyu gösteriyor.
- [ ] Kapak, başlık ve süre doğru; tekrarlanan video yok.
- [ ] Yeni video ekle, yaklaşık 10 dakika sonra sayfayı tekrar ziyaret et.
- [ ] Plus videolarının ID'leri public feed'e eklenmedi.
- [ ] API anahtarı tarayıcı kaynak kodunda veya GitHub'da bulunmuyor.

## 5. Sık sorulanlar

**Video silinirse ne olur?** Playlist'teki silinmiş/özel video senkron listede görünmez. Eski manuel katalogdan gelen videolar yedek liste olarak kalır.

**Video başlığını sonradan değiştirirsem?** Playlist'in yeni başlığını cache yenilendiğinde görebilirsin.

**Otomatik senkronizasyon için cron gerekiyor mu?** Hayır. Video kütüphanesi açıldığında sunucu geçerli önbelleği kullanır; süresi dolunca yeniden okur. Önceden bağımsız arka plan veri aktarımı yapılmaz.

**Güvenli midir?** API anahtarı yalnızca sunucuda tutulur; Google Cloud API key kısıtlamalarında YouTube Data API v3 yetkisini sınırlandır. Anahtarı kamuya açık ortamlara yapıştırma.
