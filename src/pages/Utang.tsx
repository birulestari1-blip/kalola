import PageLayout from '@/src/components/PageLayout';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Calendar, 
  CreditCard, 
  ArrowUpRight, 
  CheckCircle2,
  Clock,
  Info,
  TrendingDown,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { Input, Select } from '@/src/components/ui/Input';
import { dbService, Debt as DBDebt } from '@/src/services/dbService';
import { useAuth } from '@/src/lib/AuthContext';
import { Loader2 } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

interface Debt {
  id: string;
  name: string;
  lender: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  dueDate: string;
  category: 'Cicilan' | 'Pinjaman' | 'Kartu Kredit' | 'Lainnya';
  color: string;
  history: Payment[];
  minimumPayment: number;
}

const CATEGORIES = ['Cicilan', 'Pinjaman', 'Kartu Kredit', 'Lainnya'];
const COLORS = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Purple', value: 'bg-purple-500' },
];

export default function UtangPage() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<DBDebt[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [debtData, walletData] = await Promise.all([
        dbService.getDebts(),
        dbService.getWallets()
      ]);
      setDebts(debtData);
      setWallets(walletData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDebts = fetchData;

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [strategy, setStrategy] = useState<'Snowball' | 'Avalanche'>('Avalanche');
  
  const [editingDebt, setEditingDebt] = useState<DBDebt | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<DBDebt | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payWalletId, setPayWalletId] = useState('');
  const [payNote, setPayNote] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    lender: '',
    totalAmount: '',
    remainingAmount: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Cicilan' as Debt['category'],
    color: 'bg-red-500',
    receiveWalletId: ''
  });

  const stats = useMemo(() => {
    const totalDebt = debts.reduce((acc, curr) => acc + curr.amount, 0);
    const totalOriginal = totalDebt; // Simplified for now
    const paidAmount = 0;
    const paidPercentage = 0;
    const totalMonthlyMin = debts.reduce((acc, curr) => acc + (curr.status === 'active' ? (curr.amount * 0.1) : 0), 0); // Mock min payment
    
    // Find nearest due date
    const sortedByDate = [...debts].sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime());
    const nextDue = sortedByDate.find(d => d.status === 'active');

    // Strategy recommendation
    const avalancheTarget = [...debts]
      .filter(d => d.status === 'active')
      .sort((a, b) => (b.interest_rate || 0) - (a.interest_rate || 0))[0];
    
    const snowballTarget = [...debts]
      .filter(d => d.status === 'active')
      .sort((a, b) => a.amount - b.amount)[0];

    return { totalDebt, totalOriginal, paidAmount, paidPercentage, totalMonthlyMin, nextDue, avalancheTarget, snowballTarget };
  }, [debts]);

  const filteredDebts = useMemo(() => {
    return debts.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lender.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime());
  }, [debts, searchQuery]);

  const openAddModal = () => {
    setEditingDebt(null);
    setFormData({
      name: '',
      lender: '',
      totalAmount: '',
      remainingAmount: '',
      interestRate: '',
      minimumPayment: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Cicilan',
      color: 'bg-red-500'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: DBDebt) => {
    setEditingDebt(d);
    setFormData({
      name: d.name,
      lender: d.lender,
      totalAmount: d.amount.toString(),
      remainingAmount: d.amount.toString(),
      interestRate: (d.interest_rate || 0).toString(),
      minimumPayment: (d.amount * 0.1).toString(),
      dueDate: d.due_date || new Date().toISOString().split('T')[0],
      category: 'Cicilan',
      color: 'bg-red-500'
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDebtToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openPayModal = (d: DBDebt) => {
    setSelectedDebt(d);
    setPayAmount('');
    setPayNote('');
    setIsPayModalOpen(true);
  };

  const openHistoryModal = (d: DBDebt) => {
    setSelectedDebt(d);
    setIsHistoryModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = parseFloat(formData.remainingAmount) || 0;
      const data = {
        name: formData.name,
        lender: formData.lender,
        amount: amount,
        interest_rate: parseFloat(formData.interestRate) || 0,
        due_date: formData.dueDate,
        status: 'active' as const,
      };

      if (editingDebt) {
        await dbService.updateDebt(editingDebt.id, data);
      } else {
        const newDebt = await dbService.createDebt(data);
        
        // If a wallet is selected, create an income transaction
        if (formData.receiveWalletId) {
          await dbService.createTransaction({
            name: `Pinjaman: ${formData.name}`,
            category: 'Loan',
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            wallet_id: formData.receiveWalletId,
            type: 'income',
            note: `Menerima pinjaman dari ${formData.lender}`
          });
        }
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDebt && payAmount && payWalletId) {
      try {
        const amount = parseFloat(payAmount);
        const newAmount = Math.max(0, selectedDebt.amount - amount);
        
        // Update debt in DB
        await dbService.updateDebt(selectedDebt.id, { 
          amount: newAmount,
          status: newAmount === 0 ? 'paid' : 'active'
        });

        // Create a transaction for this payment
        await dbService.createTransaction({
          name: `Bayar Utang: ${selectedDebt.name}`,
          category: 'Bills',
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          wallet_id: payWalletId,
          type: 'expense',
          note: payNote || `Pembayaran utang ke: ${selectedDebt.lender}`
        });

        fetchData();
        setIsPayModalOpen(false);
        setSelectedDebt(null);
        setPayAmount('');
        setPayWalletId('');
        setPayNote('');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const confirmDelete = async () => {
    if (debtToDelete) {
      try {
        await dbService.deleteDebt(debtToDelete);
        fetchDebts();
        setIsDeleteModalOpen(false);
        setDebtToDelete(null);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <PageLayout 
      title="Utang" 
      description="Lacak cicilan, pinjaman, dan kewajiban kamu."
      actions={
        <Button 
          onClick={openAddModal}
          variant="neon"
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Utang</span>
          <span className="sm:hidden">Utang Baru</span>
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-neon animate-spin" />
            <p className="text-white/40 font-black uppercase tracking-widest">Memuat Data Utang...</p>
          </div>
        ) : error ? (
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-500 font-bold">{error}</p>
            <Button onClick={fetchDebts} variant="ghost">Coba Lagi</Button>
          </div>
        ) : (
          <>
            <div className="lg:col-span-2 space-y-8">
              {/* Summary Cards */}
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <Card className="sm:col-span-2 p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all sm:opacity-0 sm:group-hover:opacity-100" />
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-glow-red">Total Sisa Utang</div>
                  <div className="text-3xl sm:text-5xl font-black mb-1 tracking-tight truncate max-w-full">Rp {stats.totalDebt.toLocaleString()}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-glow-neon">Cicilan Bulanan</div>
                  <div className="text-xl sm:text-2xl font-black text-neon">Rp {stats.totalMonthlyMin.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${stats.paidPercentage}%` }} />
                </div>
                <div className="text-[10px] sm:text-xs font-black text-white/40 uppercase tracking-widest whitespace-nowrap">
                  {stats.paidPercentage.toFixed(1)}% Lunas
                </div>
              </div>
            </Card>
            <Card className="p-6 relative overflow-hidden group sm:col-span-2 lg:col-span-1">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-neon/10 rounded-full blur-3xl group-hover:bg-neon/20 transition-all sm:opacity-0 sm:group-hover:opacity-100" />
              <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3">Jatuh Tempo Terdekat</div>
              {stats.nextDue ? (
                <>
                  <div className="text-xl sm:text-2xl font-black mb-1 truncate">{stats.nextDue.name}</div>
                  <div className="text-neon font-black text-base sm:text-lg mb-4">
                    {new Date(stats.nextDue.due_date || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/40 font-black uppercase tracking-widest flex items-center gap-2 mt-auto">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.ceil((new Date(stats.nextDue.due_date || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Hari lagi
                  </div>
                </>
              ) : (
                <div className="text-white/20 font-black py-4 uppercase tracking-widest text-xs">Tidak ada utang aktif</div>
              )}
            </Card>
          </div>

          <Card className="p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
              <h3 className="text-xl font-black">Daftar Kewajiban</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari utang..." 
                  className="pl-11"
                />
              </div>
            </div>

            <div className="space-y-6">
              {filteredDebts.map((d) => {
                const isPaid = d.status === 'paid';

                return (
                  <div key={d.id} className="group relative bg-white/5 p-4 sm:p-6 rounded-3xl border border-white/5 hover:border-white/10 active:scale-[0.98] sm:active:scale-100 transition-all">
                    {/* Actions */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button 
                        onClick={() => openEditModal(d)}
                        variant="primary"
                        size="sm"
                        className="p-1.5 sm:p-2 min-w-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => openDeleteModal(d.id)}
                        variant="danger"
                        size="sm"
                        className="p-1.5 sm:p-2 min-w-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-dark shrink-0 font-black", "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]")}>
                          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-base sm:text-lg truncate">{d.name}</h4>
                          <div className="text-[10px] sm:text-xs text-white/40 font-black uppercase tracking-widest truncate">{d.lender}</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-none border-white/5">
                        <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Sisa Utang</div>
                        <div className="text-xl sm:text-2xl font-black">Rp {d.amount.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/40">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(d.due_date || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-400">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {d.interest_rate}%
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {isPaid ? (
                            <div className="flex-1 sm:flex-none flex items-center bg-green-500/10 px-4 py-2 rounded-xl text-green-500 text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Lunas
                            </div>
                          ) : (
                            <Button 
                              onClick={() => openPayModal(d)}
                              variant="neon"
                              size="sm"
                              className="flex-1 sm:flex-none py-3 sm:py-2 text-[10px] uppercase font-black tracking-widest min-w-[120px]"
                            >
                              Bayar Cicilan
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredDebts.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/20 font-black uppercase tracking-widest">Tidak ada data utang</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          <Card>
            <CardTitle className="mb-6">Strategi Pelunasan</CardTitle>
            <div className="flex p-1 bg-white/5 rounded-2xl mb-6">
              <Button 
                variant="ghost"
                onClick={() => setStrategy('Avalanche')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-black transition-all p-0 min-w-0",
                  strategy === 'Avalanche' ? "bg-neon text-dark shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                Avalanche
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setStrategy('Snowball')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-black transition-all p-0 min-w-0",
                  strategy === 'Snowball' ? "bg-neon text-dark shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                Snowball
              </Button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-neon/10 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-neon" />
                  </div>
                  <span className="text-sm font-bold">Target Prioritas</span>
                </div>
                {strategy === 'Avalanche' ? (
                  <div className="space-y-3">
                    <p className="text-xs text-white/40 leading-relaxed">
                      Metode ini memprioritaskan utang dengan <span className="text-white font-bold">bunga tertinggi</span> untuk menghemat uang paling banyak dalam jangka panjang.
                    </p>
                    {stats.avalancheTarget && (
                      <div className="p-3 bg-neon/5 rounded-xl border border-neon/10">
                        <div className="text-[10px] font-black text-neon uppercase tracking-widest mb-1">Fokus Sekarang</div>
                        <div className="text-sm font-bold">{stats.avalancheTarget.name}</div>
                        <div className="text-xs text-white/40">Bunga: {stats.avalancheTarget.interestRate}%</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-white/40 leading-relaxed">
                      Metode ini memprioritaskan utang dengan <span className="text-white font-bold">saldo terkecil</span> untuk memberikan kemenangan psikologis lebih cepat.
                    </p>
                    {stats.snowballTarget && (
                      <div className="p-3 bg-neon/5 rounded-xl border border-neon/10">
                        <div className="text-[10px] font-black text-neon uppercase tracking-widest mb-1">Fokus Sekarang</div>
                        <div className="text-sm font-bold">{stats.snowballTarget.name}</div>
                        <div className="text-xs text-white/40">Sisa: Rp {stats.snowballTarget.remainingAmount.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-bold">Tips AI</span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">
                  Jika kamu punya uang ekstra bulan ini, alokasikan ke <span className="text-white font-bold">{strategy === 'Avalanche' ? stats.avalancheTarget?.name : stats.snowballTarget?.name}</span> setelah membayar semua cicilan minimum lainnya.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-red-500 text-white relative overflow-hidden border-none">
            <AlertCircle className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <h3 className="text-xl font-black mb-4">Peringatan</h3>
            <p className="text-sm font-bold leading-relaxed opacity-90">
              Cicilan bulanan kamu (Rp {stats.totalMonthlyMin.toLocaleString()}) adalah kewajiban tetap. Pastikan dana tersedia di dompet sebelum jatuh tempo.
            </p>
          </Card>
        </div>
      </>
    )}
  </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDebt ? 'Edit Utang' : 'Tambah Utang Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nama Utang"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Misal: Cicilan Motor"
            />
            <Input 
              label="Pemberi Pinjaman"
              required
              value={formData.lender}
              onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
              placeholder="Misal: Bank BCA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Total Pinjaman (Rp)"
              required
              type="number" 
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="0"
            />
            <Input 
              label="Sisa Utang (Rp)"
              required
              type="number" 
              value={formData.remainingAmount}
              onChange={(e) => setFormData({ ...formData, remainingAmount: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Bunga (%)"
              required
              type="number" 
              step="0.1"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              placeholder="0"
            />
            <Input 
              label="Cicilan Min/Bln (Rp)"
              required
              type="number" 
              value={formData.minimumPayment}
              onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
              placeholder="0"
            />
          </div>

          <Input 
            label="Jatuh Tempo"
            required
            type="date" 
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          {!editingDebt && (
            <Select 
              label="Terima Dana ke Dompet (Opsional)"
              value={formData.receiveWalletId}
              onChange={(e) => setFormData({ ...formData, receiveWalletId: e.target.value })}
              options={[
                { label: 'Jangan catat sebagai pemasukan', value: '' },
                ...wallets.map(w => ({ label: w.name, value: w.id }))
              ]}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Debt['category'] })}
              options={CATEGORIES.map(c => ({ label: c, value: c }))}
            />
            <div className="space-y-2">
              <label className="text-xs font-black text-white/20 uppercase tracking-widest">Warna</label>
              <div className="flex gap-2 pt-1">
                {COLORS.map(c => (
                  <Button
                    key={c.value}
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all p-0 min-w-0",
                      c.value,
                      formData.color === c.value ? "border-white scale-110" : "border-transparent opacity-50"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            variant="neon"
            className="w-full py-4"
          >
            {editingDebt ? 'Simpan Perubahan' : 'Tambah Utang'}
          </Button>
        </form>
      </Modal>

      {/* Pay Modal */}
      <Modal
        isOpen={isPayModalOpen && !!selectedDebt}
        onClose={() => setIsPayModalOpen(false)}
        title="Bayar Cicilan"
      >
        {selectedDebt && (
          <form onSubmit={handlePay} className="space-y-6">
            <div className="text-center">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Membayar Untuk</div>
              <div className="text-lg font-bold">{selectedDebt.name}</div>
              <div className="text-xs text-white/40">Sisa: Rp {selectedDebt.amount.toLocaleString()}</div>
            </div>

            <Input 
              label="Jumlah Pembayaran (Rp)"
              required
              autoFocus
              type="number" 
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="0"
              className="text-center text-2xl font-black"
            />

            <Select 
              label="Bayar Menggunakan"
              required
              value={payWalletId}
              onChange={(e) => setPayWalletId(e.target.value)}
              options={[
                { label: 'Pilih Dompet', value: '' },
                ...wallets.map(w => ({ label: `${w.name} (Rp ${w.balance.toLocaleString()})`, value: w.id }))
              ]}
            />

            <Input 
              label="Catatan (Opsional)"
              type="text" 
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              placeholder="Misal: Cicilan bulan April"
            />

            <Button 
              type="submit"
              variant="neon"
              className="w-full py-4"
            >
              Konfirmasi Pembayaran
            </Button>
          </form>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen && !!selectedDebt}
        onClose={() => setIsHistoryModalOpen(false)}
        title={selectedDebt ? `${selectedDebt.name} - Riwayat` : 'Riwayat'}
      >
        {selectedDebt && (
          <div className="flex flex-col h-full max-h-[60vh]">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              <div className="text-center py-10 text-white/20 text-xs font-bold bg-white/5 rounded-2xl border border-white/5 border-dashed">
                Riwayat pembayaran akan segera hadir.
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-white/5">
              <Button 
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  openPayModal(selectedDebt);
                }}
                variant="neon"
                className="w-full py-4"
              >
                Bayar Sekarang
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Data Utang?"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm mb-8">
            Tindakan ini akan menghapus catatan utang ini secara permanen.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsDeleteModalOpen(false)}
              variant="ghost"
              className="flex-1 py-3"
            >
              Batal
            </Button>
            <Button 
              onClick={confirmDelete}
              variant="danger"
              className="flex-1 py-3"
            >
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
