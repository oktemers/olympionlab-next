# Security

Bu Next.js sürümü gizli anahtarları server tarafında tutmak için tasarlanmıştır.

## Saklanmaması gerekenler

- OpenAI API key
- Supabase service role key
- iyzico secret key
- `.env.local`

## Koruma

- Supabase RLS açık
- Admin panel role kontrolü ile korunur
- Premium içerik backend tarafında kontrol edilir
- AI API route login gerektirir
