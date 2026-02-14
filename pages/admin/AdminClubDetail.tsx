import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { 
  ArrowLeft, Shield, Link as LinkIcon, CheckCircle2,
  Users, Trophy, Calendar, Database, Loader2
} from "lucide-react";

export default function AdminClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    setLoading(true);
    // 1. Obtener club
    const { data: clubData } = await supabase.from('clubs').select('*').eq('id', id).single();
    
    // 2. Obtener estadísticas reales
    const [
      { count: playersCount },
      { count: teamsCount },
      { count: tourneysCount }
    ] = await Promise.all([
      supabase.from('torneo_jugadores').select('*', { count: 'exact', head: true }).eq('club_id', id),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('club_id', id),
      supabase.from('club_torneos').select('*', { count: 'exact', head: true }).eq('club_id', id)
    ]);

    setClub({ 
      ...clubData, 
      stats: { 
        players: playersCount || 0, 
        teams: teamsCount || 0, 
        tournaments: tourneysCount || 0 
      } 
    });
    setLoading(false);
  };

  const getLogoUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
    return data.publicUrl;
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/activar-club?id=${id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-10 text-brand-neon font-mono animate-pulse uppercase font-black tracking-widest text-center">Analizando Datos del Club...</div>;
  if (!club) return <div className="p-10 text-white text-center">Club no encontrado</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 border-b border-white/5 pb-8">
        <button 
          onClick={() => navigate('/admin/clubs')}
          className="p-4 rounded-2xl bg-[#162032] border border-white/10 text-slate-400 hover:text-brand-neon hover:border-brand-neon/50 transition-all shrink-0 self-start md:self-auto"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] bg-[#162032] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl shrink-0">
          {club.logo_path ? (
            <img src={getLogoUrl(club.logo_path)} alt="Escudo" className="w-full h-full object-contain p-4" />
          ) : (
            <Shield size={48} className="text-white/10" />
          )}
        </div>
        
        <div className="text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
             <Database size={16} className="text-slate-500" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {club.id}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            {club.name}
          </h1>
          
          {/* BOTÓN MÁGICO DE INVITACIÓN */}
          <button 
            onClick={copyInviteLink}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
              copied 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-emerald-500/10' 
                : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 shadow-blue-600/30'
            }`}
          >
            {copied ? <CheckCircle2 size={18} /> : <LinkIcon size={18} />}
            {copied ? '¡Enlace Copiado!' : 'Copiar Enlace de Invitación'}
          </button>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-2 font-bold text-center md:text-left">
            Envía este enlace al gestor del club para que cree su cuenta.
          </p>
        </div>
      </div>

      {/* DASHBOARD DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[32px] bg-[#162032]/40 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg group hover:bg-[#162032]/80 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-brand-neon/10 text-brand-neon flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Trophy size={28} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Torneos Activos</span>
          <span className="text-5xl font-display font-black text-white italic">{club.stats.tournaments}</span>
        </div>

        <div className="p-8 rounded-[32px] bg-[#162032]/40 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg group hover:bg-[#162032]/80 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Shield size={28} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Equipos Registrados</span>
          <span className="text-5xl font-display font-black text-white italic">{club.stats.teams}</span>
        </div>

        <div className="p-8 rounded-[32px] bg-[#162032]/40 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg group hover:bg-[#162032]/80 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={28} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Base de Jugadores</span>
          <span className="text-5xl font-display font-black text-white italic">{club.stats.players}</span>
        </div>
      </div>
    </div>
  );
}