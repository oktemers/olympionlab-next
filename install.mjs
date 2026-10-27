#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TURKISH_SLUGS, getCleanUrlRules } from './clean-url-routes.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const root = path.resolve(args.find(x => !x.startsWith('--')) || process.cwd());
const apply = args.includes('--apply');
const config = ['next.config.mjs', 'next.config.js'].map(x => path.join(root, x)).find(fs.existsSync);
if (!config) { console.error('Next.js next.config.mjs bulunamadı. Repo klasörünü belirtin.'); process.exit(1); }
if (config.endsWith('.js')) { console.error('Güvenli otomatik kurulum yalnızca next.config.mjs için. Manuel README adımlarını izleyin.'); process.exit(1); }
const { redirects, rewrites, records } = getCleanUrlRules(root);
if (!records.length) { console.error('app/ veya public/ içinde sayfa bulunamadı. Yanlış repo olabilir.'); process.exit(1); }

const original = fs.readFileSync(config, 'utf8');
const hasPlugin = original.includes('OLYMPION_CLEAN_URL_KIT');
if (!hasPlugin && !/\bexport\s+default\s+/.test(original)) {
 console.error('Config default export biçimi desteklenmiyor. README içindeki manuel birleşimi kullanın.'); process.exit(1);
}
const patched = hasPlugin ? original : `import { augmentNextConfig as OLYMPION_CLEAN_URL_KIT } from './olympion-clean-url-routes.mjs';\n` +
  original.replace(/\bexport\s+default\s+/, 'const __olympion_original_next_config = ') +
  `\nexport default OLYMPION_CLEAN_URL_KIT(__olympion_original_next_config);\n`;

const edits = new Map();
if (!hasPlugin) edits.set(config, patched);
const helper = path.join(root, 'olympion-clean-url-routes.mjs');
const helperContent = fs.readFileSync(path.join(scriptDir, 'clean-url-routes.mjs'), 'utf8');
if (fs.existsSync(helper) && fs.readFileSync(helper,'utf8') !== helperContent && !hasPlugin) {
  console.error('olympion-clean-url-routes.mjs zaten var ve farklı. Üzerine yazılmadı.'); process.exit(1);
}
if (!fs.existsSync(helper)) edits.set(helper, helperContent);

const linkMap = new Map(records.filter(x=>!x.old.includes(':')).map(x=>[x.old.slice(1), x.canonical]));
linkMap.set('index', '/');
const regexEscape = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cleanRe = new RegExp(`^((?:\\.\\.\\/|\\.\\/|\\/)*)(${[...linkMap.keys()].sort((a,b)=>b.length-a.length).map(regexEscape).join('|')})(?:\\.html)?(?=([?#]|$))`);

function replaceQuotedLinks(source) {
  // Changes complete URL-valued literals only; never changes import paths or asset names.
  return source.replace(/(["'`])((?:\.\.\/|\.\/|\/)*[a-z][a-z0-9-]*(?:\.html)?(?:\?[^"'`\r\n]*)?)(\1)/gi, (whole, quote, value) => {
    const match = value.match(cleanRe);
    if (!match) return whole;
    const prefix = match[1];
    const old = match[2];
    // Never mutate Supabase auth callbacks or API URLs.
    if (['api','auth'].includes(old)) return whole;
    const to = linkMap.get(old);
    if (!to) return whole;
    const rest = value.slice(match[0].length);
    const newValue = `${to}${rest}`;
    return `${quote}${newValue}${quote}`;
  });
}

const candidateRoots = ['app','src/app','components','src/components','public','pages','src/pages','lib'];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
    if (item.name === 'node_modules' || item.name === '.next' || item.name === '.git') continue;
    const filepath = path.join(dir, item.name);
    if (item.isDirectory()) walk(filepath);
    else if (/\.(?:html|js|jsx|ts|tsx)$/.test(item.name) && !filepath.endsWith('next.config.mjs')) {
      const before = fs.readFileSync(filepath, 'utf8');
      const after = replaceQuotedLinks(before);
      if (after !== before) edits.set(filepath, after);
    }
  }
}
for (const dir of candidateRoots) walk(path.join(root, dir));

// Update existing XML sitemap only. Do not generate a sitemap from an incomplete route inventory.
const sitemap = path.join(root, 'public', 'sitemap.xml');
if (fs.existsSync(sitemap)) {
 const before=fs.readFileSync(sitemap,'utf8');
 let after=before;
 for (const r of records) {
   const escaped = r.old.slice(1).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   const reg=new RegExp(`(<loc>https?:\\/\\/[^<\\/]+)\\/${escaped}(?:\\.html)?(?=<\\/loc>)`, 'g');
   after=after.replace(reg, `$1${r.canonical}`);
 }
 after=after.replace(/(<loc>https?:\/\/[^<\/]+)\/index\.html(?=<\/loc>)/g,'$1/');
 // Remove repeated <url> entries for identical canonical <loc>.
 const seen=new Set();
 after=after.replace(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (block,url) => {
   if (seen.has(url)) return ''; seen.add(url); return block;
 });
 if (after !== before) edits.set(sitemap,after);
}
console.log(`\nOlympionLab URL geçişi — ${apply ? 'UYGULA' : 'ÖNİZLEME'}`);
console.log(`Repo: ${root}`);
for (const r of records) console.log(`${r.old.padEnd(30)} -> ${r.canonical} (serves ${r.serves})`);
console.log(`\nYönlendirmeler: ${redirects.length}; rewrites: ${rewrites.length}; değişecek dosyalar: ${edits.size}`);
for(const p of edits.keys()) console.log(`  ${path.relative(root,p)}`);
if (!apply) { console.log('\nDeğişiklik yapılmadı. Uygulamak için: node install.mjs /repo/yolu --apply'); process.exit(0); }

// Atomic-ish per-file backup: never overwrite a preexisting backup.
const backupRoot=path.join(root,'.olympion-clean-url-backup');
for (const [filepath, content] of edits.entries()) {
  if (fs.existsSync(filepath)) {
    const backup=path.join(backupRoot,path.relative(root,filepath));
    fs.mkdirSync(path.dirname(backup),{recursive:true});
    if (!fs.existsSync(backup)) fs.copyFileSync(filepath,backup);
  }
  fs.mkdirSync(path.dirname(filepath),{recursive:true});
  fs.writeFileSync(filepath,content,'utf8');
}
console.log('\nTamamlandı. Önce npm run build ile doğrulayın. Değişiklikler yalnızca yerel projede yapıldı.');
console.log('Not: middleware.ts, meta/canonical ve Search Console kontrolleri ayrıca gereklidir.');
