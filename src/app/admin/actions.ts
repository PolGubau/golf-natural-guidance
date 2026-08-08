"use server";

import { redirect } from "next/navigation";
import { adminLoginSchema } from "~/domain/schemas";
import type { LoginActionState } from "~/features/admin-auth/login-view";
import {
  createAdminSession,
  deleteAdminSession,
} from "~/infrastructure/auth/admin-session";
import { InvalidCredentialsError } from "~/infrastructure/auth/auth-provider";

export async function loginAction(
  _state: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "");
  const result = adminLoginSchema.safeParse({
    email,
    password: formData.get("password"),
  });
  if (!result.success) {
    const fields = result.error.flatten().fieldErrors;
    return {
      email,
      fieldErrors: {
        email: fields.email?.[0],
        password: fields.password?.[0],
      },
    };
  }

  try {
    await createAdminSession(result.data);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return {
        email,
        message: "El email o la contraseña no son correctos.",
      };
    }
    return {
      email,
      message: "No hemos podido iniciar sesión. Inténtalo de nuevo.",
    };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await deleteAdminSession();
  redirect("/admin");
}
