import { supabase } from "@/integrations/supabase/client";

export const addTestActivity = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Utilisateur non connecté");
  }

  // Activité de test : 5km en 25 minutes
  const testActivity = {
    user_id: user.id,
    time: 1500, // 25 minutes en secondes
    distance: 5.0, // 5 km
    reviewed: false,
    review: null
  };

  const { data, error } = await supabase
    .from('activities')
    .insert([testActivity])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
};