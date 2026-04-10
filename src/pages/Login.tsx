import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('birulestari1@gmail.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Redirect based on role
      if (email === 'nopianhadi2@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Silakan periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 font-sans">
      {/* Logo & Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-[#d4ff00] rounded-2xl flex items-center justify-center text-dark font-black text-3xl mx-auto mb-4 shadow-lg shadow-[#d4ff00]/20">
          K.
        </div>
        <h1 className="text-3xl font-black tracking-tight text-dark mb-1">Kalola.</h1>
        <p className="text-gray-500 text-sm font-medium">Aplikasi kelola keuangan pribadi.</p>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-black/5 p-8 md:p-10"
      >
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-dark transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-[#eef2ff] border-none rounded-2xl py-4 pl-14 pr-6 text-dark font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#d4ff00] transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-dark transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#eef2ff] border-none rounded-2xl py-4 pl-14 pr-14 text-dark font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#d4ff00] transition-all outline-none"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-[#d4ff00] peer-checked:border-[#d4ff00] transition-all"></div>
                <svg className="absolute w-3 h-3 text-dark opacity-0 peer-checked:opacity-100 left-1 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-500 group-hover:text-dark transition-colors">Ingat saya</span>
            </label>
            <button type="button" className="text-sm font-bold text-gray-400 hover:text-dark transition-colors">
              Lupa Password?
            </button>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4ff00] text-dark font-black py-4 rounded-2xl shadow-lg shadow-[#d4ff00]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm font-bold text-gray-400">
            Belum punya akun? <Link to="/signup" className="text-gray-600 hover:text-dark underline decoration-[#d4ff00] decoration-2 underline-offset-4 transition-colors">Daftar</Link>
          </p>
        </div>
      </motion.div>

      {/* Background Accents */}
      <div className="fixed top-0 right-0 -z-10 w-96 h-96 bg-[#d4ff00]/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
}
