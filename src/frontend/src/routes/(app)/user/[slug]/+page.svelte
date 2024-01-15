<script lang="ts">
  import UserProfile from "$lib/components/user/profile/UserProfile.svelte";
  import { onMount } from "svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { nostrHandler } from "$lib/nostr";
  import { page } from "$app/stores";

  let userPromise: Promise<NDKUser>;

  onMount(async () => {
    userPromise = nostrHandler.fetchUserProfileByPublicKey($page.params.slug);
  });
</script>

{#await userPromise then user}
  {#if user}
    <UserProfile {user} />
  {/if}
{/await}
