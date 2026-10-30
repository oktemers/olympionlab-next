# OlympionLab — Google Giriş Ekranında Supabase URL'si Görünmesini Ücretsiz Önleme

Bu çözüm, ücretli Supabase **Custom Domain** seçeneğini kullanmaz.
Google Identity Services (GIS) butonu doğrudan OlympionLab içinde açılır.
Google ID token'ı Supabase `signInWithIdToken({provider:"google"})` ile doğrulanır.

## 1. Google Cloud ayarları

1. [Google Auth Platform](https://console.cloud.google.com/auth/overview) içine gir. **OlympionLab ile aynı Google Cloud projesini** seç.
2. **Clients** bölümünden halihazırda Supabase `Authentication > Providers > Google` içerisinde kullandığın **Web application** tipindeki OAuth istemcisini aç. Kayıtlı istemci kimliği `...apps.googleusercontent.com` ile biter.
3. **Authorized JavaScript origins** alanına şu adresleri ekle:
   - `https://olympionlab.com`
   - `https://www.olympionlab.com`
   - Testi Vercel önizlemesinde yapacaksan **o önizlemenin TAM kök adresini** ekle; `*.vercel.app` gibi joker karakter kullanma.
4. Mevcut **Authorized redirect URI** değerini silme. Eski OAuth girişini yedek tutuyoruz. Popup ID token akışında ayrıca callback URI gerekmiyor.
5. **Branding** altında uygulama adını `OlympionLab`, destek e-postasını ve varsa logonu ayarla. Google hangi marka ayrıntılarını göstereceğini inceleme ve doğrulama durumuna göre belirler.
6. Gerekirse `olympionlab.com` alan adını Google Search Console ile doğrula ve Google Auth Platform **Authorized domains** ayarına ekle.

## 2. Supabase ayarları

1. Supabase Dashboard > **Authentication > Providers > Google**.
2. Google provider'ın etkin olduğunu ve buradaki **Client ID** değerinin Google Cloud'daki web istemcisiyle eşleştiğini doğrula.
3. Yeni bir Google Client ID açma. Mevcut ID'yi kullanarak mevcut Supabase giriş bağlantılarını koru.
4. Var olan Google Client Secret yalnızca Supabase içinde kalmalı; Next.js veya Vercel'in `NEXT_PUBLIC_` değişkenine koyma.

## 3. Vercel ayarı

1. Vercel > OlympionLab project > **Settings > Environment Variables**.
2. Şu değişkeni ekle:
   - Name: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Value: Google Cloud'daki **Web application OAuth Client ID** (`...apps.googleusercontent.com`)
3. En az Production ortamına ekle. Preview ortamında test edeceksen Preview için de tanımla ve Google Cloud'a bu önizlemenin gerçek origin adresini ekle.
4. **Redeploy** yap. `NEXT_PUBLIC_` değeri Next.js derlemesinde okunduğundan env değişikliği eski deploy'u otomatik güncellemez.

Google Client ID genel/bilinen bir tanımlayıcıdır, sır değildir. **Client Secret** ise kesinlikle gizlidir.

## 4. Test

- `https://olympionlab.com/giris` > Google'ın resmi **Google ile devam et** düğmesine bas.
- Açılan Google oturum penceresinde alan adı ve uygulama kimliğini kontrol et.
- Mevcut Google hesabını seç; başarılı olunca `/panel` açılmalı ve mevcut Supabase oturumu çalışmalı.
- Gizli sekmede, mobil Chrome/Safari ve yeni Google hesabıyla test et. Onay ekranı veya Google'ın kendi görünümü cihaz ve doğrulama durumuna göre değişebilir.
- Developer Console'da `The given origin is not allowed for the given client ID` hatası çıkarsa, Google Cloud'daki **Authorized JavaScript origins** adreslerini bire bir kontrol et.
- `Invalid audience` ya da Supabase `invalid id token` hatası varsa web Client ID ile Supabase Google provider eşleşmesini kontrol et.

## 5. Geçiş ve geri alma

- **Önce V14 (PR #13) birleştirilmeli**. Bu PR V14 üstüne hazırlanmış bir değişikliktir.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` tanımlı değilse, eski Supabase OAuth formu **yedek olarak** gösterilir.
- Geçiş sırasında Supabase'in eski Google OAuth yönlendirme URI'sini silme; mevcut kullanıcı girişleri etkilenmesin.
- Bir hata olursa Vercel ortam değişkenini kaldırıp yeniden deploy ederek eski yönteme geri dönülebilir.

**Önemli:** Bu yöntem Google'ın göstereceği tüm metinleri zorla değiştiremez; özellikle uygulama adı/logo, Google Cloud Branding incelemesi ve alan adı doğrulamasına bağlıdır. Ancak doğrudan GIS butonu Supabase'in barındırdığı OAuth yönlendirme ekranını kullanmaz.

## Kaynaklar

- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/reference/javascript/auth-signinwithidtoken
- https://developers.google.com/identity/gsi/web/reference/js-reference
