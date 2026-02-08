import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, User } from "lucide-react";

const DemoAccess: React.FC = () => {
  const navigate = useNavigate();

  const seedDemo = () => {
    // Admin (puedes adaptarlo a tu login real luego)
    localStorage.setItem(
      "admin_user",
      JSON.stringify({ email: "admin@teamflow.demo", role: "admin" })
    );

    // Team user (tu esquema actual)
    localStorage.setItem(
      "team_user",
      JSON.stringify({
        id: "demo-team-user",
        email: "entrenador@test.com",
        team_id: "2a27f3d1-1b89-462d-96cc-6d2b118ab732",
      })
    );

    // Family user (nuevo)
    localStorage.setItem(
      "family_user",
      JSON.stringify({
        id: "demo-family-user",
        email: "familia@demo.com",
        player_id: "2a27f3d1-1b89-462d-96cc-6d2b118ab724",
      })
    );
  };

  const goAdmin = () => {
    seedDemo();
    navigate("/dashboard");
  };

  const goTeam = () => {
    seedDemo();
    navigate("/team-dashboard");
  };

  const goFamily = () => {
    seedDemo();
    navigate("/family");
  };

  return (
    <div className="min-h-screen bg-carbon text-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-display font-black italic mb-2">
          TEAMVIEW Demo Access
        </h1>
        <p className="text-slate-400 mb-8">
          3 portales distintos (Admin / Team / Family) para enseñar la propuesta
          en 1 click.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={goAdmin}
            className="bg-brand-surface border border-white/10 rounded-2xl p-6 text-left hover:border-brand-neon/30 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-brand-neon/10 text-brand-neon">
                <Shield />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  TEAMVIEW
                </div>
                <div className="text-xl font-bold italic">ADMIN</div>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Operaciones internas: torneos, equipos, hoteles, pagos, docs.
            </p>
          </button>

          <button
            onClick={goTeam}
            className="bg-brand-surface border border-white/10 rounded-2xl p-6 text-left hover:border-brand-neon/30 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <Users />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  TEAMVIEW
                </div>
                <div className="text-xl font-bold italic">TEAM</div>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Portal del club: su torneo, categorías, roster, hotel, logística.
            </p>
          </button>

          <button
            onClick={goFamily}
            className="bg-brand-surface border border-white/10 rounded-2xl p-6 text-left hover:border-brand-neon/30 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <User />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  TEAMVIEW
                </div>
                <div className="text-xl font-bold italic">FAMILY</div>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Padres: info del jugador, docs, horarios, hotel, torneo.
            </p>
          </button>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          Tip para la reunión: abre <span className="text-brand-neon">/demo</span>{" "}
          y enseñas los 3 portales en 20 segundos.
        </div>
      </div>
    </div>
  );
};

export default DemoAccess;
