import type { AuthUser } from "$lib/stores/Auth";

declare namespace App {
  interface Locals {
    user: AuthUser | null;
  }
}
