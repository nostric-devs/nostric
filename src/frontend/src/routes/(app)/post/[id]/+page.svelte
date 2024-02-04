<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import { onMount } from "svelte";
  import type { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
  import { NDKMarker, nostrHandler } from "$lib/nostr";
  import { page } from "$app/stores";
  import PostLoadingSkeleton from "$lib/components/post/PostLoadingSkeleton.svelte";
  import InfiniteScrollContainer from "$lib//components/infinite-scroll/InfiniteScrollContainer.svelte";
  import PostThread from "$lib/components/post/PostThread.svelte";
  import {
    isMarkerInTags,
    type NodeEvents,
    type NodeEvent,
    recursiveParentLookUp,
  } from "$lib/stores/Feed";

  let event: NDKEvent;
  let replies: NDKEvent[] | undefined = undefined;
  let parentPathPromise: Promise<NodeEvent>;
  let reply: string = "";

  onMount(async () => {
    // fetch the event itself
    event = await nostrHandler.fetchEventById($page.params.id);

    // fetch the parent reply tree if any
    let parentPath: NodeEvents = {};
    await recursiveParentLookUp(parentPath, event);
    // we only want the root, thread component will take care of the rest
    parentPathPromise = Promise.resolve(
      Object.values(parentPath).find((node) => node.isRoot()),
    );

    // now we are fetching replies
    // deprecated NIP-10 replies
    let deprecatedReplies: NDKEvent[] = await nostrHandler.fetchEventReplies(
      event,
      30,
    );
    let markerReplies: NDKEvent[] = [];

    if (Object.keys(parentPath).length > 1) {
      // this was a reply, so we need to prune deprecated replies to only contain
      // those that have the e tag with our event id at the very last place and there are more than one e tags,
      // and then we are fetching reply markers from new NIP-10
      deprecatedReplies = deprecatedReplies.filter(
        (reply: NDKEvent): boolean => {
          const tags: NDKTag[] = reply.getMatchingTags("e");
          return tags.length > 1 && tags.at(-1)[1] === event.id;
        },
      );
      markerReplies = await nostrHandler.fetchEventReplies(
        event,
        30,
        NDKMarker.REPLY,
      );
    } else {
      // this was a root event, so we need to prune replies to those only having our event id
      // in e tag at the first place in tag array, and then we are fetching root markers from new NIP-10
      deprecatedReplies = deprecatedReplies.filter(
        (reply: NDKEvent): boolean => {
          const tags: NDKTag[] = reply.getMatchingTags("e");
          return tags.length === 1 && tags.at(0)[1] === event.id;
        },
      );
      markerReplies = await nostrHandler.fetchEventReplies(
        event,
        30,
        NDKMarker.ROOT,
      );
      // we also need to only have those that do not contain reply markers
      markerReplies = markerReplies.filter((reply: NDKEvent): boolean => {
        const tags: NDKTag[] = reply.getMatchingTags("e");
        return isMarkerInTags(tags, NDKMarker.REPLY) === undefined;
      });
    }

    // concat, deduplicate and sort resulting events by date
    for (const reply of deprecatedReplies) {
      const index: number | undefined = markerReplies.findIndex(
        (item: NDKEvent): boolean => item.id === reply.id,
      );
      if (index !== undefined) {
        markerReplies.splice(index, 1);
      }
    }

    replies = deprecatedReplies
      .concat(markerReplies)
      .sort((x: NDKEvent, y: NDKEvent) => y.created_at - x.created_at);
  });
</script>

<h1 class="h1 m-4">Post detail</h1>
<div class="mx-4">
  {#await parentPathPromise then parent}
    {#if parent}
      <PostThread eventNode={parent} />
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

  {#if replies === undefined}
    <div class="m-4">
      {#each { length: 6 } as _}
        <PostLoadingSkeleton />
      {/each}
    </div>
  {:else if replies.length > 0}
    <InfiniteScrollContainer allItems={replies} initialNumberOfItems={5}>
      <svelte:fragment slot="listItem" let:item>
        <Post event={item} />
      </svelte:fragment>
    </InfiniteScrollContainer>
  {:else}
    <div class="px-4 my-5">No replies found for the given post so far.</div>
  {/if}
</div>
