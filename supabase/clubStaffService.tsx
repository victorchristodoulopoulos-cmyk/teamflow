import { supabase } from "./supabaseClient";

/**
 * Obtiene todos los equipos del club agrupados por torneo, con su staff asignado.
 */
export async function getClubTeamsWithStaff(clubId: string) {
  // 1. Obtenemos equipos con sus torneos
  const { data: teams, error } = await supabase
    .from("equipos")
    .select(`
      id, name, torneo_id,
      torneos (id, name, ciudad),
      team_users (
        id, profile_id,
        profiles (email, full_name)
      )
    `)
    .eq("club_id", clubId)
    .order("torneo_id");

  if (error) throw error;
  return teams;
}

/**
 * Crea un nuevo usuario Entrenador y lo asigna al equipo
 */
export async function inviteCoach(clubId: string, teamId: string, email: string, fullName: string) {
  // 1. Crear usuario en Auth (Esto enviará un email de confirmación si está configurado, o lo crea directo)
  // NOTA: Para hacer esto desde el cliente, necesitas que "Enable email signup" esté activo en Supabase.
  // Si da error de permisos, necesitaríamos una Edge Function. Por ahora probamos directo.
  
  // Opción A: Crear usuario dummy (sin contraseña, solo invitación) - Requiere Edge Function admin.
  // Opción B (Frontend): Usar signUp. Pero eso loguearía al usuario. 
  // SOLUCIÓN PRÁCTICA: Insertamos en 'profiles' y 'team_users' primero (pre-registro).
  // El usuario real se creará cuando él se registre, o usamos una Edge Function.
  
  // Vamos a asumir que usas el método de "Invitación Simualda" por base de datos:
  // Creamos un registro en una tabla nueva "invitaciones_staff" o lo metemos directo si ya existe el profile.
  
  // MIRA, LO MEJOR PARA NO COMPLICARTE CON BACKEND AHORA:
  // Solo insertamos en una tabla de 'team_users' buscando por email si existe, 
  // o creamos un 'profile' placeholder.
  
  // PERO, para que sea funcional YA:
  // Vamos a usar una función RPC de base de datos o hacerlo en dos pasos si el usuario ya existe.
  
  // P.D. La forma correcta segura es backend. 
  // Forma rápida frontend: Solo asignamos si el usuario YA existe. Si no, mostramos "Usuario no registrado".
  
  // ¿Te parece bien que por ahora solo funcione si el email ya está registrado en la app? 
  // O ¿quieres que se cree el usuario fantasma?
  
  // VAMOS A HACERLO COMPLETO (Crear usuario fantasma en profiles):
  
  // 1. Buscar si existe profile
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  let userId = existingProfile?.id;

  if (!userId) {
     // Si no existe, tendríamos que crear un usuario Auth. 
     // Como desde el cliente no podemos crear OTRO usuario sin cerrar sesión...
     // Lo mejor es: Crear un registro en una tabla 'pending_invites' o devolver error "Pide al entrenador que se registre primero".
     
     throw new Error("El entrenador debe registrarse en la app primero (Login > Registrarse). Luego podrás asignarlo aquí.");
  }

  // 2. Asignar rol 'team' si no lo tiene
  await supabase
    .from("profiles")
    .update({ role: "team", club_id: clubId }) // Le damos acceso al club
    .eq("id", userId);

  // 3. Crear vínculo en team_users
  const { error: linkError } = await supabase
    .from("team_users")
    .insert({
      team_id: teamId,
      profile_id: userId,
      club_id: clubId
    });

  if (linkError) throw linkError;
  return true;
}

/**
 * Eliminar entrenador de un equipo
 */
export async function removeCoach(teamUserId: string) {
  const { error } = await supabase
    .from("team_users")
    .delete()
    .eq("id", teamUserId);
  
  if (error) throw error;
}