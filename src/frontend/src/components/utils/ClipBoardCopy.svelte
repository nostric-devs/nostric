<script>
  import { Icon } from "svelte-feathers";

  export let copyValue = "";

  let copiedToClipBoard = false;

  const copyToClipBoard = async () => {
    navigator.clipboard.writeText(copyValue).then(() => {
      copiedToClipBoard = true;
      setTimeout(() => (copiedToClipBoard = false), 400);
    });
  };
</script>

<div
  class:custom-tooltip-open={copiedToClipBoard}
  class="tooltip tooltip-bottom tooltip-open w-full"
  data-tip="copied to clipboard"
>
  <div
    on:click={() => copyToClipBoard()}
    class="border border-gray-700 rounded-3xl text-xs sm:text-md px-5 py-2 my-2 font-mono cursor-pointer flex items-center justify-between"
  >
    <span class="mr-2">{copyValue}</span>
    <slot />
    <Icon name="copy" class="cursor-pointer hover:scale-105"></Icon>
  </div>
</div>

<style>
  .tooltip.tooltip-open:before,
  .tooltip.tooltip-open:after {
    opacity: 0;
    transition: 0.5s;
  }
  .tooltip.custom-tooltip-open:before,
  .tooltip.custom-tooltip-open:after {
    opacity: 1;
  }
</style>
