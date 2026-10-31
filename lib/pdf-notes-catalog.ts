export type Branch = "physics" | "chemistry" | "biology" | "math";
export type Note = {
  slug: string; branch: Branch; title: string; level: string; summary: string;
  goals: string[]; principles: string[]; formulas: string[];
  worked: { question: string; reasoning: string[]; answer: string };
  tactics: string[]; exercises: string[]; solutions: string[];
};
export const branchTitles: Record<Branch,string> = {
  physics: "Fizik", chemistry: "Kimya", biology: "Biyoloji", math: "Matematik"
};
export const NOTES: Note[] = [
  {
    slug:"fizik-vektorler",branch:"physics",title:"Vektörler ve Koordinatlar",level:"Temel / 1. aşama",
    summary:"Bileşen, birim vektör, izdüşüm, skaler çarpım ve geometrik düşünme.",
    goals:["Bir vektörü doğru eksenlere ayırmak","İki vektörün toplamını ve aralarındaki açıyı incelemek","İzdüşüm kullanarak çözümü sadeleştirmek"],
    principles:["Vektör hem büyüklüğe hem yöne sahiptir; koordinatları seçilen tabana bağlıdır.","Dik eksenler için A = Ax i + Ay j. Bileşenleri ayrı toplamak vektörel toplamı verir.","Bir vektörün bir doğrultudaki işaretli izdüşümü A cos(theta) olur. Açıyı hangi eksenle ölçtüğünü mutlaka belirt.","Büyüklük |A| = sqrt(Ax² + Ay²), yön atan2(Ay,Ax) ile bulunur. Tek başına tan(theta) = Ay/Ax dörtlü yön ayrımını vermez.","Skaler çarpım A·B = |A||B|cos(theta) = AxBx + AyBy, diklik testi olarak kullanılabilir."],
    formulas:["Ax = A cos(theta), Ay = A sin(theta)","|A+B|² = |A|² + |B|² + 2 A·B","A·B = Ax Bx + Ay By = |A||B| cos(theta)","Proj_B(A) = (A·B / |B|²) B (B ≠ 0)"],
    worked:{question:"Büyüklükleri 3 ve 4 olan iki vektör arasındaki açı 60° ise toplamın büyüklüğünü bul.",
      reasoning:["Paralelkenar geometrisi veya skaler çarpım kullanılabilir.","|A+B|² = |A|² + |B|² + 2|A||B|cos 60°.","9 + 16 + 2·3·4·(1/2) = 37."],answer:"Toplamın büyüklüğü sqrt(37) birimdir."},
    tactics:["Önce eksenleri şekle uygun seç; eğik düzlemde eksenleri eğime paralel ve dik al.","Büyüklük yerine mümkünse önce bileşenleri hesapla.","Sonucun yönünü birim vektör ya da dört bölge kontrolüyle doğrula.","Açı 0° ve 180° sınırlarında sonuçlar |A|+|B| ve ||A|-|B|| olmalıdır."],
    exercises:["A=(4,-3) için |A| değerini bul.","A=(2,1), B=(-1,2). A·B nedir; vektörler dik mi?","İki eşit büyüklükte vektörün toplamı sıfırsa aralarındaki açı kaç derecedir?"],
    solutions:["sqrt(4²+(-3)²)=5.","2(-1)+1(2)=0, evet diktir.","180°; vektörler zıt yönlüdür."]
  },
  {
    slug:"fizik-newton-dinamigi",branch:"physics",title:"Newton Yasaları ve Dinamik",level:"Temel / 1. aşama",
    summary:"Serbest cisim diyagramı, sürtünme, eğik düzlem, bağlı cisimler.",
    goals:["Serbest cisim diyagramını eksiksiz çizmek","Kuvvetleri koordinatlara ayırmak","Temas ve ip gerilmesi sorularını analiz etmek"],
    principles:["Newton'un ikinci yasası seçilen eylemsiz referans çerçevesinde toplam dış kuvvetin ma'ya eşit olduğunu söyler.","Ağırlık mg aşağı yönlüdür; normal kuvvet yüzeye diktir ve her zaman mg değildir.","Statik sürtünme kendini ihtiyaç kadar ayarlar: |fs| ≤ μs N. Kayma sırasında yaklaşık fk = μk N.","İdeal kütlesiz ipte gerilme aynı ip boyunca aynıdır; fakat farklı ipler için eşit olmak zorunda değildir.","Birden fazla cismi tek sistem seçtiğinde iç gerilmeler birbirini götürür; sonra tekil cisme dönerek gerilmeyi bul."],
    formulas:["ΣFx = max, ΣFy = may","Eğik düzlem: mg sin(theta) paralel, mg cos(theta) normal","|fs| ≤ μs N; |fk| = μk N","İdeal makara ve ip: ip uzunluğu sabiti → kinematik bağıntı"],
    worked:{question:"Sürtünmesiz 30° eğimdeki m kütleli blok serbest bırakılıyor. İvmesini ve normal kuvveti hesapla.",
      reasoning:["x eksenini eğim boyunca aşağı, y eksenini yüzeye dik al.","Eğim boyunca ma = mg sin 30°.","Dik yönde ivme sıfır: N = mg cos 30°."],answer:"a = g/2; N = (sqrt(3)/2)mg."},
    tactics:["Şekle yalnız gerçek kuvvetleri çiz; 'hareket kuvveti' diye fazladan ok ekleme.","İvmenin yönünü tahmin et, eksi çıkması yalnız ters yönü anlatır.","Statik sürtünmeyi baştan μsN'ye eşitlemek yerine ihtiyaç duyulan değeri çöz.","g→0 ve μ→0 limitleri seçtiğin modelle uyumlu olmalı."],
    exercises:["m=2 kg, F=10 N, sürtünmesiz düzlemde ivme nedir?","Yatay düzlemde durgun blok üzerinde yatay kuvvet 3 N; μsN=5 N. Sürtünme kaç N?","30° eğimde duran blok için kaymama koşulunda μs en az kaçtır?"],
    solutions:["a=F/m=5 m/s².","Statik sürtünme 3 N, uygulanan kuvvete zıt.","μs ≥ tan 30° = 1/sqrt(3)."]
  },
  {
    slug:"fizik-enerji-momentum",branch:"physics",title:"Enerji, Momentum ve Çarpışmalar",level:"Orta / 1.-2. aşama",
    summary:"İş-enerji, momentum korunumu, çarpışma ve kütle merkezi.",
    goals:["Hangi niceliğin korunduğunu ayırt etmek","Bir boyutlu çarpışmaları çözmek","Enerji kaybını doğru yorumlamak"],
    principles:["İş-enerji teoremi: net iş kinetik enerjideki değişime eşittir.","Yalıtılmış sistemde toplam momentum korunur; esnek olmayan çarpışmada kinetik enerji korunmak zorunda değildir.","Mekanik enerji E=K+U yalnız muhafazakâr etkileşimlerde ve dışarıdan enerji aktarımı yokken korunur.","Tam esnek çarpışmada hem momentum hem toplam kinetik enerji korunur.","Kütle merkezi hızı Vcm=(Σmi vi)/(Σmi). Dış kuvvetlerin bileşkesi kütle merkezi hareketini belirler."],
    formulas:["K = 1/2 m v²; Wnet = ΔK","p = m v; Σp_before = Σp_after (dış impuls yoksa)","E = K+U; Ugravity=mgh; Uspring=1/2 kx²","Vcm = (Σ mi vi)/(Σ mi)"],
    worked:{question:"m kütleli cisim v ile gidip durmakta olan m kütleli cisme yapışıyor. Son hız ve kaybolan kinetik enerji?",
      reasoning:["Momentum korunumu: mv = (2m)vf.","vf = v/2.","Kilk=mv²/2; Kson = (1/2)(2m)(v²/4)=mv²/4."],answer:"vf = v/2 ve kaybolan kinetik enerji mv²/4'tür."},
    tactics:["Önce sistemi ve dış impulsları tanımla.","Momentum vektörel, enerji skaler niceliktir.","Çarpışmada enerji kaybı ısı, ses ve şekil değiştirmeye dönüşebilir.","Soruyu çözmeden önce yaklaşık sonuç için simetrileri kontrol et."],
    exercises:["2m ve m kütleleri aynı yönde v ve 0 hızlarıyla birleşirse son hız nedir?","m kütleli cisim 2h'den sürtünmesiz düşerse çarpma hızı nedir?","Kuvvetin zamana göre integrali hangi niceliğin değişimini verir?"],
    solutions:["vf=2v/3.","v = sqrt(4gh).","İmpuls = momentum değişimi."]
  },
  {
    slug:"kimya-atom-ve-periyodiklik",branch:"chemistry",title:"Atom Yapısı ve Periyodik Eğilimler",level:"Temel / 1. aşama",
    summary:"Elektron dizilimi, kuantum sayıları, etkin çekirdek yükü ve periyodik tablo.",
    goals:["Elektron dizilimini ilkelerden kurmak","İyonlaşma ve yarıçap eğilimlerini açıklamak","Yarı dolu ve dolu alt kabuk istisnalarına yaklaşmak"],
    principles:["Atom numarası proton sayısını, nötr atomda elektron sayısını verir.","Aufbau enerji sırasıyla dolma için başlangıç rehberidir; çok elektronlu atomlarda orbital enerjileri değişebilir.","Pauli ilkesi aynı atomda iki elektronun dört kuantum sayısının aynı olamayacağını söyler.","Hund kuralı eşenerjili orbitallerin önce paralel spinle tek tek dolmasını açıklar.","Soldan sağa etkin çekirdek yükü genellikle artar ve atom yarıçapı küçülme eğilimindedir; alt kabuk ayrıntıları önemlidir."],
    formulas:["n=1,2,...; l=0,...,n-1; ml=-l,...,+l","Bir orbital en fazla 2 elektron içerir","Bir alt kabuktaki orbital sayısı 2l+1","Etkili çekirdek yükü yaklaşık Zeff = Z - S (perdeleme modeli)"],
    worked:{question:"Nötr fosforun (Z=15) temel hâl elektron dizilimini yaz ve eşleşmemiş elektron sayısını bul.",
      reasoning:["1s² 2s² 2p⁶ çekirdeği 10 elektron içerir.","Kalan 5 elektron 3s² 3p³ olarak yerleşir.","Üç 3p orbitali Hund kuralıyla tek tek dolar."],answer:"1s² 2s² 2p⁶ 3s² 3p³; üç eşleşmemiş elektron vardır."},
    tactics:["Periyot ve grup eğilimlerini tek sloganla değil etkin yük ve perdeleme ile gerekçelendir.","İyon yarıçapını karşılaştırırken izoelektronik kümeleri ayır.","Birinci ve ikinci iyonlaşma enerjisini aynı şey gibi ele alma.","Geçiş metalleri için dizilimde özel durum olabileceğini kontrol et."],
    exercises:["n=3, l=1 alt kabuğu en çok kaç elektron taşır?","Na+ ve Ne izoelektroniktir; yarıçapı hangisi daha küçüktür?","Azotun 2p alt kabuğunda kaç eşleşmemiş elektron bulunur?"],
    solutions:["p alt kabuğunda 3 orbital ×2=6 elektron.","Na+ (Z=11) daha yüksek çekirdek yükü nedeniyle genellikle daha küçüktür.","Üç elektron ayrı p orbitallerinde: 3."]
  },
  {
    slug:"kimya-stokiyometri",branch:"chemistry",title:"Mol, Stokiyometri ve Gazlar",level:"Temel / 1. aşama",
    summary:"Sınırlayıcı bileşen, verim, derişim, ideal gaz ve birim analizi.",
    goals:["Mol üzerinden tepkime hesabı yapmak","Sınırlayıcı reaktifi belirlemek","Gaz yasalarında birim tutarlılığı sağlamak"],
    principles:["Dengelenmiş denklemin katsayıları parçacık ve mol oranlarını verir, kütle oranlarını doğrudan vermez.","Mol sayısı n=m/M; parçacık sayısı N=n NA bağlantısıyla hesaplanır.","Sınırlayıcı reaktif, verilen miktara göre teorik ürünün en azını oluşturandır.","Yüzde verim, gerçekleşen ürün miktarının teorik ürüne oranıdır.","İdeal gaz modeli PV=nRT; gerçek gazlar yüksek basınç ve düşük sıcaklıklarda sapar."],
    formulas:["n = m/M; N = n NA","Molarite: C = n / V (V litre)","Yüzde verim = 100 × gerçek ürün / teorik ürün","PV = nRT; T(K) = t(°C) + 273.15"],
    worked:{question:"2H2 + O2 → 2H2O. 3 mol H2 ve 2 mol O2 tepkimeye girerse en çok kaç mol su oluşur?",
      reasoning:["3 mol H2'nin tamamen harcanması için 1.5 mol O2 gerekir.","2 mol O2 mevcut; bu nedenle H2 sınırlayıcıdır.","2 mol H2 → 2 mol H2O olduğundan eşit mol su oluşur."],answer:"Teorik ürün 3 mol H2O; 0.5 mol O2 artar."},
    tactics:["Önce denklemi dengele, ardından her reaktifi mol cinsine çevir.","Sonuçları gerekirse atom ve kütle korunumuyla doğrula.","Hacim ve sıcaklığın birimlerini yazmadan denklem uygulama.","Ondalık sayıları erken yuvarlama."],
    exercises:["18 g su kaç moldür? (M=18 g/mol)","0.25 mol madde 0.5 L çözeltide kaç molardır?","1 mol ideal gaz için basınç iki kat, sıcaklık sabitse hacim nasıl değişir?"],
    solutions:["1 mol.","0.5 mol/L.","Hacim yarıya iner."]
  },
  {
    slug:"kimya-kimyasal-denge",branch:"chemistry",title:"Kimyasal Denge ve Tepkime Yönü",level:"Orta / 1.-2. aşama",
    summary:"Kc, Kp, tepkime bölümü, ICE tabloları ve Le Châtelier ilkesi.",
    goals:["Denge bağıntılarını doğru kurmak","Q ve K karşılaştırmasıyla yön bulmak","ICE tablosunu bilinmeyenle çözmek"],
    principles:["Denge dinamik bir durumdur: ileri ve geri tepkime hızları eşittir.","Kc ifadesinde saf katı ve saf sıvıların aktiviteleri yazılmaz.","Q, mevcut derişimlerle aynı üs düzeninde hesaplanır; Q<K ise ileri yön, Q>K ise geri yön tercih edilir.","Sıcaklık K değerini değiştirir; aynı sıcaklıkta derişim veya basınç değişimi doğrudan K'yi değiştirmez.","ICE tablosunda başlangıç, değişim ve denge değerlerini katsayılarla doğru ilişkilendir."],
    formulas:["aA+bB ⇌ cC+dD için Kc = [C]^c[D]^d / ([A]^a[B]^b)","Q<K: ileri; Q>K: geri; Q=K: dengede","Gazlar için Kp=Kc(RT)^Δn (ideal gaz yaklaşımı)","ΔG = ΔG° + RT ln Q; dengede ΔG=0"],
    worked:{question:"A ⇌ B için başlangıçta [A]=1.0 M ve [B]=0. Kc=4 ise dengede [B] kaç M?",
      reasoning:["A: 1-x, B: x yazılır.","Kc = x/(1-x)=4.","x=4-4x → 5x=4."],answer:"[B]=0.8 M, [A]=0.2 M."},
    tactics:["K ifadesini yazmadan önce doğru dengelenmiş denklemi kur.","K'yı ters çevirince 1/K olacağını unutma.","Başlangıç derişimi negatif çıkarsa seçilen yöndeki varsayımı kontrol et.","Le Châtelier açıklamasını Q/K hesabıyla sağlamlaştır."],
    exercises:["Q=0.2 ve K=5 ise tepkime hangi yönde ilerler?","A ⇌ 2B için Kc ifadesini yaz.","Dengede ileri ve geri tepkime hızları sıfır mıdır?"],
    solutions:["Ürünler yönüne, Q<K.","Kc=[B]²/[A].","Hayır, eşit ve sıfırdan farklı olabilirler."]
  },
  {
    slug:"biyoloji-hucre-ve-zar",branch:"biology",title:"Hücre Biyolojisi ve Zar Taşınımı",level:"Temel / 1. aşama",
    summary:"Organel işlevleri, difüzyon, osmoz, aktif taşıma ve deney okuryazarlığı.",
    goals:["Hücre bileşenlerini görevleriyle ilişkilendirmek","Zar taşınım mekanizmalarını ayırmak","Osmoz deneyinde yön tahmin etmek"],
    principles:["Hücre zarı seçici geçirgendir; fosfolipit çift tabaka ile proteinler birlikte iş görür.","Basit difüzyon, net taşınımı konsantrasyon gradyanı boyunca sağlar ve doğrudan ATP tüketmez.","Kolaylaştırılmış difüzyon taşıyıcı veya kanal proteini kullanır, fakat yine gradyan yönündedir.","Aktif taşıma enerji harcayarak elektrokimyasal gradyana karşı madde hareketi sağlar.","Osmoz suyun kimyasal potansiyel farkına yanıtıdır; yalnız 'çok sudan az suya' diye ezberlemek hatalı yorumlara yol açar."],
    formulas:["Yüzey alanı / hacim oranı, küp için 6/L","Basit model: akı ∝ derişim farkı / zar kalınlığı","Ozmotik basınç için seyreltik ideal yaklaşım: π ≈ iCRT","Enerji gerektiren taşınım ATP hidrolizi veya başka gradyanla eşleştirilebilir"],
    worked:{question:"Bir hücre, kendi içinden daha yüksek çözünen madde derişimli ortama konulursa hacmi için ne beklersin?",
      reasoning:["Dış ortam hücre içiyle karşılaştırıldığında hipertoniktir.","Su, geçirgen zar üzerinden net olarak dışarı yönelir.","Hücre hacmi azalır; hayvan ve bitki hücrelerinde görünüm farklı olabilir."],answer:"Net su kaybı nedeniyle hücre büzülme eğilimindedir."},
    tactics:["Deneyde kontrol grubu, bağımsız ve bağımlı değişkeni yaz.","ATP kullanımı olup olmamasını taşınımın tanımına göre değerlendir.","Prokaryot ve ökaryotta organel farklılığını işlev üzerinden düşün.","Mikroskop görüntüsünde ölçek çubuğunu mutlaka kullan."],
    exercises:["Küpün kenarı iki katına çıkarsa yüzey/hacim oranı nasıl değişir?","İyon kanalı üzerinden gradyan yönünde geçiş aktif taşıma mıdır?","Mitokondrinin ana görevi nedir?"],
    solutions:["6/L ifadesi yarıya iner.","Hayır, kolaylaştırılmış difüzyon olabilir.","Hücresel solunumla ATP üretiminde önemli rol oynar."]
  },
  {
    slug:"biyoloji-genetik",branch:"biology",title:"Mendel Genetiği ve Olasılık",level:"Temel / 1. aşama",
    summary:"Alel, genotip, gamet, çaprazlama ve bağımsız dağılım.",
    goals:["Tek ve iki karakterli çaprazlamaları modellemek","Ayrılma ve bağımsız dağılım varsayımlarını ayırt etmek","Olasılık çarpım ve toplam kurallarını uygulamak"],
    principles:["Diploid organizmada bir lokusun iki aleli homolog kromozomlarda bulunur.","Mendel'in ayrılma ilkesiyle heterozigot Aa bireyin gametlerinin yarısı A, yarısı a olabilir.","İki lokusun bağımsız dağılımı, genlerin bağlı olmadığı veya yeterince uzak olduğu varsayımına bağlıdır.","Genotip ve fenotip oranları baskınlık modeline ve gen etkileşimlerine göre değişir.","Bağlı genler ve rekombinasyon, basit 9:3:3:1 oranından sapmalar doğurabilir."],
    formulas:["Aa × Aa: P(AA)=1/4, P(Aa)=1/2, P(aa)=1/4","Bağımsız olaylarda P(A ve B)=P(A)P(B)","Ayrık olaylarda P(A veya B)=P(A)+P(B)","AaBb bireyde, bağımsız dağılımla dört gamet türü 1/4'er"],
    worked:{question:"AaBb × AaBb çaprazlamasında iki özellik için de çekinik fenotip (aabb) olasılığı nedir? Bağımsız dağılım varsay.",
      reasoning:["Aa × Aa sonucunda aa olasılığı 1/4.","Bb × Bb sonucunda bb olasılığı 1/4.","Bağımsız olay olasılıklarını çarp."],answer:"P(aabb) = 1/4 × 1/4 = 1/16."},
    tactics:["Soruda dominant-çekinik ilişki belirtilmemişse otomatik varsayma.","Fenotip oranını bulmadan önce genotip uzayını kur.","Bağımsız dağılım varsayımının biyolojik gerekçesini sorgula.","Soy ağacında gözlenmeyen genotipleri mümkün seçeneklerle sınırla."],
    exercises:["Aa × aa sonucunda Aa olasılığı nedir?","AaBb bireyinden Ab gameti, bağımsız dağılımla hangi olasılıkla oluşur?","İki ayrı çocuğun ikisinin de erkek olma olasılığı nedir? Eşit doğum olasılığı varsay."],
    solutions:["1/2.","1/4.","1/2 × 1/2 = 1/4."]
  },
  {
    slug:"biyoloji-enzimler",branch:"biology",title:"Enzimler ve Metabolizma",level:"Orta / 1.-2. aşama",
    summary:"Aktivasyon enerjisi, substrat bağlanması, hız grafikleri ve inhibisyon.",
    goals:["Enzimlerin hızlandırıcı rolünü açıklamak","Km ve Vmax kavramlarını yorumlamak","Deney grafiğinde inhibitör etkisini okumak"],
    principles:["Enzim katalizör olarak aktivasyon enerjisini düşürür; denge sabitini değiştirmez.","Substrat derişimi arttığında hız bir noktada enzim doygunluğuna yaklaşabilir.","Michaelis-Menten modeli yalnız belirli kinetik varsayımlarda geçerlidir.","Kompetitif inhibitör tipik ideal modelde görünür Km'yi yükseltir, Vmax'ı değiştirmez.","Nonkompetitif inhibitörün ideal saf modelinde Vmax azalır; biyolojik sistemlerde sapmalar mümkündür."],
    formulas:["v ≈ Vmax [S] / (Km + [S]) (Michaelis-Menten modeli)","[S]=Km ise v=Vmax/2","Km, belirli modelde yarı maksimum hıza karşılık gelen substrat derişimidir","Denge konumu katalizörle değişmez; yalnız dengeye ulaşma süresi değişir"],
    worked:{question:"Vmax=100 birim/dk ve Km=2 mM olan ideal enzimde [S]=2 mM iken ilk hız kaçtır?",
      reasoning:["Model formülü v=Vmax[S]/(Km+[S]).","v=100·2/(2+2).","Pay ve paydayı sadeleştir."],answer:"v=50 birim/dk."},
    tactics:["Grafik eksenlerindeki birimleri kontrol et.","Denge sabitiyle hız sabitini karıştırma.","'Enzim tüketilir' ifadesinin katalizör tanımıyla çeliştiğini hatırla.","Sıcaklık artışı önce hızı artırabilir, sonra denatürasyon nedeniyle düşürebilir."],
    exercises:["[S] çok büyükken hız hangi değere yaklaşır?","Kompetitif inhibitör varlığında ideal modelde Vmax ne olur?","Enzim aktivasyonu denge sabitini değiştirir mi?"],
    solutions:["Vmax.","Değişmez.","Hayır."]
  },
  {
    slug:"matematik-sayi-teorisi",branch:"math",title:"Sayı Teorisi: Bölünebilme ve Modüler Aritmetik",level:"Temel / 1. aşama",
    summary:"Bölme algoritması, kalıntılar, EBOB ve modüler eşitlikler.",
    goals:["Modüler aritmetiği kanıtlarla kullanmak","EBOB ve Bézout fikrini anlamak","Kalıntı sınıflarıyla soru çözmek"],
    principles:["a ≡ b (mod n), n'nin a-b farkını böldüğü anlamına gelir.","Toplama ve çarpma modüler eşitliği korur; bölme ise her zaman korunmaz.","gcd(a,b) iki sayının ortak bölenlerinin en büyüğüdür ve Öklid algoritmasıyla hesaplanabilir.","Bézout özdeşliği gcd(a,b)=ax+by olacak tamsayı x,y bulunduğunu söyler.","Bir sayının mod n çarpımsal tersi ancak gcd(a,n)=1 olduğunda vardır."],
    formulas:["a=bq+r, 0≤r<|b| (b≠0)","a ≡ b (mod n) ⇔ n | (a-b)","gcd(a,b)=gcd(b,a mod b)","ax ≡ 1 (mod n) çözülebilir ⇔ gcd(a,n)=1"],
    worked:{question:"7x ≡ 3 (mod 11) eşitliğini çöz.",
      reasoning:["7 ile 11 aralarında asaldır; 7'nin tersi vardır.","7·8=56 ≡ 1 (mod 11), yani ters 8'dir.","İki tarafı 8 ile çarp: x ≡ 24 ≡ 2 (mod 11)."],answer:"x ≡ 2 (mod 11)."},
    tactics:["Büyük üslerde kuvvetleri kısa periyotlara ayır.","Modüler bölme yapmadan önce bölenin tersinin varlığını doğrula.","Çözümü özgün bağıntıda yerine koy.","Negatif kalıntıları 0,...,n-1 temsilcilerine indir."],
    exercises:["2^10 mod 7 kalanı nedir?","gcd(84,30) kaçtır?","3x ≡ 1 (mod 7) çözümünü bul."],
    solutions:["1024 ≡ 2 (mod 7).","6.","x ≡ 5 (mod 7)."]
  },
  {
    slug:"matematik-kombinatorik",branch:"math",title:"Kombinatorik: Sayma ve Güvercin Yuvası",level:"Temel / 1. aşama",
    summary:"Toplama-çarpma ilkesi, permütasyon-kombinasyon, değişmezler.",
    goals:["Doğru sayma yöntemi seçmek","Çifte sayma ve tamamlayıcı sayma uygulamak","Güvercin yuvası ilkesini kanıtlamak"],
    principles:["Birbirini dışlayan durumların sayıları toplanır; ardışık bağımsız seçimlerin sayıları çarpılır.","Sıralama önemliyse permütasyon, değilse kombinasyon kullanılır.","Tamamlayıcı sayma özellikle 'en az bir' türündeki sorularda yararlıdır.","Güvercin yuvası ilkesi: N nesne k kutuya dağılırsa bir kutuda en az ceil(N/k) nesne vardır.","Çifte sayma aynı kümenin elemanlarını iki farklı yöntemle sayıp eşitlik üretir."],
    formulas:["P(n,r)=n!/(n-r)!","C(n,r)=n!/[r!(n-r)!]","C(n,r)=C(n,n-r)","En kalabalık kutu ≥ ceil(N/k)"],
    worked:{question:"1'den 10'a kadar sayılardan 6'sı seçildiğinde aralarında farkı 5 olan iki sayı bulunacağını göster.",
      reasoning:["Sayıları (1,6),(2,7),(3,8),(4,9),(5,10) çiftlerine ayır.","Toplam 5 kutu vardır.","6 sayı seçildiğinde güvercin yuvası ilkesi gereği bir çiftten iki sayı seçilir."],answer:"Bu ikilinin farkı 5'tir; iddia kanıtlandı."},
    tactics:["Nesneleri doğru kutulara yerleştirmek çoğu zaman bütün çözümdür.","'En az bir' için tüm durumdan 'hiçbiri'yi çıkar.","İki kez sayma hatasını küçük n değerleriyle test et.","Sıralamayı iki ayrı aşamada hesaba katıp fazla sayma yapma."],
    exercises:["5 kişiden 2 kişilik komite kaç şekilde seçilir?","10 kişi 3 masaya dağılırsa en az bir masada kaç kişi olur?","Üç basamaklı rakamları farklı kaç sayı vardır?"],
    solutions:["C(5,2)=10.","ceil(10/3)=4.","9·9·8=648."]
  },
  {
    slug:"matematik-geometri",branch:"math",title:"Geometri: Benzerlik ve Çember",level:"Orta / 1.-2. aşama",
    summary:"Üçgen benzerliği, açı takibi, çemberde kuvvet ve yardımcı çizimler.",
    goals:["Benzer üçgenleri tanımak","Çember teoremleriyle uzunluk bulmak","Şekilde yardımcı doğru seçmek"],
    principles:["Üçgende iki açının eşitliği benzerlik için yeterlidir.","Benzer üçgenlerde karşılıklı kenar oranları sabittir; alan oranı benzerlik oranının karesidir.","Çevre açı aynı yayı görüyorsa eşittir; merkez açı aynı yaya ait çevre açının iki katıdır.","Bir dış noktadan çizilen iki kesenin parçaları için çarpım ilişkisi bulunur.","Açı kovalamada eşit açıların hangi yay veya paralellikten geldiğini açıkça yaz."],
    formulas:["Benzerlik oranı k ⇒ uzunluk oranı k, alan oranı k²","Kesen-kesen: PA·PB = PC·PD (P dış nokta)","Teğet-kesen: PT² = PA·PB","Çemberde aynı yayı gören çevre açılar eşittir"],
    worked:{question:"Bir dış noktadan çembere çizilen teğet uzunluğu 6, kesenin dış parçası 4 ise kesenin tamamı kaçtır?",
      reasoning:["Teğet-kesen teoremini yaz: PT²=PA·PB.","36=4·PB.","PB=9."],answer:"Kesenin P noktasından uzak kesişime kadar toplam uzunluğu 9'dur."},
    tactics:["Şekle bakıp yalnız görsel oran tahmin etme; geometrik gerekçe kur.","Benzer üçgende karşılıklı köşeleri doğru sırada yaz.","Bir çevre açıyı görmüyorsan aynı yayı gören başka açı ara.","Uzunluk sonucu negatif veya geometrik olarak olanaksız çıkarsa düzeni kontrol et."],
    exercises:["Benzerlik oranı 3 ise alan oranı kaçtır?","Çemberin aynı yayını gören iki çevre açı 35° ise ikincisi kaçtır?","PT=8 ve PA=4 ise PB kaçtır?"],
    solutions:["9.","35°.","PT²/PA = 64/4=16."]
  }
];

export const findNote = (slug: string) => NOTES.find(note => note.slug === slug);

// One introductory booklet per branch is free; advanced topics require Plus.
export const isFreeNote = (note: Note) => NOTES.find(n => n.branch === note.branch)?.slug === note.slug;
