// app/actions/auth.ts
'use server'

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials" };
    }
    return { error: "Something went wrong" };
  }
}