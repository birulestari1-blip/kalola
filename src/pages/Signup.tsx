import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2,
  Zap,
  Star,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { supabase } from '../lib/supabase';

type Plan = 'Starter' | 'Pro';

export default function SignupPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('Starter');
  const [formData, setFormData] = useState({
    email: 'birulestari1@gmail.com',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            phone: formData.phone,
            plan: selectedPlan,
          }
        }
      });

      if (error) throw error;
      
      // Normally we'd wait for email confirmation, but for this demo let's assume it works
      alert('Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const plans = {
    Starter: {
      name: 'Kalola Starter',
      price: 99000,
      originalPrice: 199000,
      description: 'Akses Penuh 1 Tahun',
      discount: 100000
    },
    Pro: {
      name: 'Kalola Pro',
      price: 149000,
      originalPrice: 299000,
      description: 'Akses Penuh Selamanya',
      discount: 150000
    }
  };

  const currentPlan = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center py-12 px-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-12 h-12 bg-[#d4ff00] rounded-xl flex items-center justify-center text-black text-2xl font-black shadow-lg">
          K.
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-dark mb-2 flex items-center justify-center gap-2">
          Gabung Klub 🚀
        </h1>
        <p className="text-gray-500 font-medium">
          Daftar & aktifkan paket pilihanmu.
        </p>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-[500px] bg-white border-none shadow-2xl shadow-black/5 rounded-[2.5rem] p-8 md:p-10">
        <form onSubmit={handleSignup}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Plan Selection */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
          <button 
            onClick={() => setSelectedPlan('Starter')}
            className={cn(
              "flex-1 py-4 rounded-xl transition-all relative",
              selectedPlan === 'Starter' ? "bg-white shadow-sm" : "hover:bg-gray-200/50"
            )}
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Starter</div>
            <div className="text-sm font-black text-dark">Rp 99.000<span className="text-[10px] text-gray-400">/thn</span></div>
          </button>
          <button 
            onClick={() => setSelectedPlan('Pro')}
            className={cn(
              "flex-1 py-4 rounded-xl transition-all relative",
              selectedPlan === 'Pro' ? "bg-white shadow-sm" : "hover:bg-gray-200/50"
            )}
          >
            <div className="absolute -top-2 -right-2 bg-[#d4ff00] text-dark text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
              Populer
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pro</div>
            <div className="text-sm font-black text-dark">Rp 149.000<span className="text-[10px] text-gray-400">/thn</span></div>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#d4ff00]/50 transition-all outline-none text-dark"
              placeholder="Email"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#d4ff00]/50 transition-all outline-none text-dark"
              placeholder="Nomor HP (Wajib)"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#d4ff00]/50 transition-all outline-none text-dark"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50/50 rounded-3xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ringkasan Pesanan</div>
            <div className="flex items-center gap-1 bg-[#d4ff00]/10 text-[#a3c200] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              Secure Checkout
            </div>
          </div>

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-500">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-sm font-black text-dark">{currentPlan.name}</div>
                <div className="text-[10px] text-gray-400 font-medium">{currentPlan.description}</div>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-400 line-through">Rp {currentPlan.originalPrice.toLocaleString()}</div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Diskon Terbatas</div>
            <div className="text-sm font-black text-red-500">- Rp {currentPlan.discount.toLocaleString()}</div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="text-xs font-black text-dark uppercase tracking-widest">Total Bayar</div>
            <div className="text-2xl font-black text-[#d4ff00]">Rp {currentPlan.price.toLocaleString()}</div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#d4ff00] hover:bg-[#c2eb00] text-dark font-black rounded-2xl shadow-xl shadow-[#d4ff00]/20 flex items-center justify-center gap-2 mb-8 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Lanjut ke Pembayaran
            </>
          )}
        </Button>
        </form>

        {/* Footer Link */}
        <Link 
          to="/login" 
          className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Sudah punya akun? Masuk
        </Link>
      </Card>

      {/* Legal Footer */}
      <div className="mt-12 text-center max-w-xs">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
          Dengan mendaftar, kamu menyetujui <span className="text-dark underline cursor-pointer">Syarat & Ketentuan</span> serta <span className="text-dark underline cursor-pointer">Kebijakan Privasi</span> Kalola.
        </p>
      </div>
    </div>
  );
}
