<script lang="ts">
  import { page } from "$app/stores";
  import { nostrHandler } from "$lib/nostr";
  import { onMount } from "svelte";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import UserFollowLoadingSkeleton from "$lib/components/user/follow/UserFollowLoadingSkeleton.svelte";
  import FollowCard from "$lib/components/user/follow/FollowCard.svelte";
  import InfiniteScrollContainer from "$lib/components/infinite-scroll/InfiniteScrollContainer.svelte";

  let followersPromise: Promise<NDKUser[]>;
  let disabled: boolean = false;

  onMount(async () => {
    followersPromise = nostrHandler.fetchUserFollowersByPublicKey(
      $page.params.slug,
      true
    );
  });
</script>

<h1 class="h1 px-4 my-4">Followers</h1>
{#await followersPromise}
  <div class="px-4 mb-4">
    <div class="placeholder animate-pulse" />
  </div>
  <hr class="!border-t-2 mx-4" />
  <div class="px-4 mt-3">
    {#each { length: 10 } as _}
      <UserFollowLoadingSkeleton />
    {/each}
  </div>
{:then followers}
  {#if followers && followers.length > 0}
    <div class="px-4 mb-4">
      This user has total of { followers.length } followers
    </div>
    <hr class="!border-t-2 mx-4" />
    <InfiniteScrollContainer allItems={followers} >
      <svelte:fragment slot="listItem" let:item={item} >
        <FollowCard user={item} {disabled}/>
      </svelte:fragment>
    </InfiniteScrollContainer>
  {:else}
    <div class="mt-2">This user has not followers yet.</div>
  {/if}
{/await}

