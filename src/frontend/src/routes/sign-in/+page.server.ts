import type { Actions } from "./$types";
import { AuthStates } from "$lib/stores/Auth";

export const actions: Actions = {
  "login-anonymous": async ({ cookies }) => {
    cookies.set("auth", AuthStates.NOSTR_AUTHENTICATED.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
    });
    return { success: true };
  },
  "login-identity": async ({ cookies }) => {
    cookies.set("auth", AuthStates.IDENTITY_AUTHENTICATED.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
    });
    return { success: true };
  },
  logout: async ({ cookies }) => {
    cookies.delete("auth");
    return { success: true };
  },
};
