import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { HomeChromeMenu } from "./HomeChromeMenu";

/** The header/footer source of truth is public/index.html, not a duplicate component. */
function homepageChrome(active: string) {
  const page = readFileSync(join(process.cwd(), "public", "index.html"), "utf8");
  const header = page.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
  const footer = page.match(/<footer class="site-footer[^"]*">[\s\S]*?<\/footer>/)?.[0];
  if (!header || !footer) throw new Error("Homepage header/footer not found in public/index.html");
  const activeHeader = active === "/" ? header :
    header.replace('href="/" class="active"', 'href="/"')
          .replace('href="' + active + '"', 'href="' + active + '" class="active"');
  const inlineCss = page.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  return { header: activeHeader, footer, inlineCss };
}

export function HomeChrome({ active, children }: { active: string; children: ReactNode }) {
  const { header, footer, inlineCss } = homepageChrome(active);
  const homepageStyles = '@import url("/style.css") layer(olympion-public);\n@layer olympion-public {\n' + inlineCss + '\n}';
  return (
    <>
      <style>{homepageStyles}</style>
      <style>{".olympion-shared-header{position:sticky;top:0;z-index:1000}.olympion-shared-header .site-header{position:relative!important;top:0!important;left:auto!important;right:auto!important}.olympion-shared-footer{position:relative;z-index:2}.olympion-shared-header .site-header,.olympion-shared-footer .site-footer{font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}"}</style>
      <HomeChromeMenu />
      <div className="olympion-shared-header" dangerouslySetInnerHTML={{ __html: header }} />
      {children}
      <div className="olympion-shared-footer" dangerouslySetInnerHTML={{ __html: footer }} />
    </>
  );
}
