import { supabase } from "./supabaseClient";

export type TeamSession = {
  profile_id: string;
  role: "team";
  club_id: string;
};

export async function getTeamSession(): Promise<TeamSession> {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("No authenticated user");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, club_id")
    .eq("id", userData.user.id)
    .single();

  if (error) throw error;
  if (data.role !== "team") {
    throw new Error("User is not TEAM");
  }

  return {
    profile_id: data.id,
    role: "team",
    club_id: data.club_id,
  };
}
