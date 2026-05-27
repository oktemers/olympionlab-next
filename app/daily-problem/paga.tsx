export const dynamic = "force-dynamic";

export default function DailyProblemPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050b14",
        color: "white",
        padding: "48px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Günlük Problem sayfası çalışıyor.</h1>

      <p>
        Bu geçici test sayfası. Eğer bunu görüyorsan /daily-problem route’u
        artık çalışıyor demektir.
      </p>

      <a
        href="/dashboard"
        style={{
          display: "inline-block",
          marginTop: "24px",
          color: "#7cf2ff",
          fontWeight: 800,
        }}
      >
        Dashboard’a dön
      </a>
    </main>
  );
}
