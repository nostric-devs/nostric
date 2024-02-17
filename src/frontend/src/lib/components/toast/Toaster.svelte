<script lang="ts">
  import { getToastStore } from "@skeletonlabs/skeleton";

  const toastStore = getToastStore();

  export let message: string;
  export let timeout: number | undefined = 1000;
  export let color: string;

  const triggerClipboardToast = (): void => {
    toastStore.trigger({
      message,
      background: `variant-filled-${color}`,
      timeout,
    });
  };
</script>

<div
  tabindex="0"
  role="button"
  on:click={triggerClipboardToast}
  on:keydown={triggerClipboardToast}
>
  <slot />
</div>
