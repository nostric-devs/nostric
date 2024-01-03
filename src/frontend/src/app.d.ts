// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import type { AuthUser } from "$lib/stores/Auth";

declare namespace App {
  interface Locals {
    user: AuthUser | null;
  }
  // interface PageData {}
  // interface Error {}
  // interface Platform {}
}
