import PageLayout from '@/src/components/PageLayout';
import { 
  TrendingUp, 
  ArrowUpRight, 
  PieChart as PieChartIcon, 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Pencil, 
  Trash2, 
  X,
  Calendar,
  Building2,
  Coins,
  LineChart,
  Home,
  Car,
  MoreHorizontal
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { Input, Select } from '@/src/components/ui/Input';
import { dbService, Asset as DBAsset } from '@/src/services/dbService';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/src/lib/AuthContext';

interface AssetHistory {
  date: string;
  value: number;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  value: number;
  purchasePrice: number;
  purchaseDate: string;
  color: string;
  liquidity: 'Liquid' | 'Semi-Liquid' | 'Non-Liquid';
  provider: string;
  history: AssetHistory[];
}

interface Liability {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
}

const CATEGORIES = [
  { name: 'Tabungan', icon: Coins, color: '#d4ff00' },
  { name: 'Emas', icon: LineChart, color: '#fbbf24' },
  { name: 'Saham', icon: TrendingUp, color: '#3b82f6' },
  { name: 'Properti', icon: Home, color: '#a855f7' },
  { name: 'Kendaraan', icon: Car, color: '#ef4444' },
  { name: 'Lainnya', icon: Briefcase, color: '#94a3b8' },
];

export default function AsetPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [liabilities, setLiabilities] = useState<DBDebt[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetData, walletData, debtData] = await Promise.all([
        dbService.getAssets(),
        dbService.getWallets(),
        dbService.getDebts()
      ]);
      setAssets(assetData);
      setWallets(walletData);
      setLiabilities(debtData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = fetchData;

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DBAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tabungan',
    value: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    liquidity: 'Liquid' as 'Liquid' | 'Semi-Liquid' | 'Non-Liquid',
    provider: '',
    purchaseWalletId: '',
  });

  const [liabilityFormData, setLiabilityFormData] = useState({
    name: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Hutang Jangka Pendek',
  });

  const stats = useMemo(() => {
    const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);
    const totalPurchase = assets.reduce((acc, curr) => acc + curr.purchasePrice, 0);
    const totalGrowth = totalPurchase > 0 ? ((totalValue - totalPurchase) / totalPurchase) * 100 : 0;
    const totalLiabilities = liabilities.reduce((acc, curr) => acc + curr.amount, 0);
    const netWorth = totalValue - totalLiabilities;
    
    const categoryData = CATEGORIES.map(cat => {
      const value = assets
        .filter(a => a.category === cat.name)
        .reduce((acc, curr) => acc + curr.value, 0);
      return { name: cat.name, value, color: cat.color };
    }).filter(c => c.value > 0);

    const liquidityData = [
      { name: 'Liquid', value: assets.filter(a => a.liquidity === 'Liquid').reduce((acc, curr) => acc + curr.value, 0), color: '#d4ff00' },
      { name: 'Semi-Liquid', value: assets.filter(a => a.liquidity === 'Semi-Liquid').reduce((acc, curr) => acc + curr.value, 0), color: '#fbbf24' },
      { name: 'Non-Liquid', value: assets.filter(a => a.liquidity === 'Non-Liquid').reduce((acc, curr) => acc + curr.value, 0), color: '#a855f7' },
    ].filter(l => l.value > 0);

    return { totalValue, totalPurchase, totalGrowth, totalLiabilities, netWorth, categoryData, liquidityData };
  }, [assets, liabilities]);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.value - a.value);
  }, [assets, searchQuery]);

  const openAddModal = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      category: 'Tabungan',
      value: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      liquidity: 'Liquid',
      provider: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (a: DBAsset) => {
    setEditingAsset(a);
    setFormData({
      name: a.name,
      category: a.type,
      value: a.value.toString(),
      purchasePrice: a.value.toString(), // Mocking purchase price as current value for now if not in DB
      purchaseDate: a.purchase_date || new Date().toISOString().split('T')[0],
      liquidity: 'Liquid', // Defaulting liquidity
      provider: a.note || '',
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setAssetToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const value = parseFloat(formData.value) || 0;
      const data = {
        name: formData.name,
        type: formData.category,
        value: value,
        purchase_date: formData.purchaseDate,
        note: formData.provider,
      };

      if (editingAsset) {
        await dbService.updateAsset(editingAsset.id, data);
      } else {
        await dbService.createAsset(data);
        
        // If a wallet is selected, create an expense transaction
        if (formData.purchaseWalletId) {
          await dbService.createTransaction({
            name: `Beli Aset: ${formData.name}`,
            category: 'Asset',
            amount: parseFloat(formData.purchasePrice) || value,
            date: formData.purchaseDate,
            wallet_id: formData.purchaseWalletId,
            type: 'expense',
            note: `Pembelian aset ${formData.name} (${formData.category})`
          });
        }
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    if (assetToDelete) {
      try {
        await dbService.deleteAsset(assetToDelete);
        fetchAssets();
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleLiabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = parseFloat(liabilityFormData.amount) || 0;
      await dbService.createDebt({
        name: liabilityFormData.name,
        lender: 'Manual Entry',
        amount: amount,
        due_date: liabilityFormData.dueDate,
        status: 'active'
      });
      fetchData();
      setIsLiabilityModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <PageLayout 
      title="Aset & Kekayaan" 
      description="Pantau kekayaan bersih dan pertumbuhan aset kamu."
      actions={
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setIsLiabilityModalOpen(true)}
            variant="primary"
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Hutang</span>
            <span className="sm:hidden">Hutang</span>
          </Button>
          <Button 
            onClick={openAddModal}
            variant="neon"
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Aset</span>
            <span className="sm:hidden">Aset</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-neon animate-spin" />
            <p className="text-white/40 font-black uppercase tracking-widest">Memuat Data Aset...</p>
          </div>
        ) : error ? (
          <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-500 font-bold">{error}</p>
            <Button onClick={fetchAssets} variant="ghost">Coba Lagi</Button>
          </div>
        ) : (
          <>
            <div className="lg:col-span-2 space-y-8">
              {/* Net Worth Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2 text-glow-neon">Kekayaan Bersih (Net Worth)</div>
                  <div className="text-3xl sm:text-5xl font-black tracking-tight text-neon mb-1 truncate max-w-full">Rp {stats.netWorth.toLocaleString()}</div>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-xl font-bold flex items-center gap-2 self-start",
                  stats.totalGrowth >= 0 ? "bg-neon/10 text-neon" : "bg-red-500/10 text-red-500"
                )}>
                  {stats.totalGrowth >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                  {stats.totalGrowth >= 0 ? '+' : ''}{stats.totalGrowth.toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:gap-8 gap-4 w-full pt-6 border-t border-white/5">
                <div>
                  <div className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-widest mb-1 sm:mb-2">Total Aset</div>
                  <div className="text-base sm:text-lg font-black">Rp {stats.totalValue.toLocaleString()}</div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-white/5" />
                <div>
                  <div className="text-[9px] sm:text-[10px] text-white/40 font-black uppercase tracking-widest mb-1 sm:mb-2">Total Hutang</div>
                  <div className="text-base sm:text-lg font-black text-red-500">Rp {stats.totalLiabilities.toLocaleString()}</div>
                </div>
              </div>
            </Card>
            <Card className="flex flex-col justify-center">
              <div className="text-white/40 text-xs font-black uppercase tracking-widest mb-4">Likuiditas</div>
              <div className="space-y-4">
                {stats.liquidityData.map((l, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-white/60">{l.name}</span>
                      <span>{((l.value / stats.totalValue) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(l.value / stats.totalValue) * 100}%`, backgroundColor: l.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

              {/* Asset List */}
              <Card>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
                  <h3 className="text-xl font-black">Daftar Aset</h3>
                  <div className="relative w-full sm:w-64">
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari aset..." 
                      className="pl-11"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredAssets.map((aset) => {
                    const CategoryIcon = CATEGORIES.find(c => c.name === aset.type)?.icon || Briefcase;
                    
                    return (
                      <div key={aset.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 hover:bg-white/5 rounded-2xl transition-all border border-white/5 sm:border-transparent hover:border-white/10 group relative gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                            <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/40" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold truncate">{aset.name}</div>
                            <div className="text-[10px] sm:text-xs text-white/40 flex items-center gap-2 truncate">
                              {aset.note} • {aset.type} 
                            </div>
                          </div>
                          <div className="sm:hidden text-right shrink-0">
                            <div className="font-black text-base">Rp {aset.value.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-none border-white/5">
                          <div className="hidden sm:block text-right">
                            <div className="font-black text-lg">Rp {aset.value.toLocaleString()}</div>
                          </div>
                          
                          <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-full sm:w-auto justify-end">
                            <Button 
                              variant="primary"
                              size="sm"
                              onClick={() => openEditModal(aset)}
                              className="flex-1 sm:flex-none py-2"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="danger"
                              size="sm"
                              onClick={() => openDeleteModal(aset.id)}
                              className="flex-1 sm:flex-none py-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredAssets.length === 0 && (
                    <div className="text-center py-20 text-white/20 font-black uppercase tracking-widest">
                      Tidak ada aset ditemukan
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar Allocation */}
            <div className="space-y-8">
              <Card className="flex flex-col items-center">
                <CardTitle className="self-start mb-8">Alokasi Aset</CardTitle>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-3 mt-4">
                  {stats.categoryData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-white/60">{item.name}</span>
                      </div>
                      <span className="font-bold">{((item.value / stats.totalValue) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* AI Insight */}
              <Card variant="neon">
                <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                <CardTitle className="mb-4">AI Insight</CardTitle>
                <p className="text-sm font-bold leading-relaxed">
                  {stats.totalGrowth > 10 
                    ? "Portofolio aset kamu tumbuh sangat baik! Pertimbangkan untuk melakukan rebalancing jika alokasi satu kategori sudah terlalu dominan."
                    : "Aset kamu stabil. Menambah aset produktif seperti saham atau emas secara rutin dapat mempercepat pertumbuhan kekayaan kamu."}
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
        title={editingAsset ? 'Edit Aset' : 'Tambah Aset Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Nama Aset"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Misal: Rumah BSD, Saham BBCA"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Lembaga/Provider"
              required
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="Misal: BCA, Ajaib, Antam"
            />
            <Select 
              label="Likuiditas"
              value={formData.liquidity}
              onChange={(e) => setFormData({ ...formData, liquidity: e.target.value as any })}
              options={[
                { value: 'Liquid', label: 'Liquid (Mudah Cair)' },
                { value: 'Semi-Liquid', label: 'Semi-Liquid' },
                { value: 'Non-Liquid', label: 'Non-Liquid (Sulit Cair)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES.map(c => ({ value: c.name, label: c.name }))}
            />
            <Input 
              label="Tanggal Perolehan"
              required
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Harga Beli (Rp)"
              required
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              placeholder="0"
            />
            <Input 
              label="Nilai Saat Ini (Rp)"
              required
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="0"
            />
          </div>

          {!editingAsset && (
            <Select 
              label="Bayar dari Dompet (Opsional)"
              value={formData.purchaseWalletId}
              onChange={(e) => setFormData({ ...formData, purchaseWalletId: e.target.value })}
              options={[
                { label: 'Jangan catat sebagai pengeluaran', value: '' },
                ...wallets.map(w => ({ label: `${w.name} (Rp ${w.balance.toLocaleString()})`, value: w.id }))
              ]}
            />
          )}

          <Button variant="neon" type="submit" className="w-full mt-4 py-4">
            {editingAsset ? 'Simpan Perubahan' : 'Tambah Aset'}
          </Button>
        </form>
      </Modal>

      {/* Add Liability Modal */}
      <Modal
        isOpen={isLiabilityModalOpen}
        onClose={() => setIsLiabilityModalOpen(false)}
        title="Tambah Hutang"
        danger
      >
        <form onSubmit={handleLiabilitySubmit} className="space-y-6">
          <Input 
            label="Nama Hutang"
            required
            value={liabilityFormData.name}
            onChange={(e) => setLiabilityFormData({ ...liabilityFormData, name: e.target.value })}
            placeholder="Misal: KPR, Pinjaman Bank"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Jumlah (Rp)"
              required
              type="number"
              value={liabilityFormData.amount}
              onChange={(e) => setLiabilityFormData({ ...liabilityFormData, amount: e.target.value })}
              placeholder="0"
            />
            <Input 
              label="Jatuh Tempo"
              required
              type="date"
              value={liabilityFormData.dueDate}
              onChange={(e) => setLiabilityFormData({ ...liabilityFormData, dueDate: e.target.value })}
            />
          </div>

          <Button variant="danger" type="submit" className="w-full mt-4 py-4">
            Tambah Hutang
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Aset?"
        danger
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm mb-8">
            Tindakan ini akan menghapus aset dari daftar kekayaan kamu.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" className="flex-1" onClick={confirmDelete}>
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
