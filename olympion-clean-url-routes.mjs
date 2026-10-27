import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SEO slugs use ASCII Turkish spellings for stable, shareable URLs.
export const TURKISH_SLUGS = Object.freeze({
  'videos': 'video-kutuphanesi',
  'branches': 'branslar',
  'labs': 'laboratuvarlar',
  'about': 'hakkimizda',
  'courses': 'kurslar',
  'pricing': 'fiyatlandirma',
  'faq': 'sikca-sorulan-sorular',
  'login': 'giris',
  'dashboard': 'panel',
  'settings': 'ayarlar',
  'onboarding': 'baslangic',
  'ai-coach': 'yapay-zeka-kocu',
  'app-labs': 'uygulama-laboratuvarlari',
  'daily-problem': 'gunun-sorusu',
  'roadmap': 'yol-haritasi',
  'notes': 'notlar',
  'lesson': 'ders',
  'problem': 'soru',
  'pdf-viewer': 'pdf-goruntuleyici',
  'video-watch': 'video-izle',
  'mentorship-application': 'mentorluk-basvurusu',
  'privacy': 'gizlilik-politikasi',
  'terms': 'kullanim-kosullari',
  'checkout': 'odeme',
  'yonetim-kurulu': 'yonetim-kurulu',
  'yonetim-kurulu-detay': 'yonetim-kurulu-detay',
  'organizasyon-semasi': 'organizasyon-semasi',
  'kvkk': 'kvkk',
});

const PAGE_EXTS = ['.tsx', '.ts', '.jsx', '.js', '.mdx'];
const exists = (p) => fs.existsSync(p);
const slugOf = (s) => TURKISH_SLUGS[s] ?? s;
const trimSlash = (s) => s.replace(/\/$/, '') || '/';

function topLevelPageRoutes(root) {
  const result = new Set();
  for (const folder of ['app', 'src/app', 'pages', 'src/pages']) {
    const base = path.join(root, folder);
    if (!exists(base)) continue;
    const isApp = folder.endsWith('app');
    for (const ent of fs.readdirSync(base, { withFileTypes: true })) {
      if (isApp && ent.isDirectory() && !ent.name.startsWith('(') && !ent.name.startsWith('@') && !ent.name.startsWith('_')) {
        if (PAGE_EXTS.some(ext => exists(path.join(base, ent.name, 'page' + ext)))) result.add(ent.name);
      } else if (!isApp && ent.isFile() && PAGE_EXTS.some(ext => ent.name.endsWith(ext)) && !ent.name.startsWith('_')) {
        const name = ent.name.replace(/\.[^.]+$/, '');
        result.add(name);
      }
    }
  }
  return result;
}

function publicHtmlRoutes(root) {
  const result = new Set();
  for (const folder of ['public', 'static']) {
    const base = path.join(root, folder);
    if (!exists(base)) continue;
    for (const ent of fs.readdirSync(base, { withFileTypes: true })) {
      if (ent.isFile() && ent.name.endsWith('.html')) result.add(ent.name.slice(0, -5));
    }
  }
  return result;
}

export function getCleanUrlRules(root = path.dirname(fileURLToPath(import.meta.url))) {
  const app = topLevelPageRoutes(root);
  const html = publicHtmlRoutes(root);
  const redirects = [];
  const rewrites = [];
  const records = [];
  const dedupR = new Set();
  const dedupW = new Set();

  function redirect(source, destination, opts = {}) {
    if (source === destination) return;
    const key = `${source}\u0000${JSON.stringify(opts.has || [])}`;
    if (dedupR.has(key)) return;
    dedupR.add(key);
    redirects.push({ source, destination, permanent: true, ...opts });
  }
  function rewrite(source, destination) {
    if (source === destination) return;
    if (dedupW.has(source)) return;
    dedupW.add(source);
    rewrites.push({ source, destination });
  }

  const known = new Set([...app, ...html]);
  if (known.has('index')) redirect('/index.html', '/');
  for (const old of [...known].sort()) {
    if (old === 'index' || old.startsWith('_') || old.startsWith('api')) continue;
    // Auth callbacks and API endpoints are not presentation URLs.
    if (old === 'auth') continue;
    const clean = slugOf(old);
    const canon = '/' + clean;
    const oldPath = '/' + old;
    const target = app.has(old) ? oldPath : `${oldPath}.html`;
    if (old !== clean) redirect(oldPath, canon);
    redirect(`${oldPath}.html`, canon);
    rewrite(canon, target);
    records.push({ old: oldPath, canonical: canon, serves: target });
  }

  // Parameterized organization profile: retain legacy query for old shared URLs.
  // Only enable when the original detail file is actually present.
  const boardDetailExists = known.has('yonetim-kurulu-detay');
  if (boardDetailExists && !app.has('ozan-oktemer')) {
    const condition = { has: [{ type: 'query', key: 'member', value: 'kurucu' }] };
    // Most-specific redirects before generic *.html redirects.
    const specific = [
      { source: '/yonetim-kurulu-detay.html', destination: '/ozan-oktemer', permanent: true, ...condition },
      { source: '/yonetim-kurulu-detay', destination: '/ozan-oktemer', permanent: true, ...condition },
    ];
    redirects.unshift(...specific);
    rewrite('/ozan-oktemer', app.has('yonetim-kurulu-detay')
      ? '/yonetim-kurulu-detay?member=kurucu'
      : '/yonetim-kurulu-detay.html?member=kurucu');
  }

  // Existing Next.js dynamic lesson route: preserve IDs and component behavior.
  for (const base of ['app', 'src/app']) {
    if (PAGE_EXTS.some(ext => exists(path.join(root, base, 'lesson', '[id]', 'page' + ext)))) {
      redirect('/lesson/:id', '/ders/:id');
      rewrite('/ders/:id', '/lesson/:id');
      records.push({ old: '/lesson/:id', canonical: '/ders/:id', serves: '/lesson/:id' });
      break;
    }
  }

  return { redirects, rewrites, records };
}

export function augmentNextConfig(config, root = path.dirname(fileURLToPath(import.meta.url))) {
  if (typeof config === 'function') {
    return (...args) => {
      const result = config(...args);
      return result && typeof result.then === 'function'
        ? result.then(x => augmentNextConfig(x, root))
        : augmentNextConfig(result, root);
    };
  }
  const initial = config || {};
  const { redirects: oursR, rewrites: oursW } = getCleanUrlRules(root);
  const canonical = new Set(oursW.map(x => x.source));
  return {
    ...initial,
    trailingSlash: false,
    async redirects() {
      const prior = typeof initial.redirects === 'function' ? await initial.redirects.call(initial) : [];
      // Replace old canonical-to-.html rules to prevent redirect loops.
      const safePrior = (Array.isArray(prior) ? prior : []).filter(x => !canonical.has(x.source));
      return [...oursR, ...safePrior];
    },
    async rewrites() {
      const prior = typeof initial.rewrites === 'function' ? await initial.rewrites.call(initial) : [];
      if (Array.isArray(prior)) return { beforeFiles: [...oursW, ...prior], afterFiles: [], fallback: [] };
      return {
        beforeFiles: [...oursW, ...(prior?.beforeFiles || [])],
        afterFiles: prior?.afterFiles || [],
        fallback: prior?.fallback || [],
      };
    },
  };
}
[33mf2539c7[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m Turkce URL ve sayfa baglantilari
 public/admin.html                  | 12 [32m++++++[m[31m------[m
 public/ai-coach.html               | 26 [32m+++++++++++++[m[31m-------------[m
 public/app-labs.html               | 12 [32m++++++[m[31m------[m
 public/biyoloji-dashboard.html     | 20 [32m++++++++++[m[31m----------[m
 public/biz-kimiz.html              | 44 [32m++++++++++++++++++++++[m[31m----------------------[m
 public/branches.html               | 56 [32m++++++++++++++++++++++++++++[m[31m----------------------------[m
 public/checkout.html               |  8 [32m++++[m[31m----[m
 public/courses.html                | 16 [32m++++++++[m[31m--------[m
 public/daily-problem.html          | 24 [32m++++++++++++[m[31m------------[m
 public/faq.html                    | 16 [32m++++++++[m[31m--------[m
 public/fizik-dashboard.html        | 20 [32m++++++++++[m[31m----------[m
 public/hakkimizda.html             | 76 [32m++++++++++++++++++++++++++++++++++++++[m[31m--------------------------------------[m
 public/index.html                  | 96 [32m++++++++++++++++++++++++++++++++++++++++++++++++[m[31m------------------------------------------------[m
 public/kimya-dashboard.html        | 20 [32m++++++++++[m[31m----------[m
 public/kvkk.html                   | 20 [32m++++++++++[m[31m----------[m
 public/labs.html                   | 16 [32m++++++++[m[31m--------[m
 public/lesson.html                 | 12 [32m++++++[m[31m------[m
 public/login.html                  |  4 [32m++[m[31m--[m
 public/matematik-dashboard.html    | 20 [32m++++++++++[m[31m----------[m
 public/mentorship-application.html | 56 [32m++++++++++++++++++++++++++++[m[31m----------------------------[m
 public/notes.html                  | 14 [32m+++++++[m[31m-------[m
 public/organizasyon-semasi.html    | 46 [32m+++++++++++++++++++++++[m[31m-----------------------[m
 public/pdf-viewer.html             |  4 [32m++[m[31m--[m
 public/pricing.html                | 14 [32m+++++++[m[31m-------[m
 public/privacy.html                | 20 [32m++++++++++[m[31m----------[m
 public/problem.html                | 16 [32m++++++++[m[31m--------[m
 public/reset-password.html         |  4 [32m++[m[31m--[m
 public/roadmap.html                | 24 [32m++++++++++++[m[31m------------[m
 public/script.js                   | 36 [32m++++++++++++++++++[m[31m------------------[m
 public/settings.html               | 28 [32m++++++++++++++[m[31m--------------[m
 public/sitemap.xml                 | 21 [32m+++++++++[m[31m------------[m
 public/student-labs.html           | 12 [32m++++++[m[31m------[m
 public/terms.html                  | 20 [32m++++++++++[m[31m----------[m
 public/tesekkurler.html            |  4 [32m++[m[31m--[m
 public/video-watch.html            |  4 [32m++[m[31m--[m
 public/videos.html                 | 18 [32m+++++++++[m[31m---------[m
 public/yonetim-kurulu-detay.html   | 50 [32m+++++++++++++++++++++++++[m[31m-------------------------[m
 public/yonetim-kurulu.html         | 56 [32m++++++++++++++++++++++++++++[m[31m----------------------------[m
 38 files changed, 481 insertions(+), 484 deletions(-)
