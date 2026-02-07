import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useTheme } from "../../context/Theme";

export default function FamilyProfile() {
  const { theme, toggle } = useTheme();

  const raw = localStorage.getItem("session");
  const email = raw
    ? (() => {
        try {
          return JSON.parse(raw).email;
        } catch {
          return "";
        }
      })()
    : "";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Perfil" subtitle="Cuenta" />
        <CardContent className="space-y-3">
          <div className="text-sm text-[rgb(var(--muted))]">Email</div>
          <div className="text-lg font-extrabold">{email || "—"}</div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <Card className="bg-white/5 shadow-none">
              <CardContent className="p-5">
                <div className="text-sm font-extrabold">Preferencias</div>
                <div className="mt-2 text-sm text-[rgb(var(--muted))]">
                  Tema visual del portal familiar.
                </div>
                <div className="mt-4">
                  <Button variant="secondary" onClick={toggle}>
                    Cambiar a {theme === "dark" ? "Light" : "Dark"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 shadow-none">
              <CardContent className="p-5">
                <div className="text-sm font-extrabold">Soporte</div>
                <div className="mt-2 text-sm text-[rgb(var(--muted))]">
                  ¿Problemas con pagos o documentación? Escríbenos.
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1">Contactar</Button>
                  <Button variant="secondary" className="flex-1">FAQ</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Seguridad" subtitle="Sesión" />
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary">Cambiar contraseña (próximamente)</Button>
          <Button variant="danger" onClick={() => alert("Cierra sesión desde el botón del sidebar/topbar.")}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
