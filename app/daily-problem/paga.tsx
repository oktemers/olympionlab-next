import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import DailyProblemClient from "./DailyProblemClient";

type BranchKey = "physics" | "chemistry";

const branchLabels: Record<BranchKey, string> = {
  physics: "Fizik",
  chemistry: "Kimya",
};

const physicsProblems = [
  {
    id: "physics-energy-01",
    branch: "physics" as const,
    branchLabel: "Fizik",
    title: "Enerji korunumu ile hız-yükseklik ilişkisi",
    difficulty: "Orta",
    topic: "Mekanik • Enerji korunumu",
    questionHtml: `
      <p>
        Sürtünmesiz bir ray üzerinde hareket eden küçük bir cisim, yerden <code>h</code>
        yüksekliğinden serbest bırakılıyor. Cisim daha sonra başlangıç seviyesinden
        <code>h/4</code> kadar aşağıdaki bir noktadan geçiyor.
      </p>
      <p>
        Bu noktadaki hızının karesi <code>v²</code> kaçtır?
      </p>
    `,
    visualHtml: `
      <svg viewBox="0 0 720 260" role="img" aria-label="Enerji korunumu rampası">
        <rect x="30" y="25" width="660" height="210" rx="24" fill="#071525" stroke="rgba(124,242,255,0.24)" />
        <path d="M110 85 C230 90 310 178 440 178 C520 178 590 150 640 122" fill="none" stroke="#7cf2ff" stroke-width="8" stroke-linecap="round"/>
        <circle cx="118" cy="84" r="18" fill="#ffd66b"/>
        <circle cx="450" cy="178" r="14" fill="#9dffcb"/>
        <line x1="85" y1="84" x2="85" y2="178" stroke="rgba(255,255,255,0.45)" stroke-dasharray="8 8"/>
        <text x="52" y="133" fill="#ffffff" font-size="18">h/4</text>
        <text x="95" y="55" fill="#ffffff" font-size="18">başlangıç</text>
        <text x="415" y="215" fill="#ffffff" font-size="18">v ?</text>
      </svg>
    `,
    steps: [
      {
        title: "Mekanik enerji korunur",
        text: "Sürtünme olmadığı için potansiyel enerjideki azalma kinetik enerjiye dönüşür.",
      },
      {
        title: "Yükseklik farkını belirle",
        text: "Cisim başlangıç seviyesinden h/4 kadar aşağıya indiği için kaybedilen potansiyel enerji mgh/4 olur.",
      },
      {
        title: "Kinetik enerjiye eşitle",
        text: "mgh/4 = (1/2)mv² yazılır. Kütleler sadeleşir.",
      },
      {
        title: "Sonuç",
        text: "v² = gh/2 bulunur.",
      },
    ],
  },
  {
    id: "physics-momentum-01",
    branch: "physics" as const,
    branchLabel: "Fizik",
    title: "Momentum korunumu ile yapışmalı çarpışma",
    difficulty: "Zor",
    topic: "Mekanik • Momentum",
    questionHtml: `
      <p>
        Sürtünmesiz yatay düzlemde <code>m</code> kütleli bir cisim <code>2v</code>
        hızıyla, durmakta olan <code>3m</code> kütleli başka bir cisme çarpıp yapışıyor.
      </p>
      <p>
        Çarpışmadan sonra ortak hız kaç olur?
      </p>
    `,
    visualHtml: `
      <svg viewBox="0 0 720 240" role="img" aria-label="Momentum çarpışması">
        <rect x="30" y="25" width="660" height="190" rx="24" fill="#071525" stroke="rgba(124,242,255,0.24)" />
        <line x1="90" y1="158" x2="640" y2="158" stroke="rgba(255,255,255,0.25)" stroke-width="4"/>
        <circle cx="170" cy="130" r="30" fill="#7cf2ff"/>
        <rect x="395" y="102" width="90" height="56" rx="18" fill="#ffd66b"/>
        <path d="M220 130 L320 130" stroke="#9dffcb" stroke-width="8" stroke-linecap="round"/>
        <path d="M320 130 L300 118 M320 130 L300 142" stroke="#9dffcb" stroke-width="8" stroke-linecap="round"/>
        <text x="150" y="190" fill="#ffffff" font-size="18">m, 2v</text>
        <text x="395" y="190" fill="#ffffff" font-size="18">3m, duruyor</text>
      </svg>
    `,
    steps: [
      {
        title: "Dış kuvvet yoksa momentum korunur",
        text: "Yatay doğrultuda dış kuvvet olmadığı için toplam momentum sabittir.",
      },
      {
        title: "Başlangıç momentumu",
        text: "İlk momentum m·2v + 3m·0 = 2mv olur.",
      },
      {
        title: "Son momentum",
        text: "Cisimler yapıştığı için toplam kütle 4m olur. Ortak hız V ise son momentum 4mV olur.",
      },
      {
        title: "Eşitle",
        text: "2mv = 4mV olduğundan V = v/2 bulunur.",
      },
    ],
  },
];

const chemistryProblems = [
  {
    id: "chemistry-electron-01",
    branch: "chemistry" as const,
    branchLabel: "Kimya",
    title: "Elektron dizilimi ve 4s² yorumu",
    difficulty: "Orta",
    topic: "Atom yapısı • Elektron dizilimi",
    questionHtml: `
      <p>
        Bir elementin temel hâl elektron diziliminin son kısmı <code>4s² 3d⁶</code>
        şeklindedir.
      </p>
      <p>
        Bu element hangi blokta yer alır ve değerlik elektronları yorumlanırken
        neden yalnızca <code>4s²</code> ifadesine bakmak yeterli değildir?
      </p>
    `,
    visualHtml: `
      <svg viewBox="0 0 720 300" role="img" aria-label="4s ve 3d orbital enerji gösterimi">
        <rect x="30" y="25" width="660" height="250" rx="24" fill="#071525" stroke="rgba(124,242,255,0.24)" />
        <text x="70" y="70" fill="#ffffff" font-size="22">Enerji sırası ve geçiş metali yorumu</text>
        <line x1="90" y1="220" x2="250" y2="220" stroke="#7cf2ff" stroke-width="7" stroke-linecap="round"/>
        <text x="105" y="250" fill="#ffffff" font-size="18">4s²</text>
        <circle cx="145" cy="205" r="10" fill="#ffd66b"/>
        <circle cx="175" cy="205" r="10" fill="#ffd66b"/>
        <line x1="360" y1="175" x2="610" y2="175" stroke="#9dffcb" stroke-width="7" stroke-linecap="round"/>
        <text x="455" y="205" fill="#ffffff" font-size="18">3d⁶</text>
        <circle cx="390" cy="158" r="9" fill="#ffd66b"/>
        <circle cx="425" cy="158" r="9" fill="#ffd66b"/>
        <circle cx="460" cy="158" r="9" fill="#ffd66b"/>
        <circle cx="495" cy="158" r="9" fill="#ffd66b"/>
        <circle cx="530" cy="158" r="9" fill="#ffd66b"/>
        <circle cx="565" cy="158" r="9" fill="#ffd66b"/>
      </svg>
    `,
    steps: [
      {
        title: "Dizilimin son kısmını oku",
        text: "Dizilim 4s² 3d⁶ içerdiği için element d orbitallerini doldurmaktadır.",
      },
      {
        title: "Blok yorumu",
        text: "d orbitali dolduğu için element d bloğundadır; yani geçiş metali karakteri gösterir.",
      },
      {
        title: "Neden sadece 4s² yetmez?",
        text: "Geçiş metallerinde kimyasal özelliklerde ns ve (n−1)d elektronları birlikte önemlidir. Bu yüzden 3d⁶ kısmı da değerlik davranışını etkiler.",
      },
      {
        title: "Sonuç",
        text: "Element d bloğundadır. Değerlik yorumu yapılırken 4s² ile birlikte 3d elektronları da dikkate alınmalıdır.",
      },
    ],
  },
  {
    id: "chemistry-organic-01",
    branch: "chemistry" as const,
    branchLabel: "Kimya",
    title: "Organik reaksiyonda ürün tahmini",
    difficulty: "Zor",
    topic: "Organik Kimya • Katılma tepkimesi",
    questionHtml: `
      <p>
        Aşağıdaki alken üzerine asidik ortamda <code>HBr</code> katılıyor.
      </p>
      <p>
        Ana ürün hangi karbon üzerinde brom taşımalıdır? Gerekçeni karbokatyon
        kararlılığı üzerinden açıkla.
      </p>
    `,
    visualHtml: `
      <svg viewBox="0 0 760 320" role="img" aria-label="Alken üzerine HBr katılması">
        <rect x="25" y="25" width="710" height="270" rx="24" fill="#071525" stroke="rgba(124,242,255,0.24)" />
        <text x="55" y="65" fill="#ffffff" font-size="22">Alken + HBr</text>

        <line x1="115" y1="165" x2="185" y2="125" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <line x1="185" y1="125" x2="255" y2="165" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <line x1="188" y1="138" x2="245" y2="171" stroke="#7cf2ff" stroke-width="4" stroke-linecap="round"/>
        <line x1="255" y1="165" x2="325" y2="125" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <text x="105" y="198" fill="#ffffff" font-size="18">CH₃</text>
        <text x="175" y="105" fill="#ffffff" font-size="18">C</text>
        <text x="250" y="198" fill="#ffffff" font-size="18">C</text>
        <text x="318" y="105" fill="#ffffff" font-size="18">CH₃</text>

        <path d="M385 150 L500 150" stroke="#9dffcb" stroke-width="8" stroke-linecap="round"/>
        <path d="M500 150 L478 135 M500 150 L478 165" stroke="#9dffcb" stroke-width="8" stroke-linecap="round"/>
        <text x="414" y="125" fill="#9dffcb" font-size="20">HBr</text>

        <line x1="555" y1="165" x2="625" y2="125" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <line x1="625" y1="125" x2="695" y2="165" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <text x="610" y="104" fill="#ff9dc7" font-size="20">Br</text>
        <text x="545" y="198" fill="#ffffff" font-size="18">daha kararlı ara ürün</text>
      </svg>
    `,
    steps: [
      {
        title: "Asidik katılmada önce proton eklenir",
        text: "Alkenin çift bağı proton alır ve daha kararlı karbokatyon oluşacak yön tercih edilir.",
      },
      {
        title: "Karbokatyon kararlılığına bak",
        text: "Daha çok alkil grubu ile stabilize edilen karbokatyon daha kararlıdır. Bu yüzden proton, daha kararlı karbokatyonu bırakacak karbona eklenir.",
      },
      {
        title: "Bromür saldırısı",
        text: "Br⁻ iyonu oluşan karbokatyon merkezine saldırır.",
      },
      {
        title: "Sonuç",
        text: "Ana ürün Markovnikov yönelimine göre oluşur; Br daha sübstitüe karbona bağlanır.",
      },
    ],
  },
  {
    id: "chemistry-equilibrium-01",
    branch: "chemistry" as const,
    branchLabel: "Kimya",
    title: "Denge yönü ve Le Chatelier ilkesi",
    difficulty: "Orta",
    topic: "Kimyasal Denge",
    questionHtml: `
      <p>
        Kapalı bir kapta <code>N₂(g) + 3H₂(g) ⇌ 2NH₃(g)</code> dengesi kurulmuştur.
      </p>
      <p>
        Sabit sıcaklıkta kaba bir miktar <code>H₂</code> gazı eklenirse denge hangi
        yöne kayar ve neden?
      </p>
    `,
    visualHtml: `
      <svg viewBox="0 0 720 260" role="img" aria-label="Kimyasal denge yönü">
        <rect x="30" y="25" width="660" height="210" rx="24" fill="#071525" stroke="rgba(124,242,255,0.24)" />
        <text x="80" y="85" fill="#ffffff" font-size="24">N₂ + 3H₂</text>
        <text x="315" y="85" fill="#7cf2ff" font-size="32">⇌</text>
        <text x="400" y="85" fill="#ffffff" font-size="24">2NH₃</text>
        <circle cx="170" cy="155" r="16" fill="#7cf2ff"/>
        <circle cx="210" cy="155" r="16" fill="#7cf2ff"/>
        <circle cx="250" cy="155" r="16" fill="#7cf2ff"/>
        <text x="145" y="205" fill="#ffffff" font-size="18">H₂ eklendi</text>
        <path d="M330 155 L475 155" stroke="#9dffcb" stroke-width="8" stroke-linecap="round"/>
        <path d="M475 155 L452 140 M475 155 L452 170" stroke="#9dffcb" stroke-width="8" stroke-linecap="round"/>
        <text x="510" y="160" fill="#ffffff" font-size="18">sağa kayar</text>
      </svg>
    `,
    steps: [
      {
        title: "Eklenen maddeyi belirle",
        text: "H₂ tepkimenin girenler tarafındadır.",
      },
      {
        title: "Le Chatelier ilkesini uygula",
        text: "Sistem eklenen H₂ miktarını azaltmak için H₂ tüketen yöne ilerler.",
      },
      {
        title: "Denge yönü",
        text: "H₂ tüketilen yön ürünler yönüdür. Bu yüzden denge sağa kayar.",
      },
      {
        title: "Sonuç",
        text: "NH₃ miktarı artar.",
      },
    ],
  },
];

export default async function DailyProblemPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,branch,level,goal,plan")
    .eq("id", user.id)
    .maybeSingle();

  const rawBranch = profile?.branch ? String(profile.branch) : "physics";
  const branchKey: BranchKey = rawBranch === "chemistry" ? "chemistry" : "physics";
  const branchLabel = branchLabels[branchKey];
  const problems = branchKey === "chemistry" ? chemistryProblems : physicsProblems;

  return (
    <>
      <link rel="stylesheet" href="/style.css" />

      <div className="app-page">
        <a href="/" className="app-mobile-home">
          ← Ana Sayfa
        </a>

        <div className="noise"></div>

        <div className="app-bg-formulas" aria-hidden="true">
          {branchKey === "chemistry" ? (
            <>
              <span>PV = nRT</span>
              <span>ΔG = ΔH − TΔS</span>
              <span>pH = −log[H⁺]</span>
              <span>4s² 3d⁶</span>
            </>
          ) : (
            <>
              <span>F = ma</span>
              <span>E = ½mv²</span>
              <span>p = mv</span>
              <span>∑τ = Iα</span>
            </>
          )}
        </div>

        <div className="app-shell">
          <aside className="app-sidebar">
            <a href="/dashboard" className="app-brand">
              <div className="brand-badge">O</div>
              <div>
                Olympion
                <small>Öğrenci Paneli</small>
              </div>
            </a>

            <nav className="app-nav" aria-label="Panel menüsü">
              <a href="/dashboard" className="app-link">
                <span>⌘</span>
                Genel
              </a>

              <a href="/courses" className="app-link">
                <span>▶</span>
                Dersler
              </a>

              <a href="/roadmap.html" className="app-link">
                <span>🧭</span>
                Rota
              </a>

              <a href="/notes.html" className="app-link">
                <span>📚</span>
                PDF
              </a>

              <a href="/daily-problem" className="app-link active">
                <span>🔥</span>
                Problem
              </a>

              <a href="/ai-coach.html" className="app-link">
                <span>✦</span>
                Koç
              </a>

              <a href="/student-labs.html" className="app-link">
                <span>🧪</span>
                Labs
              </a>

              <a href="/settings" className="app-link">
                <span>⚙</span>
                Ayarlar
              </a>

              <form action={signOut} className="dashboard-logout-form">
                <button className="app-link logout-sidebar" type="submit">
                  <span>⏻</span>
                  Çıkış
                </button>
              </form>
            </nav>

            <div className="sidebar-upgrade">
              <span>{branchLabel}</span>
              <strong>Günlük problem serini başlat.</strong>
              <p>Her gün profilindeki branşa uygun bir problem çöz.</p>
              <a href="/pricing.html">Planı yükselt →</a>
            </div>

            <a href="/" className="back-site">
              ← Ana siteye dön
            </a>
          </aside>

          <main className="app-main">
            <div className="app-top">
              <div>
                <span className="eyebrow">Günlük Problem</span>
                <h1>{branchLabel} problemi</h1>
                <p>
                  Bu sayfa profilindeki branşa göre problem seçer. Bugünkü
                  problem tarih bazlı belirlenir; yarın otomatik farklı problem
                  gösterilir.
                </p>
              </div>

              <a className="btn btn-primary compact-btn" href="/courses">
                Derslere Dön
              </a>
            </div>

            <DailyProblemClient
              branchKey={branchKey}
              branchLabel={branchLabel}
              problems={problems}
            />
          </main>
        </div>

        <style>{`
          .dashboard-logout-form {
            margin: 0;
          }

          .dashboard-logout-form .app-link {
            width: 100%;
            border: 0;
            text-align: left;
            cursor: pointer;
          }
        `}</style>
      </div>
    </>
  );
}
