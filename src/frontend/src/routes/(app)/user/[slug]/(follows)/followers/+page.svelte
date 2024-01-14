<script lang="ts">
  import { page } from "$app/stores";
  import { nostrHandler } from "$lib/nostr";
  import { onMount } from "svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import UserFollowLoadingSkeleton from "$lib/components/user/follow/UserFollowLoadingSkeleton.svelte";
  import FollowCard from "$lib/components/user/follow/FollowCard.svelte";

  let followersPromise: Promise<NDKUser[]>;
  let disabled: boolean = false;

  onMount(async () => {
    followersPromise = nostrHandler.fetchUserFollowersByPublicKey(
      $page.params.slug,
    );
  });
</script>

<h1 class="h1 m-4">Followers</h1>
<div class="px-4">
  {#await followersPromise}
    {#each { length: 10 } as _}
      <UserFollowLoadingSkeleton />
    {/each}
  {:then followers}
    {#if followers && followers.length > 0}
      {#each followers as user}
        <FollowCard bind:disabled {user} />
      {/each}
    {:else}
      <div class="mt-2">This user has not followers yet.</div>
    {/if}
  {/await}
</div>
