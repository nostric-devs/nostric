<script lang="ts">
  import { page } from "$app/stores";
  import { nostrHandler } from "$lib/nostr";
  import { onMount } from "svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import UserFollowLoadingSkeleton from "$lib/components/user/follow/UserFollowLoadingSkeleton.svelte";
  import { followedUsers } from "$lib/stores/FollowedUsers";
  import FollowCard from "$lib/components/user/follow/FollowCard.svelte";
  import InfiniteScrollContainer from "$lib/components/infinite-scroll/InfiniteScrollContainer.svelte";

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
    followedUsersPromise = nostrHandler.fetchUserFollowingByPublicKey(
      $page.params.slug,
      true,
    );
  });
</script>

<h1 class="h1 px-4 mt-4 mb-6">Following</h1>
{#await followedUsersPromise}
  <div class="px-4 mb-4">
    <div class="placeholder animate-pulse" />
  </div>
  <hr class="!border-t-2 mx-4" />
  <div class="pl-4 pr-6 mt-3">
    {#each { length: 10 } as _}
      <UserFollowLoadingSkeleton />
    {/each}
  </div>
{:then followedUsers}
  {#if followedUsers && followedUsers.length > 0}
    <div class="px-4 mb-4">
      This user follows {followedUsers.length} users.
    </div>
    <hr class="!border-t-2 mx-4" />
    <InfiniteScrollContainer allItems={followedUsers} initialNumberOfItems={15}>
      <svelte:fragment slot="listItem" let:item>
        <FollowCard user={item} {disabled} />
      </svelte:fragment>
    </InfiniteScrollContainer>
  {:else}
    <div class="mt-2 px-4">This user does not yet follow anyone.</div>
  {/if}
{/await}
