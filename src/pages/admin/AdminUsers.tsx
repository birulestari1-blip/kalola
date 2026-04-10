import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { adminService, AdminUser } from '@/src/services/adminService';
import { 
  Search, 
  MoreHorizontal, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Crown, 
  Clock,
  ExternalLink,
  Mail,
  Loader2,
  Filter
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Suspended'>('All');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || u.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, filterStatus]);

  const toggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    if (confirm(`Apakah Anda yakin ingin mengubah status ${user.name} menjadi ${newStatus}?`)) {
      await adminService.updateUserStatus(user.id, newStatus);
      fetchUsers();
    }
  };

  return (
    <AdminLayout 
      title="User Management" 
      description="Kelola hak akses, status, dan paket berlangganan pengguna."
    >
      <div className="space-y-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email..." 
              className="pl-11 h-12 bg-dark/40 border-white/10"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {(['All', 'Active', 'Suspended'] as const).map((s) => (
              <Button
                key={s}
                variant="ghost"
                size="sm"
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "p-0 px-4 h-10 min-w-0 font-black uppercase tracking-widest text-[10px] rounded-xl",
                  filterStatus === s ? "bg-indigo-500 text-white" : "text-white/40 hover:bg-white/5"
                )}
              >
                {s}
              </Button>
            ))}
            <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block" />
            <Button variant="ghost" size="sm" className="p-2 min-w-0 h-10">
              <Filter className="w-4 h-4 text-white/40" />
            </Button>
          </div>
        </div>

        {/* User Table */}
        <Card className="overflow-hidden border-white/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-white/40 font-black uppercase tracking-widest">Memuat Daftar Pengguna...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Penguna</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Paket</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Last Active</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/2 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-black uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{user.name}</div>
                            <div className="text-[10px] text-white/30 font-bold lowercase flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          user.tier === 'Pro' ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : 
                          user.tier === 'Starter' ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-white/40"
                        )}>
                          {user.tier === 'Pro' && <Crown className="w-3 h-3" />}
                          {user.tier}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          user.status === 'Active' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500 animate-pulse"
                        )} title={user.status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-white/40">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{user.lastActive}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleStatus(user)}
                            className={cn(
                              "w-8 h-8 p-0 min-w-0 transition-all",
                              user.status === 'Active' ? "hover:bg-red-500/10 hover:text-red-500" : "hover:bg-green-500/10 hover:text-green-500"
                            )}
                          >
                            {user.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 min-w-0 hover:bg-white/10">
                            <MoreHorizontal className="w-4 h-4 text-white/40" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-20 text-center">
                  <UserX className="w-12 h-12 text-white/5 mx-auto mb-4" />
                  <p className="text-white/20 font-black uppercase tracking-widest">Tidak ada pengguna ditemukan</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
