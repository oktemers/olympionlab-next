import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/auth";

export default async function AICoachPage() {
  await requireUser();

  return (
    <div className="app-shell">
      <Sidebar active="coach" />
      <main className="main">
        <span className="badge">AI Koç</span>
        <h1>Strateji odaklı yapay zeka koçu.</h1>
        <div className="grid grid-2">
          <section className="card">
            <div id="chat" className="chat">
              <div className="bubble bot"><strong>Olympion Koçu</strong><p>Bir soru yaz. Sana direkt ezber cevap yerine çözüm stratejisi vereceğim.</p></div>
            </div>
            <form id="ai-form" className="form" style={{ marginTop: 14 }}>
              <input name="question" placeholder="Örn. Momentum mu enerji mi kullanmalıyım?" />
              <button className="btn btn-primary" type="submit">Gönder</button>
            </form>
          </section>
          <aside className="card">
            <h2>Hazır sorular</h2>
            <button className="btn btn-secondary prompt" data-q="Enerji mi momentum mu kullanmalıyım?">Enerji mi momentum mu?</button>
            <button className="btn btn-secondary prompt" data-q="Kimyasal dengede Le Chatelier nasıl düşünülür?">Denge mantığı</button>
            <button className="btn btn-secondary prompt" data-q="TÜBİTAK 1. aşama için nasıl çalışmalıyım?">1. aşama stratejisi</button>
          </aside>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          const form = document.getElementById('ai-form');
          const chat = document.getElementById('chat');
          async function ask(q){
            chat.innerHTML += '<div class="bubble user"><strong>Sen</strong><p>'+q+'</p></div>';
            chat.innerHTML += '<div class="bubble bot" id="loading"><strong>Olympion Koçu</strong><p>Yanıt hazırlanıyor...</p></div>';
            const res = await fetch('/api/ai-coach', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ question:q }) });
            const data = await res.json();
            document.getElementById('loading')?.remove();
            chat.innerHTML += '<div class="bubble bot"><strong>Olympion Koçu</strong><p>'+data.answer+'</p></div>';
          }
          form?.addEventListener('submit', (e)=>{ e.preventDefault(); const q = new FormData(form).get('question'); if(q) ask(q); form.reset(); });
          document.querySelectorAll('.prompt').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.q)));
        ` }} />
      </main>
    </div>
  );
}
