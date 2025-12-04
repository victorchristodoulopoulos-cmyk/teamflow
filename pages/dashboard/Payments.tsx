import React, { useState } from 'react';
import { Download, Filter, Plus, Trash2, Edit } from 'lucide-react';
import { useStore, Payment } from '../../context/Store';
import Modal from '../../components/ui/Modal';

const Payments: React.FC = () => {
  const { payments, addPayment, updatePayment, deletePayment, tournaments } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Payment>>({ concept: '', tournamentId: '', amount: 0, date: '', method: '', status: 'Pendiente' });

  // Totals
  const total = payments.reduce((acc, p) => acc + p.amount, 0);
  const paid = payments.filter(p => p.status === 'Pagado').reduce((acc, p) => acc + p.amount, 0);
  const pending = payments.filter(p => p.status === 'Pendiente' || p.status === 'Vencido').reduce((acc, p) => acc + p.amount, 0);
  
  const paidPct = total > 0 ? (paid / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ concept: '', tournamentId: '', amount: 0, date: '', method: '', status: 'Pendiente' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Payment) => {
    setEditingId(p.id);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(editingId) updatePayment({ ...formData, id: editingId } as Payment);
    else addPayment(formData as Payment);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if(window.confirm("¿Eliminar registro de pago?")) deletePayment(id);
  }
  
  const getTournamentName = (id: string) => tournaments.find(t => t.id === id)?.name || 'General';

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-display font-bold text-white">Pagos</h1>
           <p className="text-slate-400 mt-1">Estado financiero de los torneos</p>
        </div>
         <div className="flex gap-3">
            <button onClick={handleOpenCreate} className="bg-brand-neon text-brand-deep px-4 py-2 rounded-xl font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(201,255,47,0.3)] flex items-center gap-2 text-sm md:text-base">
                <Plus size={18} /> Registrar Pago
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-brand-surface p-6 rounded-2xl border border-white/5">
              <div className="text-slate-400 text-sm mb-2">Total Facturado</div>
              <div className="text-3xl font-bold text-white">€{total.toLocaleString()}</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full w-[100%]"></div>
              </div>
          </div>
          <div className="bg-brand-surface p-6 rounded-2xl border border-white/5">
              <div className="text-slate-400 text-sm mb-2">Cobrado</div>
              <div className="text-3xl font-bold text-emerald-400">€{paid.toLocaleString()}</div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{width: `${paidPct}%`}}></div>
              </div>
          </div>
          <div className="bg-brand-surface p-6 rounded-2xl border border-white/5">
              <div className="text-slate-400 text-sm mb-2">Pendiente</div>
              <div className="text-3xl font-bold text-orange-400">€{pending.toLocaleString()}</div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-orange-500 h-full transition-all duration-500" style={{width: `${pendingPct}%`}}></div>
              </div>
          </div>
      </div>

      <div className="bg-brand-surface border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                <tr className="bg-brand-deep/50 border-b border-white/5 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-5 font-medium">Concepto</th>
                    <th className="p-5 font-medium">Torneo</th>
                    <th className="p-5 font-medium">Fecha</th>
                    <th className="p-5 font-medium">Método</th>
                    <th className="p-5 font-medium">Importe</th>
                    <th className="p-5 font-medium">Estado</th>
                    <th className="p-5 font-medium text-right"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {payments.map((row) => (
                        <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-5 font-medium text-white">{row.concept}</td>
                            <td className="p-5 text-slate-400">{getTournamentName(row.tournamentId)}</td>
                            <td className="p-5 text-slate-400">{row.date}</td>
                            <td className="p-5 text-slate-400">{row.method}</td>
                            <td className="p-5 font-bold text-white">€{row.amount.toLocaleString()}</td>
                            <td className="p-5">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    row.status === 'Pagado' ? 'bg-emerald-500/20 text-emerald-400' :
                                    row.status === 'Pendiente' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                    {row.status}
                                </span>
                            </td>
                            <td className="p-5 text-right flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenEdit(row)} className="p-1.5 bg-brand-deep rounded hover:text-blue-400 text-slate-400"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(row.id)} className="p-1.5 bg-brand-deep rounded hover:text-red-400 text-slate-400"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Pago" : "Registrar Pago"}>
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm text-slate-400 mb-1">Concepto</label>
                <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} />
            </div>
             <div>
                <label className="block text-sm text-slate-400 mb-1">Torneo</label>
                 <select required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.tournamentId} onChange={e => setFormData({...formData, tournamentId: e.target.value})}>
                    <option value="">Selecciona Torneo</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </select>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Importe (€)</label>
                    <input type="number" required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
                </div>
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Fecha</label>
                    <input type="date" required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Método</label>
                    <input required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} placeholder="Transferencia, Tarjeta..." />
                </div>
                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Estado</label>
                    <select required className="w-full bg-brand-deep border border-white/10 rounded-lg p-3 text-white focus:border-brand-neon outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                        <option value="Vencido">Vencido</option>
                    </select>
                </div>
            </div>
             <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                 <button type="submit" className="px-6 py-2 bg-brand-neon text-brand-deep font-bold rounded-lg hover:bg-white">Guardar</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;