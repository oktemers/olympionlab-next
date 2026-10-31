# Shopier → Olympionlab otomatik üyelik kurulumu

Bu entegrasyon bir **hazır kurulum**dur: GitHub/Vercel kodu tek başına ödeme aktivasyonunu açmaz.
Canlı kullanımdan önce Supabase migration, Vercel secret'ları ve Shopier webhook'u kurulmalıdır.

## Ürünler

- Plus: https://www.shopier.com/ozanoktemer/52427384 — 349,00 TRY, 30 gün.
- Pro: https://www.shopier.com/ozanoktemer/52427721 — 649,00 TRY, 30 gün.
- Her iki ürün 30 günlük **tek seferlik erişim** sağlar; otomatik kart çekimi yoktur.
- Ürün fiyatı değişirse hem `lib/shopier/server.ts` hem SQL migration doğrulama mantığı güncellenmelidir.
- İndirim kuponları nedeniyle gerçek ödeme tutarı farklıysa otomatik aktivasyon yapılmaz; manuel kontrol gerekir.

## Kurulum sırası

1. Supabase **SQL Editor** → `supabase/migrations/20261031_shopier_verified_memberships.sql` dosyasının tamamını çalıştır.
   SQL, ödemeler için benzersiz sipariş kaydı, servis rolü dışı işlem engeli ve profil planını kullanıcıların kendilerinin yükseltmesini engelleyen trigger oluşturur.
2. Vercel → Project → Settings → Environment Variables:
   - `SHOPIER_ACCESS_TOKEN`: Shopier kişisel erişim anahtarın (orders:read yetkisi olmalı).
   - `SUPABASE_SERVICE_ROLE_KEY`: mevcut Supabase sunucu gizli anahtarı.
   - `CRON_SECRET`: en az 32 baytlık rastgele bir sır. Vercel'in günlük görevine gönderdiği Bearer token.
   - `SHOPIER_WEBHOOK_TOKEN`: aşağıda oluşturulan webhook'un **bir kere görünen token değeri**.
   - Anahtarları **asla** bu repoya, sohbete, ekran görüntüsüne, `NEXT_PUBLIC_*` değişkenine veya istemciye koyma.
3. Shopier geliştirici paneli / API ile `order.created` aboneliği aç:
   - URL: `https://www.olympionlab.com/api/payments/shopier/webhook`
   - Event: `order.created`
   - Shopier API'nin POST /v1/webhooks isteği `url` ve `event` alanlarını kabul eder.
   - Oluşturma cevabındaki webhook **token** değerini yalnızca Vercel'de `SHOPIER_WEBHOOK_TOKEN` olarak sakla.
   - Bu **kişisel erişim anahtarı ile aynı şey değildir**. Webhook token'ı bir kere görüntülenir.
4. Vercel'e yeni Production deployment yap.
5. Vercel cron'un güvenli çalışması için `CRON_SECRET` ortam değişkenini mutlaka ekle.
6. Gerçek bir **kontrollü küçük tutarlı ödeme** / test yap: Shopier'in sandbox'ı varsayılmamalı.
   (Ürün fiyatları değişmeden, gerçek ödemeyi yalnızca güvenliyse gerçekleştir.)
   - Önce Olympionlab'da doğrulanmış e-posta ile hesap oluştur.
   - Shopier ödemesinde aynı e-postayı kullan.
   - Shopier sipariş panelinden siparişi doğrula.
   - Supabase `shopier_verified_orders` ve `subscriptions` kayıtlarını ve `profiles.plan` alanını kontrol et.
   - Aynı webhook tekrarlanırsa ikinci üyelik oluşmamalı.
   - Farklı e-posta / iade / eksik veya hatalı tutar / iki ürünlü sepet erişim açmamalı.
   - Hesap eşleşmediyse kullanıcı `/odeme-dogrula` sayfasına giriş yapıp sipariş numarasını girer.

## Çalışma mantığı

- **POST /api/payments/shopier/webhook**: `Shopier-Signature` HMAC-SHA256 ile doğrulanır, yalnızca `Shopier-Event: order.created` işlenir.
- Webhook verisi ödeme kanıtı değildir: `GET https://api.shopier.com/v1/orders/:id` ile tekrar sorgulanır.
- `paymentStatus=paid`, `currency=TRY`, tam ürün ID'si, 1 adet ve tam tutar aranır. `shippingInfo.email` yalnızca doğrulanmış Supabase Auth hesabıyla eşleşirse otomatik aktive edilir.
- Supabase güvenli RPC'si siparişi tek işlemde bir kere işler, abonelik süresini 30 gün uzatır. Aynı sipariş tekrarı uzatmaz.
- **POST /api/payments/shopier/claim**: giriş yapmış ve e-postası doğrulanmış kullanıcılar sipariş numarasıyla kendileri tekrar kontrol edebilir (5/15 dk).
- **GET /api/cron/shopier-expire**: Vercel, `CRON_SECRET` Bearer yetkilendirmesiyle günlük 02:00 UTC'de çalışır; süresi dolmuş Shopier aboneliklerini kapatır, profil planını yeniden hesaplar. Günlük plan nedeniyle tam bitiş saatinden sonraki bir sonraki cron çalışmasına kadar eski plan görünebilir.
- Satın almada **otomatik yenileme yoktur**. Ürün sayfası veya teşekkür sayfasına dönüş asla ödeme kanıtı sayılmaz.

## Üretime almadan önce notlar

- Shopier **refund.updated** olayları bu sürümde üyeliği otomatik iptal etmez; iade/chargeback işlemlerinde manuel plan müdahalesi gerekir. Canlıya geçişte iade sürecini ayrıca tasarla.
- Shopier ürün kimlikleri satış linkindeki kimlikler olarak varsayılmıştır. Bir gerçek Shopier siparişinin API yanıtında `lineItems[0].productId` ile **doğrula**; farklıysa ürün kimliğini SQL ve TS kodunda tutarlı şekilde güncelle.
- Supabase'de önceden manuel tanımlanmış bir üyelik varsa `shopier_membership_baselines` orijinal planı korur.
- Süre sonu tam saniyesinde erişim kapatma için günlük cron yerine uygulama düzeyinde etkin abonelik kontrolü / daha sık görev gerekir. Henüz uygulanmadı.
- Webhook veya Shopier API erişimi yapılandırılmadıkça müşterilerin üyelikleri otomatik açılmaz; mevcut manuel aktivasyon iş akışını devam ettir.
