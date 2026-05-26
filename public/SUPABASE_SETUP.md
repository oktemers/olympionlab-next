# Olympion Supabase Geçiş Notu

Bu sürüm hâlâ statik HTML/CSS/JS prototiptir. Gerçek üyelik ve ödeme için önerilen geçiş:

1. Next.js projesi oluştur.
2. Supabase Auth: e-posta/şifre + Google provider aç.
3. Aşağıdaki tabloları kur: profiles, videos, courses, notes, progress, subscriptions.
4. Ödeme sağlayıcısı: iyzico veya Stripe checkout.
5. Ödeme başarılı olunca profiles.plan alanını `plus`, `pro` veya `mentor` yap.
6. Frontend'de kilitli içerikleri plan alanına göre aç.

Bu dosya geliştirici yol haritasıdır; GitHub Pages canlı statik sitede güvenli ödeme/şifre saklama yapılmamalıdır.
