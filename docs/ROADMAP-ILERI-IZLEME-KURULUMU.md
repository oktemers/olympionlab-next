# Olympionlab yol haritası ilerleme kurulumu

## Kapsam

- /rota/adim/2: seçilen branşa ait gerçek `course_sections.lesson_videos` kayıtları, her video için ayrı %0/%100, ücretsiz ortak YouTube rehberliği ve diğer çalışma görevleri.
- /rota/adim/3: `learning_modules` soru setleri, pratik ve sınav görevleri; "Soruları çözdüm" manuel tamamlaması.
- /rota/adim/4 ve /panel: `user_module_progress`, `user_video_progress` ve rehberlik ilerlemelerinin birlikte hesaplandığı rota yüzdesi.
- /rota/video/:id: Plus/Pro erişim denetimi; video geçerliyse gerçek YouTube oynatıcı. Video bitince tamamlamayı kaydeder; manuel seçenek de vardır.
- /api/roadmap/progress: Sunucuda kullanıcı, branş, görev kimliği ve Plus üyeliği kontrolleri. Genel rehberlik ücretsiz.
- /kurslar: ortak rehberlikte izleme yüzdesi.

## ZORUNLU Supabase SQL (bir kere çalıştırılmalı)

GitHub'da yer alan `supabase/migrations/20261031_guidance_video_progress.sql` dosyasının tamamını kendi Supabase projenin **SQL Editor** kısmına yapıştırıp **Run** çalıştır.

Bu dosya `user_guidance_video_progress` tablosunu ve sadece kullanıcının kendi ilerlemesini okumasına/yazmasına izin veren RLS politikalarını oluşturur. Videoların YouTube liste verileri ayrı saklandığı için bu yeni tablo olmadan ortak rehberlik tamamlama kaydı yapılamaz.

**Önemli:** GitHub'a migration dosyası eklenmesi mevcut Supabase veritabanında otomatik SQL çalıştırmaz. Migration uygulanmadan rehberlik oynatılır ama tamamlandı kaydı 503 hatası verir.

## Mevcut tablo/izinler

Mevcut `learning_modules`, `user_module_progress`, `lesson_videos`, `user_video_progress`, `user_study_days` tabloları kurulu ve oturum açan kullanıcının kendi satırlarını yazabilmesine izin veriyor olmalı. Bu tabloların şeması bu repoda bütünüyle bulunmadığı için çalışma ortamında RLS izinlerini ve gerçek veri akışını doğrula.

Yeni soru/video içerikleri kullanıcının seçili branşıyla eşleşen Supabase kaydı olarak eklenmeli. Örneğin kimya için `course_sections.branch='chemistry'` ve ilişkili `lesson_videos` kayıtları olmalı. Var olmayan video veya çözüm içeriği otomatik üretilmez. Yol haritasındaki eski 404 veren modül `href` değerlerine doğrudan gidilmez.

## Test planı

1. `/panel` üzerinde `branch=chemistry` kullanıcı ile rota yüzdesini gör.
2. `/rota/adim/2` sayfasında kimyaya ait gerçek video adı bulunuyorsa Plus üye olarak aç, video sonunda/manuel olarak tamamla.
3. Aynı videonun ilerlemesi `%100`, /panel ve /rota/adim/4 oranları artmış olmalı.
4. `/rota/adim/3` için bir soru görevi tamamla; sonuç /panel ve /rota/adim/4 üzerinde görünmeli.
5. Free hesapta Plus içeriğe tıklandığında yükseltme penceresi ve `/odeme?plan=plus` bağlantısını doğrula.
6. Ortak `/courses/physics-guidance` videosunu bitir; `/kurslar` ve yol haritasında %100 ile kaydedilmiş olarak gör.
7. Aynı görevi tekrar işaretlediğinde haftalık çalışma tamamlaması ikinci defa artmamalı.
8. Başka branşta bir videonun kimliğini endpoint'e göndererek tamamlayamadığını kontrol et.
9. Tarayıcı yenilemesinden sonra ilerlemenin korunmasını doğrula.

### İzleme doğrulama notu

YouTube IFrame API'nin `ENDED` olayı otomatik tamamlama tetikler; alternatif `İzledim, tamamla` butonu öğrencinin beyanıdır. Soru çözümü de kullanıcı beyanına dayanır. Gerçek aktif izleme süresi, doğru cevap yüzdesi veya sınav puanı bu sürümde otomatik doğrulanmaz. Haftalık çalışma süresi görev/yayın süresi üzerinden **tahmini** hesaplanır; dakika dakika izleme telemetrisi değildir.
