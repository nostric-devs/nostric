<script lang="ts">
  import UserProfile from "$lib/components/user-profile/UserProfile.svelte";
  import { authUser } from "$lib/stores/Auth";
  import { onMount } from "svelte";
  import type { NostrUserHandler } from "$lib/nostr";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { events } from "$lib/stores/Events";

  let user: NDKUser | undefined;

  onMount(async () => {
    let userHandler: NostrUserHandler = authUser.getNostrUserHandler();
    user = userHandler.getUser();
  });
</script>

{#if user}
  <UserProfile {user} events={$events} />
{/if}
