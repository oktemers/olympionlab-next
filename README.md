# Olympion Lab — v24 Theme-Preserved Next.js + Supabase Platform

Bu paket, statik Olympion Lab sitesini gerçek SaaS platformuna çevirmek için hazırlanmış başlangıç projesidir.

## İçindekiler

- Next.js App Router
- Supabase Auth
- Supabase Database + RLS SQL migration
- Protected dashboard
- Onboarding
- Admin video ekleme paneli
- Plan bazlı video erişimi
- Video completion tracking
- AI Koç API route
- iyzico ödeme endpoint placeholder
- Vercel production-ready env yapısı

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase

1. Supabase'de yeni proje aç.
2. `supabase/migrations/0001_initial.sql` dosyasını Supabase SQL Editor'da çalıştır.
3. Auth ayarlarında Site URL:
   - local: `http://localhost:3000`
   - production: `https://olympionlab.com`
4. Redirect URL:
   - `http://localhost:3000/auth/callback`
   - `https://olympionlab.com/auth/callback`

## Vercel Environment Variables

Vercel Project → Settings → Environment Variables:

```txt
NEXT_PUBLIC_SITE_URL=https://olympionlab.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
IYZICO_CALLBACK_URL=https://olympionlab.com/api/payments/callback
```

## İlk admin

Önce siteye kendi hesabınla kayıt ol. Sonra Supabase SQL Editor'da:

```sql
update public.profiles
set role = 'admin', plan = 'pro'
where email = 'oktemerozannnn@gmail.com';
```

## Önemli

API key'leri asla frontend dosyasına yazma. Sadece Vercel Environment Variables ve local `.env.local` içinde kullan.
