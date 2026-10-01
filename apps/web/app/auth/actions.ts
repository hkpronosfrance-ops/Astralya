"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    redirect("/auth?error=invalid_credentials");
  }

  return { email, password };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const credentials = readCredentials(formData);

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirect("/auth?error=login_failed");
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const credentials = readCredentials(formData);

  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    redirect("/auth?error=signup_failed");
  }

  if (data.session) {
    redirect("/character/create");
  }

  redirect("/auth/check-email");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}
