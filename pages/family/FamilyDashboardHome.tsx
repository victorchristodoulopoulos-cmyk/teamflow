import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";



type Player = {
  id: string;
  name: string;
  surname: string;
  dni: string;
  team_id: string;
};

export default function FamilyDashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>("");

  const fullName = useMemo(() => {
    if (!player) return "—";
    return `${player.name} ${player.surname}`;
  }, [player]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      // Get current logged-in user (family)
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setLoading(false);
        return;
      }
      // Fetch profile to get player_id
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("player_id, team_id")
        .eq("id", auth.user.id)
        .single();
      if (pErr || !profile?.player_id) {
        console.error("Profile sin player_id", pErr);
        setLoading(false);
        return;
      }
      // Fetch player details
      const { data: playerData, error: jErr } = await supabase
        .from("jugadores")
        .select("id, name, surname, dni, team_id")
        .eq("id", profile.player_id)
        .single();
      if (jErr || !playerData) {
        console.error("Error cargando jugador", jErr);
        setLoading(false);
        return;
      }
      setPlayer(playerData);
      // Fetch team name if available (team_id might be null if not assigned)
      if (playerData.team_id) {
        const { data: team, error: tErr } = await supabase
          .from("equipos")
          .select("name, nombre")
          .eq("id", playerData.team_id)
          .single();
        if (!tErr && team) {
          setTeamName(team.name ?? team.nombre ?? "");
        }
      }
      setLoading(false);
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeletons */}
        <div className="h-28 rounded-2xl border border-[rgba(var(--border))] bg-white/5 animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="h-24 rounded-2xl border border-[rgba(var(--border))] bg-white/5 animate-pulse" />
          <div className="h-24 rounded-2xl border border-[rgba(var(--border))] bg-white/5 animate-pulse" />
          <div className="h-24 rounded-2xl border border-[rgba(var(--border))] bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HERO / Welcome Card */}
      <Card className="overflow-hidden">
        <div className="p-6 lg:p-8 relative">
          <div className="absolute inset-0 opacity-60 pointer-events-none">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[rgba(var(--brand),0.12)] blur-3xl" />
            <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[rgba(80,160,255,0.10)] blur-3xl" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-[rgba(var(--border))] flex items-center justify-center text-xl">
              👋
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest text-[rgb(var(--muted))]">
                Bienvenido
              </div>
              <div className="text-2xl lg:text-3xl font-black tracking-tight">
                Familia de {fullName}
              </div>
              <div className="mt-1 text-sm text-[rgb(var(--muted))]">
                Panel de pagos y documentación del torneo
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* GRID CARDS */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Jugador" subtitle="Datos principales" />
          <CardContent>
            <div className="text-lg font-extrabold">{fullName}</div>
            <div className="mt-1 text-sm text-[rgb(var(--muted))]">
              DNI: {player?.dni ?? "—"}
            </div>
            <div className="mt-4">
              <Button variant="secondary" className="w-full"
                      onClick={() => navigate("/family-dashboard/perfil")}>
                Ver perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Equipo" subtitle="Información del torneo" />
          <CardContent>
            <div className="text-lg font-extrabold">
              {teamName || "Equipo no asignado"}
            </div>
            <div className="mt-1 text-sm text-[rgb(var(--muted))] truncate">
              ID: {player?.team_id ?? "—"}
            </div>
            <div className="mt-4">
              <Button variant="secondary" className="w-full" disabled>
                Torneo (próximamente)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-glow">
          <CardHeader title="Acciones rápidas" subtitle="Accesos directos" />
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full"
                      onClick={() => navigate("/family-dashboard/pagos")}>
                Pagos
              </Button>
              <Button variant="secondary" className="w-full"
                      onClick={() => navigate("/family-dashboard/documentos")}>
                Docs
              </Button>
            </div>
            <div className="mt-3 text-xs text-[rgb(var(--muted))]">
              Pagos, documentación y soporte en un único lugar.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
