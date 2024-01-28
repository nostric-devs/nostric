<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import { onMount } from "svelte";
  import type { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
  import { NDKMarker, nostrHandler } from "$lib/nostr";
  import { page } from "$app/stores";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";
  import InfiniteScrollContainer from "$lib//components/infinite-scroll/InfiniteScrollContainer.svelte";
  import { isMarkerInTags } from "$lib/stores/Feed";

  let event: NDKEvent;
  let eventPromise: Promise<NDKEvent>;
  let eventsPromise: Promise<NDKEvent[]>;

  let reply: string = "";

  onMount(async () => {
    event = await nostrHandler.fetchEventById($page.params.id);
    eventPromise = Promise.resolve(event);
    let tags: NDKTag[] = event.getMatchingTags("e");
    let rootParentId = isMarkerInTags(tags, NDKMarker.ROOT);
    if (rootParentId === undefined) {
      // the event is not a reply, therefore we are fetching first level replies (with root tag only)
      eventsPromise = nostrHandler.fetchEventReplies(event, NDKMarker.ROOT, 20);
    } else {
      // the event is itself a reply, therefore we are only fetching events replying
      // to this event further down the tree
      eventsPromise = nostrHandler.fetchEventReplies(
        event,
        NDKMarker.REPLY,
        20,
      );
    }
  });
</script>

<h1 class="h1 m-4">Post detail</h1>
<div class="mx-4">
  {#await eventPromise then event}
    {#if event}
      <Post {event} />
    {/if}
  {/await}
</div>

<div
  class="overflow-hidden flex flex-col"
  style="max-height: calc(100% - 20px)"
>
  <h3 class="h3 m-4">Comments</h3>
  <div>
    <form class="modal-form mx-4">
      <label class="label">
        <textarea
          class="textarea px-3 py-2"
          rows="3"
          bind:value={reply}
          placeholder="Start typing your reply"
        />
      </label>
      <div class="flex justify-end">
        <button class="btn variant-filled mt-2">Post reply</button>
      </div>
    </form>
  </div>

  {#await eventsPromise}
    <div class="m-4">
      {#each { length: 6 } as _}
        <PostLoadingSkeleton />
      {/each}
    </div>
  {:then events}
    {#if events && events.length > 0}
      <InfiniteScrollContainer allItems={events} initialNumberOfItems={5}>
        <svelte:fragment slot="listItem" let:item>
          <Post event={item} />
        </svelte:fragment>
      </InfiniteScrollContainer>
    {:else}
      <div class="px-4 mt-5">No replies found for the given post so far.</div>
    {/if}
  {/await}
</div>
