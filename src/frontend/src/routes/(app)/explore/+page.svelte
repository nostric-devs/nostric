<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import { nostrHandler } from "$lib/nostr";
  import { onMount } from "svelte";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";

  let randomEvents: NDKEvent[] = [];

  $: randomEvents;

  onMount(async () => {
    randomEvents = await nostrHandler.fetchRandomEvents();
  });
</script>

<h1 class="h1 m-4">Explore</h1>

{#if randomEvents.length === 0}
  {#each { length: 6 } as _}
    <PostLoadingSkeleton />
  {/each}
{:else}
  {#each randomEvents as event}
    <Post {event} />
  {/each}
{/if}
