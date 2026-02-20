import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { MapPin, Plus, Trash2, Users, Search, Edit3, Save, X, Phone, User, Image as ImageIcon } from "lucide-react";

export default function TournamentAccommodations() {
  const [alojamientos, setAlojamientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [torneoId, setTorneoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado para el formulario (sirve para añadir o editar)
  const [formData, setFormData] = useState({ 
    name: "", plazas_totales: "", plazas_disponibles: "", precio_noche: "", contacto_nombre: "", contacto_telefono: "", image_path: "" 
  });

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
      
      const { data, error } = await supabase
        .from("hoteles")
        .select("*")
        .eq("torneo_id", profile.torneo_id);
        
      if (data) setAlojamientos(data);
    }
    setLoading(false);
  };

  const openAddForm = () => {
    setFormData({ name: "", plazas_totales: "", plazas_disponibles: "", precio_noche: "", contacto_nombre: "", contacto_telefono: "", image_path: "" });
    setEditingId(null);
    setIsAdding(true);
  };

  const openEditForm = (hotel: any) => {
    setFormData({
      name: hotel.name || "",
      plazas_totales: hotel.plazas_totales || "",
      plazas_disponibles: hotel.plazas_disponibles !== null ? hotel.plazas_disponibles : hotel.plazas_totales,
      precio_noche: hotel.precio_noche || "",
      contacto_nombre: hotel.contacto_nombre || "",
      contacto_telefono: hotel.contacto_telefono || "",
      image_path: hotel.image_path || ""
    });
    setEditingId(hotel.id);
    setIsAdding(true);
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!torneoId) return;

    const payload = {
      torneo_id: torneoId,
      name: formData.name,
      plazas_totales: parseInt(formData.plazas_totales) || 0,
      plazas_disponibles: formData.plazas_disponibles !== "" ? parseInt(formData.plazas_disponibles) : (parseInt(formData.plazas_totales) || 0),
      precio_noche: parseFloat(formData.precio_noche) || 0,
      contacto_nombre: formData.contacto_nombre,
      contacto_telefono: formData.contacto_telefono,
      image_path: formData.image_path
    };

    if (editingId) {
      // EDITAR
      const { data, error } = await supabase.from("hoteles").update(payload).eq("id", editingId).select();
      if (!error && data) {
        setAlojamientos(alojamientos.map(a => a.id === editingId ? data[0] : a));
        setIsAdding(false);
      } else alert("Error al actualizar.");
    } else {
      // AÑADIR
      const { data, error } = await supabase.from("hoteles").insert([payload]).select();
      if (!error && data) {
        setAlojamientos([...alojamientos, data[0]]);
        setIsAdding(false);
      } else alert("Error al guardar.");
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("¿Seguro que quieres eliminar este alojamiento?")) return;
    const { error } = await supabase.from("hoteles").delete().eq("id", id);
    if (!error) setAlojamientos(alojamientos.filter(a => a.id !== id));
  };

  const filteredHotels = alojamientos.filter(h => 
    h.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔥 FIX APLICADO: Usamos el cliente de Supabase directo en vez de process.env
  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Si la foto solo es el nombre del archivo (ej: "hotel.jpg"), le pedimos la URL a Supabase.
    // NOTA: 'public' es el nombre genérico del bucket. Si tu bucket se llama 'hoteles', cámbialo aquí.
    const { data } = supabase.storage.from('hoteles').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      
      {/* HEADER PREMIUM + BUSCADOR */}
      <div className="bg-[#162032] border border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 mb-4">
            <MapPin size={12} /> Gestión Hotelera
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            Alojamientos Oficiales
          </h1>
          <p className="text-slate-400 mt-3 max-w-xl text-sm leading-relaxed">
            Controla las camas disponibles, define precios y añade los datos de los mánagers de los hoteles.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar hotel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-4 rounded-2xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500/50 w-full transition-all text-sm shadow-inner"
            />
          </div>
          <button 
            onClick={isAdding ? () => setIsAdding(false) : openAddForm}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all w-full sm:w-auto shadow-lg ${
              isAdding ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-blue-500 text-white hover:bg-blue-400'
            }`}
          >
            {isAdding ? <X size={16} /> : <Plus size={16} />}
            {isAdding ? "Cancelar" : "Añadir Hotel"}
          </button>
        </div>
      </div>

      {/* FORMULARIO ÚNICO (AÑADIR / EDITAR) */}
      {isAdding && (
        <form onSubmit={handleSaveHotel} className="bg-gradient-to-br from-[#162032] to-[#0D1B2A] border border-blue-500/30 p-8 rounded-[40px] shadow-[0_0_40px_rgba(59,130,246,0.1)] animate-in slide-in-from-top-4">
          <h2 className="text-xl font-black text-white italic uppercase mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            {editingId ? <Edit3 className="text-blue-400" /> : <Plus className="text-blue-400" />}
            {editingId ? "Editar Alojamiento" : "Nuevo Alojamiento"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-2">
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Nombre del Hotel / Residencia</label>
              <input required type="text" placeholder="Ej: Hotel NH Pirineos" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 text-white outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Plazas Totales</label>
              <input required type="number" min="1" value={formData.plazas_totales} onChange={e => setFormData({...formData, plazas_totales: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 text-white outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Camas Disponibles</label>
              <input required type="number" min="0" value={formData.plazas_disponibles} onChange={e => setFormData({...formData, plazas_disponibles: e.target.value})} className="w-full bg-blue-500/10 border border-blue-500/30 rounded-2xl py-3.5 px-5 text-blue-400 font-bold outline-none focus:border-blue-500/50" />
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Precio Noche (€)</label>
              <input required type="number" min="0" step="0.01" value={formData.precio_noche} onChange={e => setFormData({...formData, precio_noche: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 text-white outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Resp. Alojamiento</label>
              <input type="text" placeholder="Nombre director/a" value={formData.contacto_nombre} onChange={e => setFormData({...formData, contacto_nombre: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 text-white outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Teléfono Hotel</label>
              <input type="text" placeholder="+34..." value={formData.contacto_telefono} onChange={e => setFormData({...formData, contacto_telefono: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 text-white outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2 block ml-2">Foto / Portada (URL o Path)</label>
              <input type="text" placeholder="Ej: hotel-fachada.jpg" value={formData.image_path} onChange={e => setFormData({...formData, image_path: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 text-white outline-none focus:border-blue-500/50" />
            </div>
          </div>
          
          <div className="flex justify-end mt-8 border-t border-white/5 pt-6">
            <button type="submit" className="bg-blue-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-colors flex items-center gap-2 shadow-lg">
              <Save size={16} /> Guardar Alojamiento
            </button>
          </div>
        </form>
      )}

      {/* LISTADO TIPO "TRIP PLAN" CARDS */}
      {loading ? (
         <div className="h-[300px] flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : filteredHotels.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] bg-[#162032]/20">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 text-blue-400">
            <MapPin size={32} />
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">No se encontraron hoteles</h3>
          <p className="text-slate-500 max-w-md mx-auto">Añade propiedades a tu base de datos o cambia los términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHotels.map(hotel => {
            const ocupacion = hotel.plazas_totales > 0 ? ((hotel.plazas_totales - hotel.plazas_disponibles) / hotel.plazas_totales) * 100 : 0;
            const bgImage = getImageUrl(hotel.image_path);

            return (
              <div key={hotel.id} className="bg-[#162032] rounded-[32px] overflow-hidden relative group hover:ring-2 ring-blue-500/50 transition-all shadow-xl flex flex-col h-full">
                
                {/* CABECERA IMAGEN */}
                <div className="h-48 relative overflow-hidden bg-black flex shrink-0">
                  {bgImage ? (
                    <img src={bgImage} alt={hotel.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-[#0D1B2A] flex items-center justify-center">
                      <ImageIcon size={40} className="text-blue-500/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#162032] via-transparent to-transparent"></div>
                  
                  {/* Botones de acción en la imagen */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditForm(hotel)} className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-blue-500 transition-colors"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(hotel.id)} className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>

                  <div className="absolute bottom-4 left-6 pr-6">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{hotel.name}</h3>
                  </div>
                </div>

                {/* CUERPO DE DATOS */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 shrink-0"><User size={14}/></div>
                      <span className="truncate">{hotel.contacto_nombre || "Sin responsable asignado"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 shrink-0"><Phone size={14}/></div>
                      <span>{hotel.contacto_telefono || "Sin teléfono"}</span>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Precio</p>
                        <p className="text-xl font-black text-white italic">{hotel.precio_noche}€</p>
                      </div>
                      <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                        <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1.5">Camas Libres</p>
                        <p className="text-xl font-black text-blue-400 italic flex items-center gap-2"><Users size={16}/> {hotel.plazas_disponibles}</p>
                      </div>
                    </div>

                    <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${ocupacion > 85 ? 'bg-red-500' : ocupacion > 60 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${ocupacion}%` }}></div>
                    </div>
                    <p className="text-right text-[9px] text-slate-500 mt-2 font-bold">{Math.round(ocupacion)}% Ocupado</p>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}