import React, { useEffect, useState } from "react";
import { logisticsAdminService, HotelEntry, TransportEntry } from "../../supabase/logisticsAdminService";
import { 
  Bus, Hotel, Save, MapPin, Calendar, 
  Building2, Trophy, Loader2, CheckCircle2, Clock, Globe, Zap, Navigation, Check, Plane
} from "lucide-react";

export default function AdminLogisticsHub() {
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<{torneos: any[], clubs: any[]}>({ torneos: [], clubs: [] });
  const [activeTab, setActiveTab] = useState<'hotel' | 'transport'>('hotel');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [hotelForm, setHotelForm] = useState<Partial<HotelEntry>>({
    name: '', address: '', ciudad: '', torneo_id: '', club_id: '', check_in: '', check_out: ''
  });
  
  const [transportForm, setTransportForm] = useState<Partial<TransportEntry>>({
    company: '', departure_city: '', arrival_city: '', torneo_id: '', club_id: '', 
    departure_time: '', arrival_time: '', meeting_point: '', 
    type: 'bus' // 🚨 VALOR POR DEFECTO PARA EVITAR EL ERROR DE SUPABASE
  });

  useEffect(() => {
    loadMetadata();
  }, []);

  async function loadMetadata() {
    try {
      setLoading(true);
      const data = await logisticsAdminService.getAdminMetadata();
      setMetadata(data);
    } finally {
      setLoading(false);
    }
  }

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await logisticsAdminService.saveHotel({...hotelForm, team_id: null} as HotelEntry);
      triggerSuccess();
      setHotelForm({ name: '', address: '', ciudad: '', torneo_id: '', club_id: '', check_in: '', check_out: '' });
    } catch (err: any) {
      alert(`❌ ERROR: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 🚨 Aseguramos que enviamos el type ('bus' o 'plane')
      await logisticsAdminService.saveTransport({...transportForm, team_id: null} as TransportEntry);
      triggerSuccess();
      setTransportForm({ company: '', departure_city: '', arrival_city: '', torneo_id: '', club_id: '', departure_time: '', arrival_time: '', meeting_point: '', type: 'bus' });
    } catch (err: any) {
      alert(`❌ ERROR: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateTransportField = (val: string, field: string) => {
    setTransportForm(prev => ({ ...prev, [field]: val }));
  };

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-brand-neon mb-4" size={48} />
      <p className="text-brand-neon font-black uppercase tracking-[0.3em] text-xs animate-pulse">Sincronizando Sistemas Logísticos...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {showSuccess && (
        <div className="fixed top-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
          <div className="bg-brand-neon text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-[0_0_40px_rgba(var(--brand-neon-rgb),0.4)]">
            <CheckCircle2 size={20} /> Operación Ejecutada
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-brand-neon fill-brand-neon" />
            <span className="text-[10px] font-black text-brand-neon uppercase tracking-widest italic">Global Operations Control</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
            HUB <span className="text-slate-700">LOGÍSTICO</span>
          </h1>
        </div>

        <div className="flex p-1.5 bg-black/40 border border-white/5 rounded-[24px] backdrop-blur-xl">
          <button 
            type="button"
            onClick={() => setActiveTab('hotel')}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'hotel' ? 'bg-brand-neon text-black shadow-lg shadow-brand-neon/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Hotel size={14} /> Alojamiento
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('transport')}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'transport' ? 'bg-brand-neon text-black shadow-lg shadow-brand-neon/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Bus size={14} /> Transporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        <div className="xl:col-span-8 bg-[#162032]/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-md relative">
          <div className="p-8 md:p-12">
            <form onSubmit={activeTab === 'hotel' ? handleSaveHotel : handleSaveTransport} className="space-y-10">
              
              {/* SECCIÓN 1: ASIGNACIÓN */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-brand-neon pl-4">
                  <Globe size={20} className="text-brand-neon" />
                  <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter leading-none">1. Destino de la Expedición</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Evento / Torneo</label>
                    <select 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold outline-none focus:border-brand-neon/50 focus:bg-black/60 transition-all appearance-none cursor-pointer"
                      value={activeTab === 'hotel' ? hotelForm.torneo_id : transportForm.torneo_id}
                      onChange={(e) => activeTab === 'hotel' 
                        ? setHotelForm({...hotelForm, torneo_id: e.target.value})
                        : updateTransportField(e.target.value, 'torneo_id')
                      }
                      required
                    >
                      <option value="">-- Seleccionar Torneo --</option>
                      {metadata.torneos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Entidad / Club Beneficiario</label>
                    <select 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold outline-none focus:border-brand-neon/50 focus:bg-black/60 transition-all appearance-none cursor-pointer"
                      value={activeTab === 'hotel' ? hotelForm.club_id : transportForm.club_id}
                      onChange={(e) => activeTab === 'hotel'
                        ? setHotelForm({...hotelForm, club_id: e.target.value})
                        : updateTransportField(e.target.value, 'club_id')
                      }
                      required
                    >
                      <option value="">-- Seleccionar Club --</option>
                      {metadata.clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DETALLES */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                  {activeTab === 'hotel' ? <Hotel size={20} className="text-blue-500" /> : <Bus size={20} className="text-blue-500" />}
                  <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter leading-none">
                    2. Detalles del {activeTab === 'hotel' ? 'Alojamiento' : 'Transporte'}
                  </h3>
                </div>

                {activeTab === 'transport' && (
                  <div className="grid grid-cols-2 gap-4 max-w-sm mb-4">
                    <button 
                      type="button" 
                      onClick={() => updateTransportField('bus', 'type')}
                      className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${transportForm.type === 'bus' ? 'bg-brand-neon text-black border-brand-neon' : 'bg-white/5 text-slate-400 border-white/5'}`}
                    >
                      <Bus size={14} /> Autobús
                    </button>
                    <button 
                      type="button" 
                      onClick={() => updateTransportField('vuelo', 'type')}
                      className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${transportForm.type === 'vuelo' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-400 border-white/5'}`}
                    >
                      <Plane size={14} /> Avión
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTab === 'hotel' ? (
                    <>
                      <InputPro label="Nombre Comercial" placeholder="Ej. Puigcerdà Park Hotel" value={hotelForm.name} onChange={(v: string) => setHotelForm({...hotelForm, name: v})} icon={<Building2 size={16}/>} />
                      <InputPro label="Ciudad / Sede" placeholder="Ej. Puigcerdà" value={hotelForm.ciudad} onChange={(v: string) => setHotelForm({...hotelForm, ciudad: v})} icon={<MapPin size={16}/>} />
                      <div className="md:col-span-2">
                        <InputPro label="Localización Exacta" placeholder="Dirección completa..." value={hotelForm.address} onChange={(v: string) => setHotelForm({...hotelForm, address: v})} icon={<MapPin size={16}/>} />
                      </div>
                      <InputPro label="Check-In" type="datetime-local" value={hotelForm.check_in} onChange={(v: string) => setHotelForm({...hotelForm, check_in: v})} icon={<Calendar size={16}/>} />
                      <InputPro label="Check-Out" type="datetime-local" value={hotelForm.check_out} onChange={(v: string) => setHotelForm({...hotelForm, check_out: v})} icon={<Calendar size={16}/>} />
                    </>
                  ) : (
                    <>
                      <InputPro label="Empresa" placeholder="Ej. Autocares Fuentes" value={transportForm.company} onChange={(v: string) => updateTransportField(v, 'company')} icon={<Bus size={16}/>} />
                      <InputPro label="Punto Encuentro" placeholder="Parking Estadio" value={transportForm.meeting_point} onChange={(v: string) => updateTransportField(v, 'meeting_point')} icon={<Navigation size={16}/>} />
                      <InputPro label="Origen" placeholder="Sabadell" value={transportForm.departure_city} onChange={(v: string) => updateTransportField(v, 'departure_city')} icon={<MapPin size={16}/>} />
                      <InputPro label="Destino" placeholder="La Molina" value={transportForm.arrival_city} onChange={(v: string) => updateTransportField(v, 'arrival_city')} icon={<MapPin size={16}/>} />
                      <InputPro label="Salida" type="datetime-local" value={transportForm.departure_time} onChange={(v: string) => updateTransportField(v, 'departure_time')} icon={<Clock size={16}/>} />
                      <InputPro label="Llegada" type="datetime-local" value={transportForm.arrival_time} onChange={(v: string) => updateTransportField(v, 'arrival_time')} icon={<Clock size={16}/>} />
                    </>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isSaving || showSuccess}
                  className={`w-full py-6 font-black uppercase text-xs tracking-[0.4em] rounded-[24px] transition-all flex items-center justify-center gap-4 shadow-2xl ${
                    showSuccess ? 'bg-brand-neon text-black scale-[1.02]' : 'bg-white text-black hover:bg-brand-neon hover:scale-[1.01] active:scale-95'
                  } disabled:opacity-70`}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : showSuccess ? <><Check size={20} strokeWidth={4} /> Desplegado</> : <><Save size={20} strokeWidth={3} /> Guardar Logística</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-brand-neon/10 border border-brand-neon/20 rounded-[40px] p-8 relative overflow-hidden group">
            <CheckCircle2 className="text-brand-neon mb-4" size={32} />
            <h3 className="text-white font-black uppercase italic tracking-tighter text-xl mb-2">Protocolo Global</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-bold uppercase tracking-wider">Esta acción notifica automáticamente a toda la expedición del club seleccionado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputPro({ label, value, onChange, type = "text", placeholder = "", icon, className = "" }: any) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 ml-2 text-slate-500 italic">
        {icon}
        <label className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</label>
      </div>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full bg-black/20 border border-white/5 rounded-[20px] px-6 py-4 text-white text-sm font-bold outline-none focus:border-brand-neon/40 focus:bg-black/40 transition-all placeholder:text-slate-700"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}