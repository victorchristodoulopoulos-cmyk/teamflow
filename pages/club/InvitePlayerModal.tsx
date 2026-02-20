import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { X, Link as LinkIcon, MessageCircle, Mail, Copy, CheckCircle2 } from 'lucide-react';

interface InvitePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  torneoId?: string; // Prop opcional para auto-seleccionar el torneo
}

export default function InvitePlayerModal({ isOpen, onClose, clubId, torneoId }: InvitePlayerModalProps) {
  const [torneos, setTorneos] = useState<any[]>([]);
  // Si nos pasan un torneoId por prop, lo usamos por defecto. Si no, vacío.
  const [selectedTorneo, setSelectedTorneo] = useState(torneoId || "");
  const [copied, setCopied] = useState(false);

  // Cargar los torneos del club al abrir el modal (solo si no nos pasaron ya un torneoId)
  useEffect(() => {
    if (isOpen && clubId && !torneoId) {
      fetchTorneos();
    }
  }, [isOpen, clubId, torneoId]);

  // Sincronizar el estado si el prop torneoId cambia
  useEffect(() => {
    if (torneoId) {
      setSelectedTorneo(torneoId);
    }
  }, [torneoId]);

  const fetchTorneos = async () => {
    const { data } = await supabase
      .from('club_torneos')
      .select('torneos(id, name)')
      .eq('club_id', clubId);
      
    if (data) {
      const torneosList = data.map((item: any) => item.torneos).filter(Boolean);
      setTorneos(torneosList);
    }
  };

  if (!isOpen) return null;

  const baseUrl = window.location.origin;
  const inviteLink = selectedTorneo 
    ? `${baseUrl}/registro?club=${clubId}&torneo=${selectedTorneo}`
    : "";

  const shareMessage = `\n\n${inviteLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#162032] border border-white/10 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Cabecera */}
        <div className="p-8 border-b border-white/5 flex justify-between items-start bg-gradient-to-b from-white/[0.02] to-transparent">
          <div>
             <h3 className="text-2xl font-display font-black text-white italic uppercase tracking-tight flex items-center gap-2 mb-1">
               <LinkIcon className="text-brand-neon" size={24} />
               Invitación
             </h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generar enlace seguro de registro</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 -mt-2 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Paso 1: Seleccionar Torneo (SOLO si NO nos han pasado el torneoId por prop) */}
          {!torneoId && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                1. Selecciona el Torneo / Temporada
              </label>
              <div className="relative">
                 <select 
                   className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-brand-neon focus:ring-1 focus:ring-brand-neon transition-all cursor-pointer font-bold text-sm appearance-none"
                   value={selectedTorneo}
                   onChange={(e) => setSelectedTorneo(e.target.value)}
                 >
                   <option value="">-- Elige un torneo --</option>
                   {torneos.map((t) => (
                     <option key={t.id} value={t.id}>{t.name}</option>
                   ))}
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                 </div>
              </div>
            </div>
          )}

          {/* Paso 2: Compartir (Se muestra si ha elegido torneo, o si ya venía pre-seleccionado) */}
          {selectedTorneo && (
            <div className={`space-y-5 ${!torneoId ? 'pt-6 border-t border-white/5 animate-in slide-in-from-bottom-2' : ''}`}>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-neon flex items-center gap-2">
                {!torneoId ? "2." : ""} Enlace de inscripción generado
                <CheckCircle2 size={12} className="text-brand-neon" />
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Botón WhatsApp */}
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/30 hover:border-[#25D366] py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] transition-all group"
                >
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform" /> Enviar por WhatsApp
                </a>

                {/* Botón Email */}
                <a 
                  href={`mailto:?subject=Inscripción Oficial Club&body=${encodeURIComponent(shareMessage)}`}
                  className="w-full bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] transition-all group"
                >
                  <Mail size={18} className="group-hover:scale-110 transition-transform" /> Enviar por Email
                </a>

                {/* Botón Copiar al portapapeles */}
                <button 
                  onClick={handleCopy}
                  className="w-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] transition-all mt-2 group"
                >
                  {copied ? <CheckCircle2 size={18} className="text-brand-neon" /> : <Copy size={18} className="group-hover:scale-110 transition-transform" />}
                  {copied ? "¡Enlace Copiado!" : "Copiar Enlace"}
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}