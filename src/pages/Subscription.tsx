import React from 'react';
import PageLayout from '@/src/components/PageLayout';
import { 
  Check, 
  Zap, 
  Star, 
  ShieldCheck, 
  CreditCard,
  ArrowRight,
  Sparkles,
  Crown
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Card, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

const PLANS = [
  {
    name: 'Free',
    price: 'Rp 0',
    period: '/selamanya',
    description: 'Untuk pemula yang ingin mulai mencatat.',
    features: [
      'Mencatat Transaksi Harian',
      '1 Dompet Utama',
      'Laporan Dasar Bulanan',
      'Target Keuangan (Maks. 1)',
    ],
    buttonText: 'Paket Saat Ini',
    variant: 'ghost',
    icon: Star,
    color: 'text-gray-400'
  },
  {
    name: 'Starter',
    price: 'Rp 99.000',
    period: '/tahun',
    description: 'Cocok untuk manajemen keuangan personal.',
    features: [
      'Semua fitur Free',
      'Hingga 5 Dompet',
      'Laporan Detail & Grafik',
      'Target Keuangan (Maks. 5)',
      'Budgeting Per Kategori',
      'Export Data ke CSV',
    ],
    buttonText: 'Pilih Starter',
    variant: 'primary',
    icon: Zap,
    color: 'text-blue-500',
    popular: false
  },
  {
    name: 'Pro',
    price: 'Rp 149.000',
    period: '/tahun',
    description: 'Fitur lengkap dengan kecerdasan buatan.',
    features: [
      'Semua fitur Starter',
      'Dompet Tanpa Batas',
      'AI Financial Advisor',
      'Prediksi Arus Kas AI',
      'Multi-Device Sync',
      'Prioritas Dukungan',
      'Tanpa Iklan',
    ],
    buttonText: 'Pilih Pro',
    variant: 'neon',
    icon: Crown,
    color: 'text-neon',
    popular: true
  }
];

export default function SubscriptionPage() {
  return (
    <PageLayout 
      title="Daftar Berlangganan" 
      description="Pilih paket yang sesuai dengan kebutuhan finansial kamu."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan, i) => (
          <Card 
            key={i} 
            className={cn(
              "relative flex flex-col p-6 sm:p-8 transition-all hover:scale-[1.02] duration-300 border-white/5 active:scale-95 sm:active:scale-[1.02]",
              plan.popular ? "border-neon shadow-2xl shadow-neon/10 ring-1 ring-neon/20 scale-105 z-10 my-4 md:my-0" : ""
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon text-dark text-[9px] sm:text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(212,255,0,0.5)] z-20">
                Paling Populer
              </div>
            )}

            <div className="mb-6 sm:mb-8 text-center sm:text-left">
              <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 mx-auto sm:mx-0 shadow-inner", plan.color)}>
                <plan.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center sm:justify-start gap-1 mb-4">
                <span className="text-3xl sm:text-4xl font-black">{plan.price}</span>
                <span className="text-white/40 text-[10px] sm:text-xs font-black uppercase tracking-widest">{plan.period}</span>
              </div>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                {plan.description}
              </p>
            </div>

            <div className="space-y-4 mb-8 sm:mb-10 flex-1">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className="mt-1 w-4 h-4 rounded-full bg-neon/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-neon" />
                  </div>
                  <span className="text-xs sm:text-sm text-white/80 font-bold">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              variant={plan.variant as any}
              className={cn(
                "w-full py-4 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform",
                plan.name === 'Free' && "opacity-50 cursor-default pointer-events-none"
              )}
            >
              {plan.buttonText}
              {plan.name !== 'Free' && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </Card>
        ))}
      </div>

      {/* Comparison Table or Extra Info */}
      <div className="mt-16 sm:mt-20">
        <Card className="p-6 sm:p-10 border-none bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-center relative z-10">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-neon/10 text-neon text-[9px] sm:text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-6 border border-neon/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                Jaminan Keamanan
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6 leading-tight tracking-tight">
                Investasi Terbaik untuk <span className="text-neon text-glow-neon">Masa Depan</span> Finansialmu.
              </h2>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Dengan berlangganan Kalola, kamu tidak hanya mendapatkan fitur pencatatan, tapi juga asisten finansial pribadi yang membantu kamu mencapai tujuan lebih cepat.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 justify-center sm:justify-start">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-neon shadow-inner">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/80">Pembayaran Aman</div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 justify-center sm:justify-start">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-neon shadow-inner">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/80">Update Berkala</div>
                </div>
              </div>
            </div>
            
            <div className="relative pt-10 lg:pt-0">
              <div className="absolute inset-0 bg-neon/10 blur-[80px] sm:blur-[100px] rounded-full sm:opacity-50" />
              <Card className="relative z-10 bg-dark/40 border-white/10 p-6 sm:p-8 backdrop-blur-xl group">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-white/5">
                    <div className="font-black text-xs sm:text-sm uppercase tracking-widest text-white/40">Metode Pembayaran</div>
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-white/10 rounded group-hover:bg-white/20 transition-colors" />
                      <div className="w-8 h-5 bg-white/10 rounded group-hover:bg-white/20 transition-colors" />
                      <div className="w-8 h-5 bg-white/10 rounded group-hover:bg-white/20 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Transfer Bank</span>
                      <span className="font-black">BCA, Mandiri, BNI</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">E-Wallet</span>
                      <span className="font-black text-neon">GoPay, OVO, Dana</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Kartu Kredit</span>
                      <span className="font-black">Visa, Mastercard</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
