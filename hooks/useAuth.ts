import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";

const getEmailRedirectTo = () => {
  try {
    return Linking.createURL("/(auth)/login");
  } catch {
    return undefined;
  }
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: getEmailRedirectTo() },
    });
    if (error) throw error;

    const emailAlreadyExists =
      !!data.user && (data.user.identities?.length ?? 0) === 0 && !data.session;

    const needsEmailConfirmation =
      !!data.user && !data.session && !emailAlreadyExists;

    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from("users")
        .upsert(
          { id: data.user.id, email, name },
          { onConflict: "id" }
        );
      if (profileError) throw profileError;
    }

    return { ...data, needsEmailConfirmation, emailAlreadyExists };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: getEmailRedirectTo() },
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getEmailRedirectTo(),
    });
    if (error) throw error;
  };

  const deleteAccount = async () => {
    const userId = session?.user?.id;
    if (!userId) throw new Error("Not signed in");

    const { error } = await supabase.rpc("delete_user_account", {
      p_user_id: userId,
    });
    if (error) throw error;

    await supabase.auth.signOut();
  };

  return { session, loading, signUp, signIn, signOut, resendVerification, resetPassword, deleteAccount };
}
