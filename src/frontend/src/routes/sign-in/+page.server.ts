import type { Actions } from "./$types";
import { AuthStates } from "$lib/stores/Auth";

export const actions: Actions = {
  login: async ({cookies}) => {
    cookies.set("auth", AuthStates.NOSTR_AUTHENTICATED.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  },
  logout: async ({cookies}) => {
    cookies.delete("auth");
    return { success: true };
  }
}
