import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { getMyClubContext } from "../../supabase/clubService";
import { Send, Loader2, MessageSquare, Users, ChevronLeft, Search, User, CreditCard, X, Receipt, CheckCircle2 } from "lucide-react";

export default function ClubChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clubId, setClubId] = useState<string | null>(null);
  
  // Agendas
  const [allFamilies, setAllFamilies] = useState<any[]>([]);
  const [activeFamilyIds, setActiveFamilyIds] = useState<string[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modales
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  
  // Pagos
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const { club_id } = await getMyClubContext();
        setClubId(club_id);

        const [torneosRes, stagesRes] = await Promise.all([
          supabase.from('torneo_jugadores').select('player_id').eq('club_id', club_id),
          supabase.from('stage_inscripciones').select('player_id').eq('club_id', club_id)
        ]);

        const playerIds = [...new Set([...(torneosRes.data || []).map(t => t.player_id), ...(stagesRes.data || []).map(s => s.player_id)])];

        if (playerIds.length > 0) {
          const { data: guardians } = await supabase.from('player_guardians').select('family_profile_id, player_id').in('player_id', playerIds);
          const familyIds = [...new Set((guardians || []).map(g => g.family_profile_id))];

          if (familyIds.length > 0) {
            const [profilesRes, playersRes] = await Promise.all([
              supabase.from('profiles').select('id, full_name, email').in('id', familyIds),
              supabase.from('jugadores').select('id, name, surname').in('id', playerIds)
            ]);

            const formattedFamilies = (profilesRes.data || []).map(prof => {
              const myKidsIds = (guardians || []).filter(g => g.family_profile_id === prof.id).map(g => g.player_id);
              const myKids = (playersRes.data || []).filter(p => myKidsIds.includes(p.id)).map(k => `${k.name} ${k.surname || ''}`.trim());
              return {
                id: prof.id,
                name: prof.full_name || prof.email?.split('@')[0] || "Familia",
                childrenNames: myKids.length > 0 ? myKids.join(", ") : "Sin niños",
                kidsIds: myKidsIds // Guardamos los IDs de los niños para buscar sus deudas
              };
            });
            setAllFamilies(formattedFamilies);
          }
        }

        const { data: pastMessages } = await supabase.from('messages').select('family_id').eq('club_id', club_id);
        if (pastMessages) {
          setActiveFamilyIds([...new Set(pastMessages.map(m => m.family_id))]);
        }
      } catch (error) {
        console.error("Error inicializando chat:", error);
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (!clubId || !selectedFamilyId) return;

    const fetchMessages = async () => {
      try {
        // 🔥 AHORA TRAEMOS TAMBIÉN LOS DATOS DEL PAGO SI EXISTE
        const { data, error } = await supabase
          .from("messages")
          .select("*, pagos(id, concepto, importe, estado)")
          .eq("club_id", clubId)
          .eq("family_id", selectedFamilyId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (data) setMessages(data);
      } catch (error) {
        console.error("Error cargando mensajes:", error);
      }
    };

    fetchMessages();
  }, [clubId, selectedFamilyId]);

  useEffect(() => {
    if (!clubId || !selectedFamilyId) return;

    const channel = supabase
      .channel('chat-club')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `club_id=eq.${clubId}` },
        async (payload) => {
          if (payload.new.family_id === selectedFamilyId) {
            // Si el mensaje tiene un pago, lo consultamos completo para dibujarlo
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
  }, [clubId, selectedFamilyId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, paymentId?: string) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !paymentId) || !clubId || !selectedFamilyId) return;

    setSending(true);
    const msgText = paymentId ? "💳 He enviado una solicitud de pago." : newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        club_id: clubId,
        family_id: selectedFamilyId,
        sender_type: "club", 
        content: msgText,
        payment_id: paymentId || null // 🔥 Adjuntamos el pago
      });

      if (error) throw error;
      
      if (!activeFamilyIds.includes(selectedFamilyId)) {
        setActiveFamilyIds(prev => [...prev, selectedFamilyId]);
      }
    } catch (error) {
      alert("No se pudo enviar el mensaje");
    } finally {
      setSending(false);
      setIsPaymentModalOpen(false);
    }
  };

  const handleOpenPaymentModal = async () => {
    if (!selectedFamilyId) return;
    setIsPaymentModalOpen(true);
    setLoadingPayments(true);
    
    try {
      const family = allFamilies.find(f => f.id === selectedFamilyId);
      if (!family || family.kidsIds.length === 0) {
        setPendingPayments([]);
        return;
      }

      // Buscamos pagos pendientes de sus hijos
      const { data } = await supabase
        .from('pagos')
        .select('*')
        .in('player_id', family.kidsIds)
        .eq('club_id', clubId)
        .in('estado', ['pendiente', 'pendiente_verificacion']);

      setPendingPayments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  const activeFamiliesList = allFamilies.filter(f => activeFamilyIds.includes(f.id));
  const filteredActiveFamilies = activeFamiliesList.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.childrenNames.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeFamily = allFamilies.find(f => f.id === selectedFamilyId);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-neon" size={40} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter italic text-white uppercase leading-none">Comunicaciones</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Centro de soporte a familias</p>
        </div>
      </div>

      <div className="h-[75vh] min-h-[600px] flex bg-[#0D1B2A] border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden">
        
        {/* SIDEBAR DE FAMILIAS ACTIVAS */}
        <div className={`${selectedFamilyId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-white/5 bg-[#162032] z-20 shrink-0`}>
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                 <Users className="text-brand-neon" size={20}/> Chats ({activeFamiliesList.length})
               </h2>
               {/* BOTÓN PARA INICIAR NUEVO CHAT */}
               <button onClick={() => setIsNewChatModalOpen(true)} className="p-2 bg-brand-neon/10 text-brand-neon rounded-full hover:bg-brand-neon hover:text-black transition-colors">
                  <Search size={16} />
               </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" placeholder="Buscar conversación..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-brand-neon transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {filteredActiveFamilies.length === 0 ? (
              <div className="text-center p-6 opacity-50">
                <MessageSquare size={32} className="mx-auto mb-3 text-slate-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sin mensajes</p>
                <p className="text-[9px] mt-2 text-slate-500">Usa la lupa de arriba para buscar a cualquier familia e iniciar un chat.</p>
              </div>
            ) : (
              filteredActiveFamilies.map(fam => (
                <button
                  key={fam.id}
                  onClick={() => setSelectedFamilyId(fam.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${selectedFamilyId === fam.id ? 'bg-brand-neon/10 border-brand-neon/50 border' : 'bg-transparent border border-transparent hover:bg-white/5'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0 text-brand-neon font-black text-lg uppercase shadow-inner">
                    {fam.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white uppercase truncate">{fam.name}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate mt-0.5">Tutor de: <span className="text-slate-300">{fam.childrenNames}</span></p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ÁREA DE CHAT */}
        <div className={`${!selectedFamilyId ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative bg-gradient-to-b from-[#0D1B2A] to-[#0a1520]`}>
          {selectedFamilyId && activeFamily ? (
            <>
              <div className="bg-[#162032] p-4 md:p-6 border-b border-white/5 flex items-center gap-4 z-10 shadow-lg shrink-0">
                <button onClick={() => setSelectedFamilyId(null)} className="md:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><ChevronLeft size={20} /></button>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0 text-brand-neon font-black text-xl uppercase shadow-inner">
                  {activeFamily.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter leading-none mb-1 truncate">{activeFamily.name}</h2>
                  <p className="text-[9px] md:text-[10px] text-brand-neon font-bold uppercase tracking-widest flex items-center gap-2 truncate">Tutor de: {activeFamily.childrenNames}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <MessageSquare size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-center px-4">Inicia la conversación</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_type === "club";
                    
                    // 🔥 RENDERIZADO DE LA TARJETA DE PAGO
                    if (msg.pagos) {
                      return (
                         <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                           <div className="w-64 md:w-72 bg-[#162032] border border-brand-neon/30 rounded-[24px] p-5 shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/10 rounded-full blur-[40px]"></div>
                              <div className="relative z-10">
                                 <div className="flex items-center gap-2 mb-3">
                                   <div className="p-2 bg-brand-neon/20 text-brand-neon rounded-xl"><Receipt size={16}/></div>
                                   <p className="text-[10px] font-black uppercase text-brand-neon tracking-widest">Solicitud de Pago</p>
                                 </div>
                                 <p className="text-white font-bold text-sm leading-tight mb-2">{msg.pagos.concepto}</p>
                                 <p className="text-3xl font-black text-white italic tracking-tighter mb-4">{msg.pagos.importe}€</p>
                                 
                                 <div className="w-full py-2.5 rounded-xl bg-black/40 border border-white/5 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    {msg.pagos.estado === 'pagado' ? <span className="text-emerald-500">✅ Pagado por familia</span> : 'Esperando Pago...'}
                                 </div>
                              </div>
                              <p className="text-[8px] font-bold mt-3 text-right text-slate-500">{new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                         </div>
                      )
                    }

                    // MENSAJE NORMAL
                    return (
                      <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-[24px] ${isMe ? "bg-brand-neon text-[#0D1B2A] rounded-tr-sm shadow-lg" : "bg-[#162032] text-white border border-white/10 rounded-tl-sm shadow-xl"}`}>
                          <p className="text-sm md:text-base leading-relaxed font-medium">{msg.content}</p>
                          <p className={`text-[9px] font-bold mt-2 text-right ${isMe ? "text-[#0D1B2A]/60" : "text-slate-500"}`}>{new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-[#162032] border-t border-white/5 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-[#0D1B2A] p-2 rounded-[24px] border border-white/5 focus-within:border-brand-neon/50 transition-colors">
                  <input type="text" className="flex-1 bg-transparent px-4 py-2 md:py-3 text-white text-sm outline-none placeholder:text-slate-600" placeholder="Escribir mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  
                  {/* 🔥 BOTÓN PARA SOLICITAR PAGO */}
                  <button type="button" onClick={handleOpenPaymentModal} className="p-3 text-slate-400 hover:text-brand-neon transition-colors"><CreditCard size={20}/></button>
                  
                  <button type="submit" disabled={!newMessage.trim() || sending} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-neon text-[#0D1B2A] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 shrink-0">
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-0.5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 p-6 text-center">
              <MessageSquare size={64} className="mb-6 opacity-50" />
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">TeamFlow Soporte</h3>
              <p className="text-sm font-bold tracking-widest max-w-sm">Selecciona una familia para responder a sus dudas o solicitar pagos.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🟢 MODAL: INICIAR NUEVO CHAT (BUSCADOR GLOBAL) */}
      {/* ========================================================= */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#162032] border border-white/10 rounded-[32px] w-full max-w-md p-6 shadow-2xl relative flex flex-col max-h-[80vh]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Buscar Familia</h3>
                <button onClick={() => setIsNewChatModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
             </div>
             <div className="relative mb-4 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input autoFocus type="text" placeholder="Buscar por nombre o hijo..." value={newChatSearch} onChange={(e) => setNewChatSearch(e.target.value)} className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-brand-neon" />
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {allFamilies.filter(f => f.name.toLowerCase().includes(newChatSearch.toLowerCase()) || f.childrenNames.toLowerCase().includes(newChatSearch.toLowerCase())).map(fam => (
                  <button key={fam.id} onClick={() => { setSelectedFamilyId(fam.id); setIsNewChatModalOpen(false); }} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left">
                    <div className="w-10 h-10 rounded-full bg-black/50 text-slate-400 flex items-center justify-center font-black">{fam.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{fam.name}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 truncate">Hijos: {fam.childrenNames}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 💳 MODAL: SELECCIONAR PAGO PARA ENVIAR */}
      {/* ========================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#162032] border border-brand-neon/30 rounded-[32px] w-full max-w-md p-6 shadow-[0_0_50px_rgba(163,230,53,0.15)] relative flex flex-col max-h-[80vh]">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-xl font-black text-brand-neon uppercase italic tracking-tighter flex items-center gap-2"><CreditCard size={20}/> Solicitar Pago</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Selecciona un recibo pendiente</p>
                </div>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {loadingPayments ? (
                  <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-brand-neon" size={24}/></div>
                ) : pendingPayments.length === 0 ? (
                  <div className="py-10 text-center opacity-50">
                    <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500" />
                    <p className="text-white font-bold text-sm">Esta familia no debe nada.</p>
                  </div>
                ) : (
                  pendingPayments.map(pago => (
                    <button key={pago.id} onClick={() => handleSendMessage(undefined, pago.id)} className="w-full p-4 rounded-2xl bg-[#0D1B2A] border border-white/5 hover:border-brand-neon/50 text-left transition-all group">
                       <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-bold text-white leading-tight group-hover:text-brand-neon transition-colors">{pago.concepto}</p>
                          <p className="text-lg font-black text-white italic">{pago.importe}€</p>
                       </div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Enviar como tarjeta al chat</p>
                    </button>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}