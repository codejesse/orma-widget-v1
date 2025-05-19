import supabase from "../lib/supabaseClient";

export const submitFeedback = async ({
  name,
  email,
  rating,
  message,
  type,
  projectId,
}: {
  name: string;
  email: string;
  rating: number;
  message: string;
  type: string;
  projectId?: string;
}) => {
  const { error } = await supabase.rpc("add_feedback", {
    p_user_name: name,
    p_user_email: email,
    p_rating: rating,
    p_message: message,
    p_response_type: type,
    p_project_id: projectId,
  });

  if (error) throw error;
};
