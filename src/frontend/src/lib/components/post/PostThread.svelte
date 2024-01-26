<script lang="ts">
  import Post from "$lib/components/post/Post.svelte";
  import type { NodeEvent } from "$lib/stores/Feed";

  export let eventNode: NodeEvent;
  export let treeLevelIndex: number = 1;
  export let indent: number = 0;
</script>

{#if eventNode}
  <Post event={eventNode.model} displayAsReply={!eventNode.isRoot()} {indent} />
  {#if eventNode.hasChildren()}
    {#each eventNode.children as childNode}
      {#key childNode.model.id}
        <svelte:self
          eventNode={childNode}
          indent={treeLevelIndex > 2 ? indent + 55 : indent}
          treeLevelIndex={treeLevelIndex + 1}
        />
      {/key}
    {/each}
  {/if}
{/if}
