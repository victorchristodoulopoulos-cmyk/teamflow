import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getClubActiveTournaments, 
  getAvailableGlobalTournaments, 
  registerClubToTournament, 
  TournamentConfig 
} from "../../supabase/clubTournamentService";
import { getMyClubContext } from "../../supabase/clubService";
import { 
  Trophy, MapPin, Calendar, Plus, DollarSign, X, ChevronRight, Save, Search,
  Shield, Users, ArrowRight 
} from "lucide-react";

export default function ClubTournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<TournamentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para el Modal de Añadir
  const [globalTournaments, setGlobalTournaments] = useState<any[]>([]);
  const [selectedTorneoId, setSelectedTorneoId] = useState("");
  const [price, setPrice] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Cargar datos al inicio
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { club_id } = await getMyClubContext();
      const data = await getClubActiveTournaments(club_id);
      setTournaments(data);
    } catch (error) {
      console.error("Error cargando torneos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal y cargar lista de torneos disponibles del sistema
  const openAddModal = async () => {
    setIsModalOpen(true);
    try {
      const global = await getAvailableGlobalTournaments();
      // Filtramos los que ya tenemos añadidos para no duplicar en la lista visual
      const currentIds = tournaments.map(t => t.torneo_id);
      const available = global?.filter(g => !currentIds.includes(g.id)) || [];
      setGlobalTournaments(available);
    } catch (e) {
      console.error(e);
    }
  };

  // Guardar nuevo torneo
  const handleRegister = async () => {
    if (!selectedTorneoId) return;
    setSaving(true);
    try {
      const { club_id } = await getMyClubContext();
      const finalPrice = price ? parseFloat(price) : 0;
      
      await registerClubToTournament(club_id, selectedTorneoId, finalPrice);
      
      await loadData(); // Recargar lista
      setIsModalOpen(false); // Cerrar modal
      setSelectedTorneoId("");
      setPrice("");
    } catch (error: any) {
      alert(error.message || "Error al inscribir en el torneo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-brand-neon animate-pulse font-mono uppercase font-black">Cargando Torneos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      {/* 🔥 NUEVA CABECERA CON "SUBMENÚ" */}
      <div className="bg-[#162032] border border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-neon/10 text-brand-neon text-[10px] font-black uppercase tracking-widest border border-brand-neon/20 mb-4">
            <Trophy size={12} /> Competición
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-3">
            Hub de Torneos
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Inscribe a tu club en las mejores competiciones y gestiona toda tu estructura deportiva desde un solo lugar.
          </p>
        </div>

        {/* BOTONES DE ACCESO RÁPIDO (Actúa como submenú) */}
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full xl:w-auto mt-4 xl:mt-0">
          <button 
            onClick={() => navigate('/club-dashboard/equipos')}
            className="flex items-center justify-between gap-4 bg-black/40 border border-white/10 hover:border-blue-500/50 px-5 py-4 rounded-2xl transition-all group shadow-lg flex-1 sm:flex-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm leading-tight">Mis Equipos</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Estructura</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            onClick={() => navigate('/club-dashboard/jugadores')}
            className="flex items-center justify-between gap-4 bg-black/40 border border-white/10 hover:border-emerald-500/50 px-5 py-4 rounded-2xl transition-all group shadow-lg flex-1 sm:flex-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm leading-tight">Base de Datos</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Fichas de Jugadores</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      {/* --- BOTONERA AÑADIR TORNEO --- */}
      <div className="flex justify-end border-b border-white/5 pb-6">
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto bg-brand-neon text-brand-deep font-black uppercase tracking-wider rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} /> Añadir Torneo Oficial
        </button>
      </div>

      {/* --- GRID DE TORNEOS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tournaments.map((t) => (
          <div 
            key={t.id} 
            onClick={() => navigate(`/club-dashboard/torneos/${t.torneo_id}`)}
            className="group relative overflow-hidden bg-[#162032]/40 border border-white/5 rounded-[24px] p-6 hover:border-brand-neon/30 transition-all cursor-pointer hover:shadow-2xl hover:bg-[#162032]/60"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-neon/0 via-transparent to-transparent group-hover:from-brand-neon/5 transition-all duration-500" />

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0D1B2A] border border-white/10 flex items-center justify-center text-brand-neon shadow-lg group-hover:scale-110 transition-transform">
                <Trophy size={28} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                t.status === 'activo' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
              }`}>
                {t.status}
              </span>
            </div>

            <div className="relative z-10 space-y-2 mb-6">
              <h3 className="text-2xl font-display font-black text-white uppercase italic leading-none tracking-tight">
                {t.torneos?.name || "Torneo Desconocido"}
              </h3>
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
                    <MapPin size={12} className="text-brand-neon"/> {t.torneos?.ciudad}
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
                    <Calendar size={12} className="text-brand-neon"/> 
                    {t.torneos?.fecha ? new Date(t.torneos.fecha).toLocaleDateString() : "Fecha pendiente"}
                 </div>
              </div>
            </div>

            <div className="relative z-10 p-4 rounded-xl bg-[#0D1B2A]/50 border border-white/5 group-hover:border-brand-neon/20 transition-colors">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Coste para Jugador</p>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-white tracking-tighter">
                  {t.precio_total} <span className="text-sm text-slate-500 font-bold">{t.moneda}</span>
                </span>
                <span className="text-brand-neon text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Gestionar <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </div>
        ))}

        {tournaments.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[32px] bg-[#162032]/20 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Trophy size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No hay torneos configurados</h3>
            <p className="text-slate-500 font-medium text-sm max-w-md mx-auto mb-6">
              Inscribe al club en torneos oficiales para empezar a crear equipos y asignar jugadores.
            </p>
            <button onClick={openAddModal} className="text-brand-neon text-sm font-black uppercase tracking-widest hover:underline hover:text-white transition-colors">
              + Inscribir en el primer torneo
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL AÑADIR TORNEO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-[#162032] border border-white/10 rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative animate-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
              <X size={20} />
            </button>

            <h3 className="text-2xl font-display font-black text-white uppercase italic mb-1">Inscribir Club</h3>
            <p className="text-sm text-slate-400 mb-8">Añade un torneo a tu calendario oficial.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seleccionar Torneo</label>
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-slate-500" size={16} />
                    <select 
                      className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-bold focus:border-brand-neon outline-none appearance-none cursor-pointer"
                      value={selectedTorneoId}
                      onChange={(e) => setSelectedTorneoId(e.target.value)}
                    >
                      <option value="">-- Buscar en la base de datos --</option>
                      {globalTournaments.map(gt => (
                        <option key={gt.id} value={gt.id}>
                          {gt.name} — {gt.ciudad}
                        </option>
                      ))}
                    </select>
                </div>
                <p className="text-[10px] text-slate-500 ml-1 mt-1">
                    ¿No encuentras el torneo? <a href="#" className="text-brand-neon hover:underline font-bold">Solicita crearlo aquí</a>.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 mb-2">
                  <DollarSign size={12} /> Precio Base (Cobro al Jugador)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 text-white font-display font-black text-lg focus:border-brand-neon outline-none placeholder:text-slate-700"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <span className="absolute right-4 top-3.5 text-slate-500 font-bold text-sm">EUR</span>
                </div>
                <p className="text-[10px] text-slate-500 ml-1">
                    Este precio se asignará automáticamente a los pagos de los jugadores inscritos.
                </p>
              </div>

              <button 
                onClick={handleRegister}
                disabled={saving || !selectedTorneoId}
                className="w-full py-4 rounded-xl bg-brand-neon text-brand-deep font-black uppercase tracking-wider hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
              >
                {saving ? "Procesando..." : <><Save size={18} /> Confirmar Inscripción</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}