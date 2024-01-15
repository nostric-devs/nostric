<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import { onMount } from "svelte";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { nostrHandler } from "$lib/nostr";
  import { page } from "$app/stores";

  let eventPromise: Promise<NDKEvent>;
  let repliesPromise: Promise<NDKEvent[]>;

  onMount(async () => {
    eventPromise = nostrHandler.fetchEventById($page.params.id);
    repliesPromise = nostrHandler.fetchEventReplies($page.params.id);
  });
</script>

<h1 class="h1 m-4">Post detail</h1>

{#await eventPromise then event}
  {#if event}
    <Post {event} />
  {/if}
{/await}

<h3 class="h3 m-6">Comments</h3>
{#await repliesPromise then replies}
  {#if replies}
    {#each replies as reply}
      <Post event={reply} />
    {/each}
  {/if}
{/await}
