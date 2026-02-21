import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import { Loader2, ArrowRight, Lock, Mail, PartyPopper, User, Shield, Briefcase } from "lucide-react";

// Función auxiliar para obtener logos
const getImageUrl = (path: string | null, bucket: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export default function StaffRegistration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const clubId = searchParams.get("club");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [clubData, setClubData] = useState<any>(null);
  const [clubLogo, setClubLogo] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    if (clubId) {
      fetchClubData();
    } else {
      setErrorMsg("Enlace inválido. Falta el identificador del club.");
      setLoadingInitial(false);
    }
  }, [clubId]);

  const fetchClubData = async () => {
    try {
      const { data: club } = await supabase.from('clubs').select('*').eq('id', clubId).single();
      if (club) {
        setClubData(club);
        setClubLogo(getImageUrl(club.logo_path, 'club-logos'));
      } else {
        setErrorMsg("El club asociado a este enlace no existe.");
      }
    } catch (err) {
      setErrorMsg("Error cargando la información de la entidad.");
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Crear el usuario en Auth (Supabase)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      
      if (authError) throw authError;
      const currentUserId = authData.user?.id;
      if (!currentUserId) throw new Error("No se pudo crear el usuario.");

      // 2. Insertar en Profiles como STAFF y vincularlo al Club
      const fullName = `${formData.name.trim()} ${formData.surname.trim()}`;
      
      const { error: profileError } = await supabase.from('profiles').upsert({ 
        id: currentUserId, 
        role: 'team', // 🔥 MAGIA: Le damos rol de cuerpo técnico
        email: formData.email,
        full_name: fullName, 
        club_id: clubId, // 🔥 MAGIA: Lo metemos directamente en la bolsa de tu club
        system_role: 'user'
      });
      
      if (profileError) throw profileError;

      // 3. Éxito
      setSuccess(true);
      
      // En un futuro, aquí podrías redirigirle a su propio '/staff-dashboard'
      // De momento le mandamos al login genérico o le dejamos un mensaje
      setTimeout(() => navigate("/login"), 3000);

    } catch (err: any) {
      console.error("🚨 Error registrando staff:", err);
      setErrorMsg(err.message || "Error en el registro. Quizás el email ya está en uso.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05080f] text-center p-6">
      <div className="w-24 h-24 bg-brand-neon rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_50px_rgba(163,230,53,0.5)]">
        <PartyPopper size={48} className="text-brand-deep" />
      </div>
      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">¡BIENVENIDO AL CUERPO TÉCNICO!</h2>
      <p className="text-slate-400 text-lg">Tu cuenta de Staff ha sido creada con éxito.</p>
      <p className="text-slate-500 text-sm mt-4">Redirigiendo a la pantalla de acceso...</p>
    </div>
  );

  if (loadingInitial) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#05080f]">
      <Loader2 className="animate-spin text-brand-neon" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#05080f] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-neon/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-[#162032]/90 backdrop-blur-xl border border-white/10 rounded-[40px] p-6 md:p-10 shadow-2xl relative z-10">
        
        {/* 🔥 HEADER CORPORATIVO */}
        <div className="text-center mb-8 pb-6 border-b border-white/5">
          {clubLogo ? (
            <div className="w-20 h-20 mx-auto bg-white rounded-2xl p-2 shadow-xl mb-4 border border-white/20">
              <img src={clubLogo} alt={clubData?.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
              <Shield size={32} className="text-slate-500" />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight">{clubData?.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Briefcase size={14} className="text-brand-neon" />
            <p className="font-bold text-xs uppercase tracking-widest text-brand-neon">
              ACCESO CUERPO TÉCNICO
            </p>
          </div>
        </div>

        {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-center font-bold animate-in shake">{errorMsg}</div>}

        <form onSubmit={handleRegistration} className="space-y-6">
          <p className="text-slate-400 text-sm text-center mb-6">
            Crea tu cuenta de Entrenador/a para gestionar tus equipos en TeamFlow.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <input required type="text" placeholder="Nombre" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-3.5 px-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative group">
                <input required type="text" placeholder="Apellidos" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-3.5 px-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
              </div>
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input required type="email" placeholder="Email corporativo / personal" className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input required type="password" placeholder="Crea una contraseña (mín. 6)" minLength={6} className="w-full bg-[#0a0f18] border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-white outline-none focus:border-brand-neon text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-brand-neon hover:bg-white text-brand-deep font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(163,230,53,0.3)] mt-8">
            {submitting ? <Loader2 className="animate-spin" size={24} /> : <>CREAR CUENTA DE STAFF <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}