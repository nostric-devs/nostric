<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let itemsWrapper: HTMLDivElement;
  let displayedItems: unknown[] = [];
  let endOfRopeFlag: boolean = false;

  const loadMore = () => {
    if (
      itemsWrapper.scrollTop + itemsWrapper.clientHeight >=
      itemsWrapper.scrollHeight
    ) {
      let initialLength = displayedItems.length;
      for (let index = initialLength; index < initialLength + 5; index++) {
        if (allItems.length < index) {
          endOfRopeFlag = true;
          break;
        } else {
          displayedItems = [...displayedItems, allItems[index]];
        }
      }
    }
  };

  onMount(() => {
    displayedItems = allItems.slice(0, initialNumberOfItems);
    if (itemsWrapper) {
      itemsWrapper.addEventListener("scroll", loadMore);
    }
  });

  onDestroy(() => {
    if ("removeEventListener" in itemsWrapper) {
      itemsWrapper.removeEventListener("scroll", loadMore);
    }
  });

  export let allItems: unknown[] = [];
  export let disabled: boolean = false;
  export let initialNumberOfItems: number = 15;
</script>

<div bind:this={itemsWrapper} class="overflow-y-auto px-4 grow max-h-screen">
  {#each displayedItems as item}
    <slot name="listItem" {item} {disabled} />
  {/each}
  {#if endOfRopeFlag}
    <div class="text-center variant-filled-soft rounded-3xl my-12">
      You have reached the very end.
    </div>
  {/if}
</div>
