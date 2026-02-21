import React from 'react';
import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom'; // 🔥 Importamos Link para navegación rápida

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                 <div className="w-6 h-6 bg-brand-accent rounded-md flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-slate-900"></div>
                 </div>
                 <span className="text-xl font-bold text-white">TeamFlow</span>
            </div>
            <p className="text-sm max-w-xs">
              Gestión integral de logística deportiva para clubes y academias.
            </p>
          </div>

          {/* 🔥 CLINICAL CHANGE: Enlaces reales a tus páginas legales */}
          <div className="flex gap-8 text-sm">
            <Link to="/aviso-legal" className="hover:text-brand-accent transition-colors">Aviso Legal</Link>
            <Link to="/privacidad" className="hover:text-brand-accent transition-colors">Privacidad</Link>
            <Link to="/cookies" className="hover:text-brand-accent transition-colors">Cookies</Link>
          </div>

          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 hover:text-white transition-colors">
              <Mail size={20} />
            </a>
          </div>
        </div>
        
        <div className="mt-12 text-center text-xs text-slate-600 border-t border-slate-900 pt-8">
          © {new Date().getFullYear()} TeamFlow Sports Logistics. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;