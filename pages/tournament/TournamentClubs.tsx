import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  Building2, Search, Link as LinkIcon, CheckCircle2, 
  Trash2, UserCheck, Mail, Phone, Clock, AlertCircle, ChevronRight 
} from "lucide-react";

export default function TournamentClubs() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [torneoId, setTorneoId] = useState<string | null>(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("torneo_id")
      .eq("id", user.id)
      .single();

    if (profile?.torneo_id) {
      setTorneoId(profile.torneo_id);

      const { data, error } = await supabase
        .from("inscripciones_torneo")
        .select("*")
        .eq("torneo_id", profile.torneo_id)
        .order("created_at", { ascending: false });
        
      if (data) setClubs(data);
      if (error) console.error("Error cargando clubes:", error);
    }
    
    setLoading(false);
  };

  const handleCopyLink = () => {
    if (!torneoId) return alert("Error: No tienes un torneo asignado.");
    
    const link = `${window.location.origin}/inscripcion/${torneoId}`;
    navigator.clipboard.writeText(link);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleAceptar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!window.confirm("¿Validar este club y enviarle el acceso?")) return;
    setProcessingId(id);
    const { error } = await supabase
      .from("inscripciones_torneo")
      .update({ estado: 'aceptada' })
      .eq("id", id);
      
    if (!error) {
      setClubs(clubs.map(c => c.id === id ? { ...c, estado: 'aceptada' } : c));
    }
    setProcessingId(null);
  };

  const handleEliminar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!window.confirm("¿Estás seguro de ELIMINAR esta inscripción permanentemente?")) return;
    setProcessingId(id);
    const { error } = await supabase
      .from("inscripciones_torneo")
      .delete()
      .eq("id", id);
      
    if (!error) {
      setClubs(clubs.filter(c => c.id !== id));
    }
    setProcessingId(null);
  };

  const filteredClubs = clubs.filter(c => 
    c.nombre_club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email_responsable?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-[#162032] border border-white/5 p-8 md:p-10 rounded-[40px] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 mb-4">
            <Building2 size={12} /> Gestión de Clubes
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            Clubes Participantes
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl text-sm leading-relaxed">
            Administra las inscripciones, valida el acceso a la plataforma y controla qué categorías trae cada entidad a tu torneo.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar club..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-4 rounded-2xl bg-black/40 border border-white/10 text-white outline-none focus:border-amber-500/50 w-full transition-all text-sm"
            />
          </div>
          <button 
            onClick={handleCopyLink}
            disabled={!torneoId}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all w-full sm:w-auto shadow-lg disabled:opacity-50 ${
              copied 
                ? "bg-green-500 text-brand-deep shadow-[0_0_30px_rgba(34,197,94,0.3)]" 
                : "bg-amber-500 text-brand-deep hover:bg-white shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            }`}
          >
            {copied ? <CheckCircle2 size={18} /> : <LinkIcon size={18} />}
            {copied ? "¡Link Copiado!" : "Link de Inscripción"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center border border-white/5 rounded-[40px] bg-[#162032]/50">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-500 font-black uppercase tracking-widest text-xs animate-pulse">Cargando clubes...</p>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px] bg-[#162032]/30">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 text-amber-500">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">Sin inscripciones aún</h3>
          <p className="text-slate-500 text-center max-w-md">Copia el link de inscripción arriba y envíaselo a los clubes para que empiecen a registrarse.</p>
        </div>
      ) : (
        <div className="bg-[#162032]/60 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Info del Club</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Contacto</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Categorías</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Estado</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClubs.map((club) => {
                  let printCats = [];
                  if (Array.isArray(club.categorias)) printCats = club.categorias;
                  else if (typeof club.categorias === 'string') {
                    try { printCats = JSON.parse(club.categorias); } catch(e) {}
                  }

                  return (
                    <tr 
                      key={club.id} 
                      onClick={() => navigate(`/tournament-dashboard/clubs/${club.id}`)}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-slate-400 group-hover:border-amber-500/50 group-hover:text-amber-500 transition-colors">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors">{club.nombre_club}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                              Ingreso: {new Date(club.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1.5">
                          <p className="text-xs text-slate-300 flex items-center gap-2">
                            <Mail size={12} className="text-amber-500" /> {club.email_responsable}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            <Phone size={12} className="text-slate-500" /> {club.telefono || "Sin teléfono"}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2 max-w-[200px]">
                          {printCats.length > 0 ? (
                            printCats.map((cat: string) => (
                              <span key={cat} className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 text-[9px] font-black border border-amber-500/20">
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 italic">No especificadas</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {club.estado === 'pendiente' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-widest">
                            <Clock size={10} className="animate-pulse" /> Pendiente
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={10} /> Validado
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          <div className="flex items-center gap-2 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity mr-4">
                            {club.estado === 'pendiente' && (
                              <button 
                                onClick={(e) => handleAceptar(e, club.id)}
                                disabled={processingId === club.id}
                                title="Validar Club"
                                className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-brand-deep transition-all disabled:opacity-50"
                              >
                                <UserCheck size={18} />
                              </button>
                            )}
                            <button 
                              onClick={(e) => handleEliminar(e, club.id)}
                              disabled={processingId === club.id}
                              title="Eliminar Inscripción"
                              className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          <ChevronRight className="text-slate-600 group-hover:text-amber-500 transition-colors" size={20} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}