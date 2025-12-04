import React, { useState } from 'react';
import { useStore, Player } from '../../context/Store';
import { User, CheckCircle2, AlertCircle, Plus, UploadCloud, FileText } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const TeamRoster: React.FC = () => {
  const { user, players, addPlayer, updatePlayer } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Player>>({
    name: '', surname: '', dni: '', birthDate: '', status: 'Pendiente'
  });

  const myPlayers = players.filter(p => p.teamId === user?.teamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(user?.teamId) {
        addPlayer({ ...formData, teamId: user.teamId } as Player);
        setIsModalOpen(false);
        setFormData({ name: '', surname: '', dni: '', birthDate: '', status: 'Pendiente' });
    }
  };

  // Simulate file upload by setting status to 'Pendiente' if it was somehow unset, 
  // or just showing an alert. In a real app this would upload a file.
  const handleUpload = (player: Player) => {
      if(player.status === 'Validado') return;
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*,.pdf';
      fileInput.onchange = () => {
           // Simulate upload delay
           alert(`Documento subido para ${player.name}. Pendiente de validación por Admin.`);
           // Ensure status is pending
           if (player.status !== 'Pendiente') {
                updatePlayer({ ...player, status: 'Pendiente' });
           }
      };
      fileInput.click();
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-brand-surface p-6 rounded-2xl border border-white/5">
            <div>
                <h1 className="text-2xl font-display font-black italic text-white uppercase">Plantilla & Docs</h1>
                <p className="text-slate-400 text-sm mt-1">Sube la documentación (DNI/Pasaporte) para que la organización la valide.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-brand-neon text-brand-deep px-6 py-3 rounded-xl font-bold hover:bg-white transition-colors flex items-center gap-2 shadow-neon uppercase text-xs tracking-wider">
                <Plus size={18} /> Añadir Jugador
            </button>
       </div>

       {/* List */}
       <div className="bg-brand-surface border border-white/5 rounded-2xl overflow-hidden">
           <table className="w-full text-left border-collapse">
               <thead className="bg-brand-deep/80 text-xs uppercase text-slate-500 font-bold tracking-wider">
                   <tr>
                       <th className="p-5">Jugador</th>
                       <th className="p-5 hidden md:table-cell">ID / DNI</th>
                       <th className="p-5 hidden md:table-cell">F. Nacimiento</th>
                       <th className="p-5 text-center">Estado</th>
                       <th className="p-5 text-right">Documentación</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-sm">
                   {myPlayers.map(player => (
                       <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                           <td className="p-5">
                               <div className="font-bold text-white text-lg">{player.name} {player.surname}</div>
                               <div className="text-xs text-slate-500 md:hidden">{player.dni}</div>
                           </td>
                           <td className="p-5 text-slate-300 font-mono hidden md:table-cell">{player.dni}</td>
                           <td className="p-5 text-slate-400 hidden md:table-cell">{player.birthDate}</td>
                           <td className="p-5 flex justify-center">
                               {player.status === 'Validado' ? (
                                   <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-wide">
                                       <CheckCircle2 size={12} /> Validado
                                   </span>
                               ) : (
                                   <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20 uppercase tracking-wide animate-pulse">
                                       <AlertCircle size={12} /> Pendiente
                                   </span>
                               )}
                           </td>
                           <td className="p-5 text-right">
                               <button 
                                   onClick={() => handleUpload(player)}
                                   disabled={player.status === 'Validado'}
                                   className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ml-auto uppercase tracking-wide ${
                                       player.status === 'Validado' 
                                       ? 'bg-transparent border-white/10 text-slate-500 cursor-not-allowed'
                                       : 'bg-blue-600/10 text-blue-400 border-blue-600/30 hover:bg-blue-600 hover:text-white'
                                   }`}
                               >
                                   {player.status === 'Validado' ? <FileText size={14}/> : <UploadCloud size={14} />} 
                                   {player.status === 'Validado' ? 'Docs OK' : 'Subir'}
                               </button>
                           </td>
                       </tr>
                   ))}
                   {myPlayers.length === 0 && (
                       <tr>
                           <td colSpan={5} className="p-10 text-center text-slate-500 italic">
                               No hay jugadores en la plantilla.
                           </td>
                       </tr>
                   )}
               </tbody>
           </table>
       </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Alta de Jugador">
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold uppercase">Nombre</label>
                    <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold uppercase">Apellido</label>
                    <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none transition-colors" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
                </div>
             </div>
             <div>
                <label className="block text-sm text-slate-400 mb-1 font-bold uppercase">DNI / Pasaporte</label>
                <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none transition-colors" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-1 font-bold uppercase">Fecha Nacimiento</label>
                <input type="date" required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none transition-colors" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
            </div>
             <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm uppercase">Cancelar</button>
                 <button type="submit" className="px-6 py-3 bg-brand-neon text-brand-deep font-black rounded-lg hover:bg-white transition-colors uppercase text-sm tracking-wider shadow-neon">Guardar Jugador</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamRoster;