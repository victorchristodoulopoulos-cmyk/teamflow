import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { useFamily } from "../../context/FamilyContext";
import { Send, Loader2, MessageSquare, Shield, ChevronLeft, Search, Receipt, CreditCard, CheckCircle2 } from "lucide-react";

const getClubLogoUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('club-logos').getPublicUrl(path);
  return data.publicUrl;
};

export default function FamilyChat() {
  const { players, globalData } = useFamily();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  
  // 🔥 NUEVO: Filtro inteligente por niño
  const [activeChatPlayerId, setActiveChatPlayerId] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar selección del primer niño
  useEffect(() => {
    if (players.length > 0 && !activeChatPlayerId) {
      setActiveChatPlayerId(players[0].id);
    }
  }, [players]);

  // 1. EXTRAER CLUBES ASOCIADOS SOLO AL NIÑO SELECCIONADO
  const associatedClubs = useMemo(() => {
    if (!activeChatPlayerId) return [];
    
    const clubsMap = new Map();
    const enrollments = globalData[activeChatPlayerId]?.enrollments || [];
    
    enrollments.forEach((enc: any) => {
      if (enc.clubs && !clubsMap.has(enc.clubs.id)) {
        clubsMap.set(enc.clubs.id, { 
          id: enc.clubs.id, 
          name: enc.clubs.name, 
          logo_path: getClubLogoUrl(enc.clubs.logo_path) 
        });
      }
    });
    
    return Array.from(clubsMap.values());
  }, [activeChatPlayerId, globalData]);

  const filteredClubs = associatedClubs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeClub = associatedClubs.find(c => c.id === selectedClubId);

  // Cuando cambias de niño, deseleccionar el club para evitar chats cruzados
  useEffect(() => {
    if (associatedClubs.length > 0 && window.innerWidth >= 768) {
      setSelectedClubId(associatedClubs[0].id);
    } else {
      setSelectedClubId(null);
    }
  }, [activeChatPlayerId, associatedClubs.length]);

  // 2. INICIALIZAR CHAT Y USUARIO
  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setFamilyId(user.id);
      setLoading(false);
    };
    initChat();
  }, []);

  // 3. CARGAR HISTORIAL DE MENSAJES
  useEffect(() => {
    if (!familyId || !selectedClubId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*, pagos(id, concepto, importe, estado)")
          .eq("family_id", familyId)
          .eq("club_id", selectedClubId)
          .order("created_at", { ascending: true });
          
        if (error) throw error;
        if (data) setMessages(data);
      } catch (error) { 
        console.error("Error", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchMessages();
  }, [familyId, selectedClubId]);

  // 4. SUSCRIPCIÓN EN TIEMPO REAL
  useEffect(() => {
    if (!familyId || !selectedClubId) return;
    
    const channel = supabase.channel('chat-familia')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `family_id=eq.${familyId}` },
        async (payload) => {
          if (payload.new.club_id === selectedClubId) {
            if (payload.new.payment_id) {
              const { data } = await supabase.from("messages").select("*, pagos(id, concepto, importe, estado)").eq("id", payload.new.id).single();
              if (data) setMessages((prev) => [...prev, data]);
            } else {
              setMessages((prev) => [...prev, payload.new]);
            }
          }
        }
      ).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [familyId, selectedClubId]);

  // Scroll Automático
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  // 5. ENVIAR MENSAJE
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !familyId || !selectedClubId) return;
    
    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage("");
    
    try {
      await supabase.from("messages").insert({ 
        club_id: selectedClubId, 
        family_id: familyId, 
        sender_type: "family", 
        content: msgText 
      });
    } catch (error) { 
      alert("Error enviando mensaje"); 
    } finally { 
      setSending(false); 
    }
  };

  const handlePayFromChat = async (pagoId: string) => {
    try {
      setPayingId(pagoId);
      const response = await supabase.functions.invoke('create-checkout-session', { body: { pago_id: pagoId } });
      if (response.error) throw response.error;
      if (response.data?.url) window.location.href = response.data.url;
    } catch (err: any) { 
      alert(`Error iniciando pago: ${err.message}`); 
    } finally { 
      setPayingId(null); 
    }
  };

  if (loading && !familyId) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-neon" size={40} /></div>;

  return (
    <div className="flex flex-col h-[calc(100dvh-200px)] md:h-[calc(100dvh-110px)] -mt-2 animate-in fade-in duration-500 max-w-[1800px] mx-auto w-full">
      
      {/* 🚀 SELECTOR SUPERIOR DE HIJOS */}
      {players.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-2 shrink-0">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveChatPlayerId(p.id)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                activeChatPlayerId === p.id 
                  ? 'bg-brand-neon text-brand-deep shadow-[0_0_15px_rgba(163,230,53,0.3)]' 
                  : 'bg-[#162032] text-slate-400 border border-white/5 hover:bg-[#162032]/80 hover:text-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${activeChatPlayerId === p.id ? 'bg-black/20 text-black' : 'bg-black/50 text-slate-400'}`}>
                {p.name.charAt(0)}
              </div>
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL DEL CHAT */}
      <div className="flex flex-1 bg-[#0D1B2A] border border-white/10 rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden min-h-0">
        
        {/* SIDEBAR DE CLUBES */}
        <div className={`${selectedClubId ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[380px] flex-col border-r border-white/5 bg-[#121A26] z-20 shrink-0`}>
          <div className="p-5 border-b border-white/5">
            <h2 className="text-lg font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-2">
              <MessageSquare className="text-brand-neon" size={18}/> Contactos
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="text" placeholder="Buscar club..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-brand-neon transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredClubs.length === 0 ? (
              <div className="text-center p-6 opacity-50 mt-10">
                <Shield size={32} className="mx-auto mb-3 text-slate-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sin clubes</p>
                <p className="text-[9px] text-slate-500 mt-2">Este jugador no está inscrito en ninguna entidad activa.</p>
              </div>
            ) : (
              filteredClubs.map(club => (
                <button key={club.id} onClick={() => setSelectedClubId(club.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedClubId === club.id ? 'bg-brand-neon/10 border border-brand-neon/30' : 'bg-transparent border border-transparent hover:bg-white/5'}`}>
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {club.logo_path ? <img src={club.logo_path} alt={club.name} className="w-full h-full object-contain p-1" /> : <Shield size={16} className="text-slate-500" />}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-bold text-white uppercase truncate">{club.name}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest truncate ${selectedClubId === club.id ? 'text-brand-neon' : 'text-slate-500'}`}>{selectedClubId === club.id ? 'Chat Activo' : 'Toca para abrir'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ÁREA DE CHAT (DERECHA) */}
        <div className={`${!selectedClubId ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative bg-[#0a111a]`}>
          {selectedClubId && activeClub ? (
            <>
              {/* Cabecera Chat Activo */}
              <div className="bg-[#121A26] px-4 py-3 md:px-6 md:py-4 border-b border-white/5 flex items-center gap-3 z-10 shrink-0">
                <button onClick={() => setSelectedClubId(null)} className="md:hidden p-2 -ml-2 rounded-full bg-white/5 flex items-center justify-center text-white">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {activeClub.logo_path ? <img src={activeClub.logo_path} alt={activeClub.name} className="w-full h-full object-contain p-0.5" /> : <Shield size={16} className="text-brand-neon" />}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm md:text-base font-black text-white uppercase italic tracking-tighter leading-none mb-0.5 truncate">{activeClub.name}</h2>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Conectado</p>
                </div>
              </div>

              {/* Burbujas de Mensajes (Diseño Profesional) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
                {loading ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-brand-neon" size={32}/></div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <MessageSquare size={40} className="mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest text-center px-4">Comienza a hablar con el club</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_type === "family";

                    // 💳 TARJETA DE PAGO RECIBIDA
                    if (msg.pagos) {
                      const isPaid = msg.pagos.estado === 'pagado';
                      return (
                         <div key={msg.id} className="flex w-full justify-start mt-2 mb-2">
                           <div className="w-[260px] md:w-[300px] bg-[#162032] border border-blue-500/20 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px]"></div>
                              <div className="relative z-10">
                                 <div className="flex items-center gap-2 mb-3">
                                   <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md"><Receipt size={14}/></div>
                                   <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Solicitud de Pago</p>
                                 </div>
                                 <p className="text-white font-bold text-sm leading-tight mb-1">{msg.pagos.concepto}</p>
                                 <p className="text-2xl font-black text-white tracking-tighter mb-4">{msg.pagos.importe}€</p>
                                 
                                 {isPaid ? (
                                   <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-emerald-500/20">
                                      <CheckCircle2 size={14}/> Pagado Correctamente
                                   </div>
                                 ) : (
                                   <button 
                                     onClick={() => handlePayFromChat(msg.pagos.id)}
                                     disabled={payingId === msg.pagos.id}
                                     className="w-full py-2.5 rounded-xl bg-brand-neon text-[#0D1B2A] font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.2)] disabled:opacity-50"
                                   >
                                      {payingId === msg.pagos.id ? <Loader2 size={14} className="animate-spin"/> : <CreditCard size={14}/>} 
                                      Abonar Cuota
                                   </button>
                                 )}
                              </div>
                              <p className="text-[8px] font-bold mt-3 text-right text-slate-500">{new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                         </div>
                      )
                    }

                    // 💬 MENSAJE DE TEXTO NORMAL (ESTILO COMPACTO Y PROFESIONAL)
                    return (
                      <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl relative group ${
                          isMe 
                            ? "bg-[#1f2b38] text-white rounded-br-sm border border-white/5" // Mensaje Familia (Gris profesional oscuro)
                            : "bg-[#162032] text-slate-200 border border-white/10 rounded-tl-sm" // Mensaje Club
                        }`}>
                          <p className="text-sm leading-snug">{msg.content}</p>
                          <span className={`text-[9px] font-bold inline-block ml-3 -mb-1 float-right mt-1 ${isMe ? "text-slate-400" : "text-slate-500"}`}>
                            {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de envío */}
              <div className="p-3 bg-[#121A26] border-t border-white/5 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-black/40 px-2 py-1.5 rounded-full border border-white/10 focus-within:border-brand-neon/50 transition-colors">
                  <input type="text" className="flex-1 bg-transparent px-3 py-2 text-white text-sm outline-none placeholder:text-slate-500" placeholder="Mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <button type="submit" disabled={!newMessage.trim() || sending} className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-neon text-[#0D1B2A] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 shrink-0">
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 p-6 text-center">
              <MessageSquare size={56} className="mb-4 opacity-50" />
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-1">Central de Mensajes</h3>
              <p className="text-xs font-bold tracking-widest max-w-sm">Selecciona un club a la izquierda para establecer conexión.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}