import { supabase } from "./supabaseClient";

export type CoachContext = {
  coachName: string | null;
  clubId: string | null;
  clubName: string | null;
  email: string | null;
};

export async function getCoachContext(): Promise<CoachContext> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const user = authData.user;
  if (!user) {
    return { coachName: null, clubId: null, clubName: null, email: null };
  }

  // profiles: id, full_name, club_id, email
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("full_name, club_id, email")
    .eq("id", user.id)
    .single();

  if (pErr) throw pErr;

  const clubId = profile?.club_id ?? null;

  let clubName: string | null = null;
  if (clubId) {
    const { data: club, error: cErr } = await supabase
      .from("clubs")
      .select("name")
      .eq("id", clubId)
      .single();

    if (cErr) {
      // no rompas la app si club falla, pero log
      console.error("clubs read error:", cErr);
    } else {
      clubName = club?.name ?? null;
    }
  }

  return {
    coachName: profile?.full_name ?? null,
    clubId,
    clubName,
    email: user.email ?? profile?.email ?? null,
  };
}
