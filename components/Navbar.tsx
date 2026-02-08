export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="font-extrabold tracking-tight text-white">
          ⚡ TEAMFLOW
        </div>

        <nav className="flex items-center gap-6 text-sm font-semibold text-white/80">
          <a href="#services" className="hover:text-white">Servicios</a>
          <a href="#how" className="hover:text-white">Cómo funciona</a>
          <a href="#pricing" className="hover:text-white">Precios</a>
          <a
            href="/login"
            className="px-4 py-2 rounded-xl bg-lime-400 text-black font-bold hover:bg-lime-300 transition"
          >
            Login
          </a>
        </nav>
      </div>
    </header>
  );
}
