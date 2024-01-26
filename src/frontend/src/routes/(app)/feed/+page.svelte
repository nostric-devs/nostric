<script lang="ts">
  import PostThread from "$lib/components/post/PostThread.svelte";
  import { feed, type NodeEvent } from "$lib/stores/Feed";
  import InfiniteScrollContainer from "$lib/components/infinite-scroll/InfiniteScrollContainer.svelte";

  let feedEvents: NodeEvent[] = [];

  const orderByDate = (nodes: NodeEvent[]): NodeEvent[] => {
    let resultingEvents: NodeEvent[] = Object.values(nodes).filter(
      (nodeEvent: NodeEvent) => nodeEvent.isRoot(),
    );
    return resultingEvents.sort(
      (x: NodeEvent, y: NodeEvent) => y.model.created_at - x.model.created_at,
    );
  };

  $: feedEvents = orderByDate($feed);
</script>

<h1 class="h1 m-4">Feed</h1>
<hr class="!border-t-2 mx-4" />

{#if feedEvents.length === 0}
  <div class="px-4 mt-2">No posts to display.</div>
{:else}
  {#key feedEvents}
    <InfiniteScrollContainer allItems={feedEvents} initialNumberOfItems={6}>
      <svelte:fragment slot="listItem" let:item>
        <PostThread eventNode={item} />
      </svelte:fragment>
    </InfiniteScrollContainer>
  {/key}
{/if}
