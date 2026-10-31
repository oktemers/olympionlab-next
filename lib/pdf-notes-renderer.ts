import type { Note } from "./pdf-notes-catalog";
import { branchTitles } from "./pdf-notes-catalog";

// Server-only. Roboto font is bundled in pdfmake's own virtual font data,
// so PDF generation needs no external network or font files.
export async function renderTopicPdf(note: Note): Promise<Buffer> {
  const PdfPrinter = require("pdfmake");
  const fontsBundle = require("pdfmake/build/vfs_fonts");
  const vfs: Record<string,string> = fontsBundle.pdfMake?.vfs ?? fontsBundle.default?.pdfMake?.vfs ?? fontsBundle.default ?? fontsBundle;
  const font = (name: string) => {
    if (!vfs[name] || typeof vfs[name] !== "string") throw new Error("Bundled PDF font unavailable: " + name);
    return Buffer.from(vfs[name], "base64");
  };
  const printer = new PdfPrinter({
    Roboto: {
      normal: font("Roboto-Regular.ttf"),
      bold: font("Roboto-Medium.ttf"),
      italics: font("Roboto-Italic.ttf"),
      bolditalics: font("Roboto-MediumItalic.ttf")
    }
  });

  const title = branchTitles[note.branch];
  const pageTitle = (label: string, heading: string, subtitle?: string) => [
    { text: label.toUpperCase(), style: "eyebrow", margin: [0,0,0,10] },
    { text: heading, style: "sectionHeading", margin: [0,0,0,10] },
    ...(subtitle ? [{ text: subtitle, style: "lead", margin: [0,0,0,22] }] : [])
  ];
  const lines = (items: string[], bullet = true) => items.map((item,i) => ({
    columns: [
      { width: 20, text: bullet ? "•" : String(i+1).padStart(2,"0"), style: "count" },
      { width: "*", text: item, style: "paragraph" }
    ], columnGap: 8, margin:[0,0,0,14]
  }));
  const box = (header: string, body: string) => ({
    table: { widths:["*"], body: [[{
      stack: [{text:header,style:"boxLabel",margin:[0,0,0,8]}, {text:body,style:"boxText"}],
      fillColor:"#E9F7F8", margin:[17,15,17,15]
    }]] }, layout:"noBorders", margin:[0,12,0,20]
  });
  const rule = { canvas:[{type:"line",x1:0,y1:0,x2:487,y2:0,lineColor:"#D8E6ED",lineWidth:.7}],margin:[0,10,0,18] };
  const content: any[] = [
    { stack:[
      { text:"OLYMPIONLAB  /  BİLİM OLİMPİYATLARI",style:"coverBrand",margin:[0,30,0,66]},
      { text:title.toLocaleUpperCase("tr-TR") + "  ·  KONU FÖYÜ",style:"eyebrow",margin:[0,0,0,18]},
      {text:note.title,style:"coverTitle",margin:[0,0,0,24]},
      {text:note.summary,style:"coverLead",margin:[0,0,0,42]},
      rule,
      {text:"BU FÖYDE KAZANACAKLARIN",style:"eyebrow",margin:[0,0,0,16]},
      ...lines(note.goals),
      {text:"DERS AKIŞI",style:"eyebrow",margin:[0,22,0,14]},
      ...["Temel kavramlar","Bağıntılar ve model kurma","Adım adım çözümlü örnek","Olimpiyat problem çözme stratejileri","Alıştırmalar ve kontrol cevapları"].map((x,i)=>({text:String(i+1).padStart(2,"0")+"  /  "+x,style:"tocItem",margin:[0,0,0,8]}))
    ]},
    {pageBreak:"before",stack:[
      ...pageTitle("01 · KONU ANLATIMI","Temel kavramları kur","Tanımları ezberlemek yerine hangi varsayımla geçerli olduklarını sorgula."),
      ...lines(note.principles),
      rule,
      box("DÜŞÜN", "İlk olarak hangi niceliklerin bilindiğini, hangilerinin arandığını ve modelin hangi koşullarda geçerli olduğunu yaz. İspat veya hesap öncesi küçük bir örnek dene."),
      {text:"KAVRAMA KONTROLÜ",style:"eyebrow",margin:[0,12,0,10]},
      {text:"Konuyu kendi cümlelerinle açıklayabiliyor musun? Formüle başvurmadan önce fiziksel, kimyasal, biyolojik veya matematiksel anlamı bir arkadaşına anlatmayı dene.",style:"paragraph"}
    ]},
    {pageBreak:"before",stack:[
      ...pageTitle("02 · ARAÇ KUTUSU","Bağıntılar ve düşünme modeli","Kullanacağın her eşitliğin koşulunu, birimini veya matematiksel anlamını kontrol et."),
      ...note.formulas.map((f,i)=>({stack:[
        {text:"İLİŞKİ 0"+(i+1),style:"boxLabel",margin:[0,0,0,7]},
        {text:f,style:"formula"}
      ],margin:[0,0,0,18]})),
      rule,
      {text:"DENKLEM SEÇME KONTROL LİSTESİ",style:"eyebrow",margin:[0,0,0,12]},
      ...lines(["Bilinmeyenleri ve verilenleri tek tabloda topla.","Sembol ve birimleri aynı sistemde tut.","Geçerli sınırları kontrol et: sıfır, eşitlik, çok büyük veya çok küçük durum.","Bulduğun sayısal sonucu cümleyle yorumla."],false),
      box("KISA NOT","Bir eşitlik işlemsel olarak doğru olsa da sorunun varsayımları altında yanlış seçilmiş olabilir. Modelin geçerlilik bölgesi cevabın parçasıdır.")
    ]},
    {pageBreak:"before",stack:[
      ...pageTitle("03 · ÇÖZÜMLÜ SORU","Örnek üzerinden ilerle","Önce kendin çözmeyi dene; ardından aşağıdaki adımlarla karşılaştır."),
      {text:"SORU",style:"eyebrow",margin:[0,0,0,10]},
      {text:note.worked.question,style:"question",margin:[0,0,0,28]},
      {text:"ÇÖZÜM YOLU",style:"eyebrow",margin:[0,0,0,12]},
      ...lines(note.worked.reasoning,false),
      box("SONUÇ",note.worked.answer),
      {text:"KENDİNİ SINAMA",style:"eyebrow",margin:[0,14,0,12]},
      {text:"Aynı soruyu bir parametre değiştirerek çöz. Sonuç yön, ölçek veya sınır durum açısından beklediğin gibi mi?",style:"paragraph"},
      {text:"Boş çalışma alanı",style:"small",margin:[0,26,0,8]},
      ...[0,1,2,3].map(()=>({canvas:[{type:"line",x1:0,y1:0,x2:480,y2:0,lineWidth:.55,lineColor:"#CEDDE5"}],margin:[0,16,0,0]}))
    ]},
    {pageBreak:"before",stack:[
      ...pageTitle("04 · OLİMPİYAT TAKTİKLERİ","Çözümü güçlendiren alışkanlıklar","Hızlı işlemden daha değerlisi doğru temsil, gerekçeli karar ve kontrol."),
      ...lines(note.tactics),
      rule,
      {text:"YANLIŞ ANALİZİ ŞABLONU",style:"eyebrow",margin:[0,0,0,15]},
      ...lines(["Yanlış veya eksik adımı açıkça yaz.","Hata türünü ayır: tanım, denklem seçimi, cebir veya yorum.","Doğru gerekçeyi bir cümlede ifade et.","Aynı sorunun benzerini yeni değerlerle çöz."],false),
      box("KONTROL SORUSU","Sonuca başka bir yoldan ulaşmak mümkün mü? Geometri, simetri, limit, birim, korunum veya örnekleme gibi bağımsız bir kontrol seç."),
      {text:"ÇALIŞMA PLANI",style:"eyebrow",margin:[0,12,0,12]},
      {text:"15 dakika kavram tekrarı + 20 dakika bağımsız problem çözümü + 10 dakika hata günlüğü. Süreler öneridir; gerektiğinde seviyene göre değiştir.",style:"paragraph"}
    ]},
    {pageBreak:"before",stack:[
      ...pageTitle("05 · ALIŞTIRMA","Şimdi sen çöz","Önce cevapları kapat. İşlemleri kâğıda yaz, ardından kontrol et."),
      ...note.exercises.map((q,i)=>({stack:[
        {text:"SORU "+(i+1),style:"boxLabel",margin:[0,0,0,7]},
        {text:q,style:"question"},
        ...[0,1].map(()=>({canvas:[{type:"line",x1:0,y1:0,x2:475,y2:0,lineColor:"#D1DEE6",lineWidth:.55}],margin:[0,23,0,0]}))
      ],margin:[0,0,0,20]})),
      rule,
      {text:"KONTROL CEVAPLARI",style:"eyebrow",margin:[0,0,0,13]},
      ...lines(note.solutions,false),
      {text:"DİKKAT",style:"eyebrow",margin:[0,18,0,8]},
      {text:"Bu föy öğretici çalışma materyalidir. Sorular, resmî sınav sorularından alındığı iddiası taşımayan özgün örneklerdir. Eksik hissettiğin kavramları not alıp yeniden çalış.",style:"small"}
    ]}
  ];

  const definition: any = {
    pageSize:"A4", pageMargins:[54,63,54,65],
    info:{title:note.title+" | OlympionLab",author:"OlympionLab",subject:"Bilim olimpiyatı konu föyü",keywords:title+", olimpiyat, ders notu"},
    defaultStyle:{font:"Roboto",fontSize:11,lineHeight:1.38,color:"#1D3244"},
    content,
    styles:{
      coverBrand:{fontSize:12,bold:true,color:"#147C91",characterSpacing:1.1},
      coverTitle:{fontSize:34,bold:true,lineHeight:1.12,color:"#0B2338"},
      coverLead:{fontSize:15,color:"#476176",lineHeight:1.55},
      eyebrow:{fontSize:10,bold:true,color:"#087A90",characterSpacing:1.1},
      sectionHeading:{fontSize:26,bold:true,color:"#112C44"},
      lead:{fontSize:11.5,color:"#526A7D"},
      paragraph:{fontSize:11,lineHeight:1.42,color:"#213A50"},
      count:{fontSize:11,bold:true,color:"#178EA3"},
      formula:{fontSize:14,bold:true,color:"#143750"},
      boxLabel:{fontSize:10,bold:true,color:"#0D7085"},
      boxText:{fontSize:11,color:"#1A4856",lineHeight:1.4},
      question:{fontSize:13,bold:true,color:"#1D354A",lineHeight:1.4},
      tocItem:{fontSize:11,color:"#426075"},
      small:{fontSize:9,color:"#6C8090"}
    },
    header:(page:number)=>page===1?null:{margin:[54,24,54,0],columns:[
      {text:"OLYMPIONLAB  /  "+title.toLocaleUpperCase("tr-TR"),font:"Roboto",bold:true,fontSize:8,color:"#167E90"},
      {text:note.title,alignment:"right",fontSize:8,color:"#637D8B"}]},
    footer:(page:number,count:number)=>({margin:[54,0,54,23],columns:[
      {text:"Olimpiyat konu föyü  ·  Eğitim amaçlı",fontSize:8,color:"#8297A4"},
      {text:page+" / "+count,alignment:"right",fontSize:8,color:"#8297A4"}
    ]})
  };
  return await new Promise<Buffer>((resolve,reject)=>{
    try {
      const doc=printer.createPdfKitDocument(definition);
      const chunks:Buffer[]=[];
      doc.on("data",(chunk:Buffer)=>chunks.push(chunk));
      doc.on("end",()=>resolve(Buffer.concat(chunks)));
      doc.on("error",reject);
      doc.end();
    } catch(error){ reject(error); }
  });
}
