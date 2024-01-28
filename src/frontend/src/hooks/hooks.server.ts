import type { Handle } from "@sveltejs/kit";
import { getPath, isPathAccessible, ROUTES } from "$lib/utils/routes";
import { redirect } from "@sveltejs/kit";
import { building } from "$app/environment";

export const handle: Handle = async ({ event, resolve }): Promise<Response> => {
  // hooks are being run during build, and it causes error,
  // this prevents it;
  if (building) {
    return resolve(event);
  }

  const currentPath: string = event.url.pathname;
  const { cookies } = event;
  const userStatus: string | undefined = cookies.get("auth");

  if (isPathAccessible(currentPath, Number(userStatus))) {
    event.locals.user = userStatus;
  } else {
    throw redirect(303, getPath(ROUTES.HOMEPAGE));
  }

  return resolve(event);
};
