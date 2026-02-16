import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { MapPin, Plus, Trash2, Home, Users } from "lucide-react";

export default function TournamentAccommodations() {
  const [alojamientos, setAlojamientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [torneoId, setTorneoId] = useState<string | null>(null);

  // Estado del formulario
  const [isAdding, setIsAdding] = useState(false);
  const [newHotel, setNewHotel] = useState({ name: "", plazas_totales: "", precio_noche: "" });

  useEffect(() => {
    fetchAlojamientos();
  }, []);

  const fetchAlojamientos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("torneo_id").eq("id", user.id).single();

    if (profile?.torneo_id) {
      setTorneoId(profile.torneo_id);
      
      // 🔥 AHORA LEEMOS DE TU TABLA MAESTRA 'hoteles'
      const { data, error } = await supabase
        .from("hoteles")
        .select("*")
        .eq("torneo_id", profile.torneo_id);
        
      if (data) setAlojamientos(data);
      if (error) console.error("Error cargando hoteles:", error);
    }
    setLoading(false);
  };

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!torneoId) return;

    const plazas = parseInt(newHotel.plazas_totales);
    const precio = parseFloat(newHotel.precio_noche);

    // 🔥 INSERTAMOS EN 'hoteles'
    const { data, error } = await supabase.from("hoteles").insert([{
      torneo_id: torneoId,
      name: newHotel.name, // Tu columna se llama 'name' en BDD
      plazas_totales: plazas,
      plazas_disponibles: plazas, // Por defecto, todas disponibles al crear
      precio_noche: precio
    }]).select();

    if (!error && data) {
      setAlojamientos([...alojamientos, data[0]]);
      setIsAdding(false);
      setNewHotel({ name: "", plazas_totales: "", precio_noche: "" });
    } else {
      alert("Error al guardar el alojamiento. Revisa la consola.");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("¿Seguro que quieres eliminar este alojamiento?")) return;
    const { error } = await supabase.from("hoteles").delete().eq("id", id);
    if (!error) setAlojamientos(alojamientos.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-[#162032] border border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
            <MapPin size={12} /> Gestión Hotelera
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            Alojamientos Oficiales
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl text-sm leading-relaxed">
            Controla las camas disponibles, define precios y gestiona el stock hotelero para los clubes participantes.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="relative z-10 flex items-center gap-2 bg-blue-500 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-400 transition-colors shadow-lg"
        >
          {isAdding ? "Cancelar" : <><Plus size={16} /> Añadir Hotel</>}
        </button>
      </div>

      {/* FORMULARIO DE AÑADIR */}
      {isAdding && (
        <form onSubmit={handleAddHotel} className="bg-[#0D1B2A] border border-blue-500/30 p-6 md:p-8 rounded-[32px] grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 shadow-xl">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Nombre del Hotel / Residencia</label>
            <input required type="text" placeholder="Ej: Hotel NH Pirineos" value={newHotel.name} onChange={e => setNewHotel({...newHotel, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Plazas Totales</label>
            <input required type="number" min="1" placeholder="Ej: 150" value={newHotel.plazas_totales} onChange={e => setNewHotel({...newHotel, plazas_totales: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Precio Noche (€)</label>
            <input required type="number" min="0" step="0.01" placeholder="Ej: 45.50" value={newHotel.precio_noche} onChange={e => setNewHotel({...newHotel, precio_noche: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-blue-500/50" />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button type="submit" className="bg-white text-brand-deep px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">Guardar Alojamiento</button>
          </div>
        </form>
      )}

      {/* LISTADO */}
      {loading ? (
         <div className="h-[300px] flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : alojamientos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] bg-[#162032]/20">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 text-blue-400">
            <Home size={32} />
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">No hay alojamientos</h3>
          <p className="text-slate-500 max-w-md mx-auto">Añade tu primer hotel o residencia para poder asignarlo a los clubes inscritos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {alojamientos.map(hotel => {
            const ocupacion = hotel.plazas_totales > 0 ? ((hotel.plazas_totales - hotel.plazas_disponibles) / hotel.plazas_totales) * 100 : 0;
            return (
              <div key={hotel.id} className="bg-[#162032]/80 border border-white/5 p-6 rounded-[32px] relative group hover:border-blue-500/30 transition-all shadow-xl">
                <button onClick={() => handleDelete(hotel.id)} className="absolute top-6 right-6 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-5"><Home size={24} /></div>
                <h3 className="text-xl font-black text-white uppercase truncate pr-8 mb-6">{hotel.name}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Precio Noche</p>
                    <p className="text-xl font-black text-white italic">{hotel.precio_noche}€</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Camas Disp.</p>
                    <p className="text-xl font-black text-blue-400 italic flex items-center gap-2"><Users size={16}/> {hotel.plazas_disponibles}</p>
                  </div>
                </div>

                <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div className={`h-full rounded-full transition-all duration-1000 ${ocupacion > 85 ? 'bg-red-500' : ocupacion > 60 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${ocupacion}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}