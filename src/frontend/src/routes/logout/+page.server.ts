import type { Actions } from "./$types";
import { redirect } from "@sveltejs/kit";

export const actions: Actions = {
  default: async ({ locals, cookies }): Promise<void> => {
    cookies.delete("auth", { path: "/" });
    locals.user = null;
    throw redirect(303, "/#signup");
  },
};
