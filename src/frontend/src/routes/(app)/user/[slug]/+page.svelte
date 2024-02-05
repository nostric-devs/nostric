<script lang="ts">
  import UserProfile from "$lib/components/user/profile/UserProfile.svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { nostrHandler } from "$lib/nostr";
  import { page } from "$app/stores";
  import { navigating } from "$app/stores";

  let userPromise: Promise<NDKUser>;

  $: navigating,
    (userPromise = nostrHandler.fetchUserProfileByPublicKey($page.params.slug));
</script>

{#await userPromise then user}
  {#key user}
    {#if user}
      <UserProfile {user} />
    {/if}
  {/key}
{/await}
