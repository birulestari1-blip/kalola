import { motion } from 'motion/react';
import { 
  ChevronRight, 
  Play, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Globe, 
  Zap, 
  PieChart, 
  Bot, 
  Camera, 
  BarChart3, 
  Target, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Twitter,
  Instagram,
  Facebook,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neon rounded-lg flex items-center justify-center text-dark font-bold">K.</div>
              <span className="text-xl font-bold tracking-tight">Kalola.</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-dark transition-colors">Features</a>
              <a href="#pricing" className="hover:text-dark transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-dark transition-colors">FAQ</a>
              <button className="flex items-center gap-1 hover:text-dark transition-colors">
                <Globe className="w-4 h-4" />
                EN
              </button>
              <Link to="/login" className="bg-neon text-dark px-6 py-2.5 rounded-full font-bold hover:bg-neon-dark transition-all">
                Log In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-dark transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={cn(
          "md:hidden fixed top-20 left-0 right-0 bottom-0 bg-white/95 backdrop-blur-xl z-40 p-8 flex flex-col gap-6 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top",
          isMenuOpen ? "translate-y-0 opacity-100 scale-100" : "-translate-y-full opacity-0 scale-95 pointer-events-none"
        )}>
          <div className="flex flex-col gap-8 pt-10">
            {['Features', 'Pricing', 'FAQ'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                onClick={() => setIsMenuOpen(false)} 
                className="text-3xl font-black text-dark hover:text-neon transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="mt-auto pb-10 flex flex-col gap-4">
            <Link 
              to="/login" 
              onClick={() => setIsMenuOpen(false)}
              className="bg-dark text-white text-center py-5 rounded-3xl font-black text-xl active:scale-95 transition-transform"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-neon/10 blur-[120px] rounded-full -z-10" />

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.75rem] sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8"
          >
            Stop Hidup dari<br className="hidden sm:block" /> Gaji ke Gaji
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto mb-10 px-4 sm:px-0"
          >
            Kalola bantu kamu track semua dompet, pengeluaran dan atur budget — semua di satu tempat.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20 px-4"
          >
            <Link to="/login" className="w-full sm:w-auto bg-dark text-white px-8 py-5 rounded-[1.5rem] sm:rounded-full font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all group active:scale-95">
              Mulai atur keuanganku
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4 mb-20">
            <div className="flex -space-x-3">
              {[1,2,3,4,5].map(i => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/100/100`} 
                  className="w-12 h-12 rounded-full border-4 border-white object-cover"
                  referrerPolicy="no-referrer"
                  alt="User"
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-neon">
                {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
              </div>
              <span className="text-sm font-medium text-gray-600">1.000+ Gen Z dan Millenial udah pakai Kalola.</span>
            </div>
          </div>

          {/* Video Demo Placeholder */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-5xl mx-auto aspect-video bg-dark rounded-[2rem] overflow-hidden shadow-2xl group cursor-pointer"
          >
            <img 
              src="https://picsum.photos/seed/dashboard/1200/800" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              alt="Dashboard Demo"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-neon rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-dark fill-dark ml-1" />
              </div>
              <span className="text-white font-bold text-lg">Tonton Video</span>
              <span className="text-white/60 text-sm">Kalola app demo</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 sm:py-16 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-12 sm:mb-14">Aman dan dibuat khusus untukmu.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {[
              { icon: Lock, text: "Data terenkripsi — data kamu aman" },
              { icon: CreditCard, text: "Metode bayar yang lengkap" },
              { icon: Smartphone, text: "Bisa diinstall di HP, tablet, dan laptop" },
              { icon: Globe, text: "Dari Indonesia untuk Indonesia" }
            ].map((item, i) => (
              <div key={i} className="flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:gap-5 px-4 sm:px-0">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-dark" />
                </div>
                <span className="text-sm font-bold text-gray-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">Kamu pernah merasa begini?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                emoji: "😵", 
                title: "“Baru gajian, seminggu kemudian gatau uangnya habis kemana.”",
                desc: "Punya banyak rekening dan e-wallet. Jadinya susah banget liat semua transaksinya. Apalagi kamu gak pernah catat pengeluaran, akhirnya cuma bisa nebak-nebak aja."
              },
              { 
                emoji: "📊", 
                title: "“Udah coba bikin budget di spreadsheet, tapi nyerah di minggu pertama.”",
                desc: "Spreadsheet itu ribet. Harus zoom in zoom out kalau di HP, belum lagi kalau ada rumusnya yg error, mau rapi malah makin pusing."
              },
              { 
                emoji: "😰", 
                title: "“Niat nabung ada, tapi duitnya selalu habis duluan sebelum sempat nabung.”",
                desc: "Kalau nunggu sisa, gak akan pernah ada sisa. Harus ada sistem yang bantu kamu pisahkan dari awal."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-6">{item.emoji}</div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-gray-500 font-medium">
            Bukan karena kamu gak disiplin, tapi kamu belum ketemu sistem yang pas dan <span className="text-dark font-bold">Kalola dibuat untuk itu.</span>
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-dark text-white rounded-[3rem] mx-4">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">Cuma butuh 5 menit. Serius.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                step: "1", 
                title: "Masukkan semua dompet kamu", 
                desc: "Rekening bank, E-Wallet, Kartu Kredit sampai PayLater.",
                note: "*Saldo tidak otomatis sinkron karena tidak memasukkan id atau password, jadi sangat aman."
              },
              { 
                step: "2", 
                title: "Tentukan budget kamu", 
                desc: "Masukkan gaji atau penghasilan bulan ini dan tentukan limit masing-masing pos pengeluaran"
              },
              { 
                step: "3", 
                title: "Catat pengeluaran, lihat polanya", 
                desc: "Setiap kali belanja, catat. Di akhir bulan, kamu bisa lihat uang kamu kemana aja — dan apa yang bisa diperbaiki."
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="w-12 h-12 bg-neon rounded-full flex items-center justify-center text-dark font-bold text-xl mb-6">{item.step}</div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-white/60 mb-4">{item.desc}</p>
                {item.note && <p className="text-white/30 text-xs italic">{item.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">Semua yang kamu butuhkan untuk akhirnya punya kontrol atas keuanganmu.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CreditCard, title: "Semua dompet, satu tempat", desc: "Bank, e-wallet, kartu kredit, PayLater — cukup masukin jumlah saldo saat pertama kali." },
              { icon: PieChart, title: "Budget yang bikin disiplin", desc: "Setup wizard 6 langkah bantu kamu bagi gaji pakai aturan Persentage Budgeting atau Fixed Budgeting." },
              { icon: Bot, title: "Tanya AI, dapat jawaban personal", desc: "Financial advisor AI-mu tahu kondisi keuangan kamu. Tanya apa aja, dapat saran yang relevan.", pro: true },
              { icon: Camera, title: "Foto struk, langsung tercatat", desc: "Foto stuknya. AI langsung scan, pisahin item, dan tambah ke transaksi kamu.", pro: true },
              { icon: BarChart3, title: "Lihat duit kamu dari berbagai sudut", desc: "Financial Health Score 0–100. Grafik tren. Breakdown kategori. Perbandingan bulan ke bulan.", pro: true },
              { icon: Target, title: "Nabung dengan target yang jelas", desc: "Set goals dengan deadline dan jumlah target. Track progressnya tiap bulan.", pro: true },
              { icon: ShieldCheck, title: "Data kamu, bukan data kita", desc: "Tidak ada iklan. Tidak ada penjualan data. Mode privasi untuk sembunyikan saldo." },
              { icon: Smartphone, title: "Install kayak app, jalan di semua device", desc: "Install dari browser di HP atau laptop. Gak perlu App Store. Data selalu sinkron." }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all duration-300">
                {item.pro && <span className="absolute top-4 right-4 bg-dark text-neon text-[10px] font-bold px-2 py-1 rounded-md">PRO</span>}
                <item.icon className="w-10 h-10 text-dark mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Investasi kecil yang buat keuanganmu lebih rapi.</h2>
            <p className="text-gray-600">Kurang dari Rp 300/hari — lebih murah dari segelas es teh dan hasilnya jauh lebih bermanfaat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-1">STARTER</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-sm">Rp 199.000</span>
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">-50%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">Rp 99.000</div>
                  <div className="text-gray-400 text-xs">/tahun</div>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {["Kelola banyak dompet", "Percentage atau fixed budgeting", "Catat pemasukan & pengeluaran", "2 warna tema (Neon dan Pink Pastel)", "Mode gelap", "Laporan & Analitik Lanjutan", "Bahasa Indonesia & English"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <XCircle className="w-4 h-4" />
                  Goals dengan deadline
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <XCircle className="w-4 h-4" />
                  AI Advisor, Receipt Scanner, Report Analyzer
                </li>
              </ul>
              <button className="w-full py-4 rounded-2xl bg-gray-100 font-bold hover:bg-gray-200 transition-colors">Mulai dengan STARTER</button>
              <p className="text-center text-[10px] text-gray-400 mt-4">Rp 99.000/tahun · Aktif 365 hari</p>
            </div>

            {/* Pro */}
            <div className="bg-dark text-white p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-6 right-[-35px] bg-neon text-dark text-[10px] font-bold py-1 px-10 rotate-45">PALING POPULER</div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    PRO <Zap className="w-4 h-4 text-neon fill-neon" />
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 line-through text-sm">Rp 299.000</span>
                    <span className="bg-neon text-dark text-[10px] font-bold px-2 py-0.5 rounded-full">-50%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">Rp 149.000</div>
                  <div className="text-white/40 text-xs">/tahun</div>
                </div>
              </div>
              <p className="text-neon text-xs font-bold mb-6">Termasuk 350 AI credits gratis</p>
              <ul className="space-y-4 mb-10 flex-1">
                {["Semua fitur STARTER", "Goals dengan deadline", "Lacak aset & net worth", "Financial Health Score (0–100)", "AI Financial Advisor", "Scan struk transaksi", "AI Report Analyzer", "350 AI credits gratis saat daftar"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-5 rounded-2xl bg-neon text-dark font-black uppercase tracking-widest text-xs hover:bg-neon-dark transition-all active:scale-95">Upgrade ke PRO</button>
              <p className="text-center text-[10px] text-white/40 mt-4 font-bold uppercase tracking-widest">Rp 149.000/tahun · Aktif 365 hari</p>
            </div>
          </div>
          <p className="text-center mt-10 text-sm text-gray-500 max-w-lg mx-auto">
            Sudah punya STARTER dan mau upgrade ke PRO? Kamu cuma bayar selisihnya — dihitung proporsional dari sisa hari berlangganan.
          </p>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Yuk, bandingin.</h2>
            <p className="text-gray-600">Capek kan pake cara lama?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                type: "Spreadsheets", 
                bad: ["Ribet dibuka di HP", "Rumus gampang error", "Harus zoom in-out"],
                good: ["Tampilan mobile sat-set", "Hitungan otomatis", "Siap pakai langsung"]
              },
              { 
                type: "Catatan HP", 
                bad: ["Hitung manual & pusing", "Berantakan & gak rapi", "Gak ada total bulanan"],
                good: ["Otomatis & ada grafik", "Kategori rapi & jelas", "Total real-time"]
              },
              { 
                type: "Buku Tulis", 
                bad: ["Rawan ilang & basah", "Capek ngitung manual", "Ribet dibawa kemana-mana"],
                good: ["Aman di Cloud selamanya", "History lengkap & akurat", "Selalu ada di saku"]
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-[2.5rem] p-1 overflow-hidden">
                <div className="p-8">
                  <h3 className="text-xl font-bold text-center mb-8">{item.type}</h3>
                  <div className="space-y-4 mb-8">
                    {item.bad.map((b, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm text-gray-400">
                        <XCircle className="w-4 h-4" />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-8 border-t border-gray-100 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400">VS</div>
                  <div className="flex items-center gap-2 mb-6 justify-center">
                    <div className="w-6 h-6 bg-neon rounded flex items-center justify-center text-[10px] font-bold">K.</div>
                    <span className="font-bold">Kalola.</span>
                  </div>
                  <div className="space-y-4">
                    {item.good.map((g, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-neon" />
                        {g}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-dark text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Kata netizen</h2>
            <p className="text-white/40">Ini kata mereka ya, bukan minbu.</p>
          </div>

          <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar">
            {[
              { name: "Sarah D", handle: "@sarah*******", text: "guysss kalian wajib coba. setelah sekian lama mencari akhirnya ketemu jg sesuai yg ak mau. 10/10! 🧋" },
              { name: "Alex", handle: "@alex*****", text: "akhirnya nemu app yang gak kayak Excel tahun 98. dark modenya cakep abis 🤌" },
              { name: "Dina P", handle: "@dinad****", text: "tampilannya lebih rapi drpd kamar kos gue. fitur Net Worthnya bikin makin semangat!" },
              { name: "Rizky M. K.", handle: "@rizky_******", text: "gue udah ga pake spreadsheet lagi, karena pake kalola jauh lebih sat set. 🚀" },
              { name: "Jessy K", handle: "@jess*****", text: "Ternyata aku bisa nabung jugaa. Makasih Kalola! 😭💖" }
            ].map((item, i) => (
              <div key={i} className="min-w-[300px] bg-white/5 p-8 rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src={`https://picsum.photos/seed/testi${i}/100/100`} 
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                    alt={item.name}
                  />
                  <div>
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-white/40 text-xs">{item.handle}</div>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed italic">“{item.text}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Pertanyaan yang Sering Ditanyakan</h2>
          <div className="space-y-4">
            {[
              "Apakah data keuangan saya aman?",
              "Apakah Kalola bisa sync otomatis dengan rekening bank saya?",
              "Apa perbedaan STARTER dan PRO?",
              "Gimana cara bayarnya?",
              "Apakah ada perpanjangan otomatis?",
              "Bisa dipakai di HP dan laptop sekaligus?",
              "Kalau upgrade dari STARTER ke PRO, bayar berapa?"
            ].map((q, i) => (
              <div key={i} className="border-b border-gray-100 py-6 flex justify-between items-center cursor-pointer group">
                <span className="font-medium text-gray-700 group-hover:text-dark transition-colors">{q}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-neon rounded-[2.5rem] sm:rounded-[3rem] p-10 sm:p-20 text-center relative overflow-hidden shadow-2xl shadow-neon/20">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight tracking-tight">Dirimu di masa depan akan berterima kasih ke kamu hari ini.</h2>
            <p className="text-dark/60 mb-10 font-black text-sm sm:text-lg uppercase tracking-wider">Mulai dari Rp 99.000/tahun — cuma 271 rupiah per hari!</p>
            <Link to="/login" className="inline-flex items-center gap-2 bg-dark text-white px-10 py-5 rounded-full font-black text-lg hover:scale-105 transition-transform active:scale-95 shadow-xl">
              Mulai atur keuangan
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-gray-100 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-neon rounded-lg flex items-center justify-center text-dark font-bold">K.</div>
              <span className="text-xl font-bold tracking-tight">Kalola.</span>
            </div>
            <p className="text-gray-500 mb-8 max-w-sm">The financial planner for the next generation.</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Support:</p>
                <p className="text-lg font-bold">0895406181407</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lokasi:</p>
                <p className="text-sm font-medium text-gray-500">Kabupaten Pandeglang</p>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <Twitter className="w-5 h-5 text-gray-400 hover:text-dark cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-dark cursor-pointer" />
              <Facebook className="w-5 h-5 text-gray-400 hover:text-dark cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li><a href="#features" className="hover:text-dark">Features</a></li>
              <li><a href="#pricing" className="hover:text-dark">Pricing</a></li>
              <li><a href="#faq" className="hover:text-dark">FAQ</a></li>
              <li><Link to="/login" className="hover:text-dark">Log In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li className="flex items-center gap-2 text-neon font-bold"><Smartphone className="w-4 h-4" /> Install App</li>
              <li><a href="#" className="hover:text-dark">Support</a></li>
              <li><a href="#" className="hover:text-dark">Terms of Service</a></li>
              <li><a href="#" className="hover:text-dark">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-100 text-center text-gray-400 text-xs">
          © 2026 Kalola. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
