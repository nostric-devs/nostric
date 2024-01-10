<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import { nostrHandler } from "$lib/nostr";
  import { onMount } from "svelte";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { Circle } from "svelte-loading-spinners";

  let randomEvents: NDKEvent[] = [];

  $: randomEvents;

  onMount(async () => {
    randomEvents = await nostrHandler.fetchRandomEvents();
  });
</script>

<h1 class="h1 m-4">Explore</h1>

{#if randomEvents.length === 0}
  <div class="w-full flex justify-center items-center">
    <Circle size="100" color="black" unit="px"></Circle>
  </div>
{:else}
  {#each randomEvents as event}
    <Post {event} />
  {/each}
{/if}
