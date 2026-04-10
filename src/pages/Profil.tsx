import PageLayout from '@/src/components/PageLayout';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Bell, 
  Moon, 
  LogOut, 
  ChevronRight, 
  Camera, 
  CreditCard, 
  Globe, 
  Database, 
  HelpCircle,
  Check,
  X,
  Settings,
  Smartphone,
  Zap
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { Input, Select } from '@/src/components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function ProfilPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('IDR');
  const [twoFactor, setTwoFactor] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User Kalola',
    email: user?.email || 'birulestari1@gmail.com',
    bio: user?.user_metadata?.bio || 'Mengelola keuangan dengan lebih cerdas setiap hari.'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User Kalola',
        email: user.email || '',
        bio: user.user_metadata?.bio || 'Mengelola keuangan dengan lebih cerdas setiap hari.'
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
  };

  const accountSettings = [
    { icon: UserIcon, label: 'Informasi Pribadi', value: 'Nama, Bio, Foto Profil', onClick: () => setIsEditModalOpen(true) },
    { icon: Mail, label: 'Email & Keamanan', value: 'Ganti Password, 2FA', onClick: () => setIsSecurityModalOpen(true) },
    { icon: Shield, label: 'Privasi Data', value: 'Kelola data dan visibilitas', onClick: () => setIsPrivacyModalOpen(true) },
    { icon: CreditCard, label: 'Metode Pembayaran', value: 'Kelola kartu dan tagihan', onClick: () => setIsPaymentModalOpen(true) },
  ];

  return (
    <PageLayout 
      title="Profil" 
      description="Kelola informasi akun dan preferensi aplikasi kamu."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Header */}
          <Card className="p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-neon/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative z-10">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-neon rounded-[2.5rem] flex items-center justify-center text-dark text-4xl sm:text-5xl font-black shadow-2xl shadow-neon/20">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
                <Button 
                  variant="ghost"
                  className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-dark-lighter border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-neon transition-colors shadow-xl p-0 min-w-0"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
              
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight truncate">{profileData.name}</h2>
                  <span className="inline-flex items-center gap-1.5 bg-neon text-dark text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest w-fit mx-auto sm:mx-0">
                    <Zap className="w-3 h-3" />
                    PRO Member
                  </span>
                </div>
                <p className="text-white/40 text-xs sm:text-sm mb-4 truncate">{profileData.email}</p>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-md mb-6 sm:line-clamp-2">
                  {profileData.bio}
                </p>
                <div className="flex gap-3 justify-center sm:justify-start">
                  <Button 
                    onClick={() => setIsEditModalOpen(true)}
                    size="sm"
                    variant="primary"
                    className="flex-1 sm:flex-none py-2 text-[10px] uppercase font-black"
                  >
                    Edit Profil
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-6">Pengaturan Akun</h3>
            <Card className="p-0 overflow-hidden">
              {accountSettings.map((item, i) => (
                <Button 
                  key={i} 
                  variant="ghost"
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group rounded-none h-auto active:bg-white/10"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-white/40 group-hover:text-neon transition-colors shrink-0">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-black text-white text-sm sm:text-base">{item.label}</div>
                      <div className="text-[10px] sm:text-xs text-white/40 truncate">{item.value}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 group-hover:text-white transition-colors" />
                </Button>
              ))}
            </Card>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] ml-6">Preferensi Aplikasi</h3>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Notifikasi Push</div>
                    <div className="text-xs text-white/40">Terima pengingat budget & tagihan</div>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative p-0 min-w-0",
                    notifications ? "bg-neon" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all",
                    notifications ? "right-1 bg-dark" : "left-1 bg-white/40"
                  )} />
                </Button>
              </div>

              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Mode Gelap</div>
                    <div className="text-xs text-white/40">Tampilan antarmuka gelap</div>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  onClick={() => setDarkMode(!darkMode)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative p-0 min-w-0",
                    darkMode ? "bg-neon" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all",
                    darkMode ? "right-1 bg-dark" : "left-1 bg-white/40"
                  )} />
                </Button>
              </div>

              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Mata Uang Utama</div>
                    <div className="text-xs text-white/40">Format angka yang digunakan</div>
                  </div>
                </div>
                <Select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { label: 'IDR (Rp)', value: 'IDR' },
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'EUR (€)', value: 'EUR' },
                  ]}
                  className="w-32"
                />
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          {/* Subscription Card */}
          <Card variant="neon">
            <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <CardTitle className="mb-2">Kalola PRO</CardTitle>
            <p className="text-sm font-bold opacity-80 mb-6 leading-relaxed">
              Kamu sedang menikmati fitur premium tanpa batas. Langganan aktif hingga 12 Des 2024.
            </p>
            <div className="space-y-3 mb-8">
              {['Multi-Wallet', 'AI Insights', 'Export PDF', 'Cloud Sync'].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                  <Check className="w-4 h-4" />
                  {feature}
                </div>
              ))}
            </div>
            <Link to="/subscription" className="w-full">
              <Button variant="primary" className="w-full bg-dark text-white border-none py-4">
                Kelola Langganan
              </Button>
            </Link>
          </Card>

          {/* Device Management */}
          <Card>
            <CardTitle className="mb-6 flex items-center gap-2 text-base">
              <Smartphone className="w-5 h-5 text-blue-500" />
              Perangkat Terhubung
            </CardTitle>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <div className="font-bold">iPhone 15 Pro</div>
                  <div className="text-xs text-white/40">Perangkat ini • Aktif</div>
                </div>
                <div className="w-2 h-2 bg-neon rounded-full" />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <div className="font-bold">MacBook Air M2</div>
                  <div className="text-xs text-white/40">Terakhir aktif 2 jam lalu</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Support & Help */}
          <Card>
            <CardTitle className="mb-6 text-base">Bantuan & Dukungan</CardTitle>
            <div className="space-y-2">
              {[
                { icon: HelpCircle, label: 'Pusat Bantuan' },
                { icon: Database, label: 'Kebijakan Privasi' },
                { icon: Settings, label: 'Tentang Kalola' },
              ].map((item, i) => (
                <Button 
                  key={i} 
                  variant="ghost"
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group h-auto"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-white/40 group-hover:text-white" />
                    <span className="text-sm font-bold text-white">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </Button>
              ))}
            </div>
          </Card>

          {/* Logout Button */}
          <Button 
            variant="danger"
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full p-6 rounded-[2.5rem]"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Keluar dari Akun
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profil"
      >
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Input 
            label="Nama Lengkap"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
          />
          <Input 
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
          />
          <div className="space-y-2">
            <label className="text-xs font-black text-white/20 uppercase tracking-widest ml-2">Bio Singkat</label>
            <textarea 
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors resize-none"
            />
          </div>

          <Button variant="neon" type="submit" className="w-full mt-4 py-4">
            Simpan Perubahan
          </Button>
        </form>
      </Modal>

      {/* Security Modal */}
      <Modal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        title="Email & Keamanan"
      >
        <div className="space-y-6">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
            <div className="font-bold mb-1">Email Utama</div>
            <div className="text-sm text-white/40 mb-4">{profileData.email}</div>
            <button className="text-xs font-black text-neon uppercase tracking-widest hover:underline">Ganti Email</button>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-white/40 group-hover:text-white" />
                <span className="font-bold text-sm">Ganti Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </button>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-white/40" />
                <div>
                  <div className="font-bold text-sm">Autentikasi 2 Faktor</div>
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Keamanan Tambahan</div>
                </div>
              </div>
              <button 
                onClick={() => setTwoFactor(!twoFactor)}
                className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  twoFactor ? "bg-neon" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full transition-all",
                  twoFactor ? "right-0.5 bg-dark" : "left-0.5 bg-white/40"
                )} />
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Privasi Data"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { label: 'Mode Privasi', desc: 'Sembunyikan saldo di dashboard', checked: true },
              { label: 'Analitik Anonim', desc: 'Bantu kami meningkatkan aplikasi', checked: true },
              { label: 'Visibilitas Profil', desc: 'Izinkan teman menemukan kamu', checked: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.desc}</div>
                </div>
                <button className={cn(
                  "w-10 h-5 rounded-full transition-all relative",
                  item.checked ? "bg-neon" : "bg-white/10"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full transition-all",
                    item.checked ? "right-0.5 bg-dark" : "left-0.5 bg-white/40"
                  )} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5">
            <Button variant="danger" className="w-full py-4">
              Hapus Semua Data Akun
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Metode Pembayaran"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Kartu Utama</div>
                <div className="text-lg font-mono mb-6">**** **** **** 4242</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Exp Date</div>
                    <div className="text-sm font-bold">12/26</div>
                  </div>
                  <div className="font-black italic text-xl">VISA</div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 border-dashed text-sm font-bold text-white/40 transition-all">
              + Tambah Kartu Baru
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Riwayat Tagihan</h4>
            {[
              { date: '12 Mar 2024', amount: 'Rp 149.000', status: 'Berhasil' },
              { date: '12 Mar 2023', amount: 'Rp 149.000', status: 'Berhasil' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 text-sm">
                <div className="font-bold">{item.date}</div>
                <div className="flex items-center gap-3">
                  <span className="text-white/40">Rp 149.000</span>
                  <span className="text-[10px] font-black text-neon uppercase tracking-widest bg-neon/10 px-2 py-0.5 rounded-md">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Yakin ingin keluar?"
        danger
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <LogOut className="w-10 h-10" />
          </div>
          <p className="text-white/40 text-sm mb-10 leading-relaxed">
            Kamu perlu masuk kembali untuk mengakses data keuangan kamu.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" className="flex-1" onClick={() => setIsLogoutModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
