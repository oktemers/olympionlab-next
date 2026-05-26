# Olympion Premium Platform v8

Bu paket Olympion statik HTML prototipinin premium revizyonudur.

## Yükleme
ZIP içindeki dosyaları GitHub repo ana klasörüne yükleyin. ZIP dosyasının kendisini değil, içindeki dosyaları yükleyin.

## Öne çıkanlar
- Ana sayfa hero animasyonu daha görünür hale getirildi.
- Fiyatlandırma ana sayfaya ve pricing sayfasına 4 paket olarak düzenlendi: Free, Plus, Pro, Mentörlük.
- Günün problemi fizik/matematik kavram kartına dönüştürüldü.
- Video kütüphanesinde kısa videolar filtresi kaldırıldı, watch page eklendi.
- Plus kilitli içerik popup sistemi korundu.
- Olympion Labs bilimsel hesap makinesi, kilitli deneyler ve daha fazla deney popup sistemiyle güncellendi.
- Dashboard’a devam et kartı, heatmap ve platform içi linkler eklendi.
- `app-labs.html`, `video-watch.html`, `pdf-viewer.html` eklendi.
- Login sayfasına Google ile bağlan butonu eklendi.
- Footer ödeme logoları SVG rozetlere dönüştürüldü.

## Not
Bu hâlâ statik frontend prototipidir. Gerçek üyelik, ödeme ve veri saklama için Next.js + Supabase + ödeme sağlayıcı entegrasyonu gerekir.


## v9 notları
- Hero animasyonu ve mobil hero düzeltildi.
- Video kütüphanesi mobil taşma problemi için tek sütun ve yatay filtre düzeni eklendi.
- Dashboard ve panel sayfaları mobilde bottom navigation yapısına geçti.
- Derslerim > Derse Git artık `lesson.html` sayfasına gider. Sağda playlist, tamamlanma tikleri ve YouTube API ile video bitince otomatik işaretleme bulunur.
- Footer ödeme logoları beyaz kartlar içinde ortalandı.
- Roadmap görsel node graph ile güçlendirildi.


## v10 ekleri

- `checkout.html`: ödeme/plan seçimi prototipi.
- `data/videos.json`, `data/courses.json`, `data/notes.json`, `data/labs.json`: içeriklerin HTML dışına taşınması için başlangıç veri katmanı.
- `SUPABASE_SETUP.md` ve `supabase-schema.sql`: gerçek üyelik/profil/ilerleme sistemi için altyapı planı.
- `video-watch.html`: not alma, checkpoint, önerilen akış ve odak modu ile güçlendirildi.
- `app-labs.html`: yörünge/merkezcil etki simülasyonu eklendi.

Not: Gerçek ödeme ve auth için GitHub Pages yeterli değildir; Next.js + Supabase + ödeme sağlayıcısı gerekir.
