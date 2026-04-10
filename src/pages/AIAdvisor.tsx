import PageLayout from '@/src/components/PageLayout';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  StickyNote, 
  ChevronRight,
  MessageSquare,
  Save
} from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/src/lib/utils';
import { dbService, Note as DBNote } from '@/src/services/dbService';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '@/src/lib/AuthContext';
import { Loader2 } from 'lucide-react';

interface Message {
  role: 'ai' | 'user';
  text: string;
  time: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
}

const NOTE_COLORS = [
  'bg-neon text-dark',
  'bg-blue-500 text-white',
  'bg-purple-500 text-white',
  'bg-orange-500 text-white',
  'bg-white/10 text-white'
];

export default function AIAdvisorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Halo! Saya AI Financial Advisor kamu. Ada yang bisa saya bantu terkait kondisi keuanganmu hari ini?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [notes, setNotes] = useState<DBNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DBNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const [noteFormData, setNoteFormData] = useState({
    title: '',
    content: '',
    color: 'bg-neon text-dark'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);
      const data = await dbService.getNotes();
      setNotes(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      role: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Fetch context data
      const [wallets, transactions, assets, debts, investments] = await Promise.all([
        dbService.getWallets(),
        dbService.getTransactions(),
        dbService.getAssets(),
        dbService.getDebts(),
        dbService.getInvestments()
      ]);

      const context = `
        User Financial Data:
        Wallets: ${JSON.stringify(wallets)}
        Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}
        Assets: ${JSON.stringify(assets)}
        Debts: ${JSON.stringify(debts)}
        Investments: ${JSON.stringify(investments)}
      `;

      const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `Context: ${context}\n\nUser Question: ${inputText}` }] }
        ],
        config: {
          systemInstruction: "You are a helpful and professional Financial Advisor AI for an Indonesian financial app called 'Kalola'. Provide concise, actionable advice based on the user's data. Use Indonesian language."
        }
      });

      const aiMsg: Message = {
        role: 'ai',
        text: response.text || "Maaf, saya tidak bisa memproses permintaan Anda saat ini.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        role: 'ai',
        text: "Terjadi kesalahan saat menghubungi AI Advisor. Silakan coba lagi nanti.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const openAddNoteModal = () => {
    setEditingNote(null);
    setNoteFormData({ title: '', content: '', color: 'bg-neon text-dark' });
    setIsNoteModalOpen(true);
  };

  const openEditNoteModal = (note: DBNote) => {
    setEditingNote(note);
    setNoteFormData({ title: note.title, content: note.content, color: note.color });
    setIsNoteModalOpen(true);
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: noteFormData.title,
        content: noteFormData.content,
        color: noteFormData.color,
      };

      if (editingNote) {
        await dbService.updateNote(editingNote.id, data);
      } else {
        await dbService.createNote(data);
      }
      fetchNotes();
      setIsNoteModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const confirmDeleteNote = async () => {
    if (noteToDelete) {
      try {
        await dbService.deleteNote(noteToDelete);
        fetchNotes();
        setIsDeleteModalOpen(false);
        setNoteToDelete(null);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <PageLayout 
      title="AI Advisor" 
      description="Dapatkan saran finansial personal berbasis data keuangan kamu."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
        {/* Chat Section */}
        <div className="lg:col-span-2 bg-dark-lighter rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neon rounded-xl flex items-center justify-center text-dark">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-sm">Kalola AI</div>
                <div className="text-[10px] text-neon font-bold uppercase tracking-widest">Online & Ready</div>
              </div>
            </div>
            <button className="p-2 text-white/20 hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-white/5 text-neon' : 'bg-neon text-dark'}`}>
                  {m.role === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className="flex flex-col space-y-1 max-w-[75%]">
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed ${m.role === 'ai' ? 'bg-white/5 text-white/90 rounded-tl-none whitespace-pre-wrap' : 'bg-neon text-dark font-medium rounded-tr-none'}`}>
                    {m.text}
                  </div>
                  <div className={`text-[10px] font-bold text-white/20 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-neon">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-neon rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-neon rounded-full animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 bg-neon rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanya sesuatu (misal: 'Review budget saya')" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-neon/50 transition-colors"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-neon text-dark rounded-xl flex items-center justify-center hover:bg-neon-dark transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Catatan Finansial</h3>
            <button 
              onClick={openAddNoteModal}
              className="p-2 bg-white/5 hover:bg-neon hover:text-dark rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {loadingNotes ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-neon animate-spin" />
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className={cn("p-6 rounded-[2rem] relative group transition-all hover:scale-[1.02]", note.color)}>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditNoteModal(note)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        setNoteToDelete(note.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    <StickyNote className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {new Date(note.created_at || '').toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h4 className="font-black mb-2">{note.title}</h4>
                  <p className="text-sm opacity-80 leading-relaxed">{note.content}</p>
                </div>
              ))
            )}
            {!loadingNotes && notes.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                <p className="text-white/20 text-xs font-black uppercase tracking-widest">Belum ada catatan</p>
              </div>
            )}
          </div>

          <div className="bg-neon text-dark p-6 rounded-[2rem] relative overflow-hidden">
            <Sparkles className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10" />
            <h4 className="font-black text-sm mb-2">Tips Hari Ini</h4>
            <p className="text-xs font-bold opacity-80">"Jangan menabung apa yang tersisa setelah belanja, tapi belanjakan apa yang tersisa setelah menabung."</p>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-lighter w-full max-w-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-black">{editingNote ? 'Edit Catatan' : 'Tambah Catatan'}</h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleNoteSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-white/20 uppercase tracking-widest">Judul Catatan</label>
                <input 
                  required
                  type="text" 
                  value={noteFormData.title}
                  onChange={(e) => setNoteFormData({ ...noteFormData, title: e.target.value })}
                  placeholder="Misal: Rencana Liburan"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/20 uppercase tracking-widest">Isi Catatan</label>
                <textarea 
                  required
                  rows={4}
                  value={noteFormData.content}
                  onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })}
                  placeholder="Tulis detail catatan di sini..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/20 uppercase tracking-widest">Warna</label>
                <div className="flex gap-3">
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNoteFormData({ ...noteFormData, color })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        color.split(' ')[0],
                        noteFormData.color === color ? "border-white scale-110" : "border-transparent opacity-60"
                      )}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-neon text-dark py-4 rounded-2xl font-black hover:bg-neon-dark transition-all mt-4"
              >
                {editingNote ? 'Simpan Perubahan' : 'Buat Catatan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Note Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-lighter w-full max-w-sm rounded-[2.5rem] border border-white/10 p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-2">Hapus Catatan?</h3>
            <p className="text-white/60 text-sm mb-8">
              Catatan ini akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-2xl font-bold transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDeleteNote}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
