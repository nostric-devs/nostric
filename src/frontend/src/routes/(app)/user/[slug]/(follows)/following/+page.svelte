<script lang="ts">
  import { page } from "$app/stores";
  import { nostrHandler } from "$lib/nostr";
  import { onMount } from "svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import UserFollowLoadingSkeleton from "$lib/components/user/follow/UserFollowLoadingSkeleton.svelte";
  import { followedUsers } from "$lib/stores/FollowedUsers";
  import FollowCard from "$lib/components/user/follow/FollowCard.svelte";

  let followedUsersPromise: Promise<NDKUser[]>;
  let disabled: boolean = false;

  onMount(async () => {
    if ($authUser.authState !== AuthStates.ANONYMOUS && $authUser.nostr) {
      const user: NDKUser = $authUser.nostr.getUser();
      if ($page.params.slug == user.pubkey) {
        followedUsersPromise = Promise.resolve($followedUsers);
        return;
      }
    }
    followedUsersPromise = nostrHandler.fetchUserFollowingByPublicKey($page.params.slug);
  });

</script>

<h1 class="h1 m-4">Following</h1>
<div class="px-4">
  {#await followedUsersPromise}
    {#each {length: 10} as _}
      <UserFollowLoadingSkeleton />
    {/each}
  {:then followedUsers}
    {#if followedUsers && followedUsers.length > 0}
      {#each followedUsers as user}
        <FollowCard bind:disabled {user} />
      {/each}
    {:else}
      <div class="mt-2">This user does not yet follow anyone.</div>
    {/if}
  {/await}
</div>
