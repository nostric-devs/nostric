<script lang="ts" generics="T">
  import { onMount, onDestroy } from "svelte";

  let itemsWrapper: HTMLDivElement;
  let displayedItems: T[] = [];

  const loadMore = () => {
    if (
      itemsWrapper.scrollTop + itemsWrapper.clientHeight >=
      itemsWrapper.scrollHeight
    ) {
      let initialLength = displayedItems.length;
      for (let index = initialLength; index < initialLength + 5; index++) {
        if (allItems.length < index) {
          break;
        } else {
          displayedItems = [...displayedItems, allItems[index]];
        }
      }
    }
  };

  onMount(() => {
    displayedItems = allItems.slice(0, 10);
    if (itemsWrapper) {
      itemsWrapper.addEventListener("scroll", loadMore);
    }
  });

  onDestroy(() => {
    itemsWrapper.removeEventListener("scroll", loadMore);
  });

  export let allItems: T[] = [];
  export let disabled: boolean = false;
</script>

<div bind:this={itemsWrapper} class="overflow-y-scroll px-4 grow">
  {#each displayedItems as item}
    <slot name="listItem" {item} {disabled} />
  {/each}
</div>
