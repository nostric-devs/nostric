<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import { nostrHandler } from "$lib/nostr";
  import { onMount } from "svelte";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";
  import InfiniteScrollContainer from "$lib/components/infinite-scroll/InfiniteScrollContainer.svelte";

  let randomEvents: NDKEvent[] = [];

  $: randomEvents;

  onMount(async () => {
    randomEvents = await nostrHandler.fetchRandomEvents();
  });
</script>

<h1 class="h1 m-4">Explore</h1>
<hr class="!border-t-2 mx-4" />

{#if randomEvents.length === 0}
  <div class="m-5">
    {#each { length: 6 } as _}
      <PostLoadingSkeleton />
    {/each}
  </div>
{:else}
  <InfiniteScrollContainer allItems={randomEvents} initialNumberOfItems={5}>
    <svelte:fragment slot="listItem" let:item>
      <Post event={item} />
    </svelte:fragment>
  </InfiniteScrollContainer>
{/if}
